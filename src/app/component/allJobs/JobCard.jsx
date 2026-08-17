"use client";

// Offer card. Two Change Requirements rules are encoded here:
//
// 03 "Sign-Up Button on Offers": every card shown to a signed-out visitor
//    carries its own prominent Sign Up button, to maximise registrations.
//
// 03 "Smart Redirect on Click": the card body and the single action button both
//    go through `requireAuth`, so a guest gets the signup gate and a signed-in
//    user proceeds normally. There is deliberately no separate Apply button
//    next to the Sign Up one — the client asked for one button, not two.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, CalendarDays, Clock, BadgeCheck } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { useSignupGate } from "@/app/component/ui/SignupGate";
import { getCity } from "@/mock/cities";
import { REQUIREMENT_BY_ID, EXPERIENCE_LEVELS, CONTRACT_TYPES } from "@/mock/jobOptions";
import { daysLeft } from "@/mock/jobs";

export default function JobCard({ job }) {
  const t = useT();
  const { pick, locale } = useLocale();
  const router = useRouter();
  const { requireAuth, isLoggedIn } = useSignupGate();

  const href = `/allJobs/${job.id}`;
  const city = getCity(job.city);
  const experience = EXPERIENCE_LEVELS.find((e) => e.id === job.experience);
  const remaining = daysLeft(job);
  const isNew = remaining > 50;

  const open = requireAuth(() => router.push(href));

  return (
    <div
      onClick={open}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 font-poppins shadow-sm transition hover:border-brand/40 hover:shadow-md"
    >
      {isNew && (
        <span className="absolute end-4 top-4 rounded bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
          {t("notifications.new")}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pe-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={job.logo} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {locale === "ar" ? job.titleAr : job.title}
          </h3>
          <p className="truncate text-sm text-gray-600">{job.employerName}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {pick(city)}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {pick(experience)}
        </span>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag>{pick(CONTRACT_TYPES.find((c) => c.id === job.contractType))}</Tag>
        <Tag>
          {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()} {job.currency}
        </Tag>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-700">
        {locale === "ar" ? job.descriptionAr : job.description}
      </p>

      {/* First two requirements */}
      {job.requirements?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {job.requirements.slice(0, 2).map((id) => {
            const req = REQUIREMENT_BY_ID[id];
            if (!req) return null;
            return (
              <li key={id} className="flex items-center gap-1.5 text-sm text-gray-600">
                <BadgeCheck size={14} className="shrink-0 text-brand" />
                {pick(req)}
              </li>
            );
          })}
          {job.requirements.length > 2 && (
            <li className="text-sm font-medium text-accent">
              +{job.requirements.length - 2}
            </li>
          )}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} /> {t("jobs.postedOn")} {job.postedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {t("jobs.expiresIn", { n: Math.max(0, remaining) })}
          </span>
        </div>

        {/* One action only. Guests get Sign Up, members get Apply. */}
        {isLoggedIn ? (
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md bg-accent px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("common.applyNow")}
          </Link>
        ) : (
          <Link
            href="/signUp"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md bg-accent px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("nav.signUp")}
          </Link>
        )}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded bg-brand-soft px-2 py-1 text-[11px] font-medium text-brand-dark">
      {children}
    </span>
  );
}
