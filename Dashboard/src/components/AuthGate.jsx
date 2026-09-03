"use client";

// Sends signed-out visitors to the sign-in screen.
//
// This is a demo gate, not a security boundary — the session lives in
// localStorage and anyone can write it. Real protection belongs in middleware
// against a server-issued cookie; this exists so the Log out button leads
// somewhere and the app has a coherent entry point.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readStoredAdmin, useAdminSession } from "@/lib/adminSession";

export default function AuthGate({ children }) {
  const { isSignedIn } = useAdminSession();
  const router = useRouter();

  // Reads storage directly rather than trusting `isSignedIn`.
  //
  // On the first client commit `isSignedIn` is false even for a signed-in
  // admin: React replays the server snapshot during hydration, and
  // useSyncExternalStore only swaps to the stored value on the render *after*
  // it. Redirecting on that value bounced every hard page load to /login.
  useEffect(() => {
    if (!readStoredAdmin()) router.replace("/login");
  }, [router]);

  // Rendering still keys off the subscribed value, so the admin chrome appears
  // as soon as the store settles — one render later, with no extra state to
  // synchronise.
  if (!isSignedIn) return <div className="min-h-screen bg-white" />;

  return children;
}
