import { Types } from 'mongoose';
import { ApiError } from '@/shared/ApiError';
import { BookmarkKind } from './bookmark.constant';
import { CreateBookmarkInput, IBookmarkDocument } from './bookmark.interface';
import { Bookmark } from './bookmark.model';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}

export async function list(ownerUserId: string, kind: BookmarkKind): Promise<IBookmarkDocument[]> {
  return Bookmark.find({
    ownerUserId: toObjectId(ownerUserId),
    kind,
  }).sort({ createdAt: -1 });
}

export async function create(input: CreateBookmarkInput): Promise<IBookmarkDocument> {
  try {
    return await Bookmark.create({
      kind: input.kind,
      ownerUserId: toObjectId(input.ownerUserId),
      targetId: toObjectId(input.targetId),
      note: input.note?.trim() || null,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new ApiError(409, 'Bookmark already exists');
    }
    throw err;
  }
}

export async function remove(
  ownerUserId: string,
  kind: BookmarkKind,
  targetId: string,
): Promise<void> {
  const result = await Bookmark.deleteOne({
    ownerUserId: toObjectId(ownerUserId),
    kind,
    targetId: toObjectId(targetId),
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Bookmark not found');
  }
}
