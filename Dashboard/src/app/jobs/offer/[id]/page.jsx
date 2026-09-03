"use client";

// Job Details — the full offer, matching the Figma layout: header card,
// specialties, description and requirements in the main column, benefits and
// statistics in the sidebar.
//
// Lives under /jobs/offer/[id] rather than /jobs/[id] so it cannot collide with
// /jobs/[employerId], which is the restaurant drill-down.

import { use, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  CircleCheck,
  MapPin,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useLocale, useT, LOCALES } from "@/i18n/LocaleProvider";
import {
  approveOffer,
  deleteJobOffer,
  fetchJobOffer,
  rejectOffer,
  updateOffer,
} from "@/mock/adminApi";
import { getCity, CITIES } from "@/mock/cities";
import {
  BENEFIT_BY_ID,
  CONTRACT_TYPES,
  EXPERIENCE_LEVELS,
  OFFER_REJECTION_REASONS,
  REJECTION_REASON_BY_ID,
  REQUIREMENT_BY_ID,
} from "@/mock/jobOptions";
import { SECTORS, POSITION_BY_ID } from "@/mock/sectors";
import {
  Chip,
  ConfirmDialog,
  EmptyState,
  OfferStatusBadge,
  PageHeader,
  Panel,
  Pill,
  ReasonDialog,
  SegmentedToggle,
  Select,
  Toast,
} from "@/components/ui";

