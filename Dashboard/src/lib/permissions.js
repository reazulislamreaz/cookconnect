// Which right each screen needs — Improvement points 18.
//
// One map, used by both the sidebar and the route guard. When those live in two
// places they drift, and the failure mode is the worst one available: a link the
// admin can see, leading to a page that refuses them, or worse, a page they can
// reach by typing the URL that the sidebar pretended did not exist.
//
// Least privilege means the default is "no": a route with no entry here is
// reachable by everyone, so every new admin screen must be listed.

export const ROUTE_PERMISSIONS = {
  "/chefs": "manage-candidates",
  "/chefs/database": "manage-candidates",
  "/restaurants": "manage-employers",
  "/jobs": "approve-offers",
  "/jobs/pending": "approve-offers",
  "/statistics": "view-statistics",
  "/feedback": "manage-feedback",
  "/settings/homepage": "manage-homepage",
  "/settings/moderation": "approve-photos",
  "/settings/activity": "view-activity",
  "/settings/notifications": "manage-feedback",
  "/settings/roles": "manage-admins",
};

/**
 * The permission a path needs, matching the longest route prefix.
 *
 * `/chefs/cand-3` has no entry of its own and must inherit `/chefs`, or every
 * detail page in the app becomes a hole in the model.
 */
export function permissionForPath(pathname) {
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? ROUTE_PERMISSIONS[match] : null;
}
