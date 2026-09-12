import path from 'path';
import { Types } from 'mongoose';
import type { FilterQuery } from '@/types/mongoose';
import { ApiError } from '@/shared/ApiError';
import {
  resolveMediaUrl,
  resolveMediaWithModeration,
} from '@/shared/enrichMedia';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import * as activityLogService from '@/modules/activityLog/activityLog.service';
import * as mediaService from '@/modules/media/media.service';
import { MediaAsset } from '@/modules/media/media.model';
import * as taxonomyService from '@/modules/taxonomy/taxonomy.service';
import * as userService from '@/modules/user/user.service';
import { User } from '@/modules/user/user.model';
import { getStorage } from '@/utils/storage';
import {
  validateCvBuffer,
  validateImageBuffer,
  validateImageMime,
} from '@/middlewares/upload';
import {
  MAX_FOOD_PHOTOS,
  SEARCH_PAGE_SIZE,
} from './candidate.constant';
import {
  AdminCandidateListQuery,
  AdminFindCandidateOptions,
  AdminUpdateCandidateInput,
  CandidateSearchQuery,
  CandidateViewer,
  ICandidateProfileDocument,
  SetCandidateStatusInput,
  SetVerificationInput,
  UpdateCandidateInput,
} from './candidate.interface';
import { CandidateProfile } from './candidate.model';

type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

function storageKeyFor(userId: string, kind: string, originalName: string): string {
  const ext = path.extname(originalName) || '.bin';
  return `candidates/${userId}/${kind}-${Date.now()}${ext}`;
}

async function findByUserId(userId: string): Promise<ICandidateProfileDocument | null> {
  return CandidateProfile.findOne({ userId: toObjectId(userId) }).select('+phone');
}

async function requireByUserId(userId: string): Promise<ICandidateProfileDocument> {
  const profile = await findByUserId(userId);
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }
  return profile;
}

export async function createStub(userId: string): Promise<ICandidateProfileDocument> {
  return CandidateProfile.create({ userId: toObjectId(userId) });
}

export async function getMe(userId: string): Promise<ICandidateProfileDocument> {
  return requireByUserId(userId);
}

export async function isProfileComplete(userId: string): Promise<boolean> {
  const profile = await CandidateProfile.findOne({ userId: toObjectId(userId) });
  return Boolean(profile && profile.completionPercent === 100);
}

export async function updateMe(
  userId: string,
  input: UpdateCandidateInput,
): Promise<ICandidateProfileDocument> {
  const profile = await requireByUserId(userId);

  if (input.sectorId !== undefined) profile.sectorId = input.sectorId;
  if (input.positionId !== undefined) profile.positionId = input.positionId;

  if (profile.sectorId && profile.positionId) {
    taxonomyService.ensurePositionBelongsToSector(profile.positionId, profile.sectorId);
  }

  if (input.firstName !== undefined) profile.firstName = input.firstName;
  if (input.lastName !== undefined) profile.lastName = input.lastName;
  if (input.city !== undefined) profile.city = input.city;
  if (input.country !== undefined) profile.country = input.country;
  if (input.experience !== undefined) profile.experience = input.experience;
  if (input.availability !== undefined) profile.availability = input.availability;
  if (input.contractType !== undefined) profile.contractType = input.contractType;
  if (input.expectedSalary !== undefined) profile.expectedSalary = input.expectedSalary;
  if (input.phone !== undefined) profile.phone = input.phone;
  if (input.about !== undefined) profile.about = input.about;
  if (input.skills !== undefined) profile.skills = input.skills;
  if (input.languages !== undefined) profile.languages = input.languages;
  if (input.training !== undefined) profile.training = input.training;
  if (input.history !== undefined) profile.history = input.history;

  const user = await userService.findById(userId);
  profile.searchable =
    profile.completionPercent === 100 && user?.status !== 'suspended' && user?.status !== 'deleted';

  return profile.save();
}