/** Bulleted list with the green check the design uses. */
function CheckList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
          <CircleCheck size={17} className="mt-0.5 shrink-0 text-brand" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function JobDetailsPage({ params }) {
  const { id } = use(params);

  const t = useT();
  const router = useRouter();
  const { pick, locale } = useLocale();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [editLocale, setEditLocale] = useState("fr");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchJobOffer(id).then((res) => {
      setJob(res);
      setLoading(false);
    });
  }, [id]);

  const remove = async () => {
    setConfirming(false);
    await deleteJobOffer(id);
    setToast(t("jobs.deletedToast"));
    setTimeout(() => router.push(`/jobs/${job.employerId}`), 900);
  };

  // This is the "view the full details before they are published" screen, so the
  // decision belongs here as well as in the queue — an admin who has just read
  // the offer should not have to navigate back to act on it.
  const approve = async () => {
    setBusy(true);
    const res = await approveOffer(id);
    setJob((j) => ({ ...j, status: "active", expiresAt: res.expiresAt }));
    setBusy(false);
    setToast(t("pending.approvedToast", { title: pick(job, "title") }));
  };

  const reject = async (reason) => {
    setRejecting(false);
    setBusy(true);
    await rejectOffer(id, reason);
    setJob((j) => ({ ...j, status: "rejected", rejectionReason: reason.id }));
    setBusy(false);
    setToast(t("pending.rejectedToast", { title: pick(job, "title") }));
  };

  const openEditor = () => {
    setDraft({
      title: job.title,
      titleAr: job.titleAr,
      titleEn: job.titleEn,
      description: job.description,
      descriptionAr: job.descriptionAr,
      descriptionEn: job.descriptionEn,
      contractType: job.contractType,
      city: job.city,
      experience: job.experience,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      expiresAt: job.expiresAt,
    });
    setEditing(true);
  };

  const saveEdits = async () => {
    setEditing(false);
    setBusy(true);
    await updateOffer(id, {
      ...draft,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
    });
    const fresh = await fetchJobOffer(id);
    setJob(fresh);
    setBusy(false);
    setToast(t("jobs.editedToast"));
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t("jobs.details")} backHref="/jobs" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PageHeader title={t("common.notFound")} backHref="/jobs" />
        <EmptyState
          title={t("common.notFound")}
          hint={t("common.notFoundHint")}
          action={<Pill tone="brand" href="/jobs">{t("jobs.title")}</Pill>}
        />
      </>
    );
  }

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale);
  const contract = pick(CONTRACT_TYPES.find((c) => c.id === job.contractType)) || job.contractType;
  const city = pick(getCity(job.city)) || job.city;

  const requirements = job.requirements.map((r) => REQUIREMENT_BY_ID[r]).filter(Boolean).map((r) => pick(r));
  const benefits = job.benefits.map((b) => BENEFIT_BY_ID[b]).filter(Boolean).map((b) => pick(b));

  // "Specialties sought" is the offer's sector plus the exact position — the
  // two fields a cook filters on.
  const specialties = [
    pick(SECTORS.find((s) => s.id === job.sectorId)),
    pick(POSITION_BY_ID[job.positionId]),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title={t("jobs.details")}
        backHref={job.status === "pending" ? "/jobs/pending" : `/jobs/${job.employerId}`}
        action={
          <span className="flex flex-wrap items-center gap-2">
            {job.status === "pending" && (
              <>
                <Pill tone="green" disabled={busy} onClick={approve}>
                  <Check size={15} />
                  {t("common.approve")}
                </Pill>
                <Pill tone="red" disabled={busy} onClick={() => setRejecting(true)}>
                  <X size={15} />
                  {t("common.reject")}
                </Pill>
              </>
            )}
            <Pill tone="ghost" disabled={busy} onClick={openEditor}>
              <Pencil size={15} />
              {t("jobs.edit")}
            </Pill>
            <Pill tone="ghost" onClick={() => setConfirming(true)}>
              <Trash2 size={15} />
              {t("common.delete")}
            </Pill>
          </span>
        }
      />

      {/* Header card */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
            {pick(job, "title")}
          </h2>
          <OfferStatusBadge job={job} />
        </div>

        <p className="mt-2 text-gray-500">{job.employerName}</p>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <MapPin size={17} className="text-gray-400" />
            {city}
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 size={17} className="text-gray-400" />
            {contract}
          </span>
          <span className="inline-flex items-center gap-2">
            <Wallet size={17} className="text-gray-400" />
            {nf.format(job.salaryMin)}–{nf.format(job.salaryMax)} {job.currency}
          </span>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
          <CalendarDays size={17} />
          {t("jobs.deadlineLabel", { date: job.expiresAt })}
        </p>

        {/* A rejected offer has to say why on the record itself. Otherwise the
            next admin to open it sees only that someone refused it. */}
        {job.status === "rejected" && job.rejectionReason && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <span className="font-semibold">{t("pending.reasonLabel")} : </span>
            {pick(REJECTION_REASON_BY_ID[job.rejectionReason]) || job.rejectionReason}
            {job.rejectionNote ? ` — ${job.rejectionNote}` : ""}
          </p>
        )}
      </Panel>

      {/* Specialties */}
      <div className="mt-5">
        <Panel>
          <h3 className="mb-4 text-xl font-bold text-gray-900">{t("jobs.specialtiesSought")}</h3>
          <div className="flex flex-wrap gap-3">
            {specialties.map((s) => (
              <Chip key={s} tone="blue">
                {s}
              </Chip>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel>
            <h3 className="mb-4 text-xl font-bold text-gray-900">{t("jobs.description")}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{pick(job, "description")}</p>
          </Panel>

          <Panel>
            <h3 className="mb-4 text-xl font-bold text-gray-900">{t("jobs.requirements")}</h3>
            <CheckList items={requirements} />
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <h3 className="mb-4 text-xl font-bold text-gray-900">{t("jobs.benefits")}</h3>
            <CheckList items={benefits} />
          </Panel>

          <Panel>
            <h3 className="mb-4 text-xl font-bold text-gray-900">{t("jobs.statistics")}</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-600">{t("jobs.applications")}</dt>
                <dd className="font-semibold text-gray-900">{job.applications}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-600">{t("jobs.views")}</dt>
                <dd className="font-semibold text-gray-900">{job.views}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-600">{t("jobs.publishedSince")}</dt>
                <dd className="font-semibold text-gray-900">
                  {job.publishedDays} {t(job.publishedDays === 1 ? "common.day" : "common.days")}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      {/* Edit — the seventh action from Improvement points 15. Title and
          description are edited per language: correcting only the French would
          leave a cook reading in Darija looking at the old wording. */}
      {editing && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setEditing(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("jobs.edit")}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900">{t("jobs.edit")}</h3>
              <SegmentedToggle
                value={editLocale}
                onChange={setEditLocale}
                options={LOCALES.map((l) => ({ id: l.id, label: l.short }))}
              />
            </div>
            <p className="mt-1 text-sm text-gray-600">{t("jobs.editHint")}</p>

            {(() => {
              const suffix = editLocale === "fr" ? "" : editLocale === "ar" ? "Ar" : "En";
              const titleField = `title${suffix}`;
              const descField = `description${suffix}`;
              const rtl = editLocale === "ar";

              return (
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-500">
                      {t("jobs.jobTitle")}
                    </span>
                    <input
                      value={draft[titleField] || ""}
                      dir={rtl ? "rtl" : "ltr"}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [titleField]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-500">
                      {t("jobs.description")}
                    </span>
                    <textarea
                      rows={4}
                      value={draft[descField] || ""}
                      dir={rtl ? "rtl" : "ltr"}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [descField]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </label>
                </div>
              );
            })()}

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label={t("jobs.contractType")}
                value={draft.contractType}
                options={CONTRACT_TYPES.map((c) => ({ id: c.id, label: pick(c) }))}
                onChange={(v) => setDraft((d) => ({ ...d, contractType: v }))}
              />
              <Select
                label={t("common.city")}
                value={draft.city}
                options={CITIES.map((c) => ({ id: c.id, label: pick(c) }))}
                onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
              />
              <Select
                label={t("db.experience")}
                value={draft.experience}
                options={EXPERIENCE_LEVELS.map((e) => ({ id: e.id, label: pick(e) }))}
                onChange={(v) => setDraft((d) => ({ ...d, experience: v }))}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("jobs.deadline")}
                </span>
                <input
                  type="date"
                  value={draft.expiresAt}
                  onChange={(e) => setDraft((d) => ({ ...d, expiresAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("jobs.salaryMin")}
                </span>
                <input
                  type="number"
                  value={draft.salaryMin}
                  onChange={(e) => setDraft((d) => ({ ...d, salaryMin: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("jobs.salaryMax")}
                </span>
                <input
                  type="number"
                  value={draft.salaryMax}
                  onChange={(e) => setDraft((d) => ({ ...d, salaryMax: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
            </div>

            {Number(draft.salaryMin) > Number(draft.salaryMax) && (
              <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
                {t("jobs.salaryOrder")}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Pill tone="ghost" onClick={() => setEditing(false)}>
                {t("common.cancel")}
              </Pill>
              <Pill
                tone="brand"
                disabled={Number(draft.salaryMin) > Number(draft.salaryMax)}
                onClick={saveEdits}
              >
                {t("common.save")}
              </Pill>
            </div>
          </div>
        </div>
      )}

      <ReasonDialog
        open={rejecting}
        title={t("pending.rejectTitle")}
        body={t("pending.rejectBody")}
        reasons={OFFER_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("pending.reasonLabel")}
        noteLabel={t("pending.noteLabel")}
        notePlaceholder={t("pending.notePlaceholder")}
        confirmLabel={t("common.reject")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setRejecting(false)}
        onConfirm={reject}
      />

      <ConfirmDialog
        open={confirming}
        title={t("jobs.confirmDelete")}
        body={t("common.confirmDeleteBody")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
