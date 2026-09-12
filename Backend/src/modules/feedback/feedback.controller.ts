import { Request, Response } from 'express';
import { catchAsync } from '@/shared/catchAsync';
import { sendResponse } from '@/shared/sendResponse';
import * as feedbackService from './feedback.service';

export const create = catchAsync(async (req: Request, res: Response) => {
  const feedback = await feedbackService.create({
    userId: req.user!.id,
    role: req.body.role,
    rating: req.body.rating,
    message: req.body.message,
  });
  sendResponse({ res, statusCode: 201, message: 'Feedback submitted', data: feedback });
});

export const listAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await feedbackService.listAdmin(req.query);
  sendResponse({
    res,
    message: 'Feedback retrieved',
    data: result.data,
    meta: result.meta,
  });
});

export const reply = catchAsync(async (req: Request, res: Response) => {
  const feedback = await feedbackService.reply(String(req.params.id), {
    adminUserId: req.user!.id,
    body: req.body.body,
  });
  sendResponse({ res, message: 'Reply sent', data: feedback });
});
