"use client";

// Mock session. Replaces the hardcoded `role = "owner"` / `isLoggedIn = true`
// constants that used to live at the top of Navbar.jsx.
//
// The default is a signed-out guest, because the guest -> signup funnel
// (Change Requirements 03) is the behaviour the client cares most about and it
// should be what you see on a fresh load.

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { subscribe, getJSON, setValue, removeValue, SESSION_KEY as STORAGE_KEY } from "@/lib/browserStore";
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

/**
 * A candidate whose profile is missing required fields, so the "Incomplete
 * Profile" gate (Change Requirements 06) can be exercised from the sign-in
 * screen. The primary demo candidate is deliberately left at 100% complete,
 * which is why the gate looked like it was not implemented — there was no
 * account that could trigger it. Matches INCOMPLETE_CANDIDATE_ID in
 * mock/candidates.js.
 */
export const DEMO_INCOMPLETE_CANDIDATE = {
  id: "cand-4",
  name: "Salma Idrissi",
  email: "salma.idrissi@example.ma",
  avatar: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
};

const GUEST = { role: ROLES.GUEST, user: null };

export function SessionProvider({ children }) {
  // The server always renders the guest view; the stored session is picked up on
  // the client through the external store, so there is no hydration mismatch and
  // no setState inside an effect.
  const session = useSyncExternalStore(
    subscribe,
    () => {
      const stored = getJSON(STORAGE_KEY, GUEST);
      return stored?.role && stored.role !== ROLES.GUEST ? stored : GUEST;
    },
    () => GUEST
  );

  /**
   * `user` overrides the default demo account for the role — used by the
   * sign-in screen to pick the incomplete-profile candidate.
   */
  const login = useCallback((role, user) => {
    const next = { role, user: user || DEMO_USERS[role] || null };
    setValue(STORAGE_KEY, next);
    return next;
  }, []);

  const logout = useCallback(() => {
    removeValue(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isLoggedIn: session.role !== ROLES.GUEST,
      isCandidate: session.role === ROLES.CANDIDATE,
      isEmployer: session.role === ROLES.EMPLOYER,
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
