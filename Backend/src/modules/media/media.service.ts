import { Types } from 'mongoose';
import path from 'path';
import { ApiError } from '@/shared/ApiError';
import { getStorage } from '@/utils/storage';
import { validateImageBuffer, validateImageMime } from '@/middlewares/upload';
import { MediaAsset } from '@/modules/media/media.model';
import {
  CreateMediaAssetInput,
  DecideModerationInput,
  IMediaAssetDocument,
} from '@/modules/media/media.interface';

function toObjectId(value: Types.ObjectId | string): Types.ObjectId {
  return typeof value === 'string' ? new Types.ObjectId(value) : value;
}

export async function createAsset(input: CreateMediaAssetInput): Promise<IMediaAssetDocument> {
  return MediaAsset.create({
    ownerUserId: toObjectId(input.ownerUserId),
    kind: input.kind,
    storageKey: input.storageKey,
    url: input.url,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    width: input.width ?? null,
    height: input.height ?? null,
    moderationStatus: 'pending',
    reportCount: 0,
  });
}

export async function findById(id: string): Promise<IMediaAssetDocument | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  return MediaAsset.findById(id);
}

export async function decideModeration(
  id: string,
  input: DecideModerationInput,
): Promise<IMediaAssetDocument> {
  const asset = await findById(id);
  if (!asset) {
    throw new ApiError(404, 'Media asset not found');
  }

  if (input.status === 'rejected' && !input.reason?.trim()) {
    throw new ApiError(422, 'A rejection reason is required');
  }

  asset.moderationStatus = input.status;
  asset.moderationReason = input.status === 'rejected' ? input.reason!.trim() : null;
  asset.reviewedBy = toObjectId(input.reviewedBy);
  asset.reviewedAt = new Date();

  return asset.save();
}

export async function listPending(limit = 50, skip = 0): Promise<IMediaAssetDocument[]> {
  return MediaAsset.find({ moderationStatus: 'pending' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

export async function softDelete(id: string): Promise<IMediaAssetDocument> {
  const asset = await findById(id);
  if (!asset) {
    throw new ApiError(404, 'Media asset not found');
  }
  return asset.softDelete();
}

export async function listReports(limit = 50, skip = 0) {
  const { ModerationReport } = await import('./moderationReport.model');
  return ModerationReport.find({ status: 'open' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export async function adminUpload(
  ownerUserId: string,
  kind: 'homepage' | 'banner',
  file: UploadedFile,
): Promise<{ id: string; url: string }> {
  validateImageMime(file.mimetype);
  const dimensions = await validateImageBuffer(file.buffer);

  const ext = path.extname(file.originalname) || '.bin';
  const key = `admin/${kind}-${Date.now()}${ext}`;
  const stored = await getStorage().upload(key, file.buffer, file.mimetype);

  const asset = await createAsset({
    ownerUserId,
    kind,
    storageKey: stored.storageKey,
    url: stored.url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    width: dimensions.width,
    height: dimensions.height,
  });

  asset.moderationStatus = 'approved';
  await asset.save();

  return { id: String(asset._id), url: asset.url };
}
