import { Router } from 'express';
import { auth, authorize } from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validateRequest';
import * as adminNotificationsController from './admin.notifications.controller';
import { adminOutboxQuerySchema } from './admin.validation';

const router = Router();

router.use(auth(), authorize('admin'));

router.get(
  '/outbox',
  validateRequest({ query: adminOutboxQuerySchema }),
  adminNotificationsController.outbox,
);

export default router;
