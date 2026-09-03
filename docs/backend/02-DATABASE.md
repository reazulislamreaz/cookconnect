# CookconneKt Backend — Database Design (MongoDB)

18 collections. Every one is owned by exactly one module.

## Shape overview

```
users ─┬─< candidateProfiles ──< applications >── jobs >── employerProfiles ─┘
       │                    └──< bookmarks                    │
       ├─< sessions                                           │
       ├─< notifications                                      │
       ├─< feedback                                           │
       └─< mediaAssets ──< moderationReports                  │
                                                              │
taxonomies (sectors, positions, cities, option lists) ────────┘
activityLogs · searchEvents · profileViews · banners · partners · otpTokens · counters
```

## Conventions

- `_id` is the Mongo ObjectId; the API exposes it as `id` (a `toJSON` transform).
- `timestamps: true` everywhere (`createdAt`, `updatedAt`).
- Soft delete via `deletedAt: Date | null`; a global query helper excludes them.
  Nothing a user created is ever hard-deleted — the admin "delete" actions in the
  Dashboard set this field.
- **`LocalizedString`** is a reusable subdocument `{ fr: String (required), ar: String, en: String }`.
  Reads fall back to `fr`, matching `pick()` in both clients.
- Money is stored as an integer in the minor-free unit (MAD, whole dirhams) plus
  a `currency` field. No floats for money.
- Enum values are lowercase kebab-case strings, matching the ids the clients
  already send (`"head-chef"`, `"cdi"`, `"5-10"`).

---

## 1. `users` — authentication and identity

The account record. Profile data lives in the role-specific collection, so a
login lookup never drags a 40-field profile into memory.

| Field | Type | Notes |
| --- | --- | --- |
| `email` | String | lowercased, trimmed, **unique** |
| `passwordHash` | String | bcrypt cost 12; `select: false` |
| `role` | Enum | `candidate` \| `employer` \| `admin` |
| `status` | Enum | `pending` \| `active` \| `suspended` \| `deleted` |
| `emailVerified` | Boolean | gate for applying/posting |
| `phone` | String | optional at signup |
| `locale` | Enum | `fr` \| `ar` \| `en` — drives email language |
| `authProvider` | Enum | `local` \| `google` \| `facebook` |
| `providerId` | String | sparse index |
| `failedLoginAttempts` | Number | Change Req 05 |
| `lockedUntil` | Date \| null | set after 3 failures |
| `lastLoginAt` | Date | shown in the admin CV database |
| `adminLevel` | Enum \| null | `super` \| `sub` — role `admin` only |
| `permissions` | [String] | role `admin` only |
| `deletedAt` | Date \| null | |

**Indexes** — `{ email: 1 }` unique · `{ role: 1, status: 1 }` ·
`{ authProvider: 1, providerId: 1 }` sparse · `{ createdAt: -1 }` (growth chart).

> **Decision — one `users` collection, not three.** Login, lockout, password
> reset and email verification are identical for all three roles. Splitting them
> would triple that logic and make "is this email taken?" a three-collection
> question.

---

## 2. `candidateProfiles` — cooks

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId → users | **unique** |
| `firstName`, `lastName` | String | |
| `photoId` | ObjectId → mediaAssets | |
| `sectorId`, `positionId` | String → taxonomies | position must belong to sector |
| `city` | String → taxonomies | |
| `country` | String | default `MA` |
| `experience` | Enum | `0-1` `1-3` `3-5` `5-10` `10+` |
| `availability` | Enum | `immediate` `1-month` `3-months` |
| `contractType` | Enum | `cdi` `cdd` `interim` `stage` `unspecified` |
| `expectedSalary` | Number | MAD/month |
| `phone` | String | **never projected to guests** (Change Req 13) |
| `about` | LocalizedString | |
| `skills` | [String] | taxonomy keys |
| `languages` | [String] | |
| `training` | [{ school, diploma, from, to }] | |
| `history` | [{ establishment, positionId, from, to }] | |
| `foodPhotoIds` | [ObjectId] | max 8, eligible roles only |
| `cvAssetId` | ObjectId \| null | |
| `completionPercent` | Number | **derived**, recomputed on save |
| `verified` | Boolean | set by admin |
| `verifiedAt`, `verifiedBy` | Date, ObjectId | |
| `profileViews` | Number | denormalised counter |
| `searchable` | Boolean | false while suspended or incomplete |

