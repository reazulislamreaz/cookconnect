import path from 'path';
import { Types } from 'mongoose';
import type { FilterQuery } from '@/types/mongoose';
import { ApiError } from '@/shared/ApiError';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import * as mediaService from '@/modules/media/media.service';
import * as taxonomyService from '@/modules/taxonomy/taxonomy.service';
import * as userService from '@/modules/user/user.service';
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
): Promise<{ data: ICandidateProfileDocument[]; meta: ReturnType<typeof paginationMeta> }> {
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

  const [data, total] = await Promise.all([
    builder.query.exec(),
    CandidateProfile.countDocuments(baseFilter),
  ]);

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

  try {
    const activityLogService = await import('../activityLog/activityLog.service');
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
  } catch {
    // activity log module optional at runtime
  }
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
  data: ICandidateProfileDocument[];
  meta: ReturnType<typeof paginationMeta>;
}> {
  const filter: FilterQuery<ICandidateProfileDocument> = {};

  if (query.verified === 'true') filter.verified = true;
  if (query.verified === 'false') filter.verified = false;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  const modelQuery = CandidateProfile.find(filter).select('+phone');
  const builder = new QueryBuilder<ICandidateProfileDocument>(modelQuery, query);

  if (query.q?.trim()) {
    builder.search(['firstName', 'lastName', 'phone']);
  }

  builder.sort('-createdAt').paginate(SEARCH_PAGE_SIZE);

  const [data, total] = await Promise.all([
    builder.query.exec(),
    CandidateProfile.countDocuments(filter),
  ]);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function adminFindById(id: string): Promise<ICandidateProfileDocument> {
  const profile = await CandidateProfile.findById(id).select('+phone');
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }
  return profile;
}

export async function setVerification(
  id: string,
  input: SetVerificationInput,
): Promise<ICandidateProfileDocument> {
  const profile = await adminFindById(id);
  profile.verified = input.verified;
  profile.verifiedAt = input.verified ? new Date() : null;
  profile.verifiedBy = input.verified ? toObjectId(input.adminUserId) : null;
  return profile.save();
}

export async function setStatus(
  id: string,
  input: SetCandidateStatusInput,
): Promise<ICandidateProfileDocument> {
  const profile = await adminFindById(id);
  const user = await userService.findById(String(profile.userId));

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (input.status === 'active') {
    user.status = 'active';
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
    return profile;
  }

  await user.save();
  return profile.save();
}

export async function softDelete(id: string): Promise<ICandidateProfileDocument> {
  const profile = await adminFindById(id);
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
