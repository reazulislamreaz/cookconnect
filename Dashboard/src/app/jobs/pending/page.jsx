"use client";

// Offers awaiting approval — Improvement points 3 and 8.
//
// The client's complaint was that this screen did not exist: offers marked
// pending were counted in the statistics and badged on the detail page, but no
// list gathered them, and the only action on an offer anywhere in the dashboard
// was Delete. Nothing could be approved.
//
// Sorted oldest first, because the queue is worked from the back: the offer that
// has been waiting nine days is the one the employer is chasing. That is also
// why "waiting" is a column rather than a derived detail on the offer page.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Eye, X } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { approveOffer, fetchPendingOffers, rejectOffer } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { OFFER_REJECTION_REASONS } from "@/mock/jobOptions";
import {
  Badge,
  DataTable,
  EmptyState,
  IconAction,
  PageHeader,
  Panel,
  Pill,
  ReasonDialog,
  TableSkeleton,
  Td,
  Toast,
} from "@/components/ui";

export default function PendingOffersPage() {
  const t = useT();
  const { pick, locale } = useLocale();

  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let live = true;
    fetchPendingOffers({ q }).then((res) => live && setRows(res));
    return () => {
      live = false;
    };
  }, [q]);

  const search = (next) => {
    setQ(next);
    setPage(1);
  };

  /** Both decisions take the row out of the queue, which is the point of a queue. */
  const drop = (id) => setRows((list) => list.filter((r) => r.id !== id));

  const approve = async (job) => {
    setBusy(true);
    drop(job.id);
    await approveOffer(job.id);
    setBusy(false);
    setToast(t("pending.approvedToast", { title: pick(job, "title") }));
  };

  const reject = async (reason) => {
    const job = rejecting;
    setRejecting(null);
    setBusy(true);
    drop(job.id);
    await rejectOffer(job.id, reason);
    setBusy(false);
    setToast(t("pending.rejectedToast", { title: pick(job, "title") }));
  };

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale);

  return (
    <>
      <PageHeader
        title={t("pending.title")}
        subtitle={rows ? t("pending.subtitle", { n: rows.length }) : undefined}
        backHref="/jobs"
      />

      <Panel>
        {!rows ? (
          <TableSkeleton />
        ) : rows.length === 0 && !q ? (
          <EmptyState title={t("pending.empty")} hint={t("pending.emptyHint")} />
        ) : (
          <DataTable
            searchable
            searchValue={q}
            onSearch={search}
            searchPlaceholder={t("pending.searchPlaceholder")}
            columns={[
              { key: "title", label: t("jobs.jobTitle") },
              { key: "employer", label: t("jobs.restaurantName") },
              { key: "salary", label: t("pending.salary") },
              { key: "waiting", label: t("pending.waiting") },
              { key: "action", label: t("common.actions"), align: "end" },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("common.noResults")}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              page: t("common.page"),
              of: t("common.of"),
            }}
            renderRow={(job) => (
              <tr key={job.id} className="transition hover:bg-gray-50">
                <Td>
                  <Link
                    href={`/jobs/offer/${job.id}`}
                    className="font-medium text-gray-800 hover:text-brand"
                  >
                    {pick(job, "title")}
                  </Link>
                  <span className="block text-sm text-gray-500">
                    {pick(getCity(job.city)) || job.city}
                  </span>
                </Td>
                <Td>
                  <span className="flex items-center gap-3">
                    <Image
                      src={job.employer?.logo}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    <span className="truncate text-gray-700">{job.employerName}</span>
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-gray-700">
                  {nf.format(job.salaryMin)}–{nf.format(job.salaryMax)} {job.currency}
                </Td>
                <Td>
                  {/* Amber past a week: the point of the column is to make a
                      neglected offer visible without reading the date. */}
                  <Badge tone={job.waitingDays >= 7 ? "amber" : "gray"}>
                    {t("pending.waitingDays", { n: job.waitingDays })}
                  </Badge>
                </Td>
                <Td align="end">
                  <span className="inline-flex items-center gap-1.5">
                    <IconAction
                      icon={Eye}
                      label={t("pending.review")}
                      href={`/jobs/offer/${job.id}`}
                    />
                    <Pill tone="green" disabled={busy} onClick={() => approve(job)}>
                      <Check size={15} />
                      {t("common.approve")}
                    </Pill>
                    <Pill tone="red" disabled={busy} onClick={() => setRejecting(job)}>
                      <X size={15} />
                      {t("common.reject")}
                    </Pill>
                  </span>
                </Td>
              </tr>
            )}
          />
        )}
      </Panel>

      <ReasonDialog
        open={Boolean(rejecting)}
        title={t("pending.rejectTitle")}
        body={t("pending.rejectBody")}
        reasons={OFFER_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("pending.reasonLabel")}
        noteLabel={t("pending.noteLabel")}
        notePlaceholder={t("pending.notePlaceholder")}
        confirmLabel={t("common.reject")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setRejecting(null)}
        onConfirm={reject}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
