import { Router } from 'express';
import { auth, authorize } from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validateRequest';
import * as adminActivityController from './admin.activity.controller';
import { activityListQuerySchema } from './admin.validation';

const router = Router();

router.use(auth(), authorize('admin'));

router.get(
  '/',
  validateRequest({ query: activityListQuerySchema }),
  adminActivityController.list,
);

export default router;
