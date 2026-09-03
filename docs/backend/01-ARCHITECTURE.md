# CookconneKt Backend — Architecture

Single Node.js/Express/TypeScript service on MongoDB, serving **both** clients:

| Client | Origin | Surface |
| --- | --- | --- |
| `Frontend/` — public site | `:3000` | `/api/v1/*` |
| `Dashboard/` — admin panel | `:3001` | `/api/v1/admin/*` |

## Why one service, not two

The two apps read the same data. An offer approved in the Dashboard has to appear
in the Frontend listing on the next request; a cook verified by an admin has to
move between the two Chef Manage tabs *and* become visible to employers. Two
services would mean either a shared database (two codebases silently coupled
through collections — the worst option) or synchronous chatter between them for
every read.

One deployable with two route namespaces keeps a single source of truth for the
domain rules, one migration path, and one place where "an offer expires after 60
days" is written down. The split that matters is **authorisation**, not
deployment: `/admin` demands an admin identity and a permission, the public
surface does not.

## Modular monolith

`src/modules/<name>/` is a self-contained slice. Every module owns its route
table, HTTP layer, business logic, persistence, validation and types:

```
src/modules/job/
├── job.route.ts         Express router — paths, middleware chain
├── job.controller.ts    HTTP only: read req, call service, send response
├── job.service.ts       Business rules. No req/res. Throws ApiError.
├── job.model.ts         Mongoose schema + model
├── job.interface.ts     TJob, TJobFilters — domain types
├── job.dto.ts           Request/response shapes crossing the HTTP boundary
├── job.validation.ts    Zod schemas used by the validateRequest middleware
├── job.constant.ts      Status enums, searchable fields, populate paths
└── job.utils.ts         Module-local helpers
```

### Rules that keep it modular

1. **Controllers contain no business logic.** They parse, delegate, respond.
   Anything with an `if` about the domain belongs in the service.
2. **Services never touch `req`/`res`.** They take plain arguments and return
   plain data, so they are callable from a cron job, a seed script or a test
   without faking an HTTP request.
3. **Cross-module access goes through the other module's service**, never its
   model. `application.service` calls `jobService.findActiveById()`; it does not
   `import Job from "../job/job.model"`. This is the rule that stops a modular
   monolith from rotting into a shared-database mess, and it is the one to
   enforce in review.
4. **One collection has exactly one owning module.** If two modules both write a
   collection, the boundary is drawn in the wrong place.
5. **Circular imports are a design smell**, not a build problem to work around.
   When two modules need each other, the shared part belongs in a third module or
   in `shared/`.

## Layout

```
Backend/
├── src/
│   ├── server.ts              Boot: env check → DB connect → listen → graceful shutdown
│   ├── app.ts                 Express assembly: security, parsers, routes, error handler
│   ├── config/
│   │   ├── env.ts             Zod-validated environment. Fails fast at boot.
│   │   ├── database.ts        Mongoose connection + events
│   │   └── logger.ts          Winston (JSON in prod, pretty in dev)
│   ├── routes/index.ts        Module registry — the one file listing every router
│   ├── modules/
│   │   ├── auth/              register, login, refresh, OTP, password reset
│   │   ├── user/              account record, roles, status
│   │   ├── candidate/         cook profiles, search, completeness
│   │   ├── employer/          establishments, verification queue
│   │   ├── job/               offers, lifecycle, approval
│   │   ├── application/       applications + status timeline
│   │   ├── bookmark/          saved profiles (employer) and saved offers (cook)
│   │   ├── media/             uploads, moderation queue
│   │   ├── notification/      in-app + email fan-out
│   │   ├── feedback/          user messages and admin replies
│   │   ├── taxonomy/          sectors, positions, cities, option lists
│   │   ├── banner/            advertising slots
│   │   ├── partner/           partner logos
│   │   ├── activityLog/       audit trail incl. contact-detail access
│   │   ├── analytics/         dashboard counters, growth series, search stats
│   │   └── admin/             admin accounts and permissions
│   ├── middlewares/
│   │   ├── auth.ts            JWT verify → req.user
│   │   ├── authorize.ts       Role and permission guards
│   │   ├── validateRequest.ts Zod on body/params/query
│   │   ├── upload.ts          Multer + type/size gate
│   │   ├── rateLimit.ts       Global + strict limiter for auth routes
│   │   ├── notFound.ts
│   │   └── globalErrorHandler.ts
│   ├── shared/
│   │   ├── ApiError.ts        Operational errors with a status code
│   │   ├── catchAsync.ts      Async wrapper so no route needs try/catch
│   │   ├── sendResponse.ts    One response envelope for the whole API
│   │   ├── QueryBuilder.ts    search / filter / sort / paginate / select
│   │   └── pagination.ts
│   ├── jobs/                  node-cron: expire offers, reminders, digests
│   ├── seed/                  Ports the existing mock fixtures into MongoDB
│   ├── types/                 Global type augmentation (Express.Request.user)
│   └── utils/                 jwt, bcrypt, otp, email, storage, localizedString
├── tests/                     Jest + supertest + mongodb-memory-server
├── docs/                      These documents + generated OpenAPI
└── docker-compose.yml         api + mongo for local development
```

