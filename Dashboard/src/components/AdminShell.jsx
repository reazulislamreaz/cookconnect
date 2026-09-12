"use client";

// Dashboard chrome: the boxed sidebar, the header with the notification bell
// and the administrator's identity, and the Log out control — laid out to match
// the Figma admin screens.
//
// The sidebar is fixed and off-canvas below `lg`, where a 264px rail would eat
// most of a phone screen. The nav items are individually boxed (not a flat
// list) and the active one fills brand green, as in the design.

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  ChartColumn,
  ChefHat,
  ChevronDown,
  ClipboardCheck,
  Database,
  Gauge,
  Globe,
  Images,
  LayoutTemplate,
  Lock,
  LogOut,
  Menu,
  MessageSquareWarning,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

import { useLocale, useT, LOCALES } from "@/i18n/LocaleProvider";
import { useAdminSession } from "@/lib/adminSession";
import { subscribe } from "@/lib/browserStore";
import { ROUTE_PERMISSIONS, permissionForPath } from "@/lib/permissions";
import { currentPermissions } from "@/mock/adminApi";

// `permission` comes from the same map the route guard uses, so a link can
// never appear for a page that would then refuse the admin.
const NAV = [
  { href: "/", labelKey: "nav.dashboard", icon: Gauge },
  { href: "/chefs", labelKey: "nav.chefs", icon: ChefHat, permission: ROUTE_PERMISSIONS["/chefs"] },
  { href: "/chefs/database", labelKey: "nav.database", icon: Database, permission: ROUTE_PERMISSIONS["/chefs/database"] },
  { href: "/restaurants", labelKey: "nav.restaurants", icon: Building2, permission: ROUTE_PERMISSIONS["/restaurants"] },
  { href: "/jobs", labelKey: "nav.jobs", icon: Briefcase, permission: ROUTE_PERMISSIONS["/jobs"] },
  { href: "/jobs/pending", labelKey: "nav.pendingOffers", icon: ClipboardCheck, permission: ROUTE_PERMISSIONS["/jobs/pending"] },
  { href: "/statistics", labelKey: "nav.statistics", icon: ChartColumn, permission: ROUTE_PERMISSIONS["/statistics"] },
  { href: "/feedback", labelKey: "nav.feedback", icon: MessageSquareWarning, permission: ROUTE_PERMISSIONS["/feedback"] },
];

/** The "settings" item in the design is a disclosure, not a link. */
const SETTINGS_NAV = [
  { href: "/settings/homepage", labelKey: "nav.homepage", icon: LayoutTemplate, permission: ROUTE_PERMISSIONS["/settings/homepage"] },
  { href: "/settings/moderation", labelKey: "nav.moderation", icon: Images, permission: ROUTE_PERMISSIONS["/settings/moderation"] },
  { href: "/settings/activity", labelKey: "nav.activity", icon: ScrollText, permission: ROUTE_PERMISSIONS["/settings/activity"] },
  { href: "/settings/notifications", labelKey: "nav.outbox", icon: Send, permission: ROUTE_PERMISSIONS["/settings/notifications"] },
  { href: "/settings/roles", labelKey: "nav.roles", icon: ShieldCheck, permission: ROUTE_PERMISSIONS["/settings/roles"] },
];

/** `/` must match exactly, or it stays highlighted on every child route. */
const matchesRoute = (pathname, href) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Only the most specific nav entry lights up.
 *
 * `/jobs/pending` is a child path of `/jobs`, so a plain prefix test highlights
 * both and the sidebar shows the admin in two places at once. Taking the longest
 * matching href resolves that without special-casing either entry.
 */
const isActive = (pathname, href) => {
  if (!matchesRoute(pathname, href)) return false;

  const deeper = [...NAV, ...SETTINGS_NAV].filter(
    (i) => i.href !== href && i.href.length > href.length && matchesRoute(pathname, i.href)
  );
  return deeper.length === 0;
};

