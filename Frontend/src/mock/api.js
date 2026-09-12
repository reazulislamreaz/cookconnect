// Data access layer for the public site.
//
// When NEXT_PUBLIC_API_URL is set, calls the real backend; otherwise serves
// deterministic fixtures so the demo works without a running API.

import { ACTIVE_JOBS, JOBS, getJob, getJobsByEmployer, isExpired, daysLeft } from "./jobs";
import { CANDIDATES, getCandidate, CURRENT_CANDIDATE_ID } from "./candidates";
import { EMPLOYERS, getEmployer, CURRENT_EMPLOYER_ID } from "./employers";
import { APPLICATIONS, SAVED_PROFILES, MY_APPLICATIONS } from "./applications";
import { NOTIFICATIONS } from "./notifications";
import { getJSON, setValue, SESSION_KEY } from "@/lib/browserStore";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { ALL_POSITIONS } from "./sectors";

/** Change Requirements 07: "Display 12 profiles per page". */
export const PAGE_SIZE = 12;

/** Guests only ever see the first page of results (Change Requirements 03). */
export const GUEST_MAX_PAGES = 1;

const USE_API = Boolean(process.env.NEXT_PUBLIC_API_URL);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

const matches = (value, filter) => !filter || filter === "all" || value === filter;

const PLACEHOLDER_LOGO = "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png";
const PLACEHOLDER_PHOTO = "https://i.ibb.co/HD6WMnhg/Rectangle-119.png";

/* ----------------------------------------------------------- API helpers */

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Request failed");
  }
  return json.data;
}

async function apiWithMeta(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Request failed");
  }
  return { data: json.data, meta: json.meta };
}

function authHeaders() {
  const token = getJSON(SESSION_KEY, null)?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function qs(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "" && v !== "all") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

const positionById = (id) => ALL_POSITIONS.find((p) => p.id === id);

function pickLocalized(obj, field = "fr") {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[field] || obj.fr || obj.en || "";
}

async function hydrateCandidate(id) {
  if (!id) return null;
  try {
    const raw = await api(`/candidates/${id}`);
    return mapCandidate(raw);
  } catch {
    return null;
  }
}

function mapCandidate(raw) {
  if (!raw) return null;
  const pos = positionById(raw.positionId);
  const name = raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
  const about = raw.about;
  const mapped = {
    ...raw,
    id: raw.id || raw._id,
    name,
    photo: raw.photoUrl || raw.photo || PLACEHOLDER_PHOTO,
    title: raw.title || pos?.fr || raw.positionId || "",
    titleAr: raw.titleAr || pos?.ar || "",
    titleEn: raw.titleEn || pos?.en || "",
    completion: raw.completion ?? raw.completionPercent ?? 0,
    about: typeof about === "string" ? about : pickLocalized(about, "fr"),
    aboutAr: typeof about === "object" ? pickLocalized(about, "ar") : raw.aboutAr || "",
    aboutEn: typeof about === "object" ? pickLocalized(about, "en") : raw.aboutEn || "",
    canUploadFoodPhotos: Boolean(pos?.photos),
    foodPhotos: raw.foodPhotos || [],
    hasCv: Boolean(raw.cvAssetId || raw.hasCv),
  };
  if (!mapped.completion && mapped.firstName) {
    mapped.completion = getProfileCompletion(mapped).percent;
  }
  return mapped;
}

const employerCache = new Map();

async function getEmployerCached(id) {
  if (!id) return null;
  if (employerCache.has(id)) return employerCache.get(id);
  try {
    const raw = await api(`/employers/${id}`);
    const mapped = {
      ...raw,
      id: raw.id,
      logo: raw.logoUrl || raw.logo || PLACEHOLDER_LOGO,
      cover: raw.coverUrl || raw.cover || PLACEHOLDER_LOGO,
      about: typeof raw.about === "string" ? raw.about : pickLocalized(raw.about, "fr"),
      email: raw.email || "",
    };
    employerCache.set(id, mapped);
    return mapped;
  } catch {
    return { id, name: "", logo: PLACEHOLDER_LOGO, type: "restaurant", city: "" };
  }
}

async function mapJob(raw) {
  if (!raw) return null;
  const employer = await getEmployerCached(raw.employerId);
  const title = raw.title;
  const description = raw.description;
  const mapped = {
    ...raw,
    id: raw.id || raw._id,
    title: typeof title === "string" ? title : pickLocalized(title, "fr"),
    titleAr: typeof title === "object" ? pickLocalized(title, "ar") : raw.titleAr || "",
    titleEn: typeof title === "object" ? pickLocalized(title, "en") : raw.titleEn || "",
    description: typeof description === "string" ? description : pickLocalized(description, "fr"),
    descriptionAr: typeof description === "object" ? pickLocalized(description, "ar") : raw.descriptionAr || "",
    descriptionEn: typeof description === "object" ? pickLocalized(description, "en") : raw.descriptionEn || "",
    employerName: employer?.name || raw.employerName || "",
    establishmentType: employer?.type || raw.establishmentType || "",
    logo: employer?.logo || PLACEHOLDER_LOGO,
    applicants: raw.applicationCount ?? raw.applicants ?? 0,
    postedAt: raw.postedAt ? String(raw.postedAt).slice(0, 10) : raw.postedAt,
    expiresAt: raw.expiresAt ? String(raw.expiresAt).slice(0, 10) : raw.expiresAt,
  };
  mapped.daysLeft = daysLeft(mapped);
  mapped.expired = isExpired(mapped);
  return mapped;
}

function paginateFromMeta(items, meta, isLoggedIn) {
  const total = meta?.total ?? items.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visiblePages = isLoggedIn ? totalPages : Math.min(totalPages, GUEST_MAX_PAGES);
  const page = meta?.page ?? 1;
  return {
    items,
    page,
    totalPages,
    visiblePages,
    total,
    gated: meta?.gated ?? (!isLoggedIn && totalPages > visiblePages),
  };
}

/* ------------------------------------------------- candidate profile edits */

const PROFILE_EDITS_KEY = "nkhedmou.profileEdits";

const allProfileEdits = () => getJSON(PROFILE_EDITS_KEY, {}) || {};

function withEdits(candidate) {
  if (!candidate) return candidate;
  const patch = allProfileEdits()[candidate.id];
  if (!patch) return candidate;

  const merged = { ...candidate, ...patch };
  return { ...merged, completion: getProfileCompletion(merged).percent };
}

const currentCandidateId = () =>
  getJSON(SESSION_KEY, null)?.user?.id || CURRENT_CANDIDATE_ID;

function paginate(items, page, isLoggedIn) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visiblePages = isLoggedIn ? totalPages : Math.min(totalPages, GUEST_MAX_PAGES);
  const safePage = Math.min(Math.max(1, page), visiblePages);
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: safePage,
    totalPages,
    visiblePages,
    total: items.length,
    gated: !isLoggedIn && totalPages > visiblePages,
  };
}

