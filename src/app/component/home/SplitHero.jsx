"use client";

// Split-screen hero — Change Requirements section 03:
//
//   "Replace existing hero with a split-screen design: left half = 'I'm Looking
//    for a Job' (cook image), right half = 'I'm an Employer' (restaurant image).
//    Equal sizes. Big, impossible to miss."
//
//   "Place the split-screen below the main banner image, where the stats row
//    (500 registered cooks, etc.) currently appears."
//
// The two halves are exactly 50/50 on desktop (grid-cols-2, identical markup and
// min-height) and stack full-width on mobile.

import Link from "next/link";
import { ChefHat, Building2, ArrowRight } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";

const HALVES = [
  {
    id: "candidate",
    href: "/signUp?role=candidate",
    icon: ChefHat,
    titleKey: "home.lookingForJob",
    descKey: "home.lookingForJobDesc",
    image: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    overlay: "from-brand-dark/90 to-brand/70",
  },
  {
    id: "employer",
    href: "/signUp?role=employer",
    icon: Building2,
    titleKey: "home.iAmEmployer",
    descKey: "home.iAmEmployerDesc",
    image: "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    overlay: "from-accent-dark/90 to-accent/70",
  },
];

export default function SplitHero() {
  const t = useT();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {HALVES.map(({ id, href, icon: Icon, titleKey, descKey, image, overlay }) => (
        <Link
          key={id}
          href={href}
          className="group relative flex min-h-[300px] items-center justify-center overflow-hidden md:min-h-[420px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${overlay}`} />

          <div className="relative z-10 flex max-w-sm flex-col items-center px-6 text-center text-white">
            <span className="mb-4 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
              <Icon size={36} strokeWidth={1.75} />
            </span>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              {t(titleKey)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              {t(descKey)}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition group-hover:gap-3">
              {t("home.getStarted")}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
