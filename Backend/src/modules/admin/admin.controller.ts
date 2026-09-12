import { Request, Response } from 'express';
import { catchAsync } from '@/shared/catchAsync';
import { sendResponse } from '@/shared/sendResponse';
import * as adminService from './admin.service';

export const listAdmins = catchAsync(async (_req: Request, res: Response) => {
  const data = await adminService.listAdmins();
  sendResponse({ res, message: 'Admins retrieved', data });
});

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await adminService.createAdmin(req.body);
  sendResponse({ res, statusCode: 201, message: 'Admin created', data: admin });
});

export const updatePermissions = catchAsync(async (req: Request, res: Response) => {
  const admin = await adminService.updatePermissions(
    String(req.params.id),
    req.body.permissions,
    {
      id: req.user!.id,
      adminLevel: req.user!.adminLevel,
      permissions: req.user!.permissions,
    },
  );
  sendResponse({ res, message: 'Admin permissions updated', data: admin });
});

export const disableAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await adminService.disableAdmin(String(req.params.id));
  sendResponse({ res, message: 'Admin disabled', data: admin });
});
