// Mock data access layer.
//
// Every page reads through these async functions rather than importing the
// fixtures directly, so replacing them with real `fetch` calls later is a
// one-file change and no component has to be rewritten.

import { ACTIVE_JOBS, JOBS, getJob, getJobsByEmployer, isExpired, daysLeft } from "./jobs";
import { CANDIDATES, getCandidate, CURRENT_CANDIDATE_ID } from "./candidates";
import { EMPLOYERS, getEmployer, CURRENT_EMPLOYER_ID } from "./employers";
import { APPLICATIONS, SAVED_PROFILES, MY_APPLICATIONS } from "./applications";
import { NOTIFICATIONS } from "./notifications";
import { getJSON, setValue, SESSION_KEY } from "@/lib/browserStore";
import { getProfileCompletion } from "@/lib/profileCompletion";

/** Change Requirements 07: "Display 12 profiles per page". */
export const PAGE_SIZE = 12;

/** Guests only ever see the first page of results (Change Requirements 03). */
export const GUEST_MAX_PAGES = 1;

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

const matches = (value, filter) => !filter || filter === "all" || value === filter;

/* ------------------------------------------------- candidate profile edits */

/**
 * Profile edits, layered over the read-only fixtures.
 *
 * The fixtures in mock/candidates.js are module constants, so a saved profile
 * used to vanish the moment the component re-fetched: "Save" set a banner and
 * changed nothing. That made the "Incomplete Profile" gate a dead end — it
 * sent a candidate to Edit My Profile, and completing the form still left them
 * blocked, because the next read returned the original blank fields.
 *
 * Edits live in browser storage, keyed by candidate id, and are merged on the
 * way out. When this layer is replaced by a real API, this is one PATCH call
 * and the merge disappears.
 */
const PROFILE_EDITS_KEY = "nkhedmou.profileEdits";

const allProfileEdits = () => getJSON(PROFILE_EDITS_KEY, {}) || {};

/**
 * `completion` is recomputed rather than carried over from the fixture: it is
 * derived from the required fields, so a merge that fills one of them has to
 * move the percentage with it.
 */
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
    // True when there are more results the visitor cannot reach without an account.
    gated: !isLoggedIn && totalPages > visiblePages,
  };
}

/* ------------------------------------------------------------------ jobs */

/**
 * Job offer search.
 * `searchAll: true` is the "Search All" button from Change Requirements 07 —
 * it ignores every filter and returns the whole active database.
 */
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
  await delay(150);
  const job = getJob(id);
  return job ? { ...job, daysLeft: daysLeft(job), expired: isExpired(job) } : null;
}

/** Home page teaser: the first page of offers shown to a signed-out visitor. */
export async function fetchFeaturedJobs(limit = 6) {
  await delay(150);
  return ACTIVE_JOBS.slice(0, limit);
}

/* ------------------------------------------------------------ candidates */

/** Candidate search. Filters per ClientDoc 6: city, sector, job, experience. */
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

/**
 * A candidate's public profile. The phone number is only ever attached for a
 * signed-in employer (Change Requirements 13 — contact privacy).
 */
export async function fetchCandidate(id, { asEmployer = false } = {}) {
  await delay(150);
  const c = withEdits(getCandidate(id));
  if (!c) return null;
  const { phone, ...rest } = c;
  return asEmployer ? { ...rest, phone } : rest;
}

/**
 * The signed-in candidate.
 *
 * Reads the demo session straight from browser storage rather than taking an
 * id argument, so every caller keeps its existing signature. This used to
 * return CURRENT_CANDIDATE_ID unconditionally, which meant signing in as the
 * incomplete-profile demo account still loaded the 100%-complete fixture and
 * the profile gate could never be observed.
 */
export async function fetchCurrentCandidate() {
  await delay(120);
  return withEdits(getCandidate(currentCandidateId()));
}

/**
 * Persist the signed-in candidate's profile and return the saved result, so a
 * caller can show the new completion percentage without a second round trip.
 */
export async function saveCurrentCandidate(patch) {
  await delay(180);

  const id = currentCandidateId();
  const edits = allProfileEdits();
  setValue(PROFILE_EDITS_KEY, { ...edits, [id]: { ...(edits[id] || {}), ...patch } });

  return withEdits(getCandidate(id));
}

/* -------------------------------------------------------------- employer */

export async function fetchEmployer(id) {
  await delay(120);
  return getEmployer(id);
}

export async function fetchCurrentEmployer() {
  await delay(120);
  return getEmployer(CURRENT_EMPLOYER_ID);
}

/** Employer's own offers, split the way the job-management screen needs them. */
export async function fetchEmployerJobs(employerId = CURRENT_EMPLOYER_ID) {
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

/** The two candidate sources an employer sees (Change Requirements 10). */
export async function fetchEmployerCandidates(employerId = CURRENT_EMPLOYER_ID) {
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
  await delay(120);
  return EMPLOYERS;
}

/* ------------------------------------------------ candidate's own account */

export async function fetchMyApplications() {
  await delay(180);
  return MY_APPLICATIONS.map((a) => ({ ...a, job: getJob(a.jobId) }));
}

/* --------------------------------------------------------- notifications */

export async function fetchNotifications() {
  await delay(120);
  return NOTIFICATIONS;
}

/* ------------------------------------------------------------ mutations */
// No-ops that resolve, so form submit handlers already have the right shape.

export async function applyToJob(jobId) {
  await delay(400);
  return { ok: true, jobId };
}

/** Offers never go live directly — admin approves first (Change Req 08). */
export async function postJob(payload) {
  await delay(600);
  return { ok: true, status: "pending", message: "offer.pendingApproval", payload };
}

export async function republishJob(jobId) {
  await delay(400);
  return { ok: true, jobId, status: "pending" };
}

export async function toggleSaveProfile(candidateId, saved) {
  await delay(250);
  return { ok: true, candidateId, saved };
}

export async function submitFeedback(payload) {
  await delay(400);
  return { ok: true, payload };
}