/* ------------------------------------------------------------------ jobs */

export async function searchJobs({
  q = "",
  city = "all",
  sectorId = "all",
  positionId = "all",
  contractType = "all",
  establishmentType = "all",
  experience = "all",
  page = 1,
  isLoggedIn = false,
  searchAll = false,
} = {}) {
  if (USE_API) {
    const params = searchAll
      ? { page, limit: PAGE_SIZE }
      : { q, city, sectorId, positionId, contractType, establishmentType, experience, page, limit: PAGE_SIZE };
    const { data, meta } = await apiWithMeta(`/jobs${qs(params)}`);
    const items = await Promise.all((data || []).map(mapJob));
    return paginateFromMeta(items, meta, isLoggedIn);
  }

  await delay();

  const term = q.trim().toLowerCase();
  const results = ACTIVE_JOBS.filter((job) => {
    if (searchAll) return true;
    if (term && !`${job.title} ${job.employerName}`.toLowerCase().includes(term)) return false;
    return (
      matches(job.city, city) &&
      matches(job.sectorId, sectorId) &&
      matches(job.positionId, positionId) &&
      matches(job.contractType, contractType) &&
      matches(job.establishmentType, establishmentType) &&
      matches(job.experience, experience)
    );
  });

  return paginate(results, page, isLoggedIn);
}

export async function fetchJob(id) {
  if (USE_API) {
    const raw = await api(`/jobs/${id}`);
    return raw ? mapJob(raw) : null;
  }

  await delay(150);
  const job = getJob(id);
  return job ? { ...job, daysLeft: daysLeft(job), expired: isExpired(job) } : null;
}

export async function fetchFeaturedJobs(limit = 6) {
  if (USE_API) {
    const data = await api(`/jobs/featured${qs({ limit })}`);
    return Promise.all((data || []).slice(0, limit).map(mapJob));
  }

  await delay(150);
  return ACTIVE_JOBS.slice(0, limit);
}

/* ------------------------------------------------------------ candidates */

