// Admin dashboard fixtures — the data the Figma admin screens show and that the
// spec-driven statistics in mock/admin.js do not cover.
//
// Everything here is either a hand-authored series (the two growth charts) or
// derived from the existing fixtures (chef ratings, restaurant rollups), so the
// admin area can never contradict what the public site shows.
//
// Deterministic by construction: no Math.random, no Date.now. Both would
// produce a different value on the server than on the client and blow up
// hydration, the same reason jobs.js and candidates.js are seeded.

import { CANDIDATES } from "./candidates";
import { EMPLOYERS } from "./employers";
import { JOBS, isExpired } from "./jobs";
import { APPLICATIONS } from "./applications";
import { getCity } from "./cities";

/* ------------------------------------------------------------- calendar */

export const MONTHS = [
  { id: "jan", fr: "Janv", ar: "يناير", en: "Jan" },
  { id: "feb", fr: "Févr", ar: "فبراير", en: "Feb" },
  { id: "mar", fr: "Mars", ar: "مارس", en: "Mar" },
  { id: "apr", fr: "Avr", ar: "أبريل", en: "Apr" },
  { id: "may", fr: "Mai", ar: "ماي", en: "May" },
  { id: "jun", fr: "Juin", ar: "يونيو", en: "Jun" },
  { id: "jul", fr: "Juil", ar: "يوليوز", en: "Jul" },
  { id: "aug", fr: "Août", ar: "غشت", en: "Aug" },
  { id: "sep", fr: "Sept", ar: "شتنبر", en: "Sep" },
  { id: "oct", fr: "Oct", ar: "أكتوبر", en: "Oct" },
  { id: "nov", fr: "Nov", ar: "نونبر", en: "Nov" },
  { id: "dec", fr: "Déc", ar: "دجنبر", en: "Dec" },
];

/* --------------------------------------------------------- growth charts */
// The two charts on the Figma dashboard. Values are monthly sign-ups, not
// cumulative totals, which is why they dip — Ramadan and the late-summer
// slowdown are visible in the cook curve, the hiring push before the summer
// season in the restaurant bars.

export const COOK_GROWTH = {
  year: 2025,
  points: [26, 77, 55, 61, 38, 65, 61, 37, 94, 18, 13, 39],
};

export const RESTAURANT_GROWTH = {
  year: 2025,
  points: [10.97, 86.89, 56.52, 62.21, 63.35, 50.53, 68, 71.14, 13.28, 46.79, 84.75, 54.03],
};

/* ------------------------------------------------- headline KPI counters */
// The four cards across the top. Derived, so they track the fixtures.

export const dashboardTotals = () => ({
  cooks: CANDIDATES.length,
  restaurants: EMPLOYERS.length,
  verifiedProfiles:
    CANDIDATES.filter((c) => c.verified).length + EMPLOYERS.filter((e) => e.verified).length,
  availableJobs: JOBS.filter((j) => j.status === "active" && !isExpired(j)).length,
});

/* --------------------------------------------------------- photography */
// Unsplash serves these through its own CDN, which handles resizing and format
// negotiation from the query string. Free for commercial use, no attribution
// required; swap the ids here when the client supplies their own photography.

