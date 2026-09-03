# Dashboard Gap Plan

**Client review: "Improvement points" · 26 August 2026**

I read all five pages of the client's document (`Improvement points (1).pdf`) and all
40 source files in `Dashboard/src` (~5,500 lines), then checked each of their points
against the actual code. This is what is missing, and how each item gets fixed.

The headline: **the dashboard is a front-end demo.** Every screen reads from
`src/mock/adminApi.js` and every admin action writes to a `localStorage` overlay.
Nothing is emailed, nothing is enforced on a server, and nothing survives a different
browser. That is fine for phases 1–5 below, and it is the whole of F1.

The backend is designed but not built: `docs/backend/` contains an architecture, an
18-collection data model, a full API contract and 31 implementation tasks — and zero
lines of code. **Building it is a future engagement, not part of this work.** Several items
below are already accounted for in that design; those cross-references are noted so the two
stay in step when it does get built.

## Status — this engagement is complete

**Every dashboard item is built and verified.** Phases 1 to 5, plus F2, cover all of the
client's points that can be answered in this repository.

| Phase | Items | State |
| --- | --- | --- |
| 01 · Data and plumbing | A1 A2 A3 | done · 30 checks |
| 02 · The missing screens | B1 B2 B3 B4 | done · 70 checks |
| 03 · Actions on records | C1 C2 C3 C4 | done · 49 checks |
| 04 · Notifications and feedback | D1 D2 | done · 30 checks |
| 05 · Roles that restrict | E1 E2 E3 E4 | done · 35 checks |
| 06 · Ready for the backend | F2 | done · 7 checks |

221 acceptance checks run against the real modules, a clean lint and production build, and
a runtime smoke test of all 21 routes. Seven of the checks exist because they caught a real
bug first; each is noted where it belongs.

**F1 — building the backend — is a separate, future engagement and is not part of this
scope.** It is written up below because the client's §20 asks for it and they need to know
where it is answered, not because it is outstanding work here. The design already exists in
`docs/backend/`: an architecture, an 18-collection data model, a full API contract and 31
implementation tasks, with no code written yet. Nothing in this dashboard waits on it —
F2 is the work that makes the eventual integration a swap rather than a rewrite.

---

## Phase 1 — Data and plumbing — **done, 27 Aug 2026**

Three foundations. Almost every later item writes through them, so they go first —
build them after phase 2 and half of phase 3 has to be rewritten.

All three shipped. One design decision changed during implementation: **there is no
separate `approved` status.** Approving an offer is what publishes it, so it becomes
`active` and carries `approvedBy` / `approvedAt`. A sixth status would have left every
"is this offer live?" check in the codebase ambiguous, and `ACTIVE_JOBS` — the public
listing — already means `active`. The five states are exactly the client's five filters.

Verified with a throwaway Node harness against the real modules: 30 checks covering the
status spread, the approval stamps, the extension maths, log ordering and merge, reason
translation, and the notification outbox. A real ordering bug turned up and was fixed —
timestamps are minute-granular, so three actions in the same minute tied and sorted
oldest-first; entries now carry a sequence number that breaks the tie.

### A1 · An offer needs more than three states — *done*

**Today.** `src/mock/jobs.js` generates only `active`, `pending` and `expired`. The
client asked to filter by five states and to reject offers with a reason, so `closed`
and `rejected` have nowhere to live — which is why `offerStats().closed` is hardcoded
to `0`.

**Done.**

1. Status set is `active | pending | expired | closed | rejected`, exported as
   `OFFER_STATUSES` for the filter bar C3 builds. No `approved` state — see the note
   above.
2. Added `approvedBy`, `approvedAt`, `rejectionReason`, `extendedUntil`, `republishedAt`.
   The first three mirror the backend data model (`docs/backend/02-DATABASE.md`) so the
   two stay in step.
