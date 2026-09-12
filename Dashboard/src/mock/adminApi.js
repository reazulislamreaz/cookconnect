// Mock data-access layer for the dashboard.
//
// Every screen reads through these async functions instead of importing the
// fixtures directly, so swapping them for real `fetch` calls later is a
// one-file change and no component has to be rewritten.
//
// Mutations are *real*. The fixtures are module constants, so an admin who
// approved a restaurant used to watch the row reappear on the next render —
// the button looked broken because nothing it did survived. Instead of mutating
// the fixtures (which would be invisible to React and lost on reload), every
// action writes to an overlay in localStorage that is merged on the way out.
// That is also exactly the shape a real API takes: read, PATCH, re-read.

import { CANDIDATES, getCandidate } from "./candidates";
import { EMPLOYERS, getEmployer } from "./employers";
import {
  JOBS,
  OFFER_STATUSES,
  getJob,
  daysLeft,
  isExpired,
  iso,
  MAX_OFFER_DAYS,
  TODAY,
} from "./jobs";
import { APPLICATIONS } from "./applications";
import {
  ACTION_DETAILS,
  ACTIVITY_LOG,
  ADMINS,
  FEEDBACK,
  PERMISSION_IDS,
  MOST_SEARCHED_CITIES,
  MOST_SEARCHED_TITLES,
  PENDING_PHOTOS,
  REPORTED_OFFERS,
  averageSalary,
  candidateStats,
  employerActivity,
  employerStats,
  offerStats,
  registrationStats,
} from "./admin";
import { NOTIFICATION_TEMPLATES, fillTemplate } from "./adminNotifications";
import {
  COOK_GROWTH,
  DISH_PHOTOS,
  MONTHS,
  PORTRAITS,
  RESTAURANT_GROWTH,
  chefRows,
  dashboardTotals,
  dishPhotosFor,
  jobManagementRows,
  jobsForEmployer,
  restaurantRequests,
  restaurantRows,
} from "./adminDashboard";
import { CITIES } from "./cities";
import { ALL_POSITIONS, SECTORS } from "./sectors";
import { AVAILABILITY, EXPERIENCE_LEVELS, REQUIREMENT_BY_ID } from "./jobOptions";
import { getJSON, getString, setValue, ADMIN_SESSION_KEY } from "@/lib/browserStore";

/** Network-ish pause, so loading states are visible and honest. */
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------------------------------------- API mode */

const USE_API = Boolean(process.env.NEXT_PUBLIC_API_URL);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";
const ADMIN_TOKEN_KEY = "cookkonnekt.adminToken";
const ADMIN_META_KEY = "cookkonnekt.adminMeta";

async function adminFetch(path, options = {}) {
  const token =
    getJSON(ADMIN_META_KEY, null)?.accessToken ||
    getString(ADMIN_TOKEN_KEY, "") ||
    getJSON(ADMIN_SESSION_KEY, null)?.accessToken;

  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

async function adminApi(path, options = {}) {
  const json = await adminFetch(path, options);
  return json.data;
}

async function adminApiWithMeta(path, options = {}) {
  const json = await adminFetch(path, options);
  return { data: json.data, meta: json.meta };
}

function adminQs(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "" && v !== "all") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

function pickL(obj, locale = "fr") {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || obj.fr || obj.en || "";
}

function isoDay(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function mapAdminUser(user) {
  return {
    id: user.id,
    name: user.email?.split("@")[0] || "Admin",
    email: user.email,
    role: user.adminLevel === "super" ? "super" : "sub",
    permissions: user.permissions || [],
    disabled: user.status === "suspended",
    lastActive: user.lastLoginAt ? isoDay(user.lastLoginAt) : "—",
  };
}

function mapCandidateRow(c) {
  const pos = ALL_POSITIONS.find((p) => p.id === c.positionId);
  return {
    id: c.id,
    name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
    photo: c.photoUrl || "",
    sectorId: c.sectorId,
    positionId: c.positionId,
    title: pos?.fr || c.positionId || "",
    titleAr: pos?.ar || "",
    titleEn: pos?.en || "",
    city: c.city,
    experience: c.experience,
    availability: c.availability,
    contractType: c.contractType,
    expectedSalary: c.expectedSalary,
    completion: c.completionPercent ?? 0,
    verified: c.verified,
    blocked: c.user?.status === "suspended",
    status: c.user?.status === "deleted" ? "deleted" : c.user?.status === "suspended" ? "deactivated" : "active",
    hasCv: Boolean(c.cvAssetId),
    registeredAt: isoDay(c.createdAt),
    email: c.user?.email,
    phone: c.phone,
    ref: c.id?.slice(-6),
  };
}

function mapEmployerRow(e) {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    city: e.city,
    address: e.address,
    email: e.user?.email || "",
    phone: e.phone,
    verified: e.verified,
    blocked: e.status === "blocked",
    status: e.status,
    ref: e.id?.slice(-6),
    logo: e.logoUrl || "",
    cover: e.coverUrl || "",
  };
}

function jobDaysLeft(j) {
  const end = j.extendedUntil || j.expiresAt;
  if (!end) return 0;
  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86400000));
}

function jobIsExpired(j) {
  if (j.status === "expired" || j.status === "closed") return true;
  const end = j.extendedUntil || j.expiresAt;
  return Boolean(end && new Date(end) < new Date());
}

function mapJobRow(j, employer) {
  const embedded = j.employer || employer;
  return {
    ...j,
    id: j.id,
    title: pickL(j.title),
    titleAr: pickL(j.title, "ar"),
    titleEn: pickL(j.title, "en"),
    employerId: j.employerId,
    employerName: embedded?.name || employer?.name || j.employerName || "",
    city: j.city,
    status: j.status,
    postedAt: isoDay(j.postedAt),
    expiresAt: isoDay(j.expiresAt),
    contractType: j.contractType,
    experience: j.experience,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    daysLeft: jobDaysLeft(j),
    expired: jobIsExpired(j),
  };
}

function mapActivityEntry(l) {
  return {
    id: l.id || String(l._id),
    type: l.type || "admin-action",
    action: l.action,
    actor: l.actorLabel || l.actor || "Administrateur",
    target: l.target || l.targetId || "—",
    detail: pickL(l.detail),
    detailAr: pickL(l.detail, "ar"),
    detailEn: pickL(l.detail, "en"),
    at: l.at || (l.createdAt ? String(l.createdAt).slice(0, 16).replace("T", " ") : ""),
  };
}

function mapOutboxItem(n) {
  const title = n.title;
  const body = n.body;
  return {
    id: n.id,
    templateId: n.type || n.templateId || "notification",
    to: n.to || { id: n.userId, name: "" },
    audience:
      n.data?.audience ||
      (n.to?.role === "employer" ? "employer" : n.to?.role === "candidate" ? "candidate" : "both"),
    title: pickL(title),
    titleAr: pickL(title, "ar"),
    titleEn: pickL(title, "en"),
    body: pickL(body),
    bodyAr: pickL(body, "ar"),
    bodyEn: pickL(body, "en"),
    channels: ["in-app", "email"],
    inAppStatus: "delivered",
    emailStatus: n.emailSentAt ? "sent" : "queued",
    at: n.createdAt ? String(n.createdAt).slice(0, 16).replace("T", " ") : "",
  };
}

function mapApplicationRow(a) {
  const job = a.job && typeof a.job === "object" ? a.job : null;
  const employer = a.employer && typeof a.employer === "object" ? a.employer : null;
  return {
    ...a,
    id: a.id || String(a._id),
    jobId: job?.id || a.jobId,
    jobTitle: job ? pickL(job.title) : a.jobTitle || "",
    candidateId: a.candidateId?.id || a.candidateId,
    employerId: employer?.id || a.employerId,
    status: a.status,
    appliedAt: isoDay(a.appliedAt),
    job: job
      ? {
          ...mapJobRow(job, employer),
          title: pickL(job.title),
          titleAr: pickL(job.title, "ar"),
          titleEn: pickL(job.title, "en"),
        }
      : null,
    employer: employer ? mapEmployerRow(employer) : null,
  };
}

function mapChefDetail(raw) {
  const base = mapCandidateRow(raw);
  const pos = ALL_POSITIONS.find((p) => p.id === raw.positionId);
  const about = raw.about;
  const dishPhotos = (raw.dishPhotos || [])
    .map((p) => (typeof p === "string" ? p : p.url))
    .filter(Boolean);

  return {
    ...raw,
    ...base,
    firstName: raw.firstName,
    lastName: raw.lastName,
    photo: raw.photoUrl || base.photo || "",
    about: typeof about === "string" ? about : pickL(about),
    aboutAr: typeof about === "object" ? pickL(about, "ar") : raw.aboutAr || "",
    aboutEn: typeof about === "object" ? pickL(about, "en") : raw.aboutEn || "",
    skills: raw.skills || [],
    training: raw.training || [],
    history: raw.history || [],
    foodPhotos: dishPhotos,
    dishPhotos,
    canUploadFoodPhotos: Boolean(pos?.photos),
    pendingPhotos: (raw.pendingPhotos || []).map((p) => ({
      id: p.id,
      url: p.url || "",
      type: p.kind === "profile-photo" || p.type === "profile" ? "profile" : "food",
      uploadedAt: isoDay(p.createdAt || p.uploadedAt),
      reports: p.reportCount ?? p.reports ?? 0,
    })),
    completion: raw.completionPercent ?? base.completion ?? 0,
    registeredAt: isoDay(raw.createdAt) || base.registeredAt,
    email: raw.user?.email || raw.email,
    phone: raw.phone,
  };
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function adminUploadMedia(blob, filename = "banner.webp") {
  const token =
    getJSON(ADMIN_META_KEY, null)?.accessToken ||
    getString(ADMIN_TOKEN_KEY, "") ||
    getJSON(ADMIN_SESSION_KEY, null)?.accessToken;

  const form = new FormData();
  form.append("file", blob, filename);
  form.append("kind", "homepage");

  const res = await fetch(`${API}/admin/media`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Upload failed");
  }
  return json.data;
}

async function candidateIdsByUserIds(userIds) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return new Map();

  const { data } = await adminApiWithMeta("/admin/candidates?limit=200").catch(() => ({ data: [] }));
  const map = new Map();
  (data || []).forEach((c) => {
    if (c.user?.id) map.set(String(c.user.id), c.id);
  });
  return map;
}

