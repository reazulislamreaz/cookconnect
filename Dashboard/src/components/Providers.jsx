"use client";

// Client providers for the dashboard: locale first, then the admin session,
// then the chrome. The shell reads from both contexts, so it has to sit inside
// them rather than wrapping them.
//
// The sign-in screen is the one route that must render without the sidebar —
// showing the admin navigation to someone who is signed out would be nonsense —
// so it is excluded here rather than by giving it a parallel route group.

import { usePathname } from "next/navigation";

import { LocaleProvider } from "@/i18n/LocaleProvider";
import { AdminSessionProvider } from "@/lib/adminSession";
import AdminShell from "@/components/AdminShell";
import AuthGate from "@/components/AuthGate";

export default function Providers({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <LocaleProvider>
      <AdminSessionProvider>
        {isLogin ? children : <AuthGate><AdminShell>{children}</AdminShell></AuthGate>}
      </AdminSessionProvider>
    </LocaleProvider>
  );
}