3. The 30 fixture offers now spread 18 active / 3 pending / 3 expired / 3 closed /
   3 rejected, so every filter has rows behind it. Rejected offers name a reason from the
   new `OFFER_REJECTION_REASONS` list in `jobOptions.js`.
4. `daysLeft` now reads through `offerExpiry(job)`, which honours `extendedUntil` — so
   "extend exceptionally" in C3 is a one-field write rather than a rewrite of the
   deadline.
5. `offerStats().closed` is derived instead of hardcoded to `0`, and `rejected` was
   added alongside it.
6. The status badge moved into one shared `OfferStatusBadge` in `ui.jsx`. Both screens
   had their own copy that fell through to green "Active" for anything unrecognised —
   which the two new states would have hit.

### A2 · Admin actions must write to the activity log — *done*

> The platform must maintain an activity/audit log for important administrative actions
> and for access to candidate contact information. — §20

**Today.** `/settings/activity` renders `ACTIVITY_LOG`, ten hand-written rows in
`src/mock/admin.js`. Nothing the admin does is ever appended. Verify a cook, approve a
restaurant, delete an offer: the log looks identical afterwards.

**Done.**

1. `logAction(action, { target, reason })` lives in `adminApi.js` and writes to the same
   overlay as every other mutation. `action` is a key into the new `ACTION_DETAILS`
   catalogue in `mock/admin.js`, which supplies the wording in all three languages — the
   same action logged from two screens now reads identically.
2. Wired into all six existing mutations: `setChefVerified`, `decideRequest`,
   `setRestaurantBlocked`, `deleteJobOffer`, `decidePhoto`, `replyToFeedback`.
3. `fetchActivity` merges recorded entries on top of the fixture, newest first, and the
   three type filters work across the merged list.
4. The signed-in admin is stamped as the actor. `adminApi` reads the session through a
   new `ADMIN_SESSION_KEY` in `browserStore.js` rather than importing React context —
   the same pattern the file already used for `SESSION_KEY`.
5. When an action carries a reason, it is appended in parentheses in each language:
   "Photo refusée (Contenu inapproprié)", matching how the seeded rows already read.

Backend counterpart: task 5.1, `activityLog` module.

### A3 · One place that sends notifications — *done*

**Today.** `src/mock/notifications.js` holds notification copy in all three languages,
and the dashboard never imports it. Approving a profile or replying to feedback notifies
nobody. The feedback screen even prints "the user will be notified" under the reply
box — that line is currently untrue.

**Done.**

1. `notifyUser(templateId, { to, params })` in `adminApi.js` queues a record carrying the
   rendered text, the recipient, and both channel states — `inAppStatus: "delivered"`,
   `emailStatus: "queued"`. Queued is the honest word: there is no mail provider yet.
2. Seven templates in FR / Darija / EN in the new `mock/adminNotifications.js` — profile
   verified, establishment approved, establishment rejected, offer approved, offer
   rejected, photo rejected, feedback replied.
3. `fetchNotificationOutbox()` reads them back. The outbox *screen* is D1.
4. Wired into the three decision points that need no new UI input: verifying a profile,
   approving an establishment, and replying to feedback — that last one finally makes
   true the "the user will be notified" line the reply box has always printed. The
   reason-bearing ones (offer approved/rejected, photo rejected, establishment rejected)
   fire as soon as C3 and C4 add the dialog that collects the reason; `decideRequest` and
   `decidePhoto` already take an optional `reason` and notify when given one.
5. A translated parameter resolves per language, so an Arabic body does not end in a
   French rejection reason.

Backend counterpart: task 4.3, which already specifies one in-app record **and** one
email per trigger.

---

## Phase 2 — The screens the client could not find — **done, 27 Aug 2026**

Four of the client's complaints are literally "I can't find this section". They are
right — the sections do not exist. These are the most visible wins and should ship first
after phase 1.

All four shipped, as four new routes with sidebar entries: `/settings/homepage`,
`/jobs/pending`, `/statistics` and `/chefs/database`. 51 further acceptance checks pass.