/* ------------------------------------------------------------- overlay */

const OVERLAY_KEY = "cookkonnekt.adminOverlay";

const EMPTY_OVERLAY = {
  candidates: {},        // candidateId -> patch merged over the fixture profile
  restaurantBlocked: {}, // employerId  -> boolean
  requests: {},          // requestId   -> "approved" | "rejected"
  deletedJobs: [],       // jobId[]
  feedbackThreads: {},   // feedbackId  -> messages appended by an admin
  photos: {},            // photoId     -> "approved" | "removed"
  admins: {},            // adminId     -> patch (permissions, disabled)
  createdAdmins: [],     // internal accounts the super admin added
  offers: {},            // jobId       -> patch merged over the fixture offer
  activity: [],          // entries written by logAction, newest last
  outbox: [],            // records written by notifyUser, newest last
};

const readOverlay = () => ({ ...EMPTY_OVERLAY, ...(getJSON(OVERLAY_KEY, null) || {}) });

const writeOverlay = (patch) => {
  const next = { ...readOverlay(), ...patch };
  setValue(OVERLAY_KEY, next);
  return next;
};

/** Clears every admin action — handy when demoing the dashboard repeatedly. */
export function resetAdminOverlay() {
  setValue(OVERLAY_KEY, EMPTY_OVERLAY);
}

/* --------------------------------------------------------------- utils */

const term = (value, q) => String(value ?? "").toLowerCase().includes(q);

/** Case-insensitive match across a row's searchable fields. */
const matches = (row, fields, q) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => term(row[f], needle));
};

/** Whole days between an ISO date and the fixture's "today". */
const daysSince = (iso) =>
  Math.max(0, Math.floor((TODAY.getTime() - new Date(iso).getTime()) / 86400000));

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * "YYYY-MM-DD HH:mm", matching the seeded entries so the merged log sorts as one
 * list.
 *
 * The fixtures forbid `Date.now()` because they run at module scope, where the
 * server and the client would disagree and break hydration. This runs inside a
 * user action, long after hydration, where the real clock is the correct answer.
 */
const stampNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/* --------------------------------------------------------- audit trail */
// Improvement points 20: administrative actions and every look at a candidate's
// contact details have to leave a trace. Until the backend exists that trace is
// a local one, but the shape is the shape the API will return.

/** The administrator performing the action, for the log's `actor` column. */
const actingAdmin = () => getJSON(ADMIN_SESSION_KEY, null)?.admin || null;

/**
 * A reason may be plain text, or a predefined option carrying its own
 * translations. When the admin wrote a note — what "Other reason" is for — the
 * note wins: free text cannot be translated, so it stands in every language.
 */
const reasonIn = (reason, locale) => {
  if (!reason) return "";
  if (typeof reason === "string") return reason;
  return reason.note || reason[locale] || reason.fr || "";
};

/**
 * Records one administrative action.
 *
 * `action` is a key into ACTION_DETAILS, which supplies the wording in all three
 * languages; `reason`, when the action has one, is appended in parentheses in
 * each of them.
 */
export function logAction(action, { target, reason } = {}) {
  if (USE_API) return null;
  const meta = ACTION_DETAILS[action];
  if (!meta) return null;

  const admin = actingAdmin();
  const label = (locale) => {
    const why = reasonIn(reason, locale);
    return why ? `${meta[locale]} (${why})` : meta[locale];
  };

  const overlay = readOverlay();
  const at = stampNow();
  const seq = overlay.activity.length + 1;
  const entry = {
    id: `log-local-${seq}`,
    // Timestamps are minute-granular, so several actions in the same minute tie.
    // Insertion order is the only thing that can separate them, and an admin who
    // has just done three things needs to see the third one at the top.
    seq,
    type: meta.type,
    action,
    actor: admin?.name || "Administrateur",
    target: target ?? "—",
    detail: label("fr"),
    detailAr: label("ar"),
    detailEn: label("en"),
    at,
  };

  writeOverlay({ activity: [...overlay.activity, entry] });
  return entry;
}

/* ------------------------------------------------------- notifications */
// Improvement points 17: a decision reaches the user in the platform *and* by
// email. The in-app half is real here; the email half is queued and shown as
// queued, because there is no mail provider until the backend is built.

/**
 * Queues one message to a user.
 *
 * `to` is `{ id, name }` — whoever the decision was about. The rendered text is
 * stored rather than the template id, so the outbox shows what was actually
 * sent even after the wording changes.
 */
export function notifyUser(templateId, { to, params = {} } = {}) {
  if (USE_API) return null;
  const template = NOTIFICATION_TEMPLATES[templateId];
  if (!template || !to) return null;

  const overlay = readOverlay();

  // A parameter may itself be translated — a rejection reason is picked from a
  // predefined list that carries all three languages. Resolving per field is
  // what keeps the Arabic body from ending in a French reason.
  const forLocale = (locale) =>
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        value && typeof value === "object" ? reasonIn(value, locale) : value,
      ])
    );

  const render = (field, locale) =>
    fillTemplate(template[field] ?? template.title, forLocale(locale));

  const record = {
    id: `ntf-local-${overlay.outbox.length + 1}`,
    templateId,
    to,
    audience: template.audience,
    title: render("title", "fr"),
    titleAr: render("titleAr", "ar"),
    titleEn: render("titleEn", "en"),
    body: render("body", "fr"),
    bodyAr: render("bodyAr", "ar"),
    bodyEn: render("bodyEn", "en"),
    channels: ["in-app", "email"],
    // Honest state: the in-app record exists, the email does not yet.
    inAppStatus: "delivered",
    emailStatus: "queued",
    at: stampNow(),
  };

  writeOverlay({ outbox: [...overlay.outbox, record] });
  return record;
}

/** Everything queued for a user, newest first. The outbox screen is D1. */
export async function fetchNotificationOutbox() {
  if (USE_API) {
    const rows = await adminApi("/admin/notifications/outbox");
    return (rows || []).map(mapOutboxItem);
  }
  await delay();
  return [...readOverlay().outbox].reverse();
}

/* ----------------------------------------------------------- dashboard */

export async function fetchDashboard() {
  if (USE_API) {
    const [stats, cookGrowth, restaurantGrowth, requests] = await Promise.all([
      adminApi("/admin/dashboard/stats"),
      adminApi("/admin/dashboard/growth?metric=cooks"),
      adminApi("/admin/dashboard/growth?metric=restaurants"),
      adminApi("/admin/employers/requests"),
    ]);

    const cookPoints = (cookGrowth?.buckets || []).map((b) => b.count);
    const restPoints = (restaurantGrowth?.buckets || []).map((b) => b.count);

    return {
      totals: {
        cooks: stats.candidates,
        restaurants: stats.employers,
        verifiedProfiles: stats.candidates,
        availableJobs: stats.activeJobs,
      },
      pendingOffers: stats.pendingJobs,
      months: MONTHS,
      cookGrowth: { year: cookGrowth?.year || new Date().getFullYear(), points: cookPoints },
      restaurantGrowth: { year: restaurantGrowth?.year || new Date().getFullYear(), points: restPoints },
      requests: (requests || []).map(mapEmployerRow),
    };
  }

  await delay();
  const overlay = readOverlay();

  const pending = restaurantRequests().filter((r) => !overlay.requests[r.id]);
  const offers = liveJobs(overlay);

  return {
    totals: {
      ...dashboardTotals(),
      // Recounted over the decisions, or approving an offer leaves the headline
      // number stuck at whatever the fixture shipped with.
      availableJobs: offers.filter((j) => j.status === "active" && !isExpired(j)).length,
    },
    // The queue the admin could not find (Improvement points 3). It gets its own
    // card because a number nobody can see is the problem being fixed.
    pendingOffers: offers.filter((j) => j.status === "pending").length,
    months: MONTHS,
    cookGrowth: COOK_GROWTH,
    restaurantGrowth: RESTAURANT_GROWTH,
    requests: pending,
  };
}

/* ------------------------------------------------------- site settings */
// Improvement points 1 and 2: the administrator sets the homepage background —
// an uploaded image, or the blank background it has now — and there was no
// section anywhere in the dashboard for doing it.
//
// Kept in its own storage key rather than in the admin overlay. The background
// is a data URL and is by far the largest thing this app stores; if it ever
// fails to fit, the failure must not take every approval and rejection with it.

const SITE_KEY = "cookkonnekt.siteSettings";

