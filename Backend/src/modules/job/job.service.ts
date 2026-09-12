import { Types } from 'mongoose';
import { ApiError } from '@/shared/ApiError';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import { ModerationReport } from '@/modules/media/moderationReport.model';
import {
  DEFAULT_CURRENCY,
  OFFER_DURATION_DAYS,
  SEARCH_PAGE_SIZE,
} from './job.constant';
import {
  assertTransition,
  getEffectiveExpiry,
  getTransitionTarget,
} from './job.lifecycle';
import {
  AdminDecisionInput,
  CreateJobInput,
  ExtendJobInput,
  GroupedEmployerJobs,
  IJobDocument,
  JobSearchQuery,
  UpdateJobInput,
} from './job.interface';
import { Job } from './job.model';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function resolveEmployerProfileId(userId: string): Promise<Types.ObjectId> {
  try {
    const { EmployerProfile } = await import('@/modules/employer/employer.model');
    const profile = await EmployerProfile.findOne({ userId: toObjectId(userId) });
    if (!profile) {
      throw new ApiError(404, 'Employer profile not found');
    }
    return profile._id;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(404, 'Employer profile not found');
  }
}

export async function create(input: CreateJobInput): Promise<IJobDocument> {
  const employerId = await resolveEmployerProfileId(input.employerUserId);
  const status = input.asDraft ? 'draft' : 'pending';

  return Job.create({
    employerId,
    title: input.title,
    description: input.description,
    sectorId: input.sectorId,
    positionId: input.positionId,
    city: input.city,
    country: input.country ?? 'MA',
    contractType: input.contractType,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    currency: input.currency ?? DEFAULT_CURRENCY,
    experience: input.experience,
    requirements: input.requirements ?? [],
    benefits: input.benefits ?? [],
    status,
    viewCount: 0,
    applicationCount: 0,
    reportCount: 0,
  });
}

async function findOwnedJob(jobId: string, employerUserId: string): Promise<IJobDocument> {
  const employerId = await resolveEmployerProfileId(employerUserId);
  const job = await Job.findOne({ _id: jobId, employerId });
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }
  return job;
}

export async function update(
  jobId: string,
  employerUserId: string,
  input: UpdateJobInput,
): Promise<IJobDocument> {
  const job = await findOwnedJob(jobId, employerUserId);
  const wasActive = job.status === 'active';

  if (input.title) job.title = input.title;
  if (input.description) job.description = input.description;
  if (input.sectorId) job.sectorId = input.sectorId;
  if (input.positionId) job.positionId = input.positionId;
  if (input.city) job.city = input.city;
  if (input.country) job.country = input.country;
  if (input.contractType) job.contractType = input.contractType;
  if (input.salaryMin !== undefined) job.salaryMin = input.salaryMin;
  if (input.salaryMax !== undefined) job.salaryMax = input.salaryMax;
  if (input.currency) job.currency = input.currency;
  if (input.experience) job.experience = input.experience;
  if (input.requirements) job.requirements = input.requirements;
  if (input.benefits) job.benefits = input.benefits;

  if (input.submit && job.status === 'draft') {
    job.status = assertTransition(job.status, 'submit');
  } else if (wasActive) {
    job.status = assertTransition(job.status, 'editActive');
    job.postedAt = null;
    job.expiresAt = null;
    job.approvedBy = null;
    job.approvedAt = null;
  }

  return job.save();
}

export async function close(jobId: string, employerUserId: string): Promise<IJobDocument> {
  const job = await findOwnedJob(jobId, employerUserId);
  job.status = assertTransition(job.status, 'close');
  return job.save();
}

export async function republish(jobId: string, employerUserId: string): Promise<IJobDocument> {
  const job = await findOwnedJob(jobId, employerUserId);
  job.status = assertTransition(job.status, 'republish');
  job.republishedAt = new Date();
  job.postedAt = null;
  job.expiresAt = null;
  job.extendedUntil = null;
  job.approvedBy = null;
  job.approvedAt = null;
  job.rejectionReason = null;
  return job.save();
}

type JobListFilter = Record<string, unknown>;

async function buildSearchFilter(query: JobSearchQuery): Promise<JobListFilter> {
  const filter: JobListFilter = { status: 'active' };

  if (query.city) filter.city = query.city;
  if (query.sectorId) filter.sectorId = query.sectorId;
  if (query.positionId) filter.positionId = query.positionId;
  if (query.contractType) filter.contractType = query.contractType;
  if (query.experience) filter.experience = query.experience;

  if (query.establishmentType) {
    try {
      const { EmployerProfile } = await import('@/modules/employer/employer.model');
      const employers = await EmployerProfile.find({ type: query.establishmentType }).select('_id');
      filter.employerId = { $in: employers.map((e: any) => e._id) };
    } catch {
      // employer module not available — skip establishment filter
    }
  }

  return filter;
}

