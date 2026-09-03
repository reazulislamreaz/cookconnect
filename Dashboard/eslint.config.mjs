// ESLint 9 flat config. eslint-config-next 16 ships flat configs natively, so
// it is imported directly — the FlatCompat bridge is only needed for the older
// eslintrc-style releases and actually breaks against this version.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Record fixtures a screen must never read directly.
 *
 * `src/mock/adminApi.js` is the single data-access layer: every screen reads
 * through it, so replacing the mocks with `fetch` is a one-file change and no
 * component has to be rewritten. That promise is load-bearing — the backend's
 * own task 7.2 accepts the integration only if every admin screen works against
 * the API with **no component file changes** — and it is the kind of promise
 * that decays silently, one convenient import at a time.
 *
 * Taxonomy modules are deliberately absent from this list. `cities`,
 * `jobOptions` and `sectors` are enums: a screen needs them to render a stored
 * id as a label, they ship in the bundle either way, and the API contract treats
 * them as fixed vocabulary rather than as records.
 */
const RECORD_FIXTURES = [
  {
    name: "@/mock/candidates",
    message: "Read candidates through adminApi (fetchChef, fetchCandidateDatabase).",
  },
  {
    name: "@/mock/employers",
    message: "Read employers through adminApi (fetchRestaurants, fetchRestaurant).",
  },
  {
    name: "@/mock/applications",
    message: "Read applications through adminApi (fetchCandidateApplications).",
  },
  {
    name: "@/mock/notifications",
    message: "Read notifications through adminApi (fetchNotificationOutbox).",
  },
];

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  {
    files: ["src/app/**/*.{js,jsx}", "src/components/**/*.{js,jsx}", "src/lib/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...RECORD_FIXTURES,
            {
              name: "@/mock/jobs",
              importNames: ["JOBS", "ACTIVE_JOBS", "getJob", "getJobsByEmployer"],
              message:
                "Read offers through adminApi (fetchJobOffer, fetchEmployerJobs, fetchPendingOffers). OFFER_STATUSES and the date helpers are fine.",
            },
            {
              name: "@/mock/admin",
              importNames: ["ADMINS", "FEEDBACK", "ACTIVITY_LOG", "PENDING_PHOTOS", "REPORTED_OFFERS"],
              message:
                "Read these through adminApi (fetchAdmins, fetchFeedback, fetchActivity, fetchModeration). PERMISSIONS is a taxonomy and is fine.",
            },
            {
              name: "@/mock/adminDashboard",
              importNames: ["CURRENT_ADMIN", "chefRows", "restaurantRows", "restaurantRequests"],
              message:
                "Read these through adminApi. MONTHS and the photo pools are presentation constants and are fine.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