/** The homepage as it ships today: blank background, copy from the public site. */
export const DEFAULT_SITE_SETTINGS = {
  background: "blank",
  backgroundImage: null,
  imageName: "",
  headline: {
    fr: "Trouvez votre place dans la restauration au Maroc",
    ar: "لقا بلاصتك فقطاع المطاعم والفندقة فالمغرب",
    en: "Find your place in Morocco's hospitality industry",
  },
  subheadline: {
    fr: "Cuisiniers, boulangers, personnel d'hôtel et employeurs — au même endroit.",
    ar: "طباخين، خبازة، مستخدمين ديال الأوطيلات وموظّفين — كاملين فبلاصة وحدة.",
    en: "Cooks, bakers, hotel staff and employers — all in one place.",
  },
  ctaLabel: {
    fr: "Voir les offres",
    ar: "شوف العروض",
    en: "Browse offers",
  },
};

/** What an uploaded background has to satisfy before it is stored. */
export const BANNER_RULES = {
  types: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 2 * 1024 * 1024,
  minWidth: 1600,
  minHeight: 600,
};

export async function fetchSiteSettings() {
  if (USE_API) {
    const raw = await adminApi("/admin/site-settings");
    const imageId = raw.imageId ? String(raw.imageId) : null;
    let backgroundImage = raw.imageUrl || null;
    if (!backgroundImage && imageId) {
      backgroundImage = getString(`cookkonnekt.siteImage.${imageId}`, "") || null;
    }
    return {
      background: raw.mode === "image" ? "image" : "blank",
      backgroundImage,
      imageName: raw.imageName || "",
      headline: raw.headline || DEFAULT_SITE_SETTINGS.headline,
      subheadline: raw.subheadline || DEFAULT_SITE_SETTINGS.subheadline,
      ctaLabel: raw.cta || DEFAULT_SITE_SETTINGS.ctaLabel,
    };
  }

  await delay(150);
  return { ...DEFAULT_SITE_SETTINGS, ...(getJSON(SITE_KEY, null) || {}) };
}

