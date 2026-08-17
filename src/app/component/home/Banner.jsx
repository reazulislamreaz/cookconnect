"use client";

// Main home banner. ClientDoc section 7: the admin can replace this background
// by uploading an image, or keep the plain background — so the image URL is
// data-driven rather than hardcoded in the markup.
//
// The old "Join CookConnekt" account-type modal that used to live here is gone:
// Change Requirements 03 replaced it with the split-screen hero directly below,
// and 03 also forbids duplicate call-to-action buttons.

import Link from "next/link";
import { Search } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { useSession } from "@/lib/session";

/** Admin-managed later; null keeps the plain tinted background. */
const BACKGROUND_IMAGE = "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png";

export default function Banner() {
  const t = useT();
  const { isLoggedIn } = useSession();

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-brand-tint px-4 py-16 font-poppins sm:py-24">
      {BACKGROUND_IMAGE && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BACKGROUND_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/85" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/allJobs"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark sm:w-auto"
          >
            {t("nav.jobOffers")}
            <Search size={17} />
          </Link>

          {/* One CTA only — no duplicate Apply + Sign Up pairing (Change Req 03). */}
          {!isLoggedIn && (
            <Link
              href="/signUp"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark sm:w-auto"
            >
              {t("auth.createAccount")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
