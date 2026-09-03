"use client";

// The full approval queue behind "View All" on the dashboard.
//
// Same table as the dashboard preview, without the five-row cap and with the
// pagination the full list needs.

import { useEffect, useState } from "react";
import Image from "next/image";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchRequests } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import {
  DataTable,
  PageHeader,
  Panel,
  Pill,
  TableSkeleton,
  Td,
} from "@/components/ui";

export default function RestaurantRequestsPage() {
  const t = useT();
  const { pick } = useLocale();

  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests().then(setRows);
  }, []);

  return (
    <>
      <PageHeader
        title={t("dashboard.restaurantRequest")}
        subtitle={rows ? t("dashboard.requestsSubtitle", { n: rows.length }) : undefined}
        backHref="/restaurants"
      />

      <Panel>
        {!rows ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={[
              { key: "ref", label: t("common.sno") },
              { key: "name", label: t("dashboard.restaurantName") },
              { key: "email", label: t("common.email") },
              { key: "phone", label: t("dashboard.contactNumber") },
              { key: "city", label: t("dashboard.location") },
              { key: "action", label: t("common.actions"), align: "end" },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("dashboard.noRequests")}
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
                  <span className="flex items-center gap-3">
                    <Image
                      src={r.logo}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="font-medium text-gray-800">{r.name}</span>
                  </span>
                </Td>
                <Td className="text-gray-500">{r.email}</Td>
                <Td className="text-gray-500">{r.phone}</Td>
                <Td className="text-gray-500">{pick(getCity(r.city)) || r.city}</Td>
                <Td align="end">
                  <Pill tone="green" href={`/restaurants/requests/${r.id}`}>
                    {t("common.details")}
                  </Pill>
                </Td>
              </tr>
            )}
          />
        )}
      </Panel>
    </>
  );
}