export async function saveSiteSettings(next) {
  if (USE_API) {
    let imageId;
    let backgroundImage = next.backgroundImage;

    if (next.background === "image" && next.backgroundImage?.startsWith("data:")) {
      const blob = dataUrlToBlob(next.backgroundImage);
      const uploaded = await adminUploadMedia(blob, next.imageName || "homepage-banner.webp");
      imageId = uploaded.id;
      backgroundImage = uploaded.url;
      if (imageId && backgroundImage) {
        setValue(`cookkonnekt.siteImage.${imageId}`, backgroundImage);
      }
    } else if (next.background === "blank") {
      imageId = null;
      backgroundImage = null;
    }

    const body = {
      mode: next.background === "image" ? "image" : "blank",
      headline: next.headline,
      subheadline: next.subheadline,
      cta: next.ctaLabel,
      ...(imageId !== undefined ? { imageId } : {}),
    };
    const saved = await adminApi("/admin/site-settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const savedImageId = saved.imageId ? String(saved.imageId) : null;
    if (!backgroundImage && savedImageId) {
      backgroundImage = getString(`cookkonnekt.siteImage.${savedImageId}`, "") || null;
    }
    return {
      ok: true,
      settings: {
        background: saved.mode === "image" ? "image" : "blank",
        backgroundImage,
        imageName: next.imageName || "",
        headline: saved.headline,
        subheadline: saved.subheadline,
        ctaLabel: saved.cta,
      },
    };
  }

  await delay(300);

  const merged = { ...DEFAULT_SITE_SETTINGS, ...next };
  const stored = setValue(SITE_KEY, merged);

  if (!stored) {
    // Almost always the image: the rest of this object is a few hundred bytes.
    return { ok: false, reason: "storage-full" };
  }

  logAction(
    merged.background === "image" ? "homepage.bannerSet" : "homepage.bannerCleared",
    { target: merged.imageName || "—" }
  );

  return { ok: true, settings: merged };
}

/* ---------------------------------------------------------- statistics */
// Improvement points 5 and 16. Most of this was already written in mock/admin.js
// and reachable from nowhere: candidateStats, employerStats, offerStats, the two
// "most searched" lists and averageSalary had no route out of the fixture layer,
// so no screen could show them. This is that route.

export async function fetchStatistics({ days = 30 } = {}) {
  if (USE_API) {
    const [data, market] = await Promise.all([
      adminApi(`/admin/statistics${adminQs({ days })}`),
      adminApi("/admin/dashboard/market").catch(() => null),
    ]);
    const searchedTitles = (market?.searchedPositions || data.candidatesByPosition || []).map(
      (r) => ({ id: r.id, count: r.count })
    );
    return {
      candidates: {
        total: data.candidates?.total ?? data.candidates?.registered ?? 0,
        verified: data.candidates?.verified ?? 0,
        complete: data.candidates?.complete ?? 0,
      },
      employers: {
        total: data.employers?.total ?? data.employers?.registered ?? 0,
        verified: data.employers?.verified ?? 0,
        pending: data.employers?.pending ?? 0,
      },
      offers: data.offers || {},
      registrations: data.candidatesPerDay || [],
      market: {
        searchedTitles,
        searchedCities: (market?.searchedCities || []).map((r) => ({ id: r.id, count: r.count })),
        averageSalary: market?.averageSalary ?? 0,
      },
    };
  }

  await delay();
  const overlay = readOverlay();
  const offers = liveJobs(overlay);

  return {
    candidates: candidateStats(),
    employers: employerStats(),
    // Recounted over the admin's own decisions, like the dashboard totals.
    offers: {
      ...offerStats(),
      active: offers.filter((j) => j.status === "active" && !isExpired(j)).length,
      pendingApproval: offers.filter((j) => j.status === "pending").length,
      rejected: offers.filter((j) => j.status === "rejected").length,
    },
    registrations: registrationStats(days),
    market: {
      searchedTitles: MOST_SEARCHED_TITLES,
      searchedCities: MOST_SEARCHED_CITIES,
      averageSalary: averageSalary(),
    },
  };
}

/* -------------------------------------------------------- candidates */
// Improvement points 14: the administrator can view, edit, verify, deactivate,
// delete, restore, add a skill, correct information, read the profile's history,
// see its applications, see which employers asked for its contact details, and
// moderate its photos. Two of those existed.
//
// Everything is a patch over the fixture, so a "deleted" profile is still there
// to be restored and still has a history — which is the whole point of asking
// for a restore action in the first place.

/** One candidate with any admin edits and state changes applied. */
const withCandidatePatch = (candidate, overlay) => {
  const patch = overlay.candidates[candidate.id];
  return patch ? { ...candidate, ...patch } : candidate;
};

/** Merges a patch into one candidate's overlay entry. */
const patchCandidate = (id, patch) => {
  const overlay = readOverlay();
  writeOverlay({
    candidates: {
      ...overlay.candidates,
      [id]: { ...overlay.candidates[id], ...patch },
    },
  });
};

/** Every candidate with the overlay applied. `status` defaults to active. */
const liveCandidates = (overlay) =>
  CANDIDATES.map((c) => ({ status: "active", blocked: false, ...withCandidatePatch(c, overlay) }));

/* ------------------------------------------------------- CV database */
// Improvement points 6: the complete candidate list, filterable, exportable.
//
// /chefs is a moderation queue — five columns, split by verification state. This
// is the other thing entirely: every candidate, every field, filtered the way
// recruiting is actually searched.

/**
 * What the signed-in administrator is allowed to do.
 *
 * Read from the ADMINS fixture rather than the session, because the session only
 * stores who is signed in. This is a convenience check, not a security control —
 * enforcing it properly is E3 in the UI and the backend behind it.
 */
export function can(permission) {
  if (USE_API) {
    const meta = getJSON(ADMIN_META_KEY, null);
    if (meta?.adminLevel === "super") return true;
    return (meta?.permissions || []).includes(permission);
  }

  const admin = actingAdmin();
  if (!admin) return false;

  const record = liveAdmins(readOverlay()).find((a) => a.id === admin.id);
  if (!record || record.disabled) return false;

  return record.permissions.includes(permission);
}

/** Everything the signed-in admin may do, for deriving the sidebar in one pass. */
export function currentPermissions() {
  if (USE_API) {
    const meta = getJSON(ADMIN_META_KEY, null);
    return meta?.permissions || [];
  }

  const admin = actingAdmin();
  if (!admin) return [];

  const record = liveAdmins(readOverlay()).find((a) => a.id === admin.id);
  return !record || record.disabled ? [] : record.permissions;
}

const inRange = (value, list) => !list?.length || list.includes(value);

export async function fetchCandidateDatabase({
  q = "",
  position = "",
  sector = "",
  city = "",
  experience = "",
  availability = "",
  verified = "all",
  minCompletion = 0,
  includeContact = false,
} = {}) {
  if (USE_API) {
    const { data, meta } = await adminApiWithMeta(
      `/admin/candidates${adminQs({ q, position, sector, city, experience, availability, verified, minCompletion })}`
    );
    const rows = (data || []).map(mapCandidateRow);
    return {
      rows,
      contactIncluded: includeContact && can("export-cv"),
      canExportContact: can("export-cv"),
      total: meta?.total ?? rows.length,
      options: {
        positions: ALL_POSITIONS,
        sectors: SECTORS,
        cities: CITIES,
        experience: EXPERIENCE_LEVELS,
        availability: AVAILABILITY,
      },
    };
  }

  await delay();

  const overlay = readOverlay();
  // Contact columns are a disclosure, so they are opt-in *and* permission-gated.
  const contactIncluded = includeContact && can("export-cv");

  const rows = liveCandidates(overlay)
    // A deleted profile is out of the recruiting view but still restorable from
    // /chefs — it should never appear in an export of the candidate base.
    .filter((c) => c.status !== "deleted")
    .map((c) => {
      const row = {
        id: c.id,
        name: c.name,
        photo: c.photo,
        sectorId: c.sectorId,
        positionId: c.positionId,
        title: c.title,
        titleAr: c.titleAr,
        titleEn: c.titleEn,
        city: c.city,
        experience: c.experience,
        availability: c.availability,
        contractType: c.contractType,
        expectedSalary: c.expectedSalary,
        completion: c.completion,
        verified: c.verified,
        blocked: c.blocked,
        status: c.status,
        hasCv: c.hasCv,
        registeredAt: c.registeredAt,
        applications: APPLICATIONS.filter((a) => a.candidateId === c.id).length,
      };

      // Absent, not blanked: a masked column that still ships the value to the
      // browser is not masked at all, and this shape is what the API returns.
      return contactIncluded ? { ...row, email: c.email, phone: c.phone } : row;
    })
    .filter((r) => inRange(r.positionId, position ? [position] : null))
    .filter((r) => inRange(r.sectorId, sector ? [sector] : null))
    .filter((r) => inRange(r.city, city ? [city] : null))
    .filter((r) => inRange(r.experience, experience ? [experience] : null))
    .filter((r) => inRange(r.availability, availability ? [availability] : null))
    .filter((r) => verified === "all" || r.verified === (verified === "verified"))
    .filter((r) => r.completion >= minCompletion)
    .filter((r) => matches(r, ["name", "title", "titleEn", "city"], q));

  return {
    rows,
    contactIncluded,
    canExportContact: can("export-cv"),
    total: CANDIDATES.length,
    options: {
      positions: ALL_POSITIONS,
      sectors: SECTORS,
      cities: CITIES,
      experience: EXPERIENCE_LEVELS,
      availability: AVAILABILITY,
    },
  };
}

/**
 * Records that a copy of the database left the platform.
 *
 * An export is the largest contact disclosure the dashboard can make, so it is
 * logged as contact access rather than as a routine admin action when the
 * contact columns were part of it (Improvement points 20).
 */
export async function logCandidateExport({ rows = 0, filters = {}, withContact = false } = {}) {
  if (USE_API) return { ok: true, rows };

  await delay(100);

  const applied = Object.entries(filters)
    .filter(([, v]) => v && v !== "all" && v !== 0)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  logAction(withContact ? "candidates.exportedWithContact" : "candidates.exported", {
    target: applied || "—",
    // The parenthetical the log appends: a row count reads in every language.
    reason: { fr: `${rows} lignes`, ar: `${rows} سطر`, en: `${rows} rows` },
  });

  return { ok: true, rows };
}

/* --------------------------------------------------------------- chefs */

/**
 * `tab` is "verified" | "unverified" | "deactivated" | "deleted".
 *
 * Deactivated and deleted profiles get their own tabs rather than being hidden:
 * a profile the admin took down has to be findable again to be restored.
 */
export async function fetchChefs({ verified = "verified", q = "" } = {}) {
  if (USE_API) {
    const status =
      verified === "deleted" ? "deleted" : verified === "deactivated" ? "suspended" : undefined;
    const verifiedFilter = verified === "verified" ? "true" : verified === "unverified" ? "false" : undefined;
    const { data } = await adminApiWithMeta(
      `/admin/candidates${adminQs({ q, status, verified: verifiedFilter })}`
    );
    const rows = (data || []).map(mapCandidateRow);
    const live = rows.filter((c) => c.status === "active");
    return {
      rows,
      verifiedCount: live.filter((c) => c.verified).length,
      unverifiedCount: live.filter((c) => !c.verified).length,
      deactivatedCount: rows.filter((c) => c.status === "deactivated").length,
      deletedCount: rows.filter((c) => c.status === "deleted").length,
    };
  }

  await delay();
  const overlay = readOverlay();

  const rows = chefRows().map((c) => ({
    status: "active",
    blocked: false,
    ...withCandidatePatch(c, overlay),
  }));

  const live = rows.filter((c) => c.status === "active");
  const scoped =
    verified === "deleted"
      ? rows.filter((c) => c.status === "deleted")
      : verified === "deactivated"
        ? rows.filter((c) => c.status === "deactivated")
        : live.filter((c) => c.verified === (verified === "verified"));

  return {
    rows: scoped.filter((c) => matches(c, ["name", "title", "ref"], q)),
    verifiedCount: live.filter((c) => c.verified).length,
    unverifiedCount: live.filter((c) => !c.verified).length,
    deactivatedCount: rows.filter((c) => c.status === "deactivated").length,
    deletedCount: rows.filter((c) => c.status === "deleted").length,
  };
}

/**
 * `revealContact` asks for the candidate's phone and email.
 *
 * They are withheld by default and removed from the payload rather than blanked,
 * because a masked field that still ships the value is not masked. Asking for
 * them is itself a logged event (Improvement points 20): the audit trail has to
 * answer "who looked at this person's number, and when".
 */
export async function fetchChef(id, { revealContact = false } = {}) {
  if (USE_API) {
    const qs = revealContact ? "?revealContact=true" : "";
    const raw = await adminApi(`/admin/candidates/${id}${qs}`);
    const candidate = mapChefDetail(raw);
    const maySeeContact = can("view-contact");
    const { phone, email, ...withoutContact } = candidate;
    const visible = revealContact && maySeeContact ? candidate : withoutContact;
    return {
      ...visible,
      contactVisible: revealContact && maySeeContact,
      canRevealContact: maySeeContact,
      dishPhotos: candidate.dishPhotos || [],
      pendingPhotos: candidate.pendingPhotos || [],
    };
  }

  await delay(150);

  const index = CANDIDATES.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const overlay = readOverlay();
  const base = chefRows()[index];
  const candidate = { status: "active", blocked: false, ...withCandidatePatch(base, overlay) };

  const maySeeContact = can("view-contact");
  if (revealContact && maySeeContact) {
    logAction("contact.viewed", { target: candidate.name });
  }

  const { phone, email, ...withoutContact } = candidate;
  const visible = revealContact && maySeeContact ? candidate : withoutContact;

  return {
    ...visible,
    contactVisible: revealContact && maySeeContact,
    canRevealContact: maySeeContact,
    dishPhotos: dishPhotosFor(candidate, index),
    // Photos still awaiting a decision, so they can be judged from the profile
    // rather than only from the global moderation queue.
    pendingPhotos: PENDING_PHOTOS.filter(
      (p) => p.candidateId === id && !overlay.photos[p.id]
    ).map((p, i) => ({
      ...p,
      url: p.type === "profile" ? PORTRAITS[i % PORTRAITS.length] : DISH_PHOTOS[i % DISH_PHOTOS.length],
    })),
  };
}

/** The offers this candidate applied to (Improvement points 14). */
export async function fetchCandidateApplications(id) {
  if (USE_API) {
    const rows = await adminApi(`/admin/candidates/${id}/applications`);
    return (rows || []).map(mapApplicationRow);
  }

  await delay(150);

  return APPLICATIONS.filter((a) => a.candidateId === id).map((a) => {
    const job = getJob(a.jobId);
    return {
      ...a,
      job,
      employer: job ? getEmployer(job.employerId) : null,
    };
  });
}

/**
 * Which employers looked this candidate up, and everything an admin did to the
 * profile — the two halves of "who has touched this record".
 */
export async function fetchCandidateHistory(id) {
  if (USE_API) {
    const data = await adminApi(`/admin/candidates/${id}/history`);
    return {
      contactRequests: (data?.contactRequests || []).map(mapActivityEntry),
      adminActions: (data?.adminActions || []).map(mapActivityEntry),
    };
  }

  await delay(150);

  const candidate = getCandidate(id);
  const entries = await fetchActivity();

  return {
    // Contact access is matched on the candidate's name, which is how the
    // seeded log records its target; recorded entries use the id.
    contactRequests: entries.filter(
      (l) => l.type === "contact-access" && (l.target === candidate?.name || l.target === id)
    ),
    adminActions: entries.filter((l) => l.type !== "contact-access" && l.target === id),
  };
}

export async function setChefVerified(id, verified) {
  if (USE_API) {
    await adminApi(`/admin/candidates/${id}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ verified }),
    });
    return { ok: true, id, verified };
  }

  await delay(250);
  patchCandidate(id, { verified });

  logAction(verified ? "chef.verified" : "chef.unverified", { target: id });

  // Only an approval is worth telling the candidate about; a withdrawn
  // verification is an internal correction, and the reason UI that would make it
  // an actionable message does not exist yet.
  if (verified) {
    const candidate = getCandidate(id);
    if (candidate) {
      notifyUser("profile.verified", { to: { id, name: candidate.name } });
    }
  }

  return { ok: true, id, verified };
}

/** Fields an administrator may correct on a candidate's behalf. */
const EDITABLE_CANDIDATE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "city",
  "positionId",
  "sectorId",
  "experience",
  "availability",
  "contractType",
  "expectedSalary",
  "about",
];

/**
 * Corrects a profile on the candidate's behalf (Improvement points 14).
 *
 * Only the listed fields are writable: an edit form that can set anything is one
 * typo away from rewriting a candidate's id or their verification state.
 */
export async function updateCandidate(id, changes) {
  if (USE_API) {
    const patch = Object.fromEntries(
      Object.entries(changes).filter(([key]) => EDITABLE_CANDIDATE_FIELDS.includes(key))
    );
    if (patch.about && typeof patch.about === "string") {
      patch.about = { fr: patch.about, ar: patch.about, en: patch.about };
    }
    await adminApi(`/admin/candidates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return { ok: true, id, changes: patch };
  }

  await delay(300);

  const patch = Object.fromEntries(
    Object.entries(changes).filter(([key]) => EDITABLE_CANDIDATE_FIELDS.includes(key))
  );

  // `name` is what every table renders, so it has to follow the two parts.
  if (patch.firstName || patch.lastName) {
    const current = { ...getCandidate(id), ...readOverlay().candidates[id] };
    patch.name = `${patch.firstName ?? current.firstName} ${patch.lastName ?? current.lastName}`;
  }

  patchCandidate(id, patch);
  logAction("chef.edited", { target: id });

  return { ok: true, id, changes: patch };
}

export async function addCandidateSkill(id, skillId) {
  if (USE_API) {
    const updated = await adminApi(`/admin/candidates/${id}/skills`, {
      method: "POST",
      body: JSON.stringify({ skillId }),
    });
    return { ok: true, id, skills: updated.skills || [] };
  }

  await delay(200);

  const current = { ...getCandidate(id), ...readOverlay().candidates[id] };
  if (current.skills?.includes(skillId)) return { ok: true, id, skills: current.skills };

  const skills = [...(current.skills || []), skillId];
  patchCandidate(id, { skills });
  logAction("chef.skillAdded", { target: id, reason: REQUIREMENT_BY_ID[skillId] });

  return { ok: true, id, skills };
}

export async function removeCandidateSkill(id, skillId) {
  if (USE_API) {
    const updated = await adminApi(`/admin/candidates/${id}/skills/${skillId}`, {
      method: "DELETE",
    });
    return { ok: true, id, skills: updated.skills || [] };
  }

  await delay(200);

  const current = { ...getCandidate(id), ...readOverlay().candidates[id] };
  const skills = (current.skills || []).filter((s) => s !== skillId);
  patchCandidate(id, { skills });
  logAction("chef.skillRemoved", { target: id, reason: REQUIREMENT_BY_ID[skillId] });

  return { ok: true, id, skills };
}

/**
 * `status` is "active" | "deactivated" | "deleted".
 *
 * Deletion is soft on purpose: the client asked for a restore action in the same
 * breath, and a record that is really gone cannot be restored or audited.
 */
export async function setCandidateStatus(id, status) {
  if (USE_API) {
    const apiStatus = status === "deactivated" ? "suspended" : status === "deleted" ? "deleted" : "active";
    await adminApi(`/admin/candidates/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: apiStatus }),
    });
    return { ok: true, id, status };
  }

  await delay(300);
  patchCandidate(id, { status });

  logAction(
    status === "deleted"
      ? "chef.deleted"
      : status === "deactivated"
        ? "chef.deactivated"
        : "chef.restored",
    { target: id }
  );

  return { ok: true, id, status };
}

/** Bars an account for abuse — Improvement points 16, the repeat-uploader case. */
export async function setCandidateBlocked(id, blocked, reason) {
  if (USE_API) {
    await adminApi(`/admin/candidates/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: blocked ? "suspended" : "active" }),
    });
    return { ok: true, id, blocked };
  }

  await delay(300);
  patchCandidate(id, { blocked });

  logAction(blocked ? "chef.blocked" : "chef.unblocked", { target: id, reason });

  const candidate = getCandidate(id);
  if (candidate) {
    const to = { id, name: candidate.name };
    if (blocked && reason) notifyUser("account.blocked", { to, params: { reason } });
    if (!blocked) notifyUser("account.unblocked", { to });
  }

  return { ok: true, id, blocked };
}

