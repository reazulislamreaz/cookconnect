"use client";

// Candidate dashboard: profile completeness, applications and recommendations.
// The completeness meter doubles as the entry point to the "Incomplete Profile"
// flow from Change Requirements section 06.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Send, Eye, Bookmark, AlertTriangle, ArrowRight } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchCurrentCandidate, fetchMyApplications, fetchFeaturedJobs } from "@/mock/api";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { APPLICATION_STATUS } from "@/mock/applications";
import { getCity } from "@/mock/cities";
import EmptyState from "@/app/component/ui/EmptyState";
import JobCard from "@/app/component/allJobs/JobCard";

const TONES = {
  amber: "bg-amber-50 text-amber-700",
  green: "bg-brand-soft text-brand-dark",
  red: "bg-red-50 text-red-600",
};

export default function CandidateDashboard() {
  const t = useT();
  const { pick } = useLocale();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetchCurrentCandidate().then(setProfile);
    fetchMyApplications().then(setApplications);
    fetchFeaturedJobs(3).then(setRecommended);
  }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);

  const stats = [
    { icon: Send, value: applications?.length ?? 0, labelKey: "dashboard.stats.applications" },
    { icon: Eye, value: 148, labelKey: "dashboard.stats.views" },
    { icon: Bookmark, value: 6, labelKey: "dashboard.stats.saved" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-poppins">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {profile ? t("dashboard.welcome", { name: profile.firstName }) : t("dashboard.title")}
        </h1>
      </header>

      {/* Profile completeness */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800">{t("dashboard.profileStrength")}</span>
          <span className="text-sm font-semibold text-gray-900">{completion.percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${
              completion.isComplete ? "bg-brand" : "bg-amber-500"
            }`}
            style={{ width: `${completion.percent}%` }}
          />
        </div>

        {!completion.isComplete && (
          <div className="mt-4 flex flex-col gap-3 rounded-md bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {t("profile.incompleteBody")}
            </p>
            <Link
              href="/editProfile"
              className="shrink-0 rounded-md bg-amber-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-amber-700"
            >
              {t("profile.incompleteCta")}
            </Link>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, labelKey }) => (
          <div key={labelKey} className="rounded-xl border border-gray-200 bg-white p-5">
            <Icon size={20} className="mb-3 text-brand" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm text-gray-600">{t(labelKey)}</p>
          </div>
        ))}
      </section>

      {/* Applications */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("dashboard.myApplications")}</h2>

        {applications === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title={t("dashboard.noApplications")}
            action={
              <Link
                href="/allJobs"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white"
              >
                {t("dashboard.browseOffers")}
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => {
              const status = APPLICATION_STATUS[app.status];
              const city = getCity(app.job?.city);
              return (
                <li
                  key={app.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.job?.logo} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {pick(app.job, "title")}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {app.job?.employerName} · {pick(city)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONES[status.tone]}`}>
                      {pick(status)}
                    </span>
                    <Link
                      href={`/allJobs/${app.jobId}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {t("common.seeOffer")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.recommended")}</h2>
          <Link
            href="/allJobs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            {t("home.seeAllOffers")}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