Two things worth flagging to the client. First, **the homepage text is saved in the
dashboard, not yet on the public site** — the two apps have separate storage until they
share an API, and the screen says so rather than implying the live site changed. Second,
**the export is CSV, not `.xlsx`** — Excel opens it directly and a UTF-8 byte-order mark
keeps Arabic and accented French names intact, which is what the client actually needs.
A real spreadsheet writer is only worth a dependency if they ask for formatting or
multiple sheets.

### B1 · Homepage editing, with a background image — *done*

> The administrator must be able to modify the background of the homepage by uploading an
> image, or keep the current blank background. I cannot find the access/section that
> allows me to modify the homepage. — §1–2

**Today.** Nothing. The sidebar in `src/components/AdminShell.jsx` has five entries plus
a Settings group; none of them touch site content. There is no CMS surface of any kind.
The backend's `banners` collection is advertising slots, not the homepage hero — this is
a genuine gap on both sides.

**Done.**

1. New route `/settings/homepage`, first entry under Settings, and the bare `/settings`
   path now lands there.
2. Two modes — *Blank background* and *Background image* — with a live hero preview at
   desktop and mobile widths, in whichever of the three languages is being edited.
3. Upload validated before it is stored: JPG/PNG/WebP, 2 MB, at least 1600×600. Each
   error says what is wrong and what to do — "Image too small: 900×400 px against
   1600×600 minimum. It would look stretched and blurry across the top of the page."
4. Headline, sub-headline and CTA label, each editable per language, seeded with the
   real copy from the public site rather than placeholder text.
5. Persisted through `fetchSiteSettings` / `saveSiteSettings` and logged (**A2**).
6. Site settings live in their own storage key, not the admin overlay. The background is
   a data URL and is the one value large enough to hit the storage quota; if it fails to
   fit, the failure must not take every approval and rejection with it. `setValue` now
   returns false instead of throwing, and the screen says the image is too large.

### B2 · The queue of offers waiting for approval — *done*

> I cannot find the new restaurant job offers that are waiting for approval, nor can I
> view their full details before they are published. All employer job offers must be
> reviewed and approved by the administration before they are published. — §3 and §8

**Today.** The data knows about pending offers — `offerStats().pendingApproval` counts
them and the detail page renders an amber "pending" badge — but no screen lists them.
`/jobs` is grouped by restaurant, and the only action on an offer anywhere in the app is
*Delete*. **An admin cannot approve an offer today.**

**Done.**

1. New route `/jobs/pending`: every pending offer across every employer, oldest first,
   with employer, city, salary and a waiting counter that turns amber past a week.
2. `/jobs/offer/[id]` is the full pre-publication review, and now carries the decision
   too — an admin who has just read the offer does not have to navigate back to act.
3. *Approve* and *Reject* on both; rejection goes through the new shared `ReasonDialog`,
   which requires a written note when "Other reason" is chosen so the escape hatch
   cannot send an empty explanation. A rejected offer shows its reason on its own record.
4. Fifth KPI card on the dashboard, *Offers to approve*, plus a sidebar entry.
5. Approval publishes: status becomes `active`, the 60-day window starts that day, the
   row leaves the queue, the dashboard counters move, and the employer is notified.

Two details worth recording. Offer dates run on the fixture's frozen "today" rather than
the wall clock, because `daysLeft` and every "expiring soon" statistic measure against it
— a real-world date would report 70 days of runway on a 60-day window. The audit log is
the opposite case and uses the real clock, since it records when the admin actually
clicked. And the sidebar now picks the most specific matching entry, or `/jobs` and
`/jobs/pending` would both highlight and show the admin in two places at once.

Backend counterpart: task 5.4, whose acceptance criterion already says approval sets
`postedAt`/`expiresAt` and notifies the employer.

### B3 · The statistics page — *done*

> New candidates per day. New candidates by job position. New employers per day and per
> month. Establishments by type. Most searched job positions. Most searched cities.
> Average salaries offered. — §5 and §16