/* --------------------------------------------------------- restaurants */

export async function fetchRestaurants({ q = "" } = {}) {
  if (USE_API) {
    const { data } = await adminApiWithMeta(`/admin/employers${adminQs({ q })}`);
    return (data || []).map(mapEmployerRow);
  }

  await delay();
  const overlay = readOverlay();

  const rows = restaurantRows().map((e) => ({
    ...e,
    blocked: overlay.restaurantBlocked[e.id] ?? false,
  }));

  return rows.filter((e) => matches(e, ["name", "address", "ref", "email"], q));
}

export async function fetchRestaurant(id) {
  if (USE_API) {
    const [raw, activityRaw, jobsRaw] = await Promise.all([
      adminApi(`/admin/employers/${id}`),
      adminApi(`/admin/employers/${id}/activity`).catch(() => null),
      adminApi(`/admin/jobs${adminQs({ employerId: id })}`).catch(() => []),
    ]);
    const base = mapEmployerRow(raw);
    const jobsList = Array.isArray(jobsRaw) ? jobsRaw : jobsRaw?.data || [];
    const jobs = jobsList.map((j) => mapJobRow(j, j.employer || base));
    const activity = activityRaw
      ? {
          offersPublished: activityRaw.offersPublished ?? jobs.length,
          offersActive: activityRaw.offersActive ?? jobs.filter((j) => j.status === "active" && !j.expired).length,
          offersPending: jobs.filter((j) => j.status === "pending").length,
          applicationsReceived: activityRaw.applicationsReceived ?? 0,
          profilesViewed: activityRaw.profilesViewed ?? 0,
          contactRequests: activityRaw.contactRequests ?? 0,
          declaredHires: activityRaw.declaredHires ?? 0,
          lastActivity: activityRaw.lastActivity || isoDay(raw.updatedAt),
        }
      : {
          offersPublished: jobs.length,
          offersActive: jobs.filter((j) => j.status === "active" && !j.expired).length,
          offersPending: jobs.filter((j) => j.status === "pending").length,
          applicationsReceived: 0,
          profilesViewed: 0,
          contactRequests: 0,
          declaredHires: 0,
          lastActivity: isoDay(raw.updatedAt),
        };
    return {
      ...base,
      blocked: base.status === "blocked",
      activity,
      jobs,
      dishPhotos: [],
    };
  }

  await delay(150);

  const index = EMPLOYERS.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const overlay = readOverlay();
  const base = restaurantRows()[index];
  const jobs = jobsForEmployer(id).map((j) => withDecision(j, overlay));

  // Improvement points 15: offers published and active, applications received,
  // profiles viewed, contact requests, declared hires, last activity. All of it
  // was already computed in employerActivity() and reachable from no screen.
  const summary = employerActivity().find((e) => e.id === id);

  return {
    ...base,
    blocked: overlay.restaurantBlocked[id] ?? false,
    activity: summary && {
      offersPublished: jobs.length,
      offersActive: jobs.filter((j) => j.status === "active" && !isExpired(j)).length,
      offersPending: jobs.filter((j) => j.status === "pending").length,
      applicationsReceived: summary.applicationsReceived,
      profilesViewed: summary.profilesViewed,
      contactRequests: summary.contactRequests,
      declaredHires: summary.declaredHires,
      lastActivity: summary.lastActivity,
    },
    jobs,
    // The detail screen shows a dish strip; an establishment has no food photos
    // of its own in the fixtures, so it borrows its own cover plus the dishes of
    // the cooks who applied to it — which is what an admin is actually
    // reviewing when they approve an establishment's gallery.
    dishPhotos: dishPhotosFor({ foodPhotos: new Array(6).fill(0) }, index),
  };
}

