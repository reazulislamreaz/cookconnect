# CookconneKt Backend — API Contract

Base URL `/api/v1`. Every endpoint returns the envelope described in
`01-ARCHITECTURE.md`. `🔒` = authentication required. `⚙` = admin permission
required (named in the row).

---

## Public surface — consumed by `Frontend/`

### `auth`

| Method | Path | Purpose | Replaces |
| --- | --- | --- | --- |
| POST | `/auth/register` | Sign up as `candidate` or `employer`; sends OTP | Sign Up screen |
| POST | `/auth/verify-otp` | Confirm email with the 6-digit code | OTP screen |
| POST | `/auth/resend-otp` | New code, rate limited | OTP screen |
| POST | `/auth/login` | Access + refresh token; enforces 3-attempt lockout | Sign In |
| POST | `/auth/refresh` | Rotate the refresh token | — |
| POST | `/auth/logout` 🔒 | Revoke the current session | Navbar |
| POST | `/auth/forgot-password` | Send reset OTP | Forgot Password |
| POST | `/auth/reset-password` | Set a new password with the OTP | Set New Password |
| POST | `/auth/change-password` 🔒 | Change while signed in | Profile |
| GET | `/auth/me` 🔒 | Current user + profile + completeness | Session bootstrap |
| GET | `/auth/google` · `/auth/google/callback` | OAuth | "Continue with Google" |

### `candidates` — cook profiles

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/candidates` | Search. Filters `q, city, sectorId, positionId, experience, availability, page`. **12/page; a guest receives page 1 only** and `meta.gated: true` |
| GET | `/candidates/:id` | Public profile. **`phone` is included only for an authenticated, verified employer**, and that read writes an `activityLog` |
| GET | `/candidates/me` 🔒 | The signed-in cook's own full profile |
| PATCH | `/candidates/me` 🔒 | Update; recomputes `completionPercent` |
| POST | `/candidates/me/photo` 🔒 | Profile photo (type/size/resolution gate) |
| POST | `/candidates/me/dish-photos` 🔒 | Max 8, eligible roles only |
| DELETE | `/candidates/me/dish-photos/:assetId` 🔒 | |
| POST | `/candidates/me/cv` 🔒 | PDF/DOC/DOCX, ≤ 5 MB |

### `employers`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/employers/:id` | Public establishment page |
| GET | `/employers/me` 🔒 | Own profile |
| PATCH | `/employers/me` 🔒 | |
| POST | `/employers/me/logo` · `/cover` 🔒 | |
| GET | `/employers/me/dashboard` 🔒 | Counters for the employer dashboard |

### `jobs` — offers

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/jobs` | Search. `q, city, sectorId, positionId, contractType, establishmentType, experience, page, searchAll`. Same 12/page + guest gate |
| GET | `/jobs/featured` | Home-page teaser |
| GET | `/jobs/:id` | Detail; increments `viewCount` |
| POST | `/jobs` 🔒 employer | Creates as **`pending`** — never live directly |
| PATCH | `/jobs/:id` 🔒 employer | Edit; a live offer returns to `pending` |
| POST | `/jobs/:id/close` 🔒 employer | |
| POST | `/jobs/:id/republish` 🔒 employer | Expired → `pending` |
| GET | `/jobs/me/list` 🔒 employer | Grouped `active` / `pending` / `expired` |
| POST | `/jobs/:id/report` | Flags for moderation |

### `applications`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/applications` 🔒 candidate | **422 if the profile is incomplete** (Change Req 06); 409 on duplicate |
| GET | `/applications/me` 🔒 candidate | The cook's dashboard list |
| GET | `/applications/received` 🔒 employer | Applicants inbox |
| PATCH | `/applications/:id/status` 🔒 employer | Appends to `timeline`, notifies the cook |

### `bookmarks`

| Method | Path |
| --- | --- |
| GET · POST · DELETE | `/bookmarks/profiles` 🔒 employer |
| GET · POST · DELETE | `/bookmarks/jobs` 🔒 candidate |