**Today.** This is the cheapest item on the list. `src/mock/admin.js` already exports
`candidateStats()`, `employerStats()`, `offerStats()`, `MOST_SEARCHED_TITLES`,
`MOST_SEARCHED_CITIES` and `averageSalary()` — fully written, and imported by nothing.
`adminApi.js` never exposes them, so no screen can show them. The dashboard shows four
totals and two growth charts, and that is all.

**Done.**

1. New route `/statistics` with its own sidebar entry.
2. `fetchStatistics({ days })` exposes the six functions that had no route out of the
   fixture layer, and recounts the offer figures over the admin's own decisions so the
   statistics and the dashboard can never disagree.
3. The three missing series are built: candidates per day, employers per day, employers
   per month — all off `registeredAt`, which meant adding that field to the six employers
   in `src/mock/employers.js`. Buckets are generated from the date range rather than from
   the rows, so a day nobody signed up on renders as a zero instead of vanishing and
   making the curve lie.
4. Candidates by position and establishments by type, both ranked busiest first.
5. Rendered with the existing `AreaChart` / `BarChart` and the previously unused
   `BarList`. Range selector for 7 / 30 / 90 days, and a CSV download per panel rather
   than one combined file — these numbers go into different reports.

Backend counterpart: task 5.6, `analytics` module.

### B4 · The CV database, with Excel export — *done*

> I do not have a candidate database/CV database containing the complete list of
> candidates, with the ability to export the data to Excel. — §6

**Today.** `/chefs` shows five columns — reference, name, rating, restaurants worked
with, and a view link — split across two tabs and paginated. It is a moderation queue,
not a database. There is no export anywhere in the codebase.

**Done.**

1. New route `/chefs/database`: every candidate, every field, with a link to it from
   `/chefs` and its own sidebar entry.
2. Seven filters — sector, position, city, experience, availability, verification,
   completion threshold — plus search. Changing sector clears the position, or the table
   silently returns nothing and the filters look broken.
3. Export of the current filtered view as CSV with a UTF-8 BOM, in `src/lib/csv.js`.
   Every value is quoted, so a job title with a comma, a note with a line break and a
   name with a quotation mark all survive.
4. Contact columns are opt-in *and* permission-gated: without `export-cv` the checkbox is
   disabled and the screen says why. The fields are absent from the response rather than
   blanked — a masked column that still ships the value to the browser is not masked.
   Exporting with contacts is logged as **contact access**, not as a routine admin
   action, with the row count and the filters used.

Backend counterpart: task 5.7, which specifies the same UTF-8 BOM CSV approach.

---

## Phase 3 — Actions on records — **done, 27 Aug 2026**

The client listed roughly thirty specific actions across candidates, employers and
offers. The dashboard implemented five of them: verify a cook, approve or reject a
restaurant sign-up, block a restaurant, delete an offer, approve or remove a photo.

All four items shipped; 47 acceptance checks pass. Two decisions worth recording.
**Deletion is soft** — the client asked for a restore action in the same breath, and a
record that is really gone cannot be restored, cannot be audited, and cannot answer
"which employers asked for this person's number". **Edits are allowlisted** on both
candidates and offers: a form that can write any field is one typo away from rewriting a
record's id or its verification state, and the test proves an attempt to do so is
ignored.

### C1 · Candidate profile: twelve actions — *done*

| Action | State | Where it goes |
| --- | --- | --- |
| View the complete profile | Partial — no applications, no history, no contact-request list | `/chefs/[id]` |
| Verify the profile | Built | `SegmentedToggle` |
| Edit the profile / correct information | Missing | edit drawer |
| Add a skill | Missing | specialties block |
| Deactivate the profile | Missing | action bar |
| Delete the profile | Missing | action bar, soft delete |
| Restore the profile | Missing | "Deleted" tab on `/chefs` |
| View the profile history | Missing | History tab |
| View applications | Missing — `APPLICATIONS` exists, unused here | Applications tab |
| Which employers requested contact details | Missing — log exists but is not filtered per candidate | Access tab |
| Approve / remove published photos | Global only, not on the profile | Photos tab |
| Block an abusive account | Missing for candidates (employers can be blocked) | action bar |