export async function search(
  query: CandidateSearchQuery,
  isGuest: boolean,
): Promise<{ data: Record<string, unknown>[]; meta: ReturnType<typeof paginationMeta> }> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  if (isGuest && page > 1) {
    throw new ApiError(401, 'Sign in to browse more results');
  }

  const baseFilter: FilterQuery<ICandidateProfileDocument> = {
    searchable: true,
    deletedAt: null,
  };

  if (query.city) baseFilter.city = query.city;
  if (query.sectorId) baseFilter.sectorId = query.sectorId;
  if (query.positionId) baseFilter.positionId = query.positionId;
  if (query.experience) baseFilter.experience = query.experience;
  if (query.availability) baseFilter.availability = query.availability;

  const modelQuery = CandidateProfile.find(baseFilter);
  const builder = new QueryBuilder<ICandidateProfileDocument>(modelQuery, query);

  if (query.q && typeof query.q === 'string' && query.q.trim()) {
    builder.search(['firstName', 'lastName']);
  }

  builder.sort('-createdAt').paginate(SEARCH_PAGE_SIZE);

  const [rows, total] = await Promise.all([
    builder.query.exec(),
    CandidateProfile.countDocuments(baseFilter),
  ]);

  const { resolveMediaUrl } = await import('@/shared/enrichMedia');
  const data = await Promise.all(
    rows.map(async (profile: ICandidateProfileDocument) => {
      const json = profile.toJSON() as unknown as Record<string, unknown>;
      delete json.phone;
      json.photoUrl = await resolveMediaUrl(profile.photoId);
      return json;
    }),
  );

  return {
    data,
    meta: paginationMeta(page, limit, total, isGuest),
  };
}

async function canViewPhone(viewer: CandidateViewer): Promise<boolean> {
  if (!viewer) return false;

  if (viewer.role === 'admin') {
    if (viewer.adminLevel === 'super') return true;
    return viewer.permissions.includes('view-contact');
  }

  if (viewer.role === 'employer') {
    try {
      const { EmployerProfile } = await import('../employer/employer.model');
      const employer = await EmployerProfile.findOne({ userId: toObjectId(viewer.id) });
      return Boolean(employer?.verified && employer.status === 'active');
    } catch {
      return false;
    }
  }

  return false;
}

async function logContactView(
  viewer: CandidateViewer,
  profile: ICandidateProfileDocument,
  meta?: { ip?: string; userAgent?: string },
): Promise<void> {
  if (!viewer) return;

  let actorLabel = 'User';

  if (viewer.role === 'employer') {
    const { EmployerProfile } = await import('../employer/employer.model');
    const employer = await EmployerProfile.findOne({ userId: toObjectId(viewer.id) });
    actorLabel = employer?.name || 'Employer';
  } else if (viewer.role === 'admin') {
    actorLabel = 'Admin';
  }

  await activityLogService.log({
    actorUserId: viewer.id,
    actorLabel,
    action: 'contact.viewed',
    targetType: 'candidate',
    targetId: String(profile._id),
    detail: {
      fr: `Consultation du contact de ${profile.firstName} ${profile.lastName}`,
      en: `Viewed contact for ${profile.firstName} ${profile.lastName}`,
    },
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  });
}

async function logAdminCandidateAction(
  adminUserId: string,
  action: string,
  profile: ICandidateProfileDocument,
  detail?: { fr: string; ar?: string; en?: string },
): Promise<void> {
  await activityLogService.log({
    actorUserId: adminUserId,
    actorLabel: 'Admin',
    action,
    targetType: 'candidate',
    targetId: String(profile._id),
    detail: detail ?? {
      fr: `${profile.firstName} ${profile.lastName}`,
      en: `${profile.firstName} ${profile.lastName}`,
    },
  });
}

type UserSummary = {
  id: string;
  email: string;
  status: string;
  lastLoginAt?: Date | null;
};

async function loadUserSummaries(userIds: Types.ObjectId[]): Promise<Map<string, UserSummary>> {
  if (!userIds.length) return new Map();

  const users = await User.find({ _id: { $in: userIds } })
    .select('email status lastLoginAt')
    .lean();

  return new Map(
    users.map((u: any) => [
      String(u._id),
      {
        id: String(u._id),
        email: u.email,
        status: u.status,
        lastLoginAt: u.lastLoginAt ?? null,
      },
    ]),
  );
}