export async function searchCandidates({
  q = "",
  city = "all",
  sectorId = "all",
  positionId = "all",
  experience = "all",
  availability = "all",
  page = 1,
  isLoggedIn = false,
  searchAll = false,
} = {}) {
  if (USE_API) {
    const params = searchAll
      ? { page, limit: PAGE_SIZE }
      : { q, city, sectorId, positionId, experience, availability, page, limit: PAGE_SIZE };
    const { data, meta } = await apiWithMeta(`/candidates${qs(params)}`);
    const items = (data || []).map(mapCandidate);
    return paginateFromMeta(items, meta, isLoggedIn);
  }

  await delay();

  const term = q.trim().toLowerCase();
  const results = CANDIDATES.filter((c) => {
    if (searchAll) return true;
    if (term && !`${c.name} ${c.title}`.toLowerCase().includes(term)) return false;
    return (
      matches(c.city, city) &&
      matches(c.sectorId, sectorId) &&
      matches(c.positionId, positionId) &&
      matches(c.experience, experience) &&
      matches(c.availability, availability)
    );
  });

  return paginate(results, page, isLoggedIn);
}

export async function fetchCandidate(id, { asEmployer = false } = {}) {
  if (USE_API) {
    const raw = await api(`/candidates/${id}`);
    const c = mapCandidate(raw);
    if (!c) return null;
    const { phone, ...rest } = c;
    return asEmployer && phone ? { ...rest, phone } : rest;
  }

  await delay(150);
  const c = withEdits(getCandidate(id));
  if (!c) return null;
  const { phone, ...rest } = c;
  return asEmployer ? { ...rest, phone } : rest;
}

export async function fetchCurrentCandidate() {
  if (USE_API) {
    try {
      const raw = await api("/candidates/me");
      return mapCandidate(raw);
    } catch {
      return null;
    }
  }

  await delay(120);
  return withEdits(getCandidate(currentCandidateId()));
}

