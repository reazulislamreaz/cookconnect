import { Request, Response } from 'express';
import { catchAsync } from '@/shared/catchAsync';
import { sendResponse } from '@/shared/sendResponse';
import * as activityLogService from '@/modules/activityLog/activityLog.service';
import * as mediaService from '@/modules/media/media.service';

export const listPhotos = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 50), 100);
  const skip = (page - 1) * limit;

  const status = String(req.query.status ?? 'pending');
  const data =
    status === 'pending'
      ? await mediaService.listPending(limit, skip)
      : [];

  sendResponse({ res, message: 'Photos retrieved', data });
});

export const decidePhoto = catchAsync(async (req: Request, res: Response) => {
  const asset = await mediaService.decideModeration(String(req.params.id), {
    status: req.body.status,
    reason: req.body.reason,
    reviewedBy: req.user!.id,
  });

  await activityLogService.log({
    actorUserId: req.user!.id,
    actorLabel: 'Admin',
    action: req.body.status === 'approved' ? 'photo.approved' : 'photo.rejected',
    targetType: 'media',
    targetId: String(asset._id),
    detail: {
      fr:
        req.body.status === 'approved'
          ? 'Photo approuvée'
          : `Photo refusée${req.body.reason ? ` : ${req.body.reason}` : ''}`,
      en:
        req.body.status === 'approved'
          ? 'Photo approved'
          : `Photo rejected${req.body.reason ? `: ${req.body.reason}` : ''}`,
    },
  });

  sendResponse({ res, message: 'Moderation decision recorded', data: asset });
});

export const listReports = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 50), 100);
  const skip = (page - 1) * limit;
  const data = await mediaService.listReports(limit, skip);
  sendResponse({ res, message: 'Reports retrieved', data });
});
