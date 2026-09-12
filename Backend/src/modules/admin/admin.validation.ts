import { z } from 'zod';
import { ALL_ADMIN_PERMISSIONS } from '@/modules/user/user.constant';

export const createAdminSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  permissions: z.array(z.enum(ALL_ADMIN_PERMISSIONS)).default([]),
});

export const updateAdminPermissionsSchema = z.object({
  permissions: z.array(z.enum(ALL_ADMIN_PERMISSIONS)),
});

export const adminIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid admin id'),
});

export const adminCandidateListQuerySchema = z.object({
  verified: z.enum(['true', 'false']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const candidateIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid candidate id'),
});

export const setVerificationSchema = z.object({
  verified: z.boolean(),
});

export const setCandidateStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'deleted']),
});

export const adminEmployerListQuerySchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const employerDecisionSchema = z.object({
  status: z.enum(['active', 'rejected']),
  rejectionReason: z.string().trim().optional(),
});

export const employerBlockSchema = z.object({
  blocked: z.boolean(),
  reason: z.string().trim().optional(),
});

export const moderationPhotosQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const moderationDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().trim().optional(),
});

export const mediaIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid media id'),
});

export const activityListQuerySchema = z.object({
  type: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