**Fix.**

1. Restructure `/chefs/[id]` into a header with a full action bar plus five tabs:
   Profile, Applications, Photos, Contact access, History.
2. Edit is a drawer over the same fields the candidate fills in, so admin corrections and
   candidate edits stay consistent.
3. Deactivate, delete and restore are states in the overlay, not row removal — a deleted
   profile stays restorable and stays in the log.
4. History is generated, not stored: read it back out of the audit entries from **A2**.
5. Add "Deleted" and "Deactivated" tabs alongside Verified / Unverified on `/chefs`.

### C2 · Employer activity metrics — *done*

> See how many candidate contact details each employer has requested and whether the
> employer is actively publishing job offers. — §15

**Today.** `employerActivity()` in `src/mock/admin.js` already computes offers published,
offers active, applications received, profiles viewed, contact requests and last
activity — and, like the statistics functions, is imported by nothing.
`/restaurants/[id]` shows only two of those six numbers.

**Fix.**

1. Expose `employerActivity()` through `fetchRestaurant` and render all six as a stat
   grid on the detail page — `StatGrid` and `Stat` already exist in `ui.jsx`.
2. Add the seventh number the client asked for and the fixtures do not have: declared
   hires. Add a `hired` outcome to `src/mock/applications.js` and derive the count.
3. Surface "contact requests" and "offers published" as columns on `/restaurants` too, so
   the harvesting-without-posting pattern is visible from the list.

### C3 · Offer filters, and seven actions per offer — *done*

> Filter offers by: Active, Pending approval, Expired, Closed, Rejected. […] Edit,
> Approve, Reject, Deactivate, Extend exceptionally, Republish, Delete. — §15

**Today.** `/jobs/[employerId]` lists the employer's offers with two actions: view and
delete. No filter, no status column beyond a badge, and no way to approve, extend or
republish anything — which is also the client's separate complaint in §7 about having no
management actions for published offers.

**Fix.**

1. Add a filter bar across the five states from **A1**, with live counts, on both
   `/jobs/[employerId]` and the new `/jobs/pending`.
2. Add the seven row actions behind the existing `RowActions` component in `ui.jsx`
   (already written, currently unused). *Edit* opens a form on the offer's own page,
   editing title and description per language — correcting only the French would leave a
   cook reading in Darija looking at the old wording.
3. *Extend exceptionally* opens a date picker defaulting to +30 days and records who
   extended it and why. *Republish* resets the publication date and pushes the offer back
   to the top of the board.
4. *Reject* takes a reason from a short predefined list plus free text, and that reason
   goes to the employer (**D1**).
5. Approved offers show a green badge and are removed from the pending queue, exactly as
   §17 asks.

### C4 · Photo rejection needs a reason — *done*

> Currently, there are only two options: "Accept" or "Reject". The administrator must be
> able to select or enter a rejection reason so that the candidate understands why the
> photo was rejected and can upload a compliant photo. — §4

**Today.** Exactly what the client describes. `/settings/moderation` calls
`decidePhoto(id, "approved" | "removed")`. The decision is stored, the card disappears,
and the candidate is never told anything. The backend design does not carry a photo
rejection reason either, so this needs adding on both sides.

**Fix.**

1. Replace the bare Remove button with a rejection dialog carrying the client's own list:
   poor image quality, face not clearly visible, multiple people in the photo,
   inappropriate content, does not meet platform requirements, other (free text).
2. Widen `decidePhoto` to `(id, decision, reason)` and store the reason on the decision.
3. Notify the candidate immediately, in-app and by email, with the reason and what to do
   about it (**D1**) — §17 asks for this specifically, at upload time.
