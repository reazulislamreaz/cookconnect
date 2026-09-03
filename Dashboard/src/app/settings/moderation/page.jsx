"use client";

// Photo moderation — approve or remove the photos users upload.
//
// Reported offers sit on the same screen because they are the same job:
// deciding whether user-submitted content stays on the platform.

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Ban, Check, X } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { decidePhoto, fetchModeration, setCandidateBlocked } from "@/mock/adminApi";
import { PHOTO_REJECTION_REASONS } from "@/mock/jobOptions";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  ReasonDialog,
  TableSkeleton,
  Toast,
} from "@/components/ui";

export default function ModerationPage() {
  const t = useT();
  const { pick } = useLocale();

  const [data, setData] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [blocking, setBlocking] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchModeration().then(setData);
  }, []);

  const drop = (id) =>
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));

  const approve = async (photo) => {
    drop(photo.id);
    await decidePhoto(photo.id, "approved");
    setToast(t("moderation.approvedToast"));
  };

  // Improvement points 4: a refusal without a reason leaves the candidate
  // guessing at what to change, so the reason is required and it is what the
  // candidate is told.
  const reject = async (reason) => {
    const photo = rejecting;
    setRejecting(null);
    drop(photo.id);
    await decidePhoto(photo.id, "removed", reason);
    setToast(t("moderation.removedToast"));
  };

  const block = async (reason) => {
    const photo = blocking;
    setBlocking(null);
    await setCandidateBlocked(photo.candidateId, true, reason);
    setToast(t("moderation.blockedToast", { name: photo.candidate?.name || photo.candidateId }));
  };

  return (
    <>
      <PageHeader
        title={t("moderation.title")}
        subtitle={data ? t("moderation.subtitle", { n: data.photos.length }) : undefined}
      />

      <Panel>
        {!data ? (
          <TableSkeleton rows={3} />
        ) : data.photos.length === 0 ? (
          <EmptyState title={t("moderation.empty")} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.photos.map((p) => (
              <li
                key={p.id}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <Image
                  src={p.url}
                  alt=""
                  width={400}
                  height={240}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {p.candidate?.name || p.candidateId}
                    </span>
                    <Badge tone={p.type === "profile" ? "blue" : "gray"}>
                      {p.type === "profile"
                        ? t("moderation.profilePhoto")
                        : t("moderation.foodPhoto")}
                    </Badge>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">{p.uploadedAt}</p>

                  {p.reports > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertTriangle size={13} />
                      {t("moderation.reports", { n: p.reports })}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill tone="green" onClick={() => approve(p)}>
                      <Check size={15} />
                      {t("moderation.approve")}
                    </Pill>
                    <Pill tone="red" onClick={() => setRejecting(p)}>
                      <X size={15} />
                      {t("moderation.remove")}
                    </Pill>
                    {/* Improvement points 16: repeat abusive uploads are an
                        account problem, not a photo problem. */}
                    {p.reports > 0 && (
                      <Pill tone="ghost" onClick={() => setBlocking(p)}>
                        <Ban size={15} />
                        {t("moderation.blockUser")}
                      </Pill>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {data?.reported.length > 0 && (
        <div className="mt-5">
          <Panel title={t("moderation.reportedOffers")}>
            <ul className="space-y-3">
              {data.reported.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {r.job ? pick(r.job, "title") : r.jobId}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {r.job?.employerName} · {r.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone="red">{t("moderation.reports", { n: r.reports })}</Badge>
                    {r.job && (
                      <Pill tone="blue" href={`/jobs/offer/${r.jobId}`}>
                        {t("common.view")}
                      </Pill>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <ReasonDialog
        open={Boolean(rejecting)}
        title={t("moderation.rejectTitle")}
        body={t("moderation.rejectBody")}
        reasons={PHOTO_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("moderation.reasonLabel")}
        noteLabel={t("moderation.noteLabel")}
        notePlaceholder={t("moderation.notePlaceholder")}
        confirmLabel={t("moderation.remove")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setRejecting(null)}
        onConfirm={reject}
      />

      <ReasonDialog
        open={Boolean(blocking)}
        title={t("moderation.blockTitle")}
        body={t("moderation.blockBody")}
        reasons={PHOTO_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("moderation.blockReasonLabel")}
        noteLabel={t("moderation.noteLabel")}
        notePlaceholder={t("moderation.notePlaceholder")}
        confirmLabel={t("moderation.blockUser")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setBlocking(null)}
        onConfirm={block}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