### Supporting

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/taxonomies` | Everything, one call, cached — the clients bootstrap from this |
| GET | `/taxonomies/positions?sectorId=` | Enforces the Sector→Position flow |
| GET | `/notifications` 🔒 · PATCH `/notifications/:id/read` · PATCH `/notifications/read-all` | |
| POST | `/feedback` 🔒 | Rating + message |
| GET | `/banners?placement=` · POST `/banners/:id/click` | |
| GET | `/partners` | |
| GET | `/health` · `/health/ready` | Liveness / readiness |

---

## Admin surface — consumed by `Dashboard/`

All routes 🔒 with `role: admin`, then a permission check. Permission names match
the Administrators screen already built.

### Overview — `/admin/dashboard`

| Method | Path | Feeds |
| --- | --- | --- |
| GET | `/admin/dashboard/stats` | The four KPI cards |
| GET | `/admin/dashboard/growth?year=&metric=cooks\|restaurants` | Both charts |
| GET | `/admin/dashboard/market` | Most-searched positions/cities, average salary |

### Chef Manage — `/admin/candidates`

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/admin/candidates?verified=true\|false&q=&page=` | `manage-candidates` |
| GET | `/admin/candidates/:id` | `manage-candidates` |
| PATCH | `/admin/candidates/:id/verification` | `manage-candidates` |
| PATCH | `/admin/candidates/:id/status` | `manage-candidates` |
| DELETE | `/admin/candidates/:id` | `delete-users` |
| GET | `/admin/candidates/export` | `export-cv` — CSV, the CV database |

### Restaurant Manage — `/admin/employers`

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/admin/employers?status=&q=&page=` | `manage-employers` |
| GET | `/admin/employers/:id` | `manage-employers` |
| GET | `/admin/employers/requests` | `manage-employers` — the pending queue |
| PATCH | `/admin/employers/:id/decision` | `manage-employers` — Approve / Reject |
| PATCH | `/admin/employers/:id/block` | `manage-employers` |

### Job Management — `/admin/jobs`

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/admin/jobs/by-employer` | `approve-offers` — one row per restaurant |
| GET | `/admin/jobs?employerId=&status=&page=` | `approve-offers` |
| GET | `/admin/jobs/:id` | `approve-offers` |
| PATCH | `/admin/jobs/:id/decision` | `approve-offers` — approve / reject |
| PATCH | `/admin/jobs/:id/extend` | `approve-offers` — exceptional extension |
| DELETE | `/admin/jobs/:id` | `approve-offers` |

### Remaining admin modules

| Method | Path | Permission | Screen |
| --- | --- | --- | --- |
| GET · POST | `/admin/feedback` · `/admin/feedback/:id/reply` | `manage-candidates` | Feedback |
| GET | `/admin/moderation/photos?status=pending` | `approve-photos` | Photo moderation |
| PATCH | `/admin/moderation/photos/:id` | `approve-photos` | Approve / Remove |
| GET | `/admin/moderation/reports` | `approve-photos` | Reported offers |
| GET | `/admin/activity?type=&page=` | — any admin | Activity log |
| GET · POST · PATCH · DELETE | `/admin/admins` | `manage-admins` | Administrators |
| GET · POST · PATCH · DELETE | `/admin/banners` | `manage-banners` | (future screen) |
| GET · POST · PATCH · DELETE | `/admin/taxonomies` | `manage-admins` | (future screen) |

---

## Conventions

**Pagination.** `?page=1&limit=12` (limit capped at 100). Response `meta` carries
`page, limit, total, totalPages`, plus `gated: true` when a guest is being held
to page one.

**Filtering.** Query keys mirror the field names the clients already send, so
`Frontend/src/mock/api.js` maps across with no renaming.

**Sorting.** `?sort=-createdAt,title` — `-` prefix for descending, allowlisted
per module.

**Status codes.** `200` ok · `201` created · `400` malformed · `401`
unauthenticated · `403` unauthorised · `404` missing · `409` conflict (duplicate
application) · `422` validation or business-rule failure (incomplete profile) ·
`429` rate limited.

**Idempotency.** `POST /applications` and `POST /jobs` accept an
`Idempotency-Key` header, so a double-tapped button cannot create two records.

**Versioning.** The path carries `v1`. Breaking changes open `v2`; `v1` keeps
serving until both clients have moved.

---

## Migration note — the existing client stubs

`Frontend/src/redux/api/baseApi.js` points at a hardcoded LAN address
(`http://10.10.10.52:5050/v1`) and `authApi.js` calls paths from an unrelated
template — `/user/auth/login`, `/user/create`, `/user/retrive/:id`. None of them
match this contract, and the site does not currently use them: every screen reads
`src/mock/api.js` instead.

Both files need rewriting when the backend lands. Two things to fix at the same
time:

1. **The base URL must come from `NEXT_PUBLIC_API_URL`**, not a hardcoded IP —
   the current value is unreachable from any machine outside that LAN.
2. **The mock layer stays as the seam.** `src/mock/api.js` and
   `Dashboard/src/mock/adminApi.js` already expose exactly the functions each
   screen needs. Swapping their bodies from fixture reads to `fetch` calls
   changes two files and leaves every component untouched — which is the reason
   the mock layer was written that way.