## Request lifecycle

```
request
  → helmet, cors(allowlist), rateLimit, requestId
  → express.json / multipart
  → router  /api/v1/...
      → auth()            attaches req.user, or 401
      → authorize(...)    role / permission check, or 403
      → validateRequest() Zod parse of body+query+params, or 422
      → controller        catchAsync wrapped
          → service       business rules, throws ApiError
              → model     Mongoose
      → sendResponse      uniform envelope
  → globalErrorHandler    maps every throw to the same error shape
```

## Response envelope

Every endpoint, success or failure, returns the same top-level shape so the
clients need one parser:

```jsonc
// success
{ "success": true, "statusCode": 200, "message": "Offers retrieved",
  "meta": { "page": 1, "limit": 12, "total": 84, "totalPages": 7 },
  "data": [ /* ... */ ] }

// failure
{ "success": false, "statusCode": 422, "message": "Validation failed",
  "errorSources": [ { "path": "email", "message": "Invalid email" } ],
  "stack": "only in development" }
```

## Authentication

- **Access token** — JWT, 15 min, carries `{ userId, role, permissions[] }`.
- **Refresh token** — 30 days, httpOnly cookie, stored hashed in `sessions` so it
  can be revoked. Rotated on every refresh; reuse of a rotated token revokes the
  whole family (theft detection).
- **Passwords** — bcrypt, cost 12. Policy already enforced client-side in
  `Frontend/src/lib/validation.js` is re-enforced server-side, because the client
  check is a convenience, not a control.
- **Lockout** — 3 failed attempts locks the account (Change Requirements 05).
  Counter and `lockedUntil` live on the user document.
- **OTP** — 6 digits, hashed, 10-minute TTL index, max 5 verification attempts.
  Used for email verification and password reset.

### Roles

`candidate` · `employer` · `admin`

Admins additionally carry `adminLevel` (`super` | `sub`) and a `permissions[]`
array. `/admin` routes guard on the permission, not the level, so the main
account is simply the one holding every permission — matching the Administrators
screen already built in the Dashboard.

## Non-negotiables carried over from the specification

These are business rules, not implementation details. Each has a test.

| Rule | Source | Where enforced |
| --- | --- | --- |
| Offers live 60 days, then expire but stay in history | Change Req 09 | `job.service` + nightly cron |
| New offers require admin approval before going live | Change Req 08 | `job.service.create` sets `pending` |
| 12 results per page | Change Req 07 | `QueryBuilder` default limit |
| Guests see only the first page of results | Change Req 03 | `job`/`candidate` search service |
| A cook's phone is visible only to a verified employer | Change Req 13 | `candidate.service.findById` projection |
| Every contact-detail view is logged | ClientDoc 20 | `activityLog` on that projection |
| An incomplete profile cannot apply | Change Req 06 | `application.service.create` |
| Dish photos only for kitchen/bakery/pastry roles | ClientDoc 4 | `media.service` + taxonomy flag |
| Uploads are type- and size-checked before storage | ClientDoc 20 | `upload` middleware |

## Cross-cutting concerns

**Localisation.** Both clients render French, Darija and English from the same
document. Every user-facing string that lives in the database is a
`LocalizedString` subdocument `{ fr, ar, en }` with `fr` required — matching the
`pick()` fallback the clients already implement.

**File storage.** One `StorageProvider` interface with a local-disk driver for
development and an S3-compatible driver for production. Modules depend on the
interface, so switching providers touches one file.

**Email.** Nodemailer behind a `MailProvider` interface; templates per locale.
Queued, never awaited inside a request — a slow SMTP server must not make the
API slow.

**Audit.** Admin actions, contact-detail access and photo uploads write to
`activityLogs`. The Dashboard's Activity screen is a direct read of it.

**Errors.** `ApiError` for anything expected. Unexpected throws are logged with a
request id and returned as a generic 500 — internal messages never reach a
client.

## Environments

| | Development | Production |
| --- | --- | --- |
| Mongo | docker-compose | Managed replica set (Atlas) |
| Files | `./uploads` | S3-compatible bucket |
| Logs | pretty console | JSON to stdout |
| Errors | stack included | stack stripped |
| CORS | localhost:3000/3001 | the two deployed origins |