**Indexes** — `{ userId: 1 }` unique · `{ city: 1, sectorId: 1, positionId: 1, experience: 1 }`
(the exact filter combination the search screen sends) · `{ availability: 1 }` ·
`{ verified: 1, searchable: 1 }` · text index on `firstName`, `lastName`.

> **`completionPercent` is stored, not computed on read.** The admin dashboard
> needs "profiles 100% complete" as an aggregate over 30k documents; computing it
> per document at query time makes that a full scan. It is recalculated in a
> pre-save hook, so it cannot drift from the fields it summarises.

---

## 3. `employerProfiles` — restaurants, hotels, bakeries

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId → users | **unique** |
| `name` | String | |
| `type` | Enum | `restaurant` `hotel` `bakery` `cafe` `catering` |
| `city` | String → taxonomies | |
| `address` | String | |
| `logoId`, `coverId` | ObjectId → mediaAssets | |
| `about` | LocalizedString | |
| `phone` | String | |
| `phonePublic` | Boolean | employer-controlled toggle |
| `socials` | { instagram, linkedin, website } | |
| `since`, `staffCount` | String | |
| `status` | Enum | `pending` \| `active` \| `rejected` \| `blocked` |
| `verified` | Boolean | |
| `reviewedBy`, `reviewedAt`, `rejectionReason` | | the Approve/Cancel screen |

**Indexes** — `{ userId: 1 }` unique · `{ status: 1, createdAt: -1 }` (the request
queue) · `{ city: 1, type: 1 }` · `{ createdAt: -1 }` (growth chart).

> **No separate `restaurantRequests` collection.** A pending sign-up *is* an
> employer profile with `status: "pending"`. A second collection would need the
> same 15 fields and a copy-on-approve step that can half-fail. The Dashboard's
> "Restaurant request" table is `find({ status: "pending" })`.

---

## 4. `jobs` — offers

| Field | Type | Notes |
| --- | --- | --- |
| `employerId` | ObjectId → employerProfiles | |
| `title` | LocalizedString | |
| `description` | LocalizedString | |
| `sectorId`, `positionId` | String | |
| `city`, `country` | String | |
| `contractType` | Enum | |
| `salaryMin`, `salaryMax`, `currency` | Number, Number, String | |
| `experience` | Enum | |
| `requirements` | [String] | taxonomy keys — never free text (Change Req 08) |
| `benefits` | [String] | taxonomy keys |
| `status` | Enum | `draft` `pending` `active` `rejected` `expired` `closed` |
| `postedAt` | Date | set on approval, not on create |
| `expiresAt` | Date | `postedAt + 60 days` |
| `approvedBy`, `approvedAt`, `rejectionReason` | | |
| `viewCount`, `applicationCount` | Number | denormalised |
| `reportCount` | Number | drives "reported offers" |
| `deletedAt` | Date \| null | |

**Indexes** — `{ status: 1, expiresAt: 1 }` (the expiry cron and the active list) ·
`{ employerId: 1, status: 1 }` · `{ city: 1, sectorId: 1, positionId: 1, contractType: 1, experience: 1 }` ·
`{ postedAt: -1 }` · text index on `title.fr`, `title.en`.

### Lifecycle

```
draft ──submit──> pending ──admin approve──> active ──60 days──> expired
                     │                          │                   │
                     └──admin reject──> rejected└──employer close──> closed
                                                          republish ──> pending
```

`expired` is set by a nightly cron, **not** inferred at read time. Inferring it
means every listing query carries a date comparison and the admin's "expired"
count disagrees with the employer's, depending on when each was run.

---

## 5. `applications`

| Field | Type | Notes |
| --- | --- | --- |
| `jobId`, `candidateId`, `employerId` | ObjectId | `employerId` denormalised for the employer's inbox |
| `status` | Enum | `pending` `shortlisted` `rejected` `hired` |
| `coverNote` | String | optional |
| `timeline` | [{ status, at, byUserId, note }] | append-only history |
| `appliedAt` | Date | |

**Indexes** — `{ jobId: 1, candidateId: 1 }` **unique** (one application per offer)
· `{ candidateId: 1, appliedAt: -1 }` · `{ employerId: 1, status: 1 }`.

