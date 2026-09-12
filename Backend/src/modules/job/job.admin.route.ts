import { Router } from 'express';
import { auth, hasPermission } from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validateRequest';
import * as jobAdminController from './job.admin.controller';
import {
  adminDecisionSchema,
  adminExtendSchema,
  adminJobListQuerySchema,
  jobIdParamSchema,
} from './job.validation';

const router = Router();

router.use(auth(), hasPermission('approve-offers'));

router.get('/by-employer', jobAdminController.listByEmployer);

router.get(
  '/',
  validateRequest({ query: adminJobListQuerySchema }),
  jobAdminController.list,
);

router.get(
  '/:id',
  validateRequest({ params: jobIdParamSchema }),
  jobAdminController.findById,
);

router.patch(
  '/:id/decision',
  validateRequest({ params: jobIdParamSchema, body: adminDecisionSchema }),
  jobAdminController.decision,
);

router.patch(
  '/:id/extend',
  validateRequest({ params: jobIdParamSchema, body: adminExtendSchema }),
  jobAdminController.extend,
);

router.delete(
  '/:id',
  validateRequest({ params: jobIdParamSchema }),
  jobAdminController.remove,
);

export default router;
