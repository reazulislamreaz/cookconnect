# CookconneKt Backend — Work Breakdown

31 tasks in 8 phases. Each is a reviewable unit with its own acceptance
criteria — nothing is "done" until its criteria pass.

Estimates assume one developer. **S** ≈ half a day · **M** ≈ 1–2 days ·
**L** ≈ 3–4 days.

Status: ☐ not started · ◐ in progress · ☑ done · ⊘ blocked

---

## Phase 0 — Foundation (no business logic)

Nothing here touches the domain. It exists so that every later task starts from a
project that builds, lints, tests and boots.

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 0.1 | **Project scaffold** — TypeScript strict, path aliases, `tsup`/`tsc` build, nodemon dev loop | S | `npm run dev`, `build`, `start` all work from a clean clone |
| ☐ 0.2 | **Tooling** — ESLint, Prettier, husky, lint-staged, commitlint | S | A commit that fails lint is rejected |
| ☐ 0.3 | **Config layer** — Zod-validated `env.ts`, `.env.example`, Winston logger | S | Boot with a missing `JWT_SECRET` exits with a readable message, not a stack trace |
| ☐ 0.4 | **Express assembly** — helmet, CORS allowlist, rate limit, request id, `sendResponse`, `ApiError`, `catchAsync`, global error handler, 404 | M | `GET /api/v1/health` returns the envelope; an unknown route returns the error envelope |
| ☐ 0.5 | **Mongo connection** — connect/retry/graceful shutdown, base plugins (`toJSON`, soft delete) | S | SIGTERM closes the server and the connection without dropping in-flight requests |
| ☐ 0.6 | **Test harness** — Jest, supertest, `mongodb-memory-server`, CI workflow | M | `npm test` runs green against an in-memory Mongo, no external services |
| ☐ 0.7 | **Docker** — `Dockerfile` (multi-stage) + `docker-compose` (api + mongo) | S | `docker compose up` gives a working API on a clean machine |

> **Review gate 1** — Nothing domain-specific is written until this phase is
> accepted. Every later task inherits its error handling, logging and test setup
> from here; changing it afterwards means touching every module.

---

## Phase 1 — Identity

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 1.1 | **`user` module** — model, indexes, status/role enums, soft delete | M | Unit tests for the model's invariants |
| ☐ 1.2 | **`auth` — register + OTP verification** | M | Registering creates a `pending` user, stores a hashed OTP, sends one email; an unverified user cannot apply or post |
| ☐ 1.3 | **`auth` — login, refresh rotation, logout** | L | Refresh rotates; **replaying a used refresh token revokes the whole family** and is covered by a test |
| ☐ 1.4 | **`auth` — lockout after 3 failures** (Change Req 05) | S | The 4th attempt returns 423 even with the correct password |
| ☐ 1.5 | **`auth` — forgot / reset / change password** | M | A consumed OTP cannot be reused; all sessions are revoked on reset |
| ☐ 1.6 | **`auth` middleware** — `auth()`, `authorize(roles)`, `hasPermission(perm)` | M | Table-driven tests across all role/permission combinations |
| ☐ 1.7 | **Google + Facebook OAuth** | M | First OAuth login creates the account; a later password login on the same email links rather than duplicates |

> **Review gate 2** — Security-critical. Worth reading line by line: token
> rotation, the lockout counter, and the permission matrix.

---

## Phase 2 — Core domain

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 2.1 | **`taxonomy` module** + boot cache | M | `GET /taxonomies` serves from memory; a write invalidates it. Positions cannot be fetched without a sector |
| ☐ 2.2 | **`media` module** — upload, type/size/resolution gate, storage interface, local driver | L | A 6 MB file and a 400×400 image are both rejected with distinct messages |
| ☐ 2.3 | **`candidate` module** — CRUD, `completionPercent` hook, dish-photo eligibility | L | Completeness matches `Frontend/src/lib/profileCompletion.js` exactly, verified by a shared fixture test |
| ☐ 2.4 | **`candidate` search** — filters, 12/page, guest gate | M | A guest gets 1 page + `gated: true`; an authenticated user gets all pages |
| ☐ 2.5 | **Contact privacy + access logging** (Change Req 13, ClientDoc 20) | M | `phone` absent for guests, cooks and unverified employers; present for a verified one, and that request writes exactly one `activityLog` |
| ☐ 2.6 | **`employer` module** — CRUD, verification states | M | A `pending` employer cannot publish an offer |

---

