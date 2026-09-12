import { Types } from 'mongoose';
import { ApiError } from '@/shared/ApiError';
import { LocalizedString } from '@/shared/localizedString';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import { DEFAULT_NOTIFICATION_LIMIT, NotificationType } from './notification.constant';
import {
  CreateNotificationInput,
  INotificationDocument,
  NotificationListQuery,
} from './notification.interface';
import { Notification } from './notification.model';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

function ensureTrilingual(
  value: LocalizedString | { fr: string; ar?: string; en?: string },
): LocalizedString {
  return {
    fr: value.fr,
    ar: value.ar?.trim() || value.fr,
    en: value.en?.trim() || value.fr,
  };
}

export async function create(input: CreateNotificationInput): Promise<INotificationDocument> {
  return Notification.create({
    userId: toObjectId(input.userId),
    type: input.type,
    title: ensureTrilingual(input.title),
    body: ensureTrilingual(input.body),
    data: input.data ?? {},
    read: false,
    readAt: null,
    emailSentAt: null,
  });
}

export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: LocalizedString | { fr: string; ar?: string; en?: string },
  body: LocalizedString | { fr: string; ar?: string; en?: string },
  data?: Record<string, unknown>,
): Promise<INotificationDocument> {
  return create({ userId, type, title, body, data });
}

export async function list(
  userId: string,
  query: NotificationListQuery = {},
): Promise<{ data: INotificationDocument[]; meta: ReturnType<typeof paginationMeta> }> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || DEFAULT_NOTIFICATION_LIMIT), 100);

  const filter: Record<string, unknown> = { userId: toObjectId(userId) };
  if (query.read === 'true') filter.read = true;
  if (query.read === 'false') filter.read = false;

  const modelQuery = Notification.find(filter);
  const builder = new QueryBuilder<INotificationDocument>(modelQuery, query);
  builder.sort('-createdAt').paginate(DEFAULT_NOTIFICATION_LIMIT);

  const [data, total] = await Promise.all([
    builder.query.exec(),
    Notification.countDocuments(filter),
  ]);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function markRead(
  userId: string,
  notificationId: string,
): Promise<INotificationDocument> {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId: toObjectId(userId),
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
}

export async function markAllRead(userId: string): Promise<number> {
  const result = await Notification.updateMany(
    { userId: toObjectId(userId), read: false },
    { read: true, readAt: new Date() },
  );

  return result.modifiedCount;
}

export async function listEmailOutbox(limit = 100): Promise<INotificationDocument[]> {
  return Notification.find({ emailSentAt: null }).sort({ createdAt: 1 }).limit(limit);
}

export async function listAdminOutbox(limit = 100): Promise<Record<string, unknown>[]> {
  const { User } = await import('@/modules/user/user.model');

  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(1, limit), 200))
    .lean();

  const userIds = notifications.map((n: any) => n.userId);
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } })
        .select('email role')
        .lean()
    : [];
  const userById = new Map<string, { _id: unknown; email?: string }>(
    users.map((u: any) => [String(u._id), u]),
  );

  return notifications.map((n: any) => {
    const user = userById.get(String(n.userId));
    return {
      id: String(n._id),
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      read: n.read,
      readAt: n.readAt,
      emailSentAt: n.emailSentAt,
      createdAt: n.createdAt,
      to: user
        ? {
            id: String(user._id),
            email: user.email,
            name: user.email?.split('@')[0],
          }
        : { id: String(n.userId) },
      emailQueued: n.emailSentAt == null,
    };
  });
}

export async function markEmailSent(ids: Types.ObjectId[] | string[]): Promise<number> {
  if (ids.length === 0) return 0;

  const result = await Notification.updateMany(
    { _id: { $in: ids.map((id) => toObjectId(id)) } },
    { emailSentAt: new Date() },
  );

  return result.modifiedCount;
}

const APPLICATION_STATUS_MESSAGES: Record<
  string,
  { title: LocalizedString; body: LocalizedString }
> = {
  pending: {
    title: {
      fr: 'Candidature envoyée',
      ar: 'تم إرسال الترشيح',
      en: 'Application submitted',
    },
    body: {
      fr: 'Votre candidature a bien été enregistrée.',
      ar: 'تم تسجيل ترشيحكم بنجاح.',
      en: 'Your application has been recorded.',
    },
  },
  shortlisted: {
    title: {
      fr: 'Candidature présélectionnée',
      ar: 'تم اختيار ترشيحكم',
      en: 'Application shortlisted',
    },
    body: {
      fr: 'Votre candidature a été présélectionnée par l\'employeur.',
      ar: 'تم اختيار ترشيحكم من قبل المشغّل.',
      en: 'Your application has been shortlisted by the employer.',
    },
  },
  rejected: {
    title: {
      fr: 'Candidature refusée',
      ar: 'تم رفض الترشيح',
      en: 'Application rejected',
    },
    body: {
      fr: 'Votre candidature n\'a pas été retenue pour cette offre.',
      ar: 'لم يتم الاحتفاظ بترشيحكم لهذا العرض.',
      en: 'Your application was not retained for this offer.',
    },
  },
  hired: {
    title: {
      fr: 'Candidature acceptée',
      ar: 'تم قبول الترشيح',
      en: 'Application accepted',
    },
    body: {
      fr: 'Félicitations — l\'employeur a retenu votre candidature.',
      ar: 'تهانينا — المشغّل قبل ترشيحكم.',
      en: 'Congratulations — the employer has accepted your application.',
    },
  },
};

export async function notifyApplicationStatusChange(
  application: {
    _id: Types.ObjectId;
    candidateId: Types.ObjectId;
    jobId: Types.ObjectId;
  },
  status: string,
): Promise<void> {
  try {
    const { CandidateProfile } = await import('@/modules/candidate/candidate.model');
    const candidate = await CandidateProfile.findById(application.candidateId);
    if (!candidate) return;

    const messages = APPLICATION_STATUS_MESSAGES[status];
    if (!messages) return;

    await notifyUser(
      String(candidate.userId),
      'application',
      messages.title,
      messages.body,
      {
        applicationId: String(application._id),
        jobId: String(application.jobId),
        status,
      },
    );
  } catch {
    // optional dependency chain
  }
}
