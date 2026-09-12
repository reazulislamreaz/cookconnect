import { Request, Response } from 'express';
import { catchAsync } from '@/shared/catchAsync';
import { sendResponse } from '@/shared/sendResponse';
import { CandidateProfile } from '@/modules/candidate/candidate.model';
import * as candidateService from '@/modules/candidate/candidate.service';

export const list = catchAsync(async (req: Request, res: Response) => {
  const result = await candidateService.adminList(req.query as any);
  sendResponse({ res, message: 'Candidates retrieved', data: result.data, meta: result.meta });
});

export const findById = catchAsync(async (req: Request, res: Response) => {
  const revealContact = req.query.revealContact === 'true';
  const candidate = await candidateService.adminFindById(String(req.params.id), {
    revealContact,
    viewer: req.user
      ? {
          id: req.user.id,
          role: req.user.role as 'admin',
          permissions: req.user.permissions,
          adminLevel: req.user.adminLevel,
        }
      : null,
    ip: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
  });
  sendResponse({ res, message: 'Candidate retrieved', data: candidate });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.adminUpdate(
    String(req.params.id),
    req.body,
    req.user!.id,
  );
  sendResponse({ res, message: 'Candidate updated', data: candidate });
});

export const listApplications = catchAsync(async (req: Request, res: Response) => {
  const data = await candidateService.adminListApplications(String(req.params.id));
  sendResponse({ res, message: 'Candidate applications retrieved', data });
});

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const data = await candidateService.adminGetHistory(String(req.params.id));
  sendResponse({ res, message: 'Candidate history retrieved', data });
});

export const addSkill = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.adminAddSkill(
    String(req.params.id),
    req.body.skillId,
    req.user!.id,
  );
  sendResponse({ res, message: 'Skill added', data: candidate });
});

export const removeSkill = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.adminRemoveSkill(
    String(req.params.id),
    String(req.params.skillId),
    req.user!.id,
  );
  sendResponse({ res, message: 'Skill removed', data: candidate });
});

export const setVerification = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.setVerification(String(req.params.id), {
    verified: req.body.verified,
    adminUserId: req.user!.id,
  });
  sendResponse({ res, message: 'Verification updated', data: candidate });
});

export const setStatus = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.setStatus(
    String(req.params.id),
    { status: req.body.status },
    req.user!.id,
  );
  sendResponse({ res, message: 'Candidate status updated', data: candidate });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const candidate = await candidateService.softDelete(String(req.params.id));
  sendResponse({ res, message: 'Candidate deleted', data: candidate });
});

export const exportCsv = catchAsync(async (_req: Request, res: Response) => {
  const candidates: any[] = await CandidateProfile.find().select('+phone').sort({ createdAt: -1 }).lean();

  const header = [
    'id',
    'firstName',
    'lastName',
    'city',
    'positionId',
    'sectorId',
    'phone',
    'verified',
    'completionPercent',
    'createdAt',
  ];

  const escape = (value: unknown): string => {
    const text = value == null ? '' : String(value);
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const rows = candidates.map((candidate) =>
    [
      String(candidate._id),
      candidate.firstName,
      candidate.lastName,
      candidate.city,
      candidate.positionId,
      candidate.sectorId,
      candidate.phone,
      candidate.verified,
      candidate.completionPercent,
      candidate.createdAt ? new Date(candidate.createdAt).toISOString() : '',
    ]
      .map(escape)
      .join(','),
  );

  const csv = `\uFEFF${[header.join(','), ...rows].join('\n')}`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
  res.status(200).send(csv);
});
