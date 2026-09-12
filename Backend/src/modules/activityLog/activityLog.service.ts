import { Types } from 'mongoose';
import { IActivityLogDocument, LogActivityInput } from './activityLog.interface';
import { ActivityLog } from './activityLog.model';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

export async function log(input: LogActivityInput): Promise<IActivityLogDocument> {
  return ActivityLog.create({
    actorUserId: input.actorUserId ? toObjectId(input.actorUserId) : null,
    actorLabel: input.actorLabel,
    action: input.action,
    targetType: input.targetType,
    targetId: toObjectId(input.targetId),
    detail: input.detail,
    ip: input.ip,
    userAgent: input.userAgent,
  });
}
