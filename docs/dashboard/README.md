# CookconneKt — Administration Dashboard

Standalone Next.js app for the CookconneKt admin panel, built from the Figma
screens (`Admin Dashboard`, `Chef Manage`, `Restaurant Manage`, `Job
Management`, `Feedback`). The app itself lives in `../../Dashboard`; it runs
independently of the public site in `../../Frontend` and carries its own copy of
the fixtures, so the two deploy and version separately. Paths written as
`src/...` below are relative to `../../Dashboard`.

```bash
npm install
npm run dev      # http://localhost:3001
npm run build
npm run lint
```

The public site owns port 3000; this app defaults to 3001 so both can run at
once.

## Signing in

The session is mocked — any password works. Pick one of the demo accounts
listed on `/login`:

| Account | Role |
| --- | --- |
| `admin@nkhedmou.ma` | Main administrator — full control |
| `moderation@nkhedmou.ma` | Sub-admin — photo moderation only |
| `offres@nkhedmou.ma` | Sub-admin — offers and employers |

Signing in as a sub-admin makes the permission toggles on
`/settings/roles` read-only, which is the behaviour the spec asks for.

## Screens

| Route | Figma screen |
| --- | --- |
| `/` | Admin Dashboard — KPI cards, Cook/Restaurant growth charts, request queue |
| `/chefs` · `/chefs/[id]` | Chef Manage · Chef Details |
| `/restaurants` · `/restaurants/[id]` | Restaurant Manage · Restaurant Details |
| `/restaurants/requests` · `/restaurants/requests/[id]` | Full request queue · Approve / Cancel |
| `/jobs` · `/jobs/[employerId]` · `/jobs/offer/[id]` | Job Management → a restaurant's offers → Job Details |
| `/feedback` | Feedback, with replies |
| `/settings/moderation` · `/settings/activity` · `/settings/roles` | Behind the sidebar's "settings" disclosure |

## Architecture notes

**Data.** Every screen reads through `src/mock/adminApi.js`; no component
imports a fixture directly. Replacing the mock with a real backend is a
one-file change.

**Mutations are real.** Verifying a cook, blocking an establishment, approving
a request, deleting an offer and replying to feedback all persist. The fixtures
are module constants, so writes go to an overlay in `localStorage`
(`cookkonnekt.adminOverlay`) that is merged on read — the same read / PATCH /
re-read shape a real API has. Call `resetAdminOverlay()` from
`src/mock/adminApi.js` to clear every action and start the demo over.

**Charts are hand-rolled SVG** (`src/components/Charts.jsx`). Recharts or
Chart.js would add ~150 kB of client JavaScript to draw two static series that
never animate and need no tooltip engine. The area curve is Catmull-Rom, which
interpolates — the peak you see is the real September value, not a smoothed
approximation of it.

**Determinism.** No `Math.random()` or `Date.now()` at module scope anywhere in
`src/mock/`. Both would render differently on the server than on the client and
break hydration; `TODAY` in `jobs.js` is a fixed date for the same reason.

**i18n.** French (default), Moroccan Darija and English, switchable from the
header. `t()` handles interface strings; `pick()` reads the active language off
data objects that carry their own translations. Arabic flips the layout to RTL
— except the charts, which stay left-to-right because January belongs on the
left in any language.

**Photography.** The shared fixtures point `photo`, `logo` and `cover` at grey
mockup rectangles from the design hand-off that now resolve to plated food — a
dessert rendered as a cook's avatar. `src/mock/adminDashboard.js` overrides
them with portraits for people and interiors for establishments. Swap the
Unsplash ids there when the client supplies their own photography.

## Not a security boundary

`AuthGate` and `adminSession` are a demo of the sign-in flow, not access
control: the session lives in `localStorage` and anyone can write it. Real
protection belongs in middleware, checked against a server-issued cookie.
