"use client";

// Notification outbox — Improvement points 17.
//
// The client asked that every approval and rejection reach the user in the
// platform and by email. Half of that is real: the in-app record exists. The
// email does not, because there is no mail provider until the backend is built
// (docs/backend, task 4.2).
//
// This screen exists so that gap is visible rather than assumed. Each row says
// which channel it actually went out on, and "queued" means queued.

import { useEffect, useState } from "react";
import { Building2, ChefHat, Mail, MonitorSmartphone } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchNotificationOutbox } from "@/mock/adminApi";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  SegmentedToggle,
  TableSkeleton,
} from "@/components/ui";

export default function NotificationsPage() {
  const t = useT();
  const { pick } = useLocale();

  const [rows, setRows] = useState(null);
  const [audience, setAudience] = useState("all");

  useEffect(() => {
    fetchNotificationOutbox().then(setRows);
  }, []);

  const visible = (rows || []).filter(
    (n) => audience === "all" || n.audience === audience || n.audience === "both"
  );

  return (
    <>
      <PageHeader title={t("outbox.title")} subtitle={t("outbox.subtitle")} />

      <Panel
        action={
          <SegmentedToggle
            value={audience}
            onChange={setAudience}
            options={[
              { id: "all", label: t("common.all"), count: rows?.length },
              { id: "candidate", label: t("feedback.candidate") },
              { id: "employer", label: t("feedback.employer") },
            ]}
          />
        }
      >
        {!rows ? (
          <TableSkeleton rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState title={t("outbox.empty")} hint={t("outbox.emptyHint")} />
        ) : (
          <ul className="space-y-3">
            {visible.map((n) => (
              <li key={n.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-gray-900">
                      {n.audience === "employer" ? (
                        <Building2 size={15} className="text-gray-400" />
                      ) : (
                        <ChefHat size={15} className="text-gray-400" />
                      )}
                      {pick(n, "title")}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("outbox.to", { name: n.to?.name || n.to?.id })}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm text-gray-400">{n.at}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-700">{pick(n, "body")}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="green">
                    <span className="inline-flex items-center gap-1.5">
                      <MonitorSmartphone size={12} />
                      {t("outbox.inApp")}
                    </span>
                  </Badge>
                  {/* Amber, not green: nothing has been sent. */}
                  <Badge tone="amber">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={12} />
                      {t("outbox.emailQueued")}
                    </span>
                  </Badge>
                  <span className="text-xs text-gray-400">{n.templateId}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
        {t("outbox.backendNote")}
      </p>
    </>
  );
}