4. Show the reason in the audit log and on the candidate's Photos tab, so a second admin
   sees the history rather than re-litigating it.
5. Add "Block this account" to a photo card, for the repeat-abuse case in §16 —
   candidates currently cannot be blocked at all.

---

## Phase 4 — Notifications and feedback — **done, 27 Aug 2026**

Everything here depends on **A3**. In-app notifications land in this build; email needs
**F1**. 30 acceptance checks pass, including one that walks all eight decision points and
asserts no template placeholder survives into any of the three languages.

### D1 · Every approval and rejection tells the user — *done*

> After an administrator approves a candidate profile or job offer, the user/employer must
> receive a notification on the platform and an email confirming the approval. — §17

**Fix.**

1. Fire `notifyUser` from all six decision points: profile verified, restaurant sign-up
   approved or rejected, offer approved or rejected, photo rejected, feedback replied,
   account blocked.
2. Add the outbox view at `/settings/notifications` — what was sent, to whom, which
   channel, delivery state.
3. Approved records read as approved everywhere: green badge, gone from the pending queue.
4. Notification copy in all three locales, following the shape already established in
   `src/mock/notifications.js`.

### D2 · Feedback is a conversation — *done*

> The conversation/history between the user and the administrator should remain accessible
> from the admin dashboard. — §19

**Today.** `/feedback` lists messages and lets the admin reply once — `reply` is a single
string, and once it is set the reply box is replaced by the reply text with no way to
continue or correct it. The note under the box promises an email that is not sent.

**Fix.**

1. Change `reply: string` to `messages: []`, each with author, body and timestamp, and
   render the thread.
2. Notify the user on every admin message (**D1**).
3. Add filters — unanswered, answered, by role, by rating — and search; the list is a wall
   of cards today with only a counter in the subtitle.
4. Keep threads after they are closed; the client asked for the history to stay reachable.

---

## Phase 5 — Roles that actually restrict — **done, 27 Aug 2026**

`/settings/roles` looked finished and was entirely cosmetic. This phase is where the
client's §18 gets real, and it was the one to be most careful about — a permission model
that looks enforced but is not is worse than none.

35 acceptance checks pass, including the client's own two examples from §18: an
administrator who manages candidates but cannot see their contact details, and one who
reads statistics and nothing else. Both are now seeded accounts, so the model can be
demonstrated rather than described.

**The limit of this phase, stated plainly.** It controls what a signed-in administrator
can reach. It cannot control who gets to sign in — `login()` still accepts any email and
falls back to the super admin. Every check here is a convenience until F1 puts the same
rules on a server.

### E1 · Create and manage internal admin accounts — *done*

> The platform must allow the Super Admin to create internal administrator accounts with
> limited permissions. — §18

**Today.** Three admins are hardcoded in `ADMINS`. There is no way to add a fourth, edit
one, or disable one.

**Fix.**

1. Add *Create administrator* to `/settings/roles`, visible to the super admin only:
   name, email, role, permission set.
2. Edit and disable an existing sub-admin; the super admin's own rights stay
   non-revocable, which the page already reasons about correctly.
3. Log every creation, permission change and disable (**A2**).

Backend counterpart: task 5.2.

### E2 · Permission toggles now save — *done*

**Today.** `toggle()` in `src/app/settings/roles/page.jsx` calls `setGrants` and shows a
"granted" toast. That is the whole function — no API call. Reload the page and every
change is gone, after the UI confirmed it. **This is the most misleading thing in the
dashboard right now.**

**Fix.** Add `setAdminPermissions(adminId, permissions)` to `adminApi.js`, persist to the
overlay like every other mutation, and only show the confirmation once the write resolves.

### E3 · Least privilege, enforced in the UI — *done*

> Each administrator should only have access to the functions and data required for their
> role. — §18