export async function setRestaurantBlocked(id, blocked, reason) {
  if (USE_API) {
    await adminApi(`/admin/employers/${id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ blocked, reason }),
    });
    return { ok: true, id, blocked };
  }

  await delay(250);
  const overlay = readOverlay();
  writeOverlay({ restaurantBlocked: { ...overlay.restaurantBlocked, [id]: blocked } });

  logAction(blocked ? "restaurant.blocked" : "restaurant.unblocked", { target: id, reason });

  const employer = getEmployer(id);
  if (employer) {
    const to = { id, name: employer.name };
    if (blocked && reason) notifyUser("account.blocked", { to, params: { reason } });
    if (!blocked) notifyUser("account.unblocked", { to });
  }

  return { ok: true, id, blocked };
}

/* ------------------------------------------------ restaurant requests */

export async function fetchRequests() {
  if (USE_API) {
    const rows = await adminApi("/admin/employers/requests");
    return (rows || []).map(mapEmployerRow);
  }

  await delay();
  const overlay = readOverlay();
  return restaurantRequests().filter((r) => !overlay.requests[r.id]);
}

export async function fetchRequest(id) {
  if (USE_API) {
    const raw = await adminApi(`/admin/employers/${id}`);
    return { ...mapEmployerRow(raw), decision: null, dishPhotos: [] };
  }

  await delay(150);

  const all = restaurantRequests();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const overlay = readOverlay();
  return {
    ...all[index],
    decision: overlay.requests[id] || null,
    dishPhotos: dishPhotosFor({ foodPhotos: new Array(6).fill(0) }, index + 2),
  };
}

/**
 * `decision` is "approved" | "rejected". `reason` is optional today: the screen
 * that asks the admin for one is part of the offer/photo rejection work, and a
 * rejection notification without a reason would tell the establishment nothing
 * it can act on, so it is only sent once there is something to say.
 */
export async function decideRequest(id, decision, reason) {
  if (USE_API) {
    await adminApi(`/admin/employers/${id}/decision`, {
      method: "PATCH",
      body: JSON.stringify({
        status: decision === "approved" ? "active" : "rejected",
        rejectionReason: reason?.note || reason?.fr || reason || "",
      }),
    });
    return { ok: true, id, decision };
  }

  await delay(300);
  const overlay = readOverlay();
  writeOverlay({ requests: { ...overlay.requests, [id]: decision } });

  const approved = decision === "approved";
  logAction(approved ? "request.approved" : "request.rejected", { target: id, reason });

  const request = restaurantRequests().find((r) => r.id === id);
  if (request) {
    const to = { id, name: request.name };
    if (approved) {
      notifyUser("establishment.approved", { to });
    } else if (reason) {
      notifyUser("establishment.rejected", { to, params: { reason } });
    }
  }

  return { ok: true, id, decision };
}

/* --------------------------------------------------------- offer state */
// Improvement points 3 and 8: nothing reaches the public board until an admin
// has approved it, and the admin needs to see the whole offer before deciding.
//
// Decisions are a patch per offer rather than a status string, because approving
// one also moves its dates and rejecting one attaches a reason. Every screen that
// shows offers reads through `liveJobs` so a decision made on one of them is
// visible on all of them.

/** The demo's frozen "today", as the date fields store it. */
const TODAY_ISO = iso(TODAY);

/**
 * Offer dates run on the fixture's clock, not the wall clock.
 *
 * `daysLeft` and every "expiring soon" statistic measure against TODAY, so an
 * offer approved with a real-world date would report 70 days of runway on a
 * 60-day window. The audit log is the opposite case and uses the real clock:
 * it records when the administrator actually clicked.
 */
const expiryFromToday = () =>
  iso(new Date(TODAY.getTime() + MAX_OFFER_DAYS * 86400000));

/** One offer with any admin decision applied over the fixture. */
const withDecision = (job, overlay) => {
  const patch = overlay.offers[job.id];
  return patch ? { ...job, ...patch } : job;
};

/** Every offer still on the platform, decisions applied, deletions removed. */
const liveJobs = (overlay) => {
  const dropped = new Set(overlay.deletedJobs);
  return JOBS.filter((j) => !dropped.has(j.id)).map((j) => withDecision(j, overlay));
};

/** Adds the fields every offer table shows but the fixture does not store. */
const decorate = (job) => ({
  ...job,
  expired: isExpired(job),
  daysLeft: daysLeft(job),
});

export async function fetchPendingOffers({ q = "" } = {}) {
  if (USE_API) {
    const { data } = await adminApiWithMeta(`/admin/jobs${adminQs({ status: "pending", q })}`);
    const rows = (data || []).map((j) => {
      const employer = j.employer ? mapEmployerRow({ ...j.employer, user: j.employer.user }) : null;
      return {
        ...mapJobRow(j, j.employer),
        employer,
        waitingDays: j.postedAt
          ? Math.max(0, Math.floor((Date.now() - new Date(j.postedAt).getTime()) / 86400000))
          : 0,
        applications: j.applicationCount ?? 0,
      };
    });
    return rows.sort((a, b) => (a.postedAt || "").localeCompare(b.postedAt || ""));
  }

  await delay();

  return liveJobs(readOverlay())
    .filter((j) => j.status === "pending")
    .map((j) => ({
      ...decorate(j),
      employer: getEmployer(j.employerId),
      // How long the employer has been waiting on the admin, which is the
      // column this queue is actually sorted and judged on.
      waitingDays: daysSince(j.postedAt),
      applications: APPLICATIONS.filter((a) => a.jobId === j.id).length,
    }))
    .filter((j) => matches(j, ["title", "titleEn", "employerName", "city"], q))
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt));
}

export async function approveOffer(id) {
  if (USE_API) {
    const job = await adminApi(`/admin/jobs/${id}/decision`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
    return { ok: true, id, status: "active", expiresAt: isoDay(job.expiresAt) };
  }

  await delay(300);

  const overlay = readOverlay();
  const job = getJob(id);
  if (!job) return { ok: false, id };

  const expiresAt = expiryFromToday();
  const admin = actingAdmin();

  writeOverlay({
    offers: {
      ...overlay.offers,
      [id]: {
        ...overlay.offers[id],
        status: "active",
        approvedBy: admin?.id || "adm-1",
        approvedAt: TODAY_ISO,
        // Approval is what publishes the offer, so its 60-day run starts now
        // rather than on the day the employer submitted it.
        postedAt: TODAY_ISO,
        expiresAt,
        rejectionReason: null,
      },
    },
  });

  logAction("job.approved", { target: id });

  const employer = getEmployer(job.employerId);
  if (employer) {
    notifyUser("offer.approved", {
      to: { id: employer.id, name: employer.name },
      params: { offer: job.title, expiresAt },
    });
  }

  return { ok: true, id, status: "active", expiresAt };
}

/** `reason` is an entry from OFFER_REJECTION_REASONS, optionally with a note. */
export async function rejectOffer(id, reason) {
  if (USE_API) {
    await adminApi(`/admin/jobs/${id}/decision`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "rejected",
        rejectionReason: reason?.note || reason?.fr || reason?.id || "other",
      }),
    });
    return { ok: true, id, status: "rejected" };
  }

  await delay(300);

  const overlay = readOverlay();
  const job = getJob(id);
  if (!job) return { ok: false, id };

  writeOverlay({
    offers: {
      ...overlay.offers,
      [id]: {
        ...overlay.offers[id],
        status: "rejected",
        rejectionReason: reason?.id || "other",
        rejectionNote: reason?.note || "",
      },
    },
  });

  logAction("job.rejected", { target: id, reason });

  const employer = getEmployer(job.employerId);
  if (employer) {
    notifyUser("offer.rejected", {
      to: { id: employer.id, name: employer.name },
      params: { offer: job.title, reason },
    });
  }

  return { ok: true, id, status: "rejected" };
}

/**
 * Extends an offer past its 60-day window — the client's "extend exceptionally".
 *
 * Written to `extendedUntil` rather than to `expiresAt`, so the original window
 * and the exception stay distinguishable when someone asks why an offer ran for
 * four months.
 */
export async function extendOffer(id, until) {
  if (USE_API) {
    await adminApi(`/admin/jobs/${id}/extend`, {
      method: "PATCH",
      body: JSON.stringify({ extendedUntil: until }),
    });
    return { ok: true, id, extendedUntil: until };
  }

  await delay(300);

  const overlay = readOverlay();
  if (!getJob(id)) return { ok: false, id };

  writeOverlay({
    offers: {
      ...overlay.offers,
      [id]: { ...overlay.offers[id], extendedUntil: until, status: "active" },
    },
  });

  logAction("job.extended", { target: id, reason: { fr: until, ar: until, en: until } });
  return { ok: true, id, extendedUntil: until };
}

/** Puts an expired or closed offer back on the board with a fresh window. */
export async function republishOffer(id) {
  if (USE_API) {
    const job = await adminApi(`/admin/jobs/${id}/republish`, { method: "POST" });
    return { ok: true, id, expiresAt: isoDay(job.expiresAt) };
  }

  await delay(300);

  const overlay = readOverlay();
  const job = getJob(id);
  if (!job) return { ok: false, id };

  const expiresAt = expiryFromToday();

  writeOverlay({
    offers: {
      ...overlay.offers,
      [id]: {
        ...overlay.offers[id],
        status: "active",
        postedAt: TODAY_ISO,
        expiresAt,
        // Cleared, or the offer keeps an old exception it has outlived.
        extendedUntil: null,
        republishedAt: TODAY_ISO,
      },
    },
  });

  logAction("job.republished", { target: id });

  const employer = getEmployer(job.employerId);
  if (employer) {
    notifyUser("offer.approved", {
      to: { id: employer.id, name: employer.name },
      params: { offer: job.title, expiresAt },
    });
  }

  return { ok: true, id, expiresAt };
}

/** Takes an offer off the board without deleting it. */
export async function deactivateOffer(id) {
  if (USE_API) {
    await adminApi(`/admin/jobs/${id}/close`, { method: "POST" });
    return { ok: true, id, status: "closed" };
  }

  await delay(300);

  const overlay = readOverlay();
  if (!getJob(id)) return { ok: false, id };

  writeOverlay({
    offers: { ...overlay.offers, [id]: { ...overlay.offers[id], status: "closed" } },
  });

  logAction("job.deactivated", { target: id });
  return { ok: true, id, status: "closed" };
}

/**
 * Corrects an offer's own fields. Same allowlist reasoning as updateCandidate.
 *
 * Title and description are listed per language. An admin who fixes the French
 * wording and leaves the Arabic and English saying something else has made the
 * offer worse, not better — a cook reading it in Darija sees the old text.
 */
const EDITABLE_OFFER_FIELDS = [
  "title",
  "titleAr",
  "titleEn",
  "description",
  "descriptionAr",
  "descriptionEn",
  "contractType",
  "salaryMin",
  "salaryMax",
  "city",
  "experience",
  "expiresAt",
];

export async function updateOffer(id, changes) {
  if (USE_API) {
    const patch = Object.fromEntries(
      Object.entries(changes).filter(([key]) => EDITABLE_OFFER_FIELDS.includes(key))
    );
    const body = {};
    if (patch.title !== undefined || patch.titleAr !== undefined || patch.titleEn !== undefined) {
      body.title = {
        fr: patch.title ?? "",
        ar: patch.titleAr ?? patch.title ?? "",
        en: patch.titleEn ?? patch.title ?? "",
      };
    }
    if (
      patch.description !== undefined ||
      patch.descriptionAr !== undefined ||
      patch.descriptionEn !== undefined
    ) {
      body.description = {
        fr: patch.description ?? "",
        ar: patch.descriptionAr ?? patch.description ?? "",
        en: patch.descriptionEn ?? patch.description ?? "",
      };
    }
    if (patch.salaryMin !== undefined) body.salaryMin = patch.salaryMin;
    if (patch.salaryMax !== undefined) body.salaryMax = patch.salaryMax;
    if (patch.city !== undefined) body.city = patch.city;

    await adminApi(`/admin/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return { ok: true, id, changes: patch };
  }

  await delay(300);

  const overlay = readOverlay();
  if (!getJob(id)) return { ok: false, id };

  const patch = Object.fromEntries(
    Object.entries(changes).filter(([key]) => EDITABLE_OFFER_FIELDS.includes(key))
  );

  writeOverlay({ offers: { ...overlay.offers, [id]: { ...overlay.offers[id], ...patch } } });
  logAction("job.edited", { target: id });

  return { ok: true, id, changes: patch };
}

/* ------------------------------------------------------ job management */

export async function fetchJobBoards({ q = "" } = {}) {
  if (USE_API) {
    const rows = await adminApi("/admin/jobs/by-employer");
    const employers = await adminApi(`/admin/employers${adminQs({ q })}`).catch(() => ({ data: [] }));
    const list = employers?.data || employers || [];
    return list.map((e) => {
      const counts = rows.find((r) => r.employerId === e.id)?.counts || {};
      return {
        ...mapEmployerRow(e),
        runningJobs: counts.active ?? 0,
        pendingJobs: counts.pending ?? 0,
        totalOffers: rows.find((r) => r.employerId === e.id)?.total ?? 0,
      };
    });
  }

  await delay();
  const overlay = readOverlay();
  const dropped = new Set(overlay.deletedJobs);

  // Running-job counts have to exclude deleted offers, or the row keeps
  // advertising an offer the admin has already removed, and they have to see
  // approvals, or a freshly published offer is missing from its own restaurant.
  const rows = jobManagementRows().map((r) => {
    const live = jobsForEmployer(r.id)
      .filter((j) => !dropped.has(j.id))
      .map((j) => withDecision(j, overlay));
    return {
      ...r,
      runningJobs: live.filter((j) => j.status === "active" && !isExpired(j)).length,
      pendingJobs: live.filter((j) => j.status === "pending").length,
      totalOffers: live.length,
    };
  });

  return rows.filter((r) => matches(r, ["name", "ref"], q));
}

/** `status` is one of OFFER_STATUSES, or "all" (Improvement points 15). */
export async function fetchEmployerJobs(employerId, { status = "all" } = {}) {
  if (USE_API) {
    const [employerRaw, jobsRaw] = await Promise.all([
      adminApi(`/admin/employers/${employerId}`),
      adminApi(`/admin/jobs${adminQs({ employerId })}`),
    ]);
    const employer = mapEmployerRow(employerRaw);
    const jobsList = jobsRaw?.data || jobsRaw || [];
    const jobs = jobsList.map((j) => mapJobRow(j, employer));
    const effective = (j) => (j.status === "active" && j.expired ? "expired" : j.status);
    const counts = OFFER_STATUSES.reduce((acc, s) => {
      acc[s] = jobs.filter((j) => effective(j) === s).length;
      return acc;
    }, {});
    return {
      employer,
      jobs: status === "all" ? jobs : jobs.filter((j) => effective(j) === status),
      counts,
      total: jobs.length,
    };
  }

  await delay();

  const employer = getEmployer(employerId);
  if (!employer) return null;

  const overlay = readOverlay();
  const dropped = new Set(overlay.deletedJobs);

  const jobs = jobsForEmployer(employerId)
    .filter((j) => !dropped.has(j.id))
    .map((j) => decorate(withDecision(j, overlay)));

  // An active offer past its deadline counts as expired here, exactly as the
  // badge renders it — a filter that disagrees with the label it filters on is
  // worse than no filter.
  const effective = (j) => (j.status === "active" && j.expired ? "expired" : j.status);

  const counts = OFFER_STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter((j) => effective(j) === s).length;
    return acc;
  }, {});

  return {
    employer,
    jobs: status === "all" ? jobs : jobs.filter((j) => effective(j) === status),
    counts,
    total: jobs.length,
  };
}