export default function AdminShell({ children }) {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { admin, logout } = useAdminSession();

  const [open, setOpen] = useState(false);

  // Improvement points 18, least privilege: an admin sees only their own
  // sections. Read through the same external store the session uses — grants
  // live in localStorage and change while the session stays the same, and an
  // effect that setState'd them would cascade a render on every navigation.
  //
  // The snapshot is a joined string because it has to be referentially stable:
  // `currentPermissions()` builds a fresh array each call, which would loop.
  const grantedKey = useSyncExternalStore(
    subscribe,
    () => currentPermissions().join(","),
    // The server has no storage, so it renders as "rights unknown" rather than
    // as "no rights" — otherwise every nav item vanishes for one frame and the
    // admin watches their own sidebar rebuild itself on each load.
    () => null
  );

  const granted = useMemo(
    () => (grantedKey === null ? null : grantedKey ? grantedKey.split(",") : []),
    [grantedKey]
  );

  const allowed = (item) =>
    granted === null || !item.permission || granted.includes(item.permission);

  const nav = NAV.filter(allowed);
  const settingsNav = SETTINGS_NAV.filter(allowed);

  const settingsActive = settingsNav.some((i) => isActive(pathname, i.href));
  const [settingsOpen, setSettingsOpen] = useState(true);

  // The route the admin is on, checked against the same map the sidebar uses.
  const required = permissionForPath(pathname);
  const blocked = granted !== null && required && !granted.includes(required);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const itemClass = (active) =>
    `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
      active
        ? "border-brand bg-brand font-medium text-white"
        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-[264px] flex-col bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0 shadow-xl" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/" onClick={close} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <ChefHat size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {t("brand.name")}
            </span>
          </Link>
          <button
            onClick={close}
            aria-label={t("common.close")}
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <ul className="space-y-3">
            {nav.map(({ href, labelKey, icon: Icon }) => (
              <li key={href}>
                <Link href={href} onClick={close} className={itemClass(isActive(pathname, href))}>
                  <Icon size={18} />
                  {t(labelKey)}
                </Link>
              </li>
            ))}

            {/* Settings disclosure */}
            <li>
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                aria-expanded={settingsOpen}
                className={`w-full justify-between ${itemClass(settingsActive && !settingsOpen)}`}
              >
                <span className="flex items-center gap-3">
                  <Settings size={18} />
                  {t("nav.settings")}
                </span>
                <ChevronDown
                  size={17}
                  className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {settingsOpen && (
                <ul className="mt-2 space-y-2 ps-3">
                  {settingsNav.map(({ href, labelKey, icon: Icon }) => {
                    const active = isActive(pathname, href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={close}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                            active
                              ? "bg-brand-soft font-medium text-brand-dark"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon size={16} />
                          {t(labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            <LogOut size={18} className="rtl:rotate-180" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {open && (
        <button
          aria-hidden
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Main column — offset by the fixed rail from `lg` up. */}
      <div className="flex min-h-screen flex-col lg:ms-[264px]">
        <header className="flex h-20 items-center justify-between gap-3 px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label={t("nav.menu")}
            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="ms-auto flex items-center gap-3 sm:gap-5">
            {/* Language switch — the dashboard ships the same three locales. */}
            <div className="hidden items-center gap-1 rounded-lg border border-gray-200 p-0.5 sm:flex">
              <Globe size={14} className="ms-2 text-gray-400" />
              {LOCALES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLocale(l.id)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                    l.id === locale ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {l.short}
                </button>
              ))}
            </div>

            {/* The bell points at the notifications, not at the activity log —
                it used to open a page that did not contain them. */}
            <Link
              href="/settings/notifications"
              aria-label={t("nav.notifications")}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-700 transition hover:bg-gray-100"
            >
              <Bell size={19} />
              {admin?.unreadNotifications > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-white">
                  {admin.unreadNotifications}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2.5">
              {admin?.avatar && (
                <Image
                  src={admin.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <span className="hidden text-sm font-medium text-gray-800 sm:block">
                {admin?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-10 lg:px-6">
          {/* Typing a URL must not get round the sidebar. The refusal names the
              section and says what to do, rather than pretending the page is
              missing — the admin has not made a mistake, they lack a right. */}
          {blocked ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Lock size={26} />
              </span>
              <h1 className="text-lg font-semibold text-gray-900">{t("access.title")}</h1>
              <p className="max-w-sm text-sm text-gray-600">{t("access.body")}</p>
              <Link
                href="/"
                className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
              >
                {t("common.backToDashboard")}
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