const unsplash = (id, w = 600, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** Restaurant interiors and storefronts, used as establishment logos/covers. */
export const VENUE_PHOTOS = [
  unsplash("photo-1517248135467-4c7edcad34c4", 500),
  unsplash("photo-1552566626-52f8b828add9", 500),
  unsplash("photo-1414235077428-338989a2e8c0", 500),
  unsplash("photo-1555396273-367ea4eb4db5", 500),
  unsplash("photo-1590846406792-0adc7f938f1d", 500),
  unsplash("photo-1559339352-11d035aa65de", 500),
];

/** Portraits of cooks and kitchen staff, used as profile avatars. */
export const PORTRAITS = [
  unsplash("photo-1541614101331-1a5a3a194e92", 400),
  unsplash("photo-1577219491135-ce391730fb2c", 400),
  unsplash("photo-1607631568010-a87245c0daf8", 400),
  unsplash("photo-1595475207225-428b62bda831", 400),
  unsplash("photo-1581299894007-aaa50297cf16", 400),
  unsplash("photo-1622021142947-da7dedc7c39a", 400),
  unsplash("photo-1560250097-0b93528c311a", 400),
  unsplash("photo-1573496359142-b8d87734a5a2", 400),
];

/* ------------------------------------------------------ chef enrichment */
// The Chef Manage table shows a rating and a "total restaurants worked with"
// count that the candidate fixture has no field for. Both are derived from the
// candidate's own data so they stay stable across reloads and across locales.

export const chefRows = () =>
  CANDIDATES.map((c, i) => ({
    ...c,
    // The shared candidate fixture points `photo` at the grey mockup
    // rectangles from the design hand-off, which now resolve to plated-food
    // images — a dessert rendered as a cook's avatar on Chef Details. These are
    // portraits of kitchen staff instead.
    photo: PORTRAITS[i % PORTRAITS.length],
    ref: `#${12300 + i + 1}`,
    rating: Number((3.6 + ((i * 7) % 15) / 10).toFixed(1)),
    // How many establishments this cook has worked with — their own history
    // plus the employers who have their application on file.
    totalRestaurants:
      c.history.length + APPLICATIONS.filter((a) => a.candidateId === c.id).length,
  }));

/* ------------------------------------------------ restaurant enrichment */
// Restaurant Manage: total job posts, how many are still open, and the
// establishment's public site (the "available job post" link in the design).

export const restaurantRows = () =>
  EMPLOYERS.map((e, i) => {
    const jobs = JOBS.filter((j) => j.employerId === e.id);
    const website = e.socials?.website || `https://${e.email.split("@")[1]}`;
    return {
      ...e,
      // Same fixture problem as the chef avatars: the shipped logo/cover URLs
      // resolve to plated food, so a restaurant's record showed a dessert
      // where the design shows the dining room.
      logo: VENUE_PHOTOS[i % VENUE_PHOTOS.length],
      cover: VENUE_PHOTOS[(i + 3) % VENUE_PHOTOS.length],
      ref: `#${12300 + i + 1}`,
      address: e.address || `${getCity(e.city)?.fr || e.city}, Maroc`,
      totalJobPosts: jobs.length,
      availableJobPosts: jobs.filter((j) => j.status === "active" && !isExpired(j)).length,
      website,
      // Pre-computed so the table never has to run `new URL()` in render — a
      // malformed value there would throw and take the whole page down.
      websiteHost: website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      blocked: false,
    };
  });

/* ------------------------------------- job management (grouped by employer) */
// The Figma "Job Management" table is one row per restaurant — running jobs and
// total applications — and drills into that restaurant's offers.

export const jobManagementRows = () =>
  EMPLOYERS.map((e, i) => {
    const jobs = JOBS.filter((j) => j.employerId === e.id);
    return {
      id: e.id,
      ref: `#${12300 + i + 1}`,
      name: e.name,
      logo: VENUE_PHOTOS[i % VENUE_PHOTOS.length],
      city: e.city,
      runningJobs: jobs.filter((j) => j.status === "active" && !isExpired(j)).length,
      totalApplied: APPLICATIONS.filter((a) => a.employerId === e.id).length,
    };
  });

/** The offers belonging to one restaurant, for the drill-down table. */
export const jobsForEmployer = (employerId) =>
  JOBS.filter((j) => j.employerId === employerId).map((j, i) => ({
    ...j,
    ref: `#${12300 + i + 1}`,
    applications: APPLICATIONS.filter((a) => a.jobId === j.id).length,
  }));

/* ------------------------------------------------- restaurant join requests */
// Establishments that have signed up and are waiting for the admin to approve
// their account — the "Restaurant request" table on the dashboard, and the
// Approve / Cancel screen behind "Details".
//
// Unverified employers are the real queue; the list is padded with pending
// sign-ups that have no offers yet, because a brand-new establishment is
// exactly the case an admin reviews most often.

const PENDING_SIGNUPS = [
  {
    id: "req-1",
    name: "Dar Tajine",
    type: "restaurant",
    city: "fes",
    email: "contact@dartajine.ma",
    phone: "+212 5 35 62 14 08",
    logo: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    about: "Restaurant traditionnel de 80 couverts dans la médina de Fès, cuisine marocaine du terroir.",
    requestedAt: "2026-08-17",
  },
  {
    id: "req-2",
    name: "Blue Wave Beach Club",
    type: "restaurant",
    city: "agadir",
    email: "rh@bluewave.ma",
    phone: "+212 6 28 55 41 90",
    logo: "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    about: "Beach club et restaurant de bord de mer, 200 couverts, saison d'avril à octobre.",
    requestedAt: "2026-08-17",
  },
  {
    id: "req-3",
    name: "Pâtisserie Zohra",
    type: "bakery",
    city: "casablanca",
    email: "contact@zohra.ma",
    phone: "+212 6 61 07 33 12",
    logo: "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
    about: "Pâtisserie artisanale marocaine et française, laboratoire à Sidi Maârouf.",
    requestedAt: "2026-08-16",
  },
  {
    id: "req-4",
    name: "Hôtel Ryad Mogador",
    type: "hotel",
    city: "essaouira",
    email: "recrutement@ryadmogador.ma",
    phone: "+212 5 24 78 55 20",
    logo: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
    about: "Hôtel 4 étoiles de 120 chambres face à la plage, deux restaurants et un spa.",
    requestedAt: "2026-08-16",
  },
  {
    id: "req-5",
    name: "Sushi Yama",
    type: "restaurant",
    city: "rabat",
    email: "jobs@sushiyama.ma",
    phone: "+212 6 44 19 82 37",
    logo: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    about: "Comptoir à sushi et cuisine japonaise, 45 couverts, quartier Agdal.",
    requestedAt: "2026-08-15",
  },
  {
    id: "req-6",
    name: "Café des Oudayas",
    type: "cafe",
    city: "rabat",
    email: "contact@oudayas.ma",
    phone: "+212 5 37 20 66 41",
    logo: "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    about: "Café-restaurant avec terrasse panoramique sur l'estuaire du Bouregreg.",
    requestedAt: "2026-08-15",
  },
];

/**
 * Employers already in the fixtures but not yet verified belong at the top of
 * the queue: they are a real pending account, not a synthetic one.
 */
export const restaurantRequests = () => [
  ...EMPLOYERS.filter((e) => !e.verified).map((e, i) => ({
    id: e.id,
    ref: `#${12400 + i + 1}`,
    name: e.name,
    type: e.type,
    city: e.city,
    email: e.email,
    phone: e.phone,
    logo: VENUE_PHOTOS[i % VENUE_PHOTOS.length],
    about: e.about,
    requestedAt: "2026-08-17",
    existing: true,
  })),
  ...PENDING_SIGNUPS.map((r, i) => ({
    ...r,
    logo: VENUE_PHOTOS[(i + 2) % VENUE_PHOTOS.length],
    ref: `#${12500 + i + 1}`,
    existing: false,
  })),
];

export const getRestaurantRequest = (id) =>
  restaurantRequests().find((r) => r.id === id) || null;

/* --------------------------------------------------------- dish photos */
// The Chef Details and Restaurant Details screens show a "Photos of your
// dishes" strip. The candidate fixture's `foodPhotos` point at the grey mockup
// rectangles from the hand-off, which render as washed-out blocks; these are
// actual plated-food photographs, served through Unsplash's CDN.

export const DISH_PHOTOS = [
  unsplash("photo-1512621776951-a57141f2eefd"),
  unsplash("photo-1467003909585-2f8a72700288"),
  unsplash("photo-1540189549336-e6e99c3679fe"),
  unsplash("photo-1476224203421-9ac39bcb3327"),
  unsplash("photo-1504674900247-0877df9cc836"),
  unsplash("photo-1414235077428-338989a2e8c0"),
  unsplash("photo-1498837167922-ddd27525d352"),
  unsplash("photo-1473093295043-cdd812d0e601"),
];

/** A stable strip of dish photos for one profile, sized to its own fixture. */
export const dishPhotosFor = (candidate, index = 0) => {
  const count = candidate?.foodPhotos?.length || 0;
  if (!count) return [];
  return Array.from(
    { length: Math.min(count, DISH_PHOTOS.length) },
    (_, k) => DISH_PHOTOS[(index + k) % DISH_PHOTOS.length]
  );
};

/* ------------------------------------------------------- admin identity */
// The signed-in administrator shown in the header, matching the Figma.

export const CURRENT_ADMIN = {
  id: "adm-1",
  name: "Admin Camille",
  email: "admin@cookkonnekt.ma",
  avatar: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
  unreadNotifications: 1,
};