async function enrichCandidateAdmin(
  profile: ICandidateProfileDocument,
  userSummary?: UserSummary | null,
  options?: { includeContact?: boolean },
): Promise<Record<string, unknown>> {
  const json = profile.toJSON() as unknown as Record<string, unknown>;
  const userId = String(profile.userId);

  const user =
    userSummary ??
    (await User.findById(userId).select('email status lastLoginAt').lean()) ??
    null;

  if (user) {
    json.user = {
      id: String((user as any)._id ?? userId),
      email: (user as any).email,
      status: (user as any).status,
      lastLoginAt: (user as any).lastLoginAt ?? null,
    };
  }

  json.photoUrl = await resolveMediaUrl(profile.photoId);
  json.dishPhotos = await resolveMediaWithModeration(profile.foodPhotoIds);

  const pendingPhotos = await MediaAsset.find({
    ownerUserId: toObjectId(userId),
    moderationStatus: 'pending',
    deletedAt: null,
  })
    .select('url moderationStatus kind')
    .lean();

  json.pendingPhotos = pendingPhotos.map((p: any) => ({
    id: String(p._id),
    url: p.url,
    moderationStatus: p.moderationStatus,
    kind: p.kind,
  }));

  if (!options?.includeContact) {
    delete json.phone;
  }

  return json;
}

async function enrichCandidatesAdmin(
  profiles: ICandidateProfileDocument[],
): Promise<Record<string, unknown>[]> {
  const userMap = await loadUserSummaries(profiles.map((p) => toObjectId(String(p.userId))));

  const photoIds = profiles.map((p) => p.photoId).filter(Boolean) as Types.ObjectId[];
  const photoUrls = photoIds.length
    ? await MediaAsset.find({ _id: { $in: photoIds } })
        .select('url')
        .lean()
    : [];
  const photoUrlById = new Map(photoUrls.map((a: any) => [String(a._id), a.url]));

  return profiles.map((profile) => {
    const json = profile.toJSON() as unknown as Record<string, unknown>;
    const userId = String(profile.userId);
    const user = userMap.get(userId);

    if (user) {
      json.user = {
        id: user.id,
        email: user.email,
        status: user.status,
        lastLoginAt: user.lastLoginAt ?? null,
      };
    }

    if (profile.photoId) {
      json.photoUrl = photoUrlById.get(String(profile.photoId)) ?? null;
    } else {
      json.photoUrl = null;
    }

    delete json.phone;
    return json;
  });
}

async function userIdsForStatus(status: string): Promise<Types.ObjectId[] | null> {
  if (!status) return null;

  const users = await User.find({ status }).select('_id').lean();
  return users.map((u: any) => u._id as Types.ObjectId);
}

export async function findPublicById(
  id: string,
  viewer: CandidateViewer,
  meta?: { ip?: string; userAgent?: string },
): Promise<Record<string, unknown> | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  const profile = await CandidateProfile.findOneAndUpdate(
    { _id: id, searchable: true, deletedAt: null },
    { $inc: { profileViews: 1 } },
    { new: true },
  );

  if (!profile) return null;

  const json = profile.toJSON() as unknown as Record<string, unknown>;
  const showPhone = await canViewPhone(viewer);

  if (showPhone) {
    const withPhone = await CandidateProfile.findById(profile._id).select('+phone');
    if (withPhone?.phone) {
      json.phone = withPhone.phone;
      await logContactView(viewer, profile, meta);
    }
  }

  const { resolveMediaUrl, resolveMediaWithModeration } = await import('@/shared/enrichMedia');
  json.photoUrl = await resolveMediaUrl(profile.photoId);
  json.dishPhotos = await resolveMediaWithModeration(profile.foodPhotoIds);

  return json;
}

export async function uploadPhoto(
  userId: string,
  file: UploadedFile,
): Promise<ICandidateProfileDocument> {
  validateImageMime(file.mimetype);
  const dimensions = await validateImageBuffer(file.buffer);

  const key = storageKeyFor(userId, 'photo', file.originalname);
  const stored = await getStorage().upload(key, file.buffer, file.mimetype);

  const asset = await mediaService.createAsset({
    ownerUserId: userId,
    kind: 'profile-photo',
    storageKey: stored.storageKey,
    url: stored.url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    width: dimensions.width,
    height: dimensions.height,
  });

  const profile = await requireByUserId(userId);
  profile.photoId = asset._id as Types.ObjectId;
  return profile.save();
}