**Today.** Permissions are decoration. A sub-admin whose only right is "moderate photos"
still sees every sidebar entry, can open every route, and can read every candidate's phone
number. The single check in the codebase — `isSuperAdmin` — disables the toggles on the
roles page and nothing else.

**Fix.**

1. Add a `can(permission)` helper to `adminSession` and derive the sidebar from it, so an
   admin sees only their own sections.
2. Guard each route: an admin who types a URL they lack rights for gets a clear "you don't
   have access to this section", not the page.
3. Add the permissions the client's examples need but the list is missing: `view-contact`,
   `manage-homepage`, `view-statistics`, `manage-feedback`. Their §18 example — an admin
   who manages candidates but cannot see contact details — is not expressible today.
4. Mask contact fields in the data layer when `view-contact` is absent, not with CSS.
5. Every one of these checks is a convenience, not a security control, until **F1** lands.
   Say so to the client.

### E4 · Sensitive access is logged as it happens — *done*

**Fix.**

1. Every reveal of a candidate's phone or email — by an admin or an employer — writes a
   `contact-access` entry naming who, which candidate, when.
2. Add a dedicated filtered view so the client can answer "who has been looking at
   candidate contacts this week" without scrolling the whole log.
3. Add the same trail to CV exports (**B4**) — a spreadsheet of every candidate is the
   largest contact disclosure the platform can make.

---

## Phase 6 — Ready for the backend

F2 is done and belongs to this engagement: it is the front-end work that makes the eventual
integration a swap rather than a rewrite.

F1 is the backend itself — **a separate, future engagement, out of scope here.** It is
described below only so the client can see where §20 gets answered. Being direct about that
boundary matters more than the description: the alternative is shipping screens that imply
protection that does not exist.

### F1 · The backend has to actually get built — *future engagement, not in this scope*

**Why.** The dashboard has no server. `src/lib/adminSession.jsx` says so in its own header
comment: *"nothing here is a security boundary"*. Its `login()` accepts any email and falls
back to signing you in as the super admin — there is no password check anywhere. Contact
details ship to the browser with the profile. Every "decision" lives in one browser's
`localStorage`.

The design work is done — `docs/backend/` covers all of the below across 31 tasks — but
none of it is written yet.

**What has to exist server-side.**

1. Real authentication, and authorization checked on every admin endpoint — the phase 5 UI
   checks are a mirror of these, never a substitute.
2. Candidate contact fields excluded from API responses by default, behind a separate
   endpoint that logs each access and enforces the platform's disclosure rules.
3. Upload pipeline: verify the real file type by content rather than extension, cap size,
   re-encode images and strip metadata, scan for malicious files, store privately and serve
   through short-lived signed URLs (backend task 2.2).
4. Rate limiting, lockout after repeated failed logins, and a bot check on login and on
   contact reveal (backend task 6.4).
5. An append-only audit table — actor, action, subject, timestamp — with a defined
   retention period; the phase 1 log becomes its front end (backend task 5.1).
6. Transactional email for every notification in phase 4 (backend task 4.2).
7. Parameterised database access, secrets out of the client bundle, security headers,
   dependency scanning.

**Sequencing note for the client.** §20 says the privacy workflow must be defined *before*
employers get access to candidate contact details. That is a decision the client owns, and
it should be settled in writing before the contact-reveal feature ships.

### F2 · Keep the swap to one file — *done*

Backend task 7.2 accepts the integration only if every admin screen works against the API
with **no component file changes**. That promise decays silently, one convenient import at
a time, so it is now audited and enforced rather than asserted.

**Two real violations were found and fixed.** The sign-in screen imported `ADMINS` to list
its demo accounts, and `adminSession.jsx` imported `ADMINS` and `CURRENT_ADMIN` to resolve
a login. Both would have needed rewriting on the first day of the integration. Sign-in now
goes through `authenticate(email)` and `fetchDemoAccounts()` in `adminApi.js`; pointing
them at `POST /auth/login` is a one-function change and nothing on the screen moves.

