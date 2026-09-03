"use client";

// Job Management — one row per restaurant, drilling into that restaurant's
// offers.
//
// The Figma groups offers by establishment rather than listing all 30 flat,
// which matches how the work is actually done: an admin reviews a restaurant's
// posting behaviour, not an undifferentiated stream of offers.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchJobBoards } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import {
  DataTable,
  IconAction,
  PageHeader,
  Panel,
  TableSkeleton,
  Td,
} from "@/components/ui";

const pad = (n) => String(n).padStart(2, "0");

export default function JobManagementPage() {
  const t = useT();
  const { pick } = useLocale();

  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let live = true;
    fetchJobBoards({ q }).then((res) => live && setRows(res));
    return () => {
      live = false;
    };
  }, [q]);

  const search = (next) => {
    setQ(next);
    setPage(1);
  };

  return (
    <>
      <PageHeader title={t("jobs.title")} />

      <Panel>
        {!rows ? (
          <TableSkeleton />
        ) : (
          <DataTable
            searchable
            searchValue={q}
            onSearch={search}
            searchPlaceholder={t("jobs.searchPlaceholder")}
            columns={[
              { key: "ref", label: t("common.sno") },
              { key: "name", label: t("jobs.restaurantName") },
              { key: "running", label: t("jobs.runningJob") },
              { key: "applied", label: t("jobs.totalApplied") },
              { key: "action", label: t("common.actions"), align: "end" },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("jobs.empty")}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              page: t("common.page"),
              of: t("common.of"),
            }}
            renderRow={(r) => (
              <tr key={r.id} className="transition hover:bg-gray-50">
                <Td className="text-gray-500">{r.ref}</Td>
                <Td>
                  <Link href={`/jobs/${r.id}`} className="group flex items-center gap-3">
                    <Image
                      src={r.logo}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-800 group-hover:text-brand">
                        {r.name}
                      </span>
                      <span className="block truncate text-sm text-gray-500">
                        {pick(getCity(r.city)) || r.city}
                      </span>
                    </span>
                  </Link>
                </Td>
                <Td className="text-gray-700">{pad(r.runningJobs)}</Td>
                <Td className="text-gray-700">{pad(r.totalApplied)}</Td>
                <Td align="end">
                  <IconAction icon={Eye} label={t("common.view")} href={`/jobs/${r.id}`} />
                </Td>
              </tr>
            )}
          />
        )}
      </Panel>
    </>
  );
}