export async function uploadDishPhotos(
  userId: string,
  files: UploadedFile[],
): Promise<ICandidateProfileDocument> {
  if (!files.length) {
    throw new ApiError(422, 'No files uploaded');
  }

  const profile = await requireByUserId(userId);

  if (!profile.positionId) {
    throw new ApiError(422, 'Set your position before uploading food photos');
  }

  const allowed = await taxonomyService.allowsFoodPhotos(profile.positionId);
  if (!allowed) {
    throw new ApiError(422, 'Your position is not eligible for food photos');
  }

  if (profile.foodPhotoIds.length + files.length > MAX_FOOD_PHOTOS) {
    throw new ApiError(422, `You can upload at most ${MAX_FOOD_PHOTOS} food photos`);
  }

  const newIds: Types.ObjectId[] = [];

  for (const file of files) {
    validateImageMime(file.mimetype);
    const dimensions = await validateImageBuffer(file.buffer);
    const key = storageKeyFor(userId, 'dish', file.originalname);
    const stored = await getStorage().upload(key, file.buffer, file.mimetype);

    const asset = await mediaService.createAsset({
      ownerUserId: userId,
      kind: 'dish-photo',
      storageKey: stored.storageKey,
      url: stored.url,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
    });

    newIds.push(asset._id as Types.ObjectId);
  }

  profile.foodPhotoIds.push(...newIds);
  return profile.save();
}

export async function deleteDishPhoto(
  userId: string,
  assetId: string,
): Promise<ICandidateProfileDocument> {
  const profile = await requireByUserId(userId);
  const assetObjectId = toObjectId(assetId);

  if (!profile.foodPhotoIds.some((id) => id.equals(assetObjectId))) {
    throw new ApiError(404, 'Food photo not found on this profile');
  }

  profile.foodPhotoIds = profile.foodPhotoIds.filter((id) => !id.equals(assetObjectId));
  await profile.save();

  try {
    await mediaService.softDelete(assetId);
  } catch {
    // asset may already be gone
  }

  return profile;
}

export async function uploadCv(
  userId: string,
  file: UploadedFile,
): Promise<ICandidateProfileDocument> {
  validateCvBuffer(file.buffer, file.mimetype);

  const key = storageKeyFor(userId, 'cv', file.originalname);
  const stored = await getStorage().upload(key, file.buffer, file.mimetype);

  const asset = await mediaService.createAsset({
    ownerUserId: userId,
    kind: 'cv',
    storageKey: stored.storageKey,
    url: stored.url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  });

  const profile = await requireByUserId(userId);
  profile.cvAssetId = asset._id as Types.ObjectId;
  return profile.save();
}

