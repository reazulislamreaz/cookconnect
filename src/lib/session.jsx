"use client";

// Mock session. Replaces the hardcoded `role = "owner"` / `isLoggedIn = true`
// constants that used to live at the top of Navbar.jsx.
//
// The default is a signed-out guest, because the guest -> signup funnel
// (Change Requirements 03) is the behaviour the client cares most about and it
// should be what you see on a fresh load.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nkhedmou.session";
const SessionContext = createContext(null);

export const ROLES = { GUEST: "guest", CANDIDATE: "candidate", EMPLOYER: "employer" };

const DEMO_USERS = {
  [ROLES.CANDIDATE]: {
    id: "cand-1",
    name: "Youssef El Amrani",
    email: "youssef.elamrani@example.ma",
    avatar: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
  },
  [ROLES.EMPLOYER]: {
    id: "emp-2",
    name: "La Table Casablancaise",
    email: "rh@tablecasa.ma",
    avatar: "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
  },
};

const GUEST = { role: ROLES.GUEST, user: null };

export function SessionProvider({ children }) {
  // Start as a guest on both server and client so the first paint matches,
  // then restore any stored session after hydration.
  const [session, setSession] = useState(GUEST);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.role && parsed.role !== ROLES.GUEST) setSession(parsed);
      }
    } catch {
      // Corrupted value — fall back to guest rather than crashing the shell.
    }
    setReady(true);
  }, []);

  const login = useCallback((role) => {
    const next = { role, user: DEMO_USERS[role] || null };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const logout = useCallback(() => {
    setSession(GUEST);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      ready,
      isLoggedIn: session.role !== ROLES.GUEST,
      isCandidate: session.role === ROLES.CANDIDATE,
      isEmployer: session.role === ROLES.EMPLOYER,
      login,
      logout,
    }),
    [session, ready, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
