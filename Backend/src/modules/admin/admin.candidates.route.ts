import { Router } from 'express';
import { auth, hasPermission } from '@/middlewares/auth';
import { validateRequest } from '@/middlewares/validateRequest';
import * as adminCandidatesController from './admin.candidates.controller';
import {
  adminCandidateListQuerySchema,
  candidateIdParamSchema,
  setCandidateStatusSchema,
  setVerificationSchema,
} from './admin.validation';

const router = Router();

router.use(auth());

router.get(
  '/export',
  hasPermission('export-cv'),
  adminCandidatesController.exportCsv,
);

router.get(
  '/',
  hasPermission('manage-candidates'),
  validateRequest({ query: adminCandidateListQuerySchema }),
  adminCandidatesController.list,
);

router.get(
  '/:id',
  hasPermission('manage-candidates'),
  validateRequest({ params: candidateIdParamSchema }),
  adminCandidatesController.findById,
);

router.patch(
  '/:id/verification',
  hasPermission('manage-candidates'),
  validateRequest({ params: candidateIdParamSchema, body: setVerificationSchema }),
  adminCandidatesController.setVerification,
);

router.patch(
  '/:id/status',
  hasPermission('manage-candidates'),
  validateRequest({ params: candidateIdParamSchema, body: setCandidateStatusSchema }),
  adminCandidatesController.setStatus,
);

router.delete(
  '/:id',
  hasPermission('delete-users'),
  validateRequest({ params: candidateIdParamSchema }),
  adminCandidatesController.remove,
);

export default router;