> The unique index is the real guard against double-applying. A service-level
> "check then insert" loses the race under concurrent requests.

---

## 6. `bookmarks` — saved profiles and saved offers

One collection, discriminated by `kind`, because both are "user X saved thing Y"
with identical mechanics.

| Field | Type | Notes |
| --- | --- | --- |
| `kind` | Enum | `saved-profile` (employer→cook) \| `saved-job` (cook→offer) |
| `ownerUserId` | ObjectId | |
| `targetId` | ObjectId | candidateProfile or job |
| `note` | String | employer's private note |

**Index** — `{ ownerUserId: 1, kind: 1, targetId: 1 }` **unique**.

---

## 7. `mediaAssets` — every uploaded file

Unifying uploads into one collection is what makes the photo-moderation queue a
single query instead of a union across profiles, dishes and covers.

| Field | Type | Notes |
| --- | --- | --- |
| `ownerUserId` | ObjectId | |
| `kind` | Enum | `profile-photo` `dish-photo` `cv` `logo` `cover` `banner` |
| `storageKey`, `url` | String | |
| `mimeType`, `sizeBytes`, `width`, `height` | | |
| `moderationStatus` | Enum | `pending` \| `approved` \| `rejected` |
| `moderationReason`, `reviewedBy`, `reviewedAt` | | |
| `reportCount` | Number | |

**Indexes** — `{ moderationStatus: 1, createdAt: -1 }` (the queue) ·
`{ ownerUserId: 1, kind: 1 }`.

---

## 8. `moderationReports`

| Field | Type |
| --- | --- |
| `targetType` | `media` \| `job` \| `candidate` \| `employer` |
| `targetId` | ObjectId |
| `reporterUserId` | ObjectId \| null |
| `reason` | String |
| `status` | `open` \| `actioned` \| `dismissed` |

**Index** — `{ targetType: 1, targetId: 1, status: 1 }`.

---

## 9. `notifications`

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId | |
| `type` | Enum | `approval` `job` `application` `feedback-reply` `system` |
| `title`, `body` | LocalizedString | all three languages stored |
| `data` | Mixed | `{ jobId }` etc. for deep links |
| `read`, `readAt` | Boolean, Date | |
| `emailSentAt` | Date \| null | Change Req 12: in-app **and** email |

**Index** — `{ userId: 1, read: 1, createdAt: -1 }`.

---

## 10. `feedback`

| Field | Type |
| --- | --- |
| `userId`, `role` | ObjectId, Enum |
| `rating` | Number 1–5 |
| `message` | String |
| `reply`, `repliedBy`, `repliedAt` | String, ObjectId, Date |
| `status` | `new` \| `answered` |

**Index** — `{ status: 1, createdAt: -1 }`.

---

## 11. `taxonomies` — reference data

One polymorphic collection instead of nine near-identical ones.

| Field | Type | Notes |
| --- | --- | --- |
| `type` | Enum | `sector` `position` `city` `contract-type` `establishment-type` `experience-level` `availability` `requirement` `benefit` `skill` |
| `key` | String | the stable id the clients send (`"head-chef"`) |
| `label` | LocalizedString | |
| `parentKey` | String \| null | a position's sector — enforces the Sector→Position flow |
| `group` | String \| null | requirement/benefit grouping for the checkbox UI |
| `meta` | Mixed | e.g. `{ allowsFoodPhotos: true }` |
| `order`, `active` | Number, Boolean | |

**Index** — `{ type: 1, key: 1 }` **unique** · `{ type: 1, parentKey: 1, order: 1 }`.

> **Decision — in the database, not as TypeScript constants.** The client
> specification puts sector, position and city lists under admin control, and
> both frontends already render them from data. Constants would need a redeploy
> to add a city. The whole collection is ~250 small documents, cached in memory
> at boot and invalidated on write, so the read cost is zero.

---

## 12. `activityLogs` — audit trail

| Field | Type | Notes |
| --- | --- | --- |
| `actorUserId` | ObjectId \| null | null for system actions |
| `actorLabel` | String | denormalised name, so the log survives a deleted account |
| `action` | String | `offer.approved`, `contact.viewed`, `photo.uploaded`, … |
| `targetType`, `targetId` | String, ObjectId | |
| `detail` | LocalizedString | rendered directly by the Dashboard |
| `ip`, `userAgent` | String | |