**The boundary is now a lint rule.** `eslint.config.mjs` restricts the record fixtures —
candidates, employers, applications, notifications, and the record exports of `jobs`,
`admin` and `adminDashboard` — from `src/app`, `src/components` and `src/lib`, each with a
message naming the `adminApi` function to use instead. Taxonomy modules are deliberately
exempt: `cities`, `jobOptions` and `sectors` are enums a screen needs to render a stored id
as a label, they ship in the bundle either way, and the API contract treats them as fixed
vocabulary. The rule was verified by planting two violations and confirming it rejects
them, because a guard that never fires proves nothing.

**Runtime smoke test.** All 21 routes were fetched from a production build: every one
returns 200 and renders. Worth doing — the Node harness exercises the data layer, not the
React tree, and it would not have caught a page that throws on render.

---

## Found while reading the code

Not on the client's list, but they change what the client sees. The first two are the kind
that make a demo look dishonest.

| Issue | Where | Effect |
| --- | --- | --- |
| ~~Permission toggles confirm a save that never happens~~ | `settings/roles/page.jsx` | **Fixed in E2** — grants persist and are logged |
| Any email signs in, and unrecognised ones become super admin | `lib/adminSession.jsx:39` | **Still open, and unfixable here.** Phase 5 restricts what a signed-in admin reaches; it cannot decide who gets to sign in. That needs real authentication — F1 |
| ~~Six statistics functions imported nowhere~~ | `mock/admin.js` | **Fixed in B3 and C2** — all of them, `employerActivity()` included, are now reachable |
| ~~`RowActions` and `BarList` written but never used~~ | `components/ui.jsx` | **Fixed** — `BarList` by B3, `RowActions` by C3 |
| ~~`offerStats().closed` hardcoded to 0~~ | `mock/admin.js` | **Fixed in A1** — derived, and `rejected` added alongside it |
| `employerStats().blocked` hardcoded to 0 | `mock/admin.js:41` | Reads the fixtures only, so blocks made in the dashboard never count; needs the overlay passed in, with C2 |
| ~~The notification bell opens the activity log~~ | `components/AdminShell.jsx` | **Fixed in D1** — it opens the notification outbox |

---

## Order of work

Phase 1 is invisible to the client but unblocks everything. Phase 2 is what they will
notice first, so it follows immediately.

```
01 Plumbing → 02 Missing screens → 03 Actions → 04 Notifications → 05 Roles → 06 Backend
```

| Phase | Items | Rough effort | What the client sees at the end |
| --- | --- | --- | --- |
| ~~01 · Data and plumbing~~ | A1 A2 A3 | **done** | A log that finally records their own actions |
| ~~02 · Missing screens~~ | B1 B2 B3 B4 | **done** | All four “I cannot find…” complaints answered |
| ~~03 · Actions on records~~ | C1 C2 C3 C4 | **done** | Every action from their §14, §15 and §16 lists works |
| ~~04 · Notifications~~ | D1 D2 | **done** | Users are told about decisions in-app; email waits on phase 6 |
| ~~05 · Roles~~ | E1 E2 E3 E4 | **done** | Sub-admins see only their own sections; contact details are gated |
| ~~06 · Ready for the backend~~ | F2 | **done** | Nothing visible; the integration becomes a swap instead of a rewrite |
| 06 · The backend | F1 | *Future engagement* | Real accounts, real email, real enforcement, real audit trail |

**The one thing to settle with the client.** Phases 1–5 are front-end work on a mock data
layer. They look and behave correctly in a demo, and none of them protects anything. If the
client reads §20 as satisfied by this dashboard, that expectation needs correcting now.
Everything they asked for is visible and usable; what is not there is the server that makes
any of it enforceable, and that is the next engagement, not this one.

---

*Sources: `Improvement points (1).pdf`, five pages, all items covered. Code reviewed:
`Dashboard/src`, 40 files, ~5,500 lines. Backend design cross-referenced from
`docs/backend/`.*
