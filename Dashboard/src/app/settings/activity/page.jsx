"use client";

// Activity log — admin actions, employer access to candidate contact details,
// and photo uploads, filterable by kind.
//
// `detail` is a system-generated label so it carries its own translations;
// `actor` and `target` are names and stay as authored, except administrator
// role names, which do translate.

import { useEffect, useState } from "react";
import { Image as ImageIcon, ScrollText, ShieldCheck, UserSearch } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchActivity } from "@/mock/adminApi";
import {
  Badge,
  DataTable,
  PageHeader,
  Panel,
  SegmentedToggle,
  TableSkeleton,
  Td,
} from "@/components/ui";

const TYPE_META = {
  admin: { tone: "blue", icon: ShieldCheck },
  "contact-access": { tone: "amber", icon: UserSearch },
  photo: { tone: "green", icon: ImageIcon },
};

export default function ActivityPage() {
  const t = useT();
  const { pick } = useLocale();

  const [type, setType] = useState("all");
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let live = true;
    fetchActivity({ type }).then((res) => live && setRows(res));
    return () => {
      live = false;
    };
  }, [type]);

  const changeType = (next) => {
    setType(next);
    setPage(1);
  };

  const typeLabel = (id) =>
    id === "admin"
      ? t("activity.adminActions")
      : id === "contact-access"
        ? t("activity.contactAccess")
        : t("activity.photoUploads");

  return (
    <>
      <PageHeader title={t("activity.title")} subtitle={t("activity.subtitle")} />

      <Panel
        action={
          <SegmentedToggle
            value={type}
            onChange={changeType}
            options={[
              { id: "all", label: t("activity.all") },
              { id: "admin", label: t("activity.adminActions") },
              { id: "contact-access", label: t("activity.contactAccess") },
              { id: "photo", label: t("activity.photoUploads") },
            ]}
          />
        }
      >
        {!rows ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={[
              { key: "type", label: t("common.actions") },
              { key: "actor", label: t("activity.actor") },
              { key: "detail", label: t("activity.detail") },
              { key: "target", label: t("activity.target") },
              { key: "when", label: t("activity.when"), align: "end" },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("activity.empty")}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              page: t("common.page"),
              of: t("common.of"),
            }}
            renderRow={(log) => {
              const meta = TYPE_META[log.type] || { tone: "gray", icon: ScrollText };
              const Icon = meta.icon;
              return (
                <tr key={log.id} className="transition hover:bg-gray-50">
                  <Td>
                    <Badge tone={meta.tone}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon size={12} />
                        {typeLabel(log.type)}
                      </span>
                    </Badge>
                  </Td>
                  {/* Administrator role names translate; people and places do not. */}
                  <Td className="font-medium text-gray-800">{pick(log, "actor")}</Td>
                  <Td className="text-gray-600">{pick(log, "detail")}</Td>
                  <Td className="text-gray-500">{log.target}</Td>
                  <Td align="end" className="whitespace-nowrap text-gray-500">
                    {log.at}
                  </Td>
                </tr>
              );
            }}
          />
        )}
      </Panel>
    </>
  );
}