**Indexes** — `{ createdAt: -1 }` · `{ action: 1, createdAt: -1 }` ·
`{ actorUserId: 1, createdAt: -1 }`.

Write-only from the application's perspective: nothing updates or deletes a log
row. Retention is handled by a scheduled archive, not by mutation.

---

## 13. `sessions` — refresh tokens

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId | |
| `tokenHash` | String | SHA-256; the raw token is never stored |
| `familyId` | String | rotation lineage, for theft detection |
| `userAgent`, `ip` | String | |
| `expiresAt` | Date | **TTL index** |
| `revokedAt` | Date \| null | |

**Indexes** — `{ tokenHash: 1 }` unique · `{ expiresAt: 1 }` TTL ·
`{ userId: 1 }`.

---

## 14. `otpTokens`

| Field | Type | Notes |
| --- | --- | --- |
| `email` | String | |
| `codeHash` | String | never store the digits |
| `purpose` | Enum | `verify-email` \| `reset-password` |
| `attempts` | Number | max 5 |
| `expiresAt` | Date | **TTL index**, 10 minutes |
| `consumedAt` | Date \| null | single use |

---

## 15. `banners` — advertising slots (Change Req 04)

| Field | Type | Notes |
| --- | --- | --- |
| `placement` | Enum | `home-middle` \| `home-bottom` \| `sticky` |
| `title`, `subtitle`, `cta` | LocalizedString | |
| `href` | String | |
| `imageId` | ObjectId → mediaAssets | |
| `theme` | String | overlay gradient |
| `order`, `active` | | |
| `startsAt`, `endsAt` | Date | scheduled campaigns |
| `impressions`, `clicks` | Number | |

**Index** — `{ placement: 1, active: 1, order: 1 }`.

## 16. `partners`

`name`, `logoId`, `href`, `order`, `active`.

---

## 17. `searchEvents` — what people look for

Feeds "most searched positions / cities" on the admin overview.

| Field | Type |
| --- | --- |
| `kind` | `job-search` \| `candidate-search` |
| `term` | String |
| `filters` | { city, sectorId, positionId, … } |
| `userId` | ObjectId \| null |
| `resultCount` | Number |

**Indexes** — `{ createdAt: -1 }` · `{ "filters.positionId": 1 }` ·
`{ "filters.city": 1 }`. TTL of 180 days: this is analytics input, not a record
to keep forever.

## 18. `profileViews`

`profileId`, `viewerUserId | null`, `createdAt`. Deduplicated per viewer per day
in the service before insert; the counter on `candidateProfiles.profileViews` is
incremented in the same operation so the dashboard reads one number.

---

## Aggregations the Dashboard needs

| Screen | Query |
| --- | --- |
| Four KPI cards | `countDocuments` per collection, cached 60 s |
| Cook Growth chart | `users.aggregate` — `$match role/date` → `$group by month` |
| Restaurant Growth chart | same over `employerProfiles` |
| Most searched positions/cities | `searchEvents.aggregate` — `$group` + `$sort` + `$limit 6` |
| Average salary | `jobs.aggregate` — `$match active` → `$avg` of the mid-point |
| Chef Manage counts | `countDocuments({ verified })` both ways |

Each is one aggregation pipeline behind a 60-second in-memory cache. The
dashboard reloads far more often than these numbers meaningfully change.

## Integrity rules Mongo will not enforce for us

MongoDB has no foreign keys. These are enforced in services and covered by tests:

1. A `positionId` must be a taxonomy of type `position` whose `parentKey` equals
   the record's `sectorId`.
2. Deleting a job soft-deletes it; its applications remain and are shown as
   "offer withdrawn" rather than disappearing from the cook's history.
3. Suspending a user cascades to `searchable: false` on their profile and hides
   their active offers, without deleting anything.
4. A `mediaAsset` rejected in moderation is detached from the profile that
   referenced it, so a rejected photo cannot keep rendering.

## Seeding

`src/seed/` ports the existing fixtures — `Frontend/src/mock/*` and
`Dashboard/src/mock/*` — into MongoDB: taxonomies, 30 cooks, 6 establishments,
30 offers, applications, feedback, banners, partners, notifications and the three
admin accounts. Both clients then run against a real API with the data they were
built against, which makes the mock→API switch a config change rather than a
re-test of every screen.