## Phase 3 — Marketplace

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 3.1 | **`job` module** — CRUD, the full lifecycle state machine | L | Every illegal transition is rejected; the state machine has its own test table |
| ☐ 3.2 | **`job` search** — filters, `searchAll`, 12/page, guest gate | M | Filter combinations return the same results the mock layer does, on seeded data |
| ☐ 3.3 | **60-day expiry cron** (Change Req 09) | M | An offer dated 61 days ago flips to `expired` on the nightly run and stays in the employer's history |
| ☐ 3.4 | **`application` module** — apply, duplicate guard, status timeline | L | Incomplete profile → 422; second apply → 409 (enforced by the unique index, proven under concurrent requests) |
| ☐ 3.5 | **`bookmark` module** — saved profiles and saved offers | S | Idempotent; the unique index holds |

---

## Phase 4 — Engagement

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 4.1 | **`notification` module** — in-app store, read state | M | Created in all three languages in one write |
| ☐ 4.2 | **Email delivery** — provider interface, per-locale templates, queued | L | A dead SMTP host slows nothing; failures retry and are logged, never lost silently |
| ☐ 4.3 | **Notification triggers** (Change Req 12) | M | Profile approval, offer approval, application status change and feedback reply each produce one in-app record **and** one email |
| ☐ 4.4 | **`feedback` module** | S | Submitting notifies admins; the unanswered counter is accurate |

---

## Phase 5 — Admin surface

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 5.1 | **`activityLog` module** + filtered listing | M | Write-only; the Activity screen's three filters work |
| ☐ 5.2 | **`admin` module** — accounts, permission grants | M | A sub-admin cannot grant itself a permission; the super-admin cannot be stripped |
| ☐ 5.3 | **Admin candidates + employers endpoints** | M | Matches the Chef Manage and Restaurant Manage tables field for field |
| ☐ 5.4 | **Admin jobs endpoints** — approve, reject, extend, delete | M | Approval sets `postedAt`/`expiresAt` and notifies the employer |
| ☐ 5.5 | **`moderation` module** — photo queue, reports | M | Rejecting a photo detaches it from the profile that used it |
| ☐ 5.6 | **`analytics` module** — KPIs, growth series, market data | L | Growth aggregation returns 12 buckets with zeros for empty months; each pipeline cached 60 s |
| ☐ 5.7 | **CV export** (ClientDoc 14) | S | CSV with a UTF-8 BOM opens correctly in Excel with French and Arabic text |

---

## Phase 6 — Content and hardening

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 6.1 | **`banner` + `partner` modules** | M | Scheduling honours `startsAt`/`endsAt`; clicks counted |
| ☐ 6.2 | **Seed script** — port both mock fixture sets into Mongo | L | `npm run seed` produces the exact dataset both clients were built against |
| ☐ 6.3 | **OpenAPI / Swagger** | M | `/api/docs` documents every endpoint; generated from the Zod schemas, not hand-written |
| ☐ 6.4 | **Security pass** — rate limits per route class, `mongo-sanitize`, `hpp`, payload caps, CORS lockdown | M | An injection attempt and a payload flood are both rejected; documented in a short threat note |
| ☐ 6.5 | **Performance pass** — index verification, `explain()` on every list query, N+1 audit | M | No listing query performs a collection scan on the seeded dataset |

---

## Phase 7 — Integration and release

| # | Task | Size | Acceptance |
| --- | --- | --- | --- |
| ☐ 7.1 | **Frontend integration** — rewrite `baseApi.js` + `src/mock/api.js` bodies to call the API | L | Every public screen works against the API; **no component file changes** |
| ☐ 7.2 | **Dashboard integration** — same for `adminApi.js` | M | Every admin screen works; mutations persist server-side instead of in `localStorage` |
| ☐ 7.3 | **Deployment** — managed Mongo, object storage, environment config, CI/CD | M | Staging reachable; rollback documented |
| ☐ 7.4 | **Observability** — structured logs, error tracking, uptime check | S | An unhandled error produces one searchable entry with a request id |

---

## Sequencing

```
Phase 0 ──> Phase 1 ──> Phase 2 ──┬──> Phase 3 ──> Phase 4 ──┐
                                  └──> Phase 6.1 ────────────┤
                                                             ├──> Phase 7
                                       Phase 5 ──────────────┘
```

Phase 5 depends on Phase 3 for the data it administers, but 5.1 (activity log)
and 5.2 (admin accounts) can start as soon as Phase 1 lands.

**Roughly 7–9 weeks** for one developer including review cycles. Phases 0–3 are
the critical path; nothing meaningful can be demonstrated before Phase 3
completes.

## Two decisions worth taking early

1. **Storage provider.** Local disk works for development, but production needs
   S3/Cloudflare R2/Backblaze. The choice affects task 2.2 and should be made
   before it starts, not after.
2. **Email provider.** SMTP, SendGrid, Resend or Mailgun. Affects task 4.2.
   Moroccan deliverability is worth checking before committing.

Neither blocks Phase 0 or 1.
