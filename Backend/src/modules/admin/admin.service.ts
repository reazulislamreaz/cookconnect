import { ApiError } from '@/shared/ApiError';
import { hashPassword } from '@/utils/crypto';
import * as userService from '@/modules/user/user.service';
import {
  ALL_ADMIN_PERMISSIONS,
  AdminPermission,
} from '@/modules/user/user.constant';
import { IUserDocument } from '@/modules/user/user.interface';
import { User } from '@/modules/user/user.model';

const PERMISSION_SET = new Set<string>(ALL_ADMIN_PERMISSIONS);

function sanitizePermissions(permissions: string[]): AdminPermission[] {
  return permissions.filter((p): p is AdminPermission => PERMISSION_SET.has(p));
}

export async function listAdmins(): Promise<IUserDocument[]> {
  return User.find({ role: 'admin', deletedAt: null }).sort({ createdAt: -1 });
}

export async function createAdmin(input: {
  email: string;
  password: string;
  permissions: string[];
}): Promise<IUserDocument> {
  const existing = await userService.findByEmail(input.email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  return User.create({
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: 'admin',
    status: 'active',
    emailVerified: true,
    adminLevel: 'sub',
    permissions: sanitizePermissions(input.permissions),
  });
}

export async function updatePermissions(
  targetId: string,
  permissions: string[],
  actor: { id: string; adminLevel?: 'super' | 'sub' | null; permissions: string[] },
): Promise<IUserDocument> {
  const target = await User.findById(targetId);
  if (!target || target.role !== 'admin') {
    throw new ApiError(404, 'Admin account not found');
  }

  if (target.adminLevel === 'super') {
    throw new ApiError(403, 'Super admin permissions cannot be modified');
  }

  let next = sanitizePermissions(permissions);

  if (actor.adminLevel === 'sub' && actor.id === targetId) {
    const actorPermissions = new Set(actor.permissions);
    const illegal = next.some((permission) => !actorPermissions.has(permission));
    if (illegal) {
      throw new ApiError(403, 'You cannot grant yourself permissions you do not have');
    }
  }

  if (actor.adminLevel === 'sub' && actor.id !== targetId) {
    const actorPermissions = new Set(actor.permissions);
    next = next.filter((permission) => actorPermissions.has(permission));
  }

  target.permissions = next;
  return target.save();
}

export async function disableAdmin(id: string): Promise<IUserDocument> {
  const admin = await User.findById(id);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(404, 'Admin account not found');
  }

  if (admin.adminLevel === 'super') {
    throw new ApiError(403, 'Super admin cannot be disabled');
  }

  admin.status = 'suspended';
  return admin.save();
}

export async function findAdminById(id: string): Promise<IUserDocument> {
  const admin = await User.findById(id);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(404, 'Admin account not found');
  }
  return admin;
}
