import { Types } from 'mongoose';
import type { FilterQuery } from '@/types/mongoose';
import { ApiError } from '@/shared/ApiError';
import { paginationMeta, QueryBuilder } from '@/shared/QueryBuilder';
import * as notificationService from '@/modules/notification/notification.service';
import { DEFAULT_FEEDBACK_LIMIT } from './feedback.constant';
import {
  AdminFeedbackListQuery,
  CreateFeedbackInput,
  IFeedbackDocument,
  ReplyFeedbackInput,
} from './feedback.interface';
import { Feedback } from './feedback.model';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

export async function create(input: CreateFeedbackInput): Promise<IFeedbackDocument> {
  return Feedback.create({
    userId: toObjectId(input.userId),
    role: input.role,
    rating: input.rating,
    message: input.message.trim(),
    messages: [],
    status: 'new',
  });
}

export async function listAdmin(query: AdminFeedbackListQuery = {}): Promise<{
  data: IFeedbackDocument[];
  meta: ReturnType<typeof paginationMeta>;
}> {
  const filter: FilterQuery<IFeedbackDocument> = {};
  if (query.status) filter.status = query.status;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || DEFAULT_FEEDBACK_LIMIT), 100);

  const modelQuery = Feedback.find(filter);
  const builder = new QueryBuilder<IFeedbackDocument>(modelQuery, query);
  builder.sort('-createdAt').paginate(DEFAULT_FEEDBACK_LIMIT);

  const [data, total] = await Promise.all([
    builder.query.exec(),
    Feedback.countDocuments(filter),
  ]);

  return { data, meta: paginationMeta(page, limit, total) };
}

export async function reply(
  id: string,
  input: ReplyFeedbackInput,
): Promise<IFeedbackDocument> {
  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  const body = input.body.trim();
  if (!body) {
    throw new ApiError(422, 'Reply body is required');
  }

  feedback.messages.push({
    authorUserId: toObjectId(input.adminUserId),
    body,
    at: new Date(),
    role: 'admin',
  });
  feedback.status = 'answered';
  await feedback.save();

  await notificationService.notifyUser(
    String(feedback.userId),
    'feedback-reply',
    {
      fr: 'Réponse à votre retour',
      ar: 'جواب على ملاحظتكم',
      en: 'Reply to your feedback',
    },
    {
      fr: body,
      ar: body,
      en: body,
    },
    { feedbackId: String(feedback._id) },
  );

  return feedback;
}