export async function search(
  query: JobSearchQuery,
  isGuest: boolean,
): Promise<{ data: IJobDocument[]; meta: ReturnType<typeof paginationMeta> }> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  if (isGuest && page > 1) {
    throw new ApiError(401, 'Sign in to browse more results');
  }

  const baseFilter = await buildSearchFilter(query);
  const modelQuery = Job.find(baseFilter);
  const builder = new QueryBuilder<IJobDocument>(modelQuery, query);

  if (query.q && typeof query.q === 'string' && query.q.trim()) {
    builder.search(['title.fr', 'title.en', 'description.fr', 'description.en']);
  }

  builder.sort('-postedAt').paginate(SEARCH_PAGE_SIZE);

  const [data, total] = await Promise.all([
    builder.query.exec(),
    Job.countDocuments(baseFilter),
  ]);

  return {
    data,
    meta: paginationMeta(page, limit, total, isGuest),
  };
}

export async function featured(limit = 6): Promise<IJobDocument[]> {
  return Job.find({ status: 'active' }).sort({ postedAt: -1 }).limit(limit);
}

export async function findById(id: string, incrementView = false): Promise<IJobDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  if (incrementView) {
    return Job.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
  }

  return Job.findById(id);
}

export async function listMine(employerUserId: string): Promise<GroupedEmployerJobs> {
  const employerId = await resolveEmployerProfileId(employerUserId);
  const jobs = await Job.find({ employerId }).sort({ updatedAt: -1 });

  const grouped: GroupedEmployerJobs = {
    active: [],
    pending: [],
    expired: [],
    draft: [],
    rejected: [],
    closed: [],
  };

  for (const job of jobs) {
    const status = job.status as keyof GroupedEmployerJobs;
    if (grouped[status]) {
      grouped[status].push(job);
    }
  }

  return grouped;
}

export async function report(
  jobId: string,
  reason: string,
  reporterUserId?: string,
): Promise<IJobDocument> {
  const job = await findById(jobId);
  if (!job || job.status !== 'active') {
    throw new ApiError(404, 'Job not found');
  }

  await ModerationReport.create({
    targetType: 'job',
    targetId: job._id,
    reporterUserId: reporterUserId ? toObjectId(reporterUserId) : null,
    reason: reason.trim(),
    status: 'open',
  });

  job.reportCount += 1;
  return job.save();
}

export async function adminList(query: JobSearchQuery): Promise<{
  data: IJobDocument[];
  meta: ReturnType<typeof paginationMeta>;
}> {
  const filter: JobListFilter = {};
  if (query.employerId) filter.employerId = toObjectId(String(query.employerId));
  if (query.status) filter.status = query.status;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || SEARCH_PAGE_SIZE), 100);

  const modelQuery = Job.find(filter);
  const builder = new QueryBuilder<IJobDocument>(modelQuery, query)
    .sort('-createdAt')
    .paginate(SEARCH_PAGE_SIZE);

  const [data, total] = await Promise.all([builder.query.exec(), Job.countDocuments(filter)]);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function adminListByEmployer(): Promise<
  Array<{ employerId: string; counts: Record<string, number>; total: number }>
> {
  const rows = await Job.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: { employerId: '$employerId', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const employerId = String(row._id.employerId);
    const status = row._id.status as string;
    if (!map.has(employerId)) map.set(employerId, {});
    map.get(employerId)![status] = row.count;
  }

  return [...map.entries()].map(([employerId, counts]) => ({
    employerId,
    counts,
    total: Object.values(counts).reduce((sum, n) => sum + n, 0),
  }));
}

export async function adminFindById(id: string): Promise<IJobDocument> {
  const job = await findById(id);
  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

export async function adminDecision(id: string, input: AdminDecisionInput): Promise<IJobDocument> {
  const job = await adminFindById(id);

  if (input.status === 'active') {
    job.status = assertTransition(job.status, 'approve');
    const now = new Date();
    job.postedAt = now;
    job.expiresAt = addDays(now, OFFER_DURATION_DAYS);
    job.approvedBy = toObjectId(input.adminUserId);
    job.approvedAt = now;
    job.rejectionReason = null;
  } else {
    job.status = assertTransition(job.status, 'reject');
    if (!input.rejectionReason?.trim()) {
      throw new ApiError(422, 'A rejection reason is required');
    }
    job.rejectionReason = input.rejectionReason.trim();
    job.approvedBy = null;
    job.approvedAt = null;
  }

  return job.save();
}

export async function adminExtend(id: string, input: ExtendJobInput): Promise<IJobDocument> {
  const job = await adminFindById(id);
  if (job.status !== 'active' && job.status !== 'expired') {
    throw new ApiError(409, 'Only active or expired offers can be extended');
  }
  job.extendedUntil = input.extendedUntil;
  if (job.status === 'expired') {
    job.status = getTransitionTarget('approve');
    if (!job.postedAt) job.postedAt = new Date();
    if (!job.expiresAt) job.expiresAt = addDays(job.postedAt, OFFER_DURATION_DAYS);
  }
  return job.save();
}

export async function adminDelete(id: string): Promise<IJobDocument> {
  const job = await adminFindById(id);
  return job.softDelete();
}

export async function expireDueJobs(): Promise<number> {
  const now = new Date();
  const activeJobs = await Job.find({ status: 'active' });
  let expiredCount = 0;

  for (const job of activeJobs) {
    const effectiveExpiry = getEffectiveExpiry(job.expiresAt, job.extendedUntil);
    if (effectiveExpiry && effectiveExpiry <= now) {
      job.status = assertTransition(job.status, 'expire');
      await job.save();
      expiredCount += 1;
    }
  }

  return expiredCount;
}