export async function adminList(query: AdminCandidateListQuery): Promise<{
  data: Record<string, unknown>[];
  meta: ReturnType<typeof paginationMeta>;
}> {
  const filter: FilterQuery<ICandidateProfileDocument> = {};

  if (query.verified === 'true') filter.verified = true;
  if (query.verified === 'false') filter.verified = false;

  const sectorId = query.sectorId || query.sector;
  const positionId = query.positionId || query.position;
  if (sectorId) filter.sectorId = sectorId;
  if (positionId) filter.positionId = positionId;
  if (query.city) filter.city = query.city;
  if (query.experience) filter.experience = query.experience;
  if (query.availability) filter.availability = query.availability;

  const minCompletion = Number(query.minCompletion);
  if (minCompletion > 0) {
    filter.completionPercent = { $gte: minCompletion };
  }

  if (query.status === 'deleted') {
    filter.deletedAt = { $ne: null };
  } else if (query.status) {
    filter.deletedAt = null;
    const userIds = await userIdsForStatus(query.status);
    if (userIds) {
      filter.userId = { $in: userIds };
    }
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  const findOptions =
    query.status === 'deleted' ? { includeDeleted: true } : undefined;

  const modelQuery = CandidateProfile.find(filter, null, findOptions).select('+phone');
  const builder = new QueryBuilder<ICandidateProfileDocument>(modelQuery, query);

  if (query.q?.trim()) {
    builder.search(['firstName', 'lastName', 'phone']);
  }

  builder.sort('-createdAt').paginate(SEARCH_PAGE_SIZE);

  const [profiles, total] = await Promise.all([
    builder.query.exec(),
    CandidateProfile.countDocuments(filter, findOptions),
  ]);

  const data = await enrichCandidatesAdmin(profiles);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function adminFindById(
  id: string,
  options: AdminFindCandidateOptions = {},
): Promise<Record<string, unknown>> {
  const findOptions = { includeDeleted: true };
  const profile = await CandidateProfile.findById(id, null, findOptions).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const mayReveal =
    options.revealContact &&
    options.viewer &&
    (options.viewer.adminLevel === 'super' ||
      options.viewer.permissions.includes('view-contact'));

  if (mayReveal) {
    await logContactView(options.viewer!, profile, {
      ip: options.ip,
      userAgent: options.userAgent,
    });
  }

  return enrichCandidateAdmin(profile, null, { includeContact: Boolean(mayReveal) });
}

export async function adminUpdate(
  id: string,
  input: AdminUpdateCandidateInput,
  adminUserId: string,
): Promise<Record<string, unknown>> {
  const profile = await CandidateProfile.findById(id).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  if (input.sectorId !== undefined) profile.sectorId = input.sectorId;
  if (input.positionId !== undefined) profile.positionId = input.positionId;

  if (profile.sectorId && profile.positionId) {
    taxonomyService.ensurePositionBelongsToSector(profile.positionId, profile.sectorId);
  }

  if (input.firstName !== undefined) profile.firstName = input.firstName;
  if (input.lastName !== undefined) profile.lastName = input.lastName;
  if (input.city !== undefined) profile.city = input.city;
  if (input.experience !== undefined) profile.experience = input.experience;
  if (input.availability !== undefined) profile.availability = input.availability;
  if (input.contractType !== undefined) profile.contractType = input.contractType;
  if (input.expectedSalary !== undefined) profile.expectedSalary = input.expectedSalary;
  if (input.phone !== undefined) profile.phone = input.phone;
  if (input.about !== undefined) profile.about = input.about;
  if (input.skills !== undefined) profile.skills = input.skills;
  if (input.languages !== undefined) profile.languages = input.languages;

  const user = await userService.findById(String(profile.userId));
  profile.searchable =
    profile.completionPercent === 100 &&
    user?.status !== 'suspended' &&
    user?.status !== 'deleted';

  await profile.save();
  await logAdminCandidateAction(adminUserId, 'candidate.updated', profile, {
    fr: `Profil modifié : ${profile.firstName} ${profile.lastName}`,
    en: `Profile updated: ${profile.firstName} ${profile.lastName}`,
  });

  return enrichCandidateAdmin(profile);
}

export async function adminListApplications(candidateId: string): Promise<unknown[]> {
  const profile = await CandidateProfile.findById(candidateId);
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const { Application } = await import('../application/application.model');
  const { Job } = await import('../job/job.model');
  const { EmployerProfile } = await import('../employer/employer.model');

  const applications = await Application.find({ candidateId: profile._id }).sort({
    appliedAt: -1,
  });

  const jobIds = applications.map((a: any) => a.jobId);
  const employerIds = applications.map((a: any) => a.employerId);

  const [jobs, employers] = await Promise.all([
    Job.find({ _id: { $in: jobIds } }).lean(),
    EmployerProfile.find({ _id: { $in: employerIds } }).lean(),
  ]);

  const jobById = new Map(jobs.map((j: any) => [String(j._id), j]));
  const employerById = new Map(employers.map((e: any) => [String(e._id), e]));

  return applications.map((app: any) => {
    const json = app.toJSON() as Record<string, unknown>;
    const job = jobById.get(String(app.jobId));
    const employer = employerById.get(String(app.employerId));
    return {
      ...json,
      job: job ?? null,
      employer: employer ?? null,
    };
  });
}

export async function adminGetHistory(candidateId: string): Promise<{
  contactRequests: unknown[];
  adminActions: unknown[];
}> {
  const profile = await CandidateProfile.findById(candidateId);
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const { ActivityLog } = await import('../activityLog/activityLog.model');
  const candidateObjectId = toObjectId(candidateId);

  const [contactRequests, adminActions] = await Promise.all([
    ActivityLog.find({
      action: 'contact.viewed',
      targetType: 'candidate',
      targetId: candidateObjectId,
    })
      .sort({ createdAt: -1 })
      .lean(),
    ActivityLog.find({
      targetType: 'candidate',
      targetId: candidateObjectId,
      action: { $ne: 'contact.viewed' },
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const mapEntry = (entry: any) => ({
    ...entry,
    id: String(entry._id),
    type: activityLogService.activityTypeFromAction(entry.action),
  });

  return {
    contactRequests: contactRequests.map(mapEntry),
    adminActions: adminActions.map(mapEntry),
  };
}

export async function adminAddSkill(
  id: string,
  skillId: string,
  adminUserId: string,
): Promise<Record<string, unknown>> {
  const profile = await CandidateProfile.findById(id);
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  if (!profile.skills.includes(skillId)) {
    profile.skills.push(skillId);
    await profile.save();
    await logAdminCandidateAction(adminUserId, 'candidate.skillAdded', profile, {
      fr: `Compétence ajoutée : ${skillId}`,
      en: `Skill added: ${skillId}`,
    });
  }

  return enrichCandidateAdmin(profile);
}

export async function adminRemoveSkill(
  id: string,
  skillId: string,
  adminUserId: string,
): Promise<Record<string, unknown>> {
  const profile = await CandidateProfile.findById(id);
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  profile.skills = profile.skills.filter((s: string) => s !== skillId);
  await profile.save();
  await logAdminCandidateAction(adminUserId, 'candidate.skillRemoved', profile, {
    fr: `Compétence retirée : ${skillId}`,
    en: `Skill removed: ${skillId}`,
  });

  return enrichCandidateAdmin(profile);
}

export async function setVerification(
  id: string,
  input: SetVerificationInput,
): Promise<Record<string, unknown>> {
  const profile = await CandidateProfile.findById(id).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  profile.verified = input.verified;
  profile.verifiedAt = input.verified ? new Date() : null;
  profile.verifiedBy = input.verified ? toObjectId(input.adminUserId) : null;
  await profile.save();

  await logAdminCandidateAction(
    input.adminUserId,
    input.verified ? 'candidate.verified' : 'candidate.unverified',
    profile,
  );

  return enrichCandidateAdmin(profile);
}

export async function setStatus(
  id: string,
  input: SetCandidateStatusInput,
  adminUserId?: string,
): Promise<Record<string, unknown>> {
  const profile = await CandidateProfile.findById(id, null, { includeDeleted: true }).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const user = await userService.findById(String(profile.userId));

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (input.status === 'active') {
    user.status = 'active';
    user.deletedAt = null;
    profile.deletedAt = null;
    profile.searchable = profile.completionPercent === 100;
  } else if (input.status === 'suspended') {
    user.status = 'suspended';
    profile.searchable = false;
  } else if (input.status === 'deleted') {
    user.status = 'deleted';
    profile.searchable = false;
    await user.save();
    await user.softDelete();
    await profile.softDelete();
    if (adminUserId) {
      await logAdminCandidateAction(adminUserId, 'candidate.deleted', profile);
    }
    return enrichCandidateAdmin(profile);
  }

  await user.save();
  await profile.save();

  if (adminUserId) {
    const action =
      input.status === 'suspended' ? 'candidate.suspended' : 'candidate.restored';
    await logAdminCandidateAction(adminUserId, action, profile);
  }

  return enrichCandidateAdmin(profile);
}

export async function softDelete(id: string): Promise<ICandidateProfileDocument> {
  const profile = await CandidateProfile.findById(id).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }
  profile.searchable = false;
  await profile.softDelete();

  const user = await userService.findById(String(profile.userId));
  if (user) {
    user.status = 'deleted';
    await user.softDelete();
  }

  return profile;
}

export async function restore(id: string): Promise<ICandidateProfileDocument> {
  const profile = await CandidateProfile.findOne({ _id: id }).setOptions({ includeDeleted: true });
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  profile.deletedAt = null;
  profile.searchable = profile.completionPercent === 100;

  const user = await userService.findById(String(profile.userId));
  if (user) {
    user.status = 'active';
    user.deletedAt = null;
    await user.save();
  }

  return profile.save();
}