export async function fetchJobOffer(id) {
  if (USE_API) {
    const job = await adminApi(`/admin/jobs/${id}`);
    const employer = job.employer
      ? mapEmployerRow({ ...job.employer, user: job.employer.user })
      : null;
    const mapped = mapJobRow(job, job.employer);
    return {
      ...mapped,
      applications: job.applicationCount ?? 0,
      views: job.viewCount ?? 0,
      publishedDays: job.postedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000))
        : 0,
      employer,
    };
  }

  await delay(150);

  const overlay = readOverlay();
  if (overlay.deletedJobs.includes(id)) return null;

  const base = getJob(id);
  if (!base) return null;

  const job = decorate(withDecision(base, overlay));

  return {
    ...job,
    applications: APPLICATIONS.filter((a) => a.jobId === id).length,
    // Deterministic stand-in for a view counter the fixtures do not carry.
    views: 40 + (JOBS.findIndex((j) => j.id === id) % 9) * 17,
    publishedDays: daysSince(job.postedAt),
    employer: getEmployer(job.employerId),
  };
}

export async function deleteJobOffer(id) {
  if (USE_API) {
    await adminApi(`/admin/jobs/${id}`, { method: "DELETE" });
    return { ok: true, id };
  }

  await delay(300);
  const overlay = readOverlay();
  if (!overlay.deletedJobs.includes(id)) {
    writeOverlay({ deletedJobs: [...overlay.deletedJobs, id] });
    logAction("job.deleted", { target: id });
  }
  return { ok: true, id };
}

/* ------------------------------------------------------------ feedback */

/**
 * Feedback as a conversation, not a single reply (Improvement points 19).
 *
 * The fixture carries at most one `reply` string. That is the shape the screen
 * was built on and it is why an admin could answer once and then had no way to
 * follow up or correct themselves. The seeded reply becomes the first message in
 * a thread; everything after it is appended.
 */
const threadFor = (message, overlay) => {
  const seeded = message.reply
    ? [{ id: `${message.id}-seed`, author: "admin", body: message.reply, at: message.at }]
    : [];
  return [...seeded, ...(overlay.feedbackThreads[message.id] || [])];
};

/** `filter` is "all" | "unanswered" | "answered"; `role` narrows by author. */
export async function fetchFeedback({ q = "", filter = "all", role = "all" } = {}) {
  if (USE_API) {
    const { data } = await adminApiWithMeta(
      `/admin/feedback${adminQs({ q, status: filter === "answered" ? "answered" : filter === "unanswered" ? "new" : undefined, role: role === "all" ? undefined : role })}`
    );
    const rows = (data || []).map((f) => ({
      id: f.id,
      from: f.from || f.user?.email || f.userId,
      role: f.role,
      rating: f.rating,
      message: f.message,
      messages: (f.messages || []).map((m) => ({
        id: m.at,
        author: m.role,
        body: m.body,
        at: isoDay(m.at),
      })),
      answered: f.status === "answered" || (f.messages || []).length > 0,
      lastReplyAt: f.messages?.length ? isoDay(f.messages[f.messages.length - 1].at) : null,
      at: isoDay(f.createdAt),
    }));
    return {
      rows,
      total: rows.length,
      unanswered: rows.filter((f) => !f.answered).length,
    };
  }

  await delay();
  const overlay = readOverlay();

  const rows = FEEDBACK.map((f) => {
    const messages = threadFor(f, overlay);
    return {
      ...f,
      messages,
      answered: messages.length > 0,
      lastReplyAt: messages.length ? messages[messages.length - 1].at : null,
    };
  });

  return {
    rows: rows
      .filter((f) => filter === "all" || (filter === "answered") === f.answered)
      .filter((f) => role === "all" || f.role === role)
      .filter((f) => matches(f, ["from", "message"], q)),
    total: rows.length,
    unanswered: rows.filter((f) => !f.answered).length,
  };
}

