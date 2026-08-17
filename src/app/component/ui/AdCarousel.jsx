"use client";

// Sliding advertising banner — Change Requirements section 04.
// Slides auto-rotate every ~3 seconds; used twice on the home page (middle and
// bottom). Must stay proportional on mobile, which the client flagged as the
// priority since most traffic is expected on phones.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { AD_ROTATE_MS } from "@/mock/banners";

export default function AdCarousel({ slides = [], className = "" }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AD_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section className={`px-4 ${className}`} aria-label={t("home.advertising")}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-gray-400">
          {t("home.advertising")}
        </p>

        <div
          className="relative overflow-hidden rounded-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out rtl:flex-row-reverse"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide) => (
              <Link
                key={slide.id}
                href={slide.href || "#"}
                className={`relative flex w-full shrink-0 flex-col justify-center gap-2 bg-gradient-to-r ${slide.bg} p-6 text-white sm:p-10`}
                style={{ minHeight: "clamp(140px, 22vw, 200px)" }}
              >
                <h3 className="text-lg font-bold sm:text-2xl">{slide.title}</h3>
                <p className="max-w-xl text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
                <span className="mt-2 w-fit rounded-md bg-white/95 px-4 py-2 text-xs font-semibold text-gray-900 sm:text-sm">
                  {slide.cta}
                </span>
              </Link>
            ))}
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-3 start-6 flex gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setIndex(i)}
                  aria-label={`${t("common.page")} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
