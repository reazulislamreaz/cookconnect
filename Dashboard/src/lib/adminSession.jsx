"use client";

// Mock administrator session for the dashboard app.
//
// The Figma sidebar ends in a "Log out" button, so the app needs somewhere to
// log out *to* — otherwise the control is decorative. This keeps a signed-in
// flag in localStorage and the sign-in screen writes it; nothing here is a
// security boundary, it is a demo of the flow.
//
// Read through useSyncExternalStore for the same reason the public site does:
// the server has no localStorage, so it renders the signed-out snapshot and
// React swaps to the stored one after hydration, with no setState-in-effect and
// no hydration mismatch.

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import {
  subscribe,
  getJSON,
  setValue,
  removeValue,
  ADMIN_SESSION_KEY,
} from "@/lib/browserStore";
import { authenticate, clearAdminAuth } from "@/mock/adminApi";

/** Header identity the Figma shows — avatar and unread count, not a record. */
const HEADER_IDENTITY = {
  avatar: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
  unreadNotifications: 1,
};

const STORAGE_KEY = ADMIN_SESSION_KEY;
const SIGNED_OUT = { admin: null };

const AdminSessionContext = createContext(null);

export function AdminSessionProvider({ children }) {
  const session = useSyncExternalStore(
    subscribe,
    () => getJSON(STORAGE_KEY, SIGNED_OUT) || SIGNED_OUT,
    () => SIGNED_OUT
  );

  /**
   * `email` picks which of the demo administrators to sign in as, so the
   * permissions screen can be exercised as a sub-admin as well as the main
   * account. Anything unrecognised falls back to the main admin — this is a
   * demo, not an authentication check.
   *
   * Resolution goes through the data layer rather than the ADMINS fixture, so
   * pointing it at a real POST /auth/login is a one-function change here and
   * nothing on the sign-in screen moves.
   */
  const login = useCallback(async (email, password) => {
    const res = await authenticate(email, password);
    if (!res.ok) return null;

    const admin = res.admin
      ? { ...HEADER_IDENTITY, ...res.admin }
      : { ...HEADER_IDENTITY, id: "adm-1", name: "Admin principal", email, role: "super" };

    setValue(STORAGE_KEY, { admin });
    return admin;
  }, []);

  const logout = useCallback(async () => {
    await clearAdminAuth();
    removeValue(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      admin: session.admin,
      isSignedIn: Boolean(session.admin),
      isSuperAdmin: session.admin?.role !== "sub",
      login,
      logout,
    }),
    [session, login, logout]
  );

  return (
    <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
  );
}

/**
 * Reads the stored administrator straight from storage, bypassing React.
 *
 * Needed by AuthGate: on the first client commit React is still replaying the
 * server snapshot (always signed out), so an effect that trusts the rendered
 * value would redirect a signed-in admin to /login on every hard page load.
 */
export const readStoredAdmin = () => getJSON(STORAGE_KEY, SIGNED_OUT)?.admin || null;

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used inside <AdminSessionProvider>");
  return ctx;
}
