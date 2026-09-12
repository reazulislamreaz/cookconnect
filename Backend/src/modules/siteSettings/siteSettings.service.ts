import { Types } from 'mongoose';
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_DOC_ID,
} from './siteSettings.constant';
import { ISiteSettingsDocument, UpdateSiteSettingsInput } from './siteSettings.interface';
import { SiteSettings } from './siteSettings.model';

function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

async function ensureDocument(): Promise<ISiteSettingsDocument> {
  let doc = await SiteSettings.findById(SITE_SETTINGS_DOC_ID);
  if (!doc) {
    doc = await SiteSettings.create({
      _id: SITE_SETTINGS_DOC_ID,
      ...DEFAULT_SITE_SETTINGS,
    });
  }
  return doc;
}

export async function getPublic(): Promise<Record<string, unknown>> {
  const doc = await ensureDocument();
  const json = doc.toJSON() as unknown as Record<string, unknown>;
  const { resolveMediaUrl } = await import('@/shared/enrichMedia');
  json.imageUrl = await resolveMediaUrl(doc.imageId);
  return json;
}

export async function getAdmin(): Promise<ISiteSettingsDocument> {
  return ensureDocument();
}

export async function update(input: UpdateSiteSettingsInput): Promise<ISiteSettingsDocument> {
  const doc = await ensureDocument();

  if (input.mode !== undefined) doc.mode = input.mode;
  if (input.imageId !== undefined) {
    doc.imageId = input.imageId ? toObjectId(input.imageId) : null;
  }
  if (input.headline !== undefined) doc.headline = input.headline;
  if (input.subheadline !== undefined) doc.subheadline = input.subheadline;
  if (input.cta !== undefined) doc.cta = input.cta;

  if (doc.mode === 'image' && !doc.imageId) {
    doc.mode = 'blank';
  }

  return doc.save();
}