export async function replyToFeedback(id, reply) {
  if (USE_API) {
    await adminApi(`/admin/feedback/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ body: reply }),
    });
    return { ok: true, id, entry: { body: reply, at: stampNow() } };
  }

  await delay(350);

  const overlay = readOverlay();
  const thread = overlay.feedbackThreads[id] || [];
  const entry = {
    id: `${id}-r${thread.length + 1}`,
    author: "admin",
    authorName: actingAdmin()?.name || "Administrateur",
    body: reply,
    at: stampNow(),
  };

  writeOverlay({ feedbackThreads: { ...overlay.feedbackThreads, [id]: [...thread, entry] } });

  logAction("feedback.replied", { target: id });

  // The reply screen has always promised the user would be told. Now they are —
  // in the platform, at least; the email is queued behind the backend.
  const message = FEEDBACK.find((f) => f.id === id);
  if (message) {
    notifyUser("feedback.replied", {
      to: { id, name: message.from },
      params: { reply },
    });
  }

  return { ok: true, id, entry };
}

/* ---------------------------------------------------------- moderation */

export async function fetchModeration() {
  if (USE_API) {
    const [photos, reports] = await Promise.all([
      adminApi("/admin/moderation/photos"),
      adminApi("/admin/moderation/reports"),
    ]);
    const userIds = (photos || []).map((p) => String(p.ownerUserId || "")).filter(Boolean);
    const candidateByUser = await candidateIdsByUserIds(userIds);

    const mappedPhotos = await Promise.all(
      (photos || []).map(async (p) => {
        const ownerUserId = String(p.ownerUserId || "");
        const candidateId = p.candidateId || candidateByUser.get(ownerUserId) || null;
        let candidate = null;
        if (candidateId) {
          try {
            const c = await adminApi(`/admin/candidates/${candidateId}`);
            candidate = mapCandidateRow(c);
          } catch {
            candidate = { id: candidateId, name: candidateId };
          }
        }
        return {
          ...p,
          id: p.id || String(p._id),
          url: p.url || "",
          type: p.kind === "profile-photo" || p.type === "profile" ? "profile" : "food",
          uploadedAt: isoDay(p.createdAt || p.uploadedAt),
          reports: p.reportCount ?? p.reports ?? 0,
          candidateId,
          candidate,
        };
      })
    );

    const reported = await Promise.all(
      (reports || []).map(async (r) => {
        const jobId = String(r.targetId || r.jobId || "");
        let job = null;
        if (jobId) {
          try {
            const j = await adminApi(`/admin/jobs/${jobId}`);
            job = mapJobRow(j, j.employer);
          } catch {
            job = null;
          }
        }
        return {
          ...r,
          id: r.id || String(r._id),
          jobId,
          job,
          reason: r.reason || "",
          reportedAt: isoDay(r.createdAt || r.reportedAt),
          reports: r.reportCount ?? 1,
        };
      })
    );

    return { photos: mappedPhotos, reported };
  }

  await delay();
  const overlay = readOverlay();

  return {
    // The fixture's `url` points at the grey mockup rectangles from the design
    // hand-off, which render as empty blocks — useless on a screen whose whole
    // job is judging an image. Swapped for real photography of the kind each
    // row claims to be: a portrait for a profile photo, a plate for a dish.
    photos: PENDING_PHOTOS.filter((p) => !overlay.photos[p.id]).map((p, i) => ({
      ...p,
      url: p.type === "profile" ? PORTRAITS[i % PORTRAITS.length] : DISH_PHOTOS[i % DISH_PHOTOS.length],
      candidate: getCandidate(p.candidateId),
    })),
    reported: REPORTED_OFFERS.map((r) => ({ ...r, job: getJob(r.jobId) })),
  };
}

/**
 * `decision` is "approved" | "removed". `reason` is optional until the rejection
 * dialog exists; once it does, it is what the candidate is told and what the log
 * records alongside the refusal.
 */
export async function decidePhoto(id, decision, reason) {
  if (USE_API) {
    await adminApi(`/admin/moderation/photos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: decision === "approved" ? "approved" : "rejected",
        reason: reason?.note || reason?.fr || reason || "",
      }),
    });
    return { ok: true, id, decision };
  }

  await delay(250);
  const overlay = readOverlay();
  writeOverlay({ photos: { ...overlay.photos, [id]: decision } });

  const approved = decision === "approved";
  logAction(approved ? "photo.approved" : "photo.removed", { target: id, reason });

  if (!approved && reason) {
    const photo = PENDING_PHOTOS.find((p) => p.id === id);
    const candidate = photo && getCandidate(photo.candidateId);
    if (candidate) {
      notifyUser("photo.rejected", {
        to: { id: candidate.id, name: candidate.name },
        params: { reason },
      });
    }
  }

  return { ok: true, id, decision };
}

/* ------------------------------------------------------------ activity */

export async function fetchActivity({ type = "all" } = {}) {
  if (USE_API) {
    const apiType =
      type === "admin" ? "admin-action" : type === "all" ? undefined : type;
    const rows = await adminApi(`/admin/activity${adminQs({ type: apiType })}`);
    return (rows || []).map(mapActivityEntry);
  }

  await delay();

  // Recorded actions sit on top of the seeded history as one list, newest first
  // — the log is worthless if the admin's own last action is not the first thing
  // in it. Both carry "YYYY-MM-DD HH:mm", which sorts correctly as text; `seq`
  // then separates entries written within the same minute.
  const rows = [...readOverlay().activity, ...ACTIVITY_LOG].sort(
    (a, b) => b.at.localeCompare(a.at) || (b.seq ?? 0) - (a.seq ?? 0)
  );

  return type === "all" ? rows : rows.filter((l) => l.type === type);
}

/* -------------------------------------------------------------- admins */

// Improvement points 18: the super admin creates internal accounts with limited
// rights, and those rights actually restrict what the account can reach.
//
// The permission toggles used to be pure local state — `setGrants` plus a
// success toast, no write anywhere. Reloading the page discarded every change
// after the UI had confirmed it.

/** The fixture admins with any created, edited or disabled accounts applied. */
const liveAdmins = (overlay) => {
  const patched = ADMINS.map((a) => ({ disabled: false, ...a, ...(overlay.admins[a.id] || {}) }));
  const created = (overlay.createdAdmins || []).map((a) => ({
    ...a,
    ...(overlay.admins[a.id] || {}),
  }));
  return [...patched, ...created];
};

export async function fetchAdmins() {
  if (USE_API) {
    const rows = await adminApi("/admin/admins");
    return (rows || []).map(mapAdminUser);
  }

  await delay(150);
  return liveAdmins(readOverlay());
}

/**
 * Resolves a sign-in to an administrator.
 *
 * This is a demo, not an authentication check: no password is verified, and an
 * unrecognised address still gets in as the main account. It lives here anyway
 * so that the swap is a swap — backend task 7.2 promises every admin screen
 * works against the API with no component file changes, and a login screen that
 * reaches into the ADMINS fixture would break that promise on the first day.
 *
 * The real version returns a session from POST /auth/login and every caller
 * below stays as it is.
 */
export async function authenticate(email, password = "Admin123!") {
  if (USE_API) {
    try {
      const json = await adminFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const user = json.data?.user;
      const accessToken = json.data?.accessToken;
      if (!user || !accessToken) return { ok: false, reason: "invalid" };

      setValue(ADMIN_TOKEN_KEY, accessToken);
      setValue(ADMIN_META_KEY, {
        accessToken,
        permissions: user.permissions || [],
        adminLevel: user.adminLevel,
      });

      if (user.status === "suspended") return { ok: false, reason: "disabled" };

      return {
        ok: true,
        admin: {
          id: user.id,
          name: user.email?.split("@")[0] || "Admin",
          email: user.email,
          role: user.adminLevel === "super" ? "super" : "sub",
        },
      };
    } catch {
      return { ok: false, reason: "invalid" };
    }
  }

  await delay(200);

  const match = liveAdmins(readOverlay()).find(
    (a) => a.email.toLowerCase() === String(email).toLowerCase().trim()
  );

  if (match?.disabled) return { ok: false, reason: "disabled" };

  return {
    ok: true,
    admin: match
      ? { id: match.id, name: match.name, email: match.email, role: match.role }
      : null,
  };
}

/** The accounts the sign-in screen offers. Demo scaffolding, and only that. */
export async function fetchDemoAccounts() {
  if (USE_API) {
    return [
      { id: "seed-1", name: "Admin principal", email: "admin@nkhedmou.ma", role: "super" },
      { id: "seed-2", name: "Modération", email: "moderation@nkhedmou.ma", role: "sub" },
      { id: "seed-3", name: "Offres", email: "offres@nkhedmou.ma", role: "sub" },
    ];
  }

  await delay(100);
  return liveAdmins(readOverlay())
    .filter((a) => !a.disabled)
    .map(({ id, name, email, role }) => ({ id, name, email, role }));
}

export async function createAdmin({ name, email, permissions = [] }) {
  if (USE_API) {
    const admin = await adminApi("/admin/admins", {
      method: "POST",
      body: JSON.stringify({ email, password: "Admin123!", permissions }),
    });
    return { ok: true, admin: mapAdminUser(admin) };
  }

  await delay(300);

  if (!can("manage-admins")) return { ok: false, reason: "forbidden" };

  const overlay = readOverlay();
  const created = overlay.createdAdmins || [];

  const taken = liveAdmins(overlay).some(
    (a) => a.email.toLowerCase() === String(email).toLowerCase().trim()
  );
  if (taken) return { ok: false, reason: "email-taken" };

  const admin = {
    id: `adm-new-${created.length + 1}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "sub",
    permissions: permissions.filter((p) => PERMISSION_IDS.includes(p)),
    lastActive: "—",
    disabled: false,
  };

  writeOverlay({ createdAdmins: [...created, admin] });
  logAction("admin.created", { target: admin.email });

  return { ok: true, admin };
}

/**
 * Persists a permission grant.
 *
 * The super admin's rights are not writable: stripping them is how an
 * installation locks itself out, and the screen already reasons about that.
 */
export async function setAdminPermissions(adminId, permissions) {
  if (USE_API) {
    await adminApi(`/admin/admins/${adminId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    });
    return { ok: true, adminId, permissions };
  }

  await delay(250);

  if (!can("manage-admins")) return { ok: false, reason: "forbidden" };

  const overlay = readOverlay();
  const target = liveAdmins(overlay).find((a) => a.id === adminId);
  if (!target || target.role === "super") return { ok: false, reason: "forbidden" };

  const next = permissions.filter((p) => PERMISSION_IDS.includes(p));

  writeOverlay({
    admins: { ...overlay.admins, [adminId]: { ...overlay.admins[adminId], permissions: next } },
  });

  logAction("admin.permissionsChanged", {
    target: target.email,
    reason: { fr: `${next.length} droits`, ar: `${next.length} صلاحيات`, en: `${next.length} rights` },
  });

  return { ok: true, adminId, permissions: next };
}

export async function setAdminDisabled(adminId, disabled) {
  if (USE_API) {
    if (disabled) {
      await adminApi(`/admin/admins/${adminId}`, { method: "DELETE" });
    } else {
      await adminApi(`/admin/admins/${adminId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      });
    }
    return { ok: true, adminId, disabled };
  }

  await delay(250);

  if (!can("manage-admins")) return { ok: false, reason: "forbidden" };

  const overlay = readOverlay();
  const target = liveAdmins(overlay).find((a) => a.id === adminId);
  if (!target || target.role === "super") return { ok: false, reason: "forbidden" };

  writeOverlay({
    admins: { ...overlay.admins, [adminId]: { ...overlay.admins[adminId], disabled } },
  });

  logAction(disabled ? "admin.disabled" : "admin.enabled", { target: target.email });

  return { ok: true, adminId, disabled };
}