export async function saveCurrentCandidate(patch) {
  if (USE_API) {
    const raw = await api("/candidates/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return mapCandidate(raw);
  }

  await delay(180);

  const id = currentCandidateId();
  const edits = allProfileEdits();
  setValue(PROFILE_EDITS_KEY, { ...edits, [id]: { ...(edits[id] || {}), ...patch } });

  return withEdits(getCandidate(id));
}

/* -------------------------------------------------------------- employer */

export async function fetchEmployer(id) {
  if (USE_API) {
    return getEmployerCached(id);
  }

  await delay(120);
  return getEmployer(id);
}

export async function fetchCurrentEmployer() {
  if (USE_API) {
    try {
      const raw = await api("/employers/me");
      return {
        ...raw,
        id: raw.id,
        logo: raw.logoUrl || raw.logo || PLACEHOLDER_LOGO,
        cover: raw.coverUrl || raw.cover || PLACEHOLDER_LOGO,
        about: typeof raw.about === "string" ? raw.about : pickLocalized(raw.about, "fr"),
      };
    } catch {
      return null;
    }
  }

  await delay(120);
  return getEmployer(CURRENT_EMPLOYER_ID);
}

export async function fetchEmployerJobs(employerId = CURRENT_EMPLOYER_ID) {
  if (USE_API) {
    const grouped = await api("/jobs/me/list");
    const flatten = (arr) => Promise.all((arr || []).map(mapJob));
    const [active, pending, expired, draft, rejected, closed] = await Promise.all([
      flatten(grouped.active),
      flatten(grouped.pending),
      flatten(grouped.expired),
      flatten(grouped.draft),
      flatten(grouped.rejected),
      flatten(grouped.closed),
    ]);
    const all = [...active, ...pending, ...expired, ...draft, ...rejected, ...closed];
    return { all, active, pending, expired };
  }

  await delay(180);
  const all = getJobsByEmployer(employerId).map((j) => ({
    ...j,
    daysLeft: daysLeft(j),
    expired: isExpired(j),
  }));
  return {
    all,
    active: all.filter((j) => j.status === "active" && !j.expired),
    pending: all.filter((j) => j.status === "pending"),
    expired: all.filter((j) => j.status === "expired" || j.expired),
  };
}

export async function fetchEmployerCandidates(employerId = CURRENT_EMPLOYER_ID) {
  if (USE_API) {
    const [applicantsRaw, savedRaw] = await Promise.all([
      api("/applications/received").catch(() => []),
      api("/bookmarks/profiles").catch(() => []),
    ]);

    const applicants = await Promise.all(
      (applicantsRaw || []).map(async (a) => {
        const candRaw = a.candidateId && typeof a.candidateId === "object" ? a.candidateId : null;
        const candidateId = candRaw?.id || candRaw?._id || a.candidateId;
        const candidate = candRaw
          ? mapCandidate(candRaw)
          : await hydrateCandidate(String(candidateId));
        return {
          ...a,
          id: a.id,
          candidateId: candidate?.id || candidateId,
          employerId,
          candidate,
          source: "applied",
          appliedAt: a.appliedAt ? String(a.appliedAt).slice(0, 10) : a.appliedAt,
        };
      })
    );

    const saved = await Promise.all(
      (savedRaw || []).map(async (s) => {
        const targetId = s.targetId || s.target?.id || s.target;
        const candidate = await hydrateCandidate(String(targetId));
        return {
          ...s,
          id: s.id,
          candidateId: candidate?.id || targetId,
          employerId,
          candidate,
          source: "saved",
          savedAt: s.createdAt ? String(s.createdAt).slice(0, 10) : s.savedAt,
        };
      })
    );

    return { applicants, saved };
  }

  await delay(200);

  const applicants = APPLICATIONS.filter((a) => a.employerId === employerId).map((a) => ({
    ...a,
    candidate: getCandidate(a.candidateId),
  }));

  const saved = SAVED_PROFILES.filter((s) => s.employerId === employerId).map((s) => ({
    ...s,
    source: "saved",
    candidate: getCandidate(s.candidateId),
  }));

  return { applicants, saved };
}

export async function fetchEmployers() {
  if (USE_API) {
    return [];
  }

  await delay(120);
  return EMPLOYERS;
}

/* ------------------------------------------------ candidate's own account */

export async function fetchMyApplications() {
  if (USE_API) {
    const rows = await api("/applications/me");
    return Promise.all(
      (rows || []).map(async (a) => {
        const jobRaw = a.jobId && typeof a.jobId === "object" ? a.jobId : null;
        const job = jobRaw ? await mapJob(jobRaw) : a.jobId ? await fetchJob(a.jobId) : null;
        return {
          ...a,
          id: a.id,
          jobId: job?.id || a.jobId,
          job,
          appliedAt: a.appliedAt ? String(a.appliedAt).slice(0, 10) : a.appliedAt,
        };
      })
    );
  }

  await delay(180);
  return MY_APPLICATIONS.map((a) => ({ ...a, job: getJob(a.jobId) }));
}

export async function fetchMyStats() {
  if (USE_API) {
    const [profile, applications] = await Promise.all([
      api("/candidates/me").catch(() => null),
      api("/applications/me").catch(() => []),
    ]);
    return {
      views: profile?.profileViews ?? 0,
      applications: (applications || []).length,
      savedByEmployers: 0,
    };
  }

  await delay(150);

  const id = currentCandidateId();
  const index = Math.max(0, CANDIDATES.findIndex((c) => c.id === id));

  return {
    views: 60 + index * 13,
    applications: MY_APPLICATIONS.length,
    savedByEmployers: SAVED_PROFILES.filter((s) => s.candidateId === id).length,
  };
}

/* --------------------------------------------------------- notifications */

export async function fetchNotifications() {
  if (USE_API) {
    const { data } = await apiWithMeta("/notifications");
    return (data || []).map((n) => ({
      id: n.id,
      type: n.type,
      title: pickLocalized(n.title, "fr"),
      titleAr: pickLocalized(n.title, "ar"),
      titleEn: pickLocalized(n.title, "en"),
      body: pickLocalized(n.body, "fr"),
      bodyAr: pickLocalized(n.body, "ar"),
      bodyEn: pickLocalized(n.body, "en"),
      date: n.createdAt ? String(n.createdAt).slice(0, 10) : "",
      read: Boolean(n.read),
    }));
  }

  await delay(120);
  return NOTIFICATIONS;
}

/* ------------------------------------------------------------ mutations */

export async function applyToJob(jobId) {
  if (USE_API) {
    await api("/applications", { method: "POST", body: JSON.stringify({ jobId }) });
    return { ok: true, jobId };
  }

  await delay(400);
  return { ok: true, jobId };
}

export async function postJob(payload) {
  if (USE_API) {
    const job = await api("/jobs", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, status: job?.status || "pending", message: "offer.pendingApproval", payload };
  }

  await delay(600);
  return { ok: true, status: "pending", message: "offer.pendingApproval", payload };
}

export async function republishJob(jobId) {
  if (USE_API) {
    await api(`/jobs/${jobId}/republish`, { method: "POST" });
    return { ok: true, jobId, status: "pending" };
  }

  await delay(400);
  return { ok: true, jobId, status: "pending" };
}

export async function toggleSaveProfile(candidateId, saved) {
  if (USE_API) {
    if (saved) {
      await api("/bookmarks/profiles", {
        method: "POST",
        body: JSON.stringify({ targetId: candidateId }),
      });
    } else {
      await api(`/bookmarks/profiles${qs({ targetId: candidateId })}`, { method: "DELETE" });
    }
    return { ok: true, candidateId, saved };
  }

  await delay(250);
  return { ok: true, candidateId, saved };
}

export async function submitFeedback(payload) {
  if (USE_API) {
    await api("/feedback", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, payload };
  }

  await delay(400);
  return { ok: true, payload };
}
