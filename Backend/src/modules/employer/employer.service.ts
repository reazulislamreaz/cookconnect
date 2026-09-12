import path from 'path';
import { Types } from 'mongoose';
import type { FilterQuery } from '@/types/mongoose';
import { ApiError } from '@/shared/ApiError';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import * as mediaService from '@/modules/media/media.service';
import { SEARCH_PAGE_SIZE } from '@/modules/job/job.constant';
import { getStorage } from '@/utils/storage';
import { validateImageBuffer, validateImageMime } from '@/middlewares/upload';
import {
  AdminEmployerListQuery,
  DashboardCounters,
  EmployerDecisionInput,
  IEmployerProfileDocument,
  UpdateEmployerInput,
} from './employer.interface';
import { EmployerProfile } from './employer.model';

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
  return `employers/${userId}/${kind}-${Date.now()}${ext}`;
}

async function findByUserId(userId: string): Promise<IEmployerProfileDocument | null> {
  return EmployerProfile.findOne({ userId: toObjectId(userId) });
}

async function requireByUserId(userId: string): Promise<IEmployerProfileDocument> {
  const profile = await findByUserId(userId);
  if (!profile) {
    throw new ApiError(404, 'Employer profile not found');
  }
  return profile;
}

export function assertCanPublish(profile: IEmployerProfileDocument): void {
  if (profile.status !== 'active') {
    throw new ApiError(
      403,
      'Your establishment must be approved before publishing offers',
    );
  }
}

export async function createStub(userId: string): Promise<IEmployerProfileDocument> {
  return EmployerProfile.create({ userId: toObjectId(userId) });
}

export async function getMe(userId: string): Promise<IEmployerProfileDocument> {
  return requireByUserId(userId);
}

export async function updateMe(
  userId: string,
  input: UpdateEmployerInput,
): Promise<IEmployerProfileDocument> {
  const profile = await requireByUserId(userId);

  if (input.name !== undefined) profile.name = input.name;
  if (input.type !== undefined) profile.type = input.type;
  if (input.city !== undefined) profile.city = input.city;
  if (input.address !== undefined) profile.address = input.address;
  if (input.about !== undefined) profile.about = input.about;
  if (input.phone !== undefined) profile.phone = input.phone;
  if (input.phonePublic !== undefined) profile.phonePublic = input.phonePublic;
  if (input.socials !== undefined) profile.socials = { ...profile.socials, ...input.socials };
  if (input.since !== undefined) profile.since = input.since;
  if (input.staffCount !== undefined) profile.staffCount = input.staffCount;

  return profile.save();
}

export async function getPublic(id: string): Promise<Record<string, unknown> | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  const profile = await EmployerProfile.findOne({
    _id: id,
    status: 'active',
    deletedAt: null,
  });

  if (!profile) return null;

  const json = profile.toJSON() as unknown as Record<string, unknown>;
  if (!profile.phonePublic) {
    delete json.phone;
  }

  return json;
}

export async function getDashboardCounters(userId: string): Promise<DashboardCounters> {
  const profile = await requireByUserId(userId);

  let activeOffers = 0;
  let applicants = 0;
  let savedProfiles = 0;
  let profileViews = 0;

  try {
    const { Job } = await import('../job/job.model');
    const employerId = profile._id;
    const [activeCount, viewAgg] = await Promise.all([
      Job.countDocuments({ employerId, status: 'active', deletedAt: null }),
      Job.aggregate([
        { $match: { employerId, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
    ]);
    activeOffers = activeCount;
    profileViews = viewAgg[0]?.total ?? 0;
  } catch {
    // job module optional at compile time
  }

  try {
    const { Application } = await import('../application/application.model');
    applicants = await Application.countDocuments({ employerId: profile._id });
  } catch {
    // application module optional
  }

  try {
    const { Bookmark } = await import('../bookmark/bookmark.model');
    savedProfiles = await Bookmark.countDocuments({
      kind: 'saved-profile',
      ownerUserId: toObjectId(userId),
    });
  } catch {
    // bookmark module optional
  }

  return {
    activeOffers,
    applicants,
    savedProfiles,
    profileViews,
  };
}

async function uploadBrandImage(
  userId: string,
  file: UploadedFile,
  kind: 'logo' | 'cover',
): Promise<IEmployerProfileDocument> {
  validateImageMime(file.mimetype);
  const dimensions = await validateImageBuffer(file.buffer);

  const key = storageKeyFor(userId, kind, file.originalname);
  const stored = await getStorage().upload(key, file.buffer, file.mimetype);

  const asset = await mediaService.createAsset({
    ownerUserId: userId,
    kind,
    storageKey: stored.storageKey,
    url: stored.url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    width: dimensions.width,
    height: dimensions.height,
  });

  const profile = await requireByUserId(userId);
  if (kind === 'logo') {
    profile.logoId = asset._id as Types.ObjectId;
  } else {
    profile.coverId = asset._id as Types.ObjectId;
  }

  return profile.save();
}

export async function uploadLogo(
  userId: string,
  file: UploadedFile,
): Promise<IEmployerProfileDocument> {
  return uploadBrandImage(userId, file, 'logo');
}

export async function uploadCover(
  userId: string,
  file: UploadedFile,
): Promise<IEmployerProfileDocument> {
  return uploadBrandImage(userId, file, 'cover');
}

export async function adminList(query: AdminEmployerListQuery): Promise<{
  data: IEmployerProfileDocument[];
  meta: ReturnType<typeof paginationMeta>;
}> {
  const filter: FilterQuery<IEmployerProfileDocument> = {};
  if (query.status) filter.status = query.status;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  const modelQuery = EmployerProfile.find(filter);
  const builder = new QueryBuilder<IEmployerProfileDocument>(modelQuery, query);

  if (query.q?.trim()) {
    builder.search(['name', 'city', 'address', 'phone']);
  }

  builder.sort('-createdAt').paginate(SEARCH_PAGE_SIZE);

  const [data, total] = await Promise.all([
    builder.query.exec(),
    EmployerProfile.countDocuments(filter),
  ]);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function adminRequests(): Promise<IEmployerProfileDocument[]> {
  return EmployerProfile.find({ status: 'pending' }).sort({ createdAt: -1 });
}

export async function adminFindById(id: string): Promise<IEmployerProfileDocument> {
  const profile = await EmployerProfile.findById(id);
  if (!profile) {
    throw new ApiError(404, 'Employer profile not found');
  }
  return profile;
}

export async function adminDecision(
  id: string,
  input: EmployerDecisionInput,
): Promise<IEmployerProfileDocument> {
  const profile = await adminFindById(id);

  if (input.status === 'active') {
    profile.status = 'active';
    profile.verified = true;
    profile.reviewedBy = toObjectId(input.adminUserId);
    profile.reviewedAt = new Date();
    profile.rejectionReason = null;
  } else {
    if (!input.rejectionReason?.trim()) {
      throw new ApiError(422, 'A rejection reason is required');
    }
    profile.status = 'rejected';
    profile.verified = false;
    profile.reviewedBy = toObjectId(input.adminUserId);
    profile.reviewedAt = new Date();
    profile.rejectionReason = input.rejectionReason.trim();
  }

  return profile.save();
}

export async function adminBlock(
  id: string,
  blocked: boolean,
  reason?: string,
): Promise<IEmployerProfileDocument> {
  const profile = await adminFindById(id);
  profile.status = blocked ? 'blocked' : 'active';
  if (blocked && reason?.trim()) {
    profile.rejectionReason = reason.trim();
  }
  if (!blocked) {
    profile.rejectionReason = null;
  }
  return profile.save();
}
