"use client";

// The follow-along banner from Change Requirements section 04:
//
//   "Add a banner that follows the user as they browse the platform
//    (fixed/sticky placement — not blocking content). Shown on all pages
//    during a session."
//
// Two details that matter: it must not block content (so it is a slim bar the
// user can dismiss, and the layout reserves space for it), and dismissal lasts
// for the session only — sessionStorage, not localStorage.

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useSession } from "@/lib/session";
import { STICKY_BANNER } from "@/mock/banners";

const DISMISS_KEY = "nkhedmou.stickyAd.dismissed";

export default function StickyAdBanner() {
  const { isLoggedIn } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Rendered only after mount so the server markup and first client paint match.
    setVisible(window.sessionStorage.getItem(DISMISS_KEY) !== "1");
  }, []);

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Spacer so the fixed bar never covers the footer or page content. */}
      <div aria-hidden className="h-16 sm:h-14" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-dark/30 bg-brand text-white shadow-[0_-2px_12px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{STICKY_BANNER.title}</p>
            <p className="truncate text-xs text-white/80">{STICKY_BANNER.subtitle}</p>
          </div>

          {!isLoggedIn && (
            <Link
              href={STICKY_BANNER.href}
              className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-tint sm:px-4 sm:text-sm"
            >
              {STICKY_BANNER.cta}
            </Link>
          )}

          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="shrink-0 rounded p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
