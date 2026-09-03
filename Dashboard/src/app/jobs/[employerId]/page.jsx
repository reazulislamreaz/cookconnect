"use client";

// One restaurant's offers — the middle level of Job Management.
//
// Deleting is the destructive action on this screen, so it is confirmed and the
// row is removed from local state immediately afterwards rather than waiting
// for a refetch the mock layer would only answer with the same list.

import { use, useCallback, useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  approveOffer,
  deactivateOffer,
  deleteJobOffer,
  extendOffer,
  fetchEmployerJobs,
  rejectOffer,
  republishOffer,
} from "@/mock/adminApi";
import { OFFER_STATUSES } from "@/mock/jobs";
import { OFFER_REJECTION_REASONS } from "@/mock/jobOptions";
import {
  ConfirmDialog,
  DataTable,
  DateDialog,
  EmptyState,
  IconAction,
  OfferStatusBadge,
  PageHeader,
  Panel,
  Pill,
  ReasonDialog,
  RowActions,
  SegmentedToggle,
  TableSkeleton,
  Td,
  Toast,
} from "@/components/ui";

const pad = (n) => String(n).padStart(2, "0");

export default function EmployerJobsPage({ params }) {
  const { employerId } = use(params);

  const t = useT();
  const { pick } = useLocale();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [extending, setExtending] = useState(null);
  const [toast, setToast] = useState("");

  const reload = useCallback(
    () =>
      fetchEmployerJobs(employerId, { status }).then((res) => {
        setData(res);
        setLoading(false);
      }),
    [employerId, status]
  );

  useEffect(() => {
    let live = true;
    fetchEmployerJobs(employerId, { status }).then((res) => {
      if (!live) return;
      setData(res);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [employerId, status]);

  const changeStatus = (next) => {
    setStatus(next);
    setPage(1);
  };

  const remove = async () => {
    const job = pendingDelete;
    setPendingDelete(null);
    await deleteJobOffer(job.id);
    await reload();
    setToast(t("jobs.deletedToast"));
  };

  /** Every action reloads: the counts on the filter bar move with the decision. */
  const run = async (action, message) => {
    await action();
    await reload();
    setToast(message);
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t("jobs.details")} backHref="/jobs" />
        <Panel>
          <TableSkeleton />
        </Panel>
      </>
    );
  }

  if (!data) {
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

  return (
    <>
      <PageHeader
        title={t("jobs.offersOf", { name: data.employer.name })}
        backHref="/jobs"
        action={
          <Pill tone="brand" href={`/restaurants/${data.employer.id}`}>
            {t("restaurants.details")}
          </Pill>
        }
      />

      <Panel
        action={
          <SegmentedToggle
            value={status}
            onChange={changeStatus}
            options={[
              { id: "all", label: t("common.all"), count: data.total },
              ...OFFER_STATUSES.map((s) => ({
                id: s,
                label: t(`jobs.${s}`),
                count: data.counts[s],
              })),
            ]}
          />
        }
      >
        <DataTable
          columns={[
            { key: "ref", label: t("common.sno") },
            { key: "title", label: t("jobs.jobTitle") },
            { key: "deadline", label: t("jobs.deadline") },
            { key: "applied", label: t("jobs.totalApplied") },
            { key: "action", label: t("common.actions"), align: "end" },
          ]}
          rows={data.jobs}
          page={page}
          onPageChange={setPage}
          emptyLabel={t("jobs.noOffers")}
          labels={{
            previous: t("common.previous"),
            next: t("common.next"),
            page: t("common.page"),
            of: t("common.of"),
          }}
          renderRow={(job) => (
            <tr key={job.id} className="transition hover:bg-gray-50">
              <Td className="text-gray-500">{job.ref}</Td>
              <Td>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-800">{pick(job, "title")}</span>
                  <OfferStatusBadge job={job} />
                </span>
              </Td>
              {/* Orange, per the design — the deadline is the field an admin scans for. */}
              <Td className="whitespace-nowrap font-medium text-accent">{job.expiresAt}</Td>
              <Td className="text-gray-700">{pad(job.applicants)}</Td>
              <Td align="end">
                <span className="inline-flex items-center gap-1">
                  <IconAction
                    icon={Eye}
                    label={t("common.view")}
                    href={`/jobs/offer/${job.id}`}
                  />
                  {/* The seven actions from Improvement points 15. Only the ones
                      that make sense for this offer's state are offered: there is
                      no approving an offer that is already live, and no extending
                      one that was refused. */}
                  <RowActions
                    actions={[
                      { label: t("jobs.edit"), href: `/jobs/offer/${job.id}` },
                      job.status === "pending" && {
                        label: t("common.approve"),
                        onClick: () =>
                          run(() => approveOffer(job.id), t("jobs.approvedToast")),
                      },
                      job.status === "pending" && {
                        label: t("common.reject"),
                        tone: "danger",
                        onClick: () => setRejecting(job),
                      },
                      job.status === "active" && {
                        label: t("jobs.deactivate"),
                        onClick: () =>
                          run(() => deactivateOffer(job.id), t("jobs.deactivatedToast")),
                      },
                      (job.status === "active" || job.expired) && {
                        label: t("jobs.extend"),
                        onClick: () => setExtending(job),
                      },
                      (job.expired || job.status === "closed") && {
                        label: t("jobs.republish"),
                        onClick: () =>
                          run(() => republishOffer(job.id), t("jobs.republishedToast")),
                      },
                      {
                        label: t("common.delete"),
                        tone: "danger",
                        onClick: () => setPendingDelete(job),
                      },
                    ]}
                  />
                </span>
              </Td>
            </tr>
          )}
        />
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
        onConfirm={(reason) => {
          const job = rejecting;
          setRejecting(null);
          run(() => rejectOffer(job.id, reason), t("jobs.rejectedToast"));
        }}
      />

      <DateDialog
        open={Boolean(extending)}
        title={t("jobs.extendTitle")}
        body={t("jobs.extendBody")}
        label={t("jobs.newDeadline")}
        min={extending?.expiresAt}
        defaultValue={extending?.expiresAt}
        confirmLabel={t("jobs.extend")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setExtending(null)}
        onConfirm={(until) => {
          const job = extending;
          setExtending(null);
          run(() => extendOffer(job.id, until), t("jobs.extendedToast", { date: until }));
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("jobs.confirmDelete")}
        body={t("common.confirmDeleteBody")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
