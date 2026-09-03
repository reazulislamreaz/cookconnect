"use client";

// Restaurant Manage — the establishment directory.
//
// The Action column blocks an establishment. Blocking is confirmed rather than
// fired on the first click: it hides every offer the restaurant has published,
// and it sits one row away from the harmless "view" affordances.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Ban, CircleCheck } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { fetchRestaurants, setRestaurantBlocked } from "@/mock/adminApi";
import {
  Badge,
  ConfirmDialog,
  DataTable,
  IconAction,
  PageHeader,
  Panel,
  Pill,
  TableSkeleton,
  Td,
  Toast,
} from "@/components/ui";

export default function RestaurantManagePage() {
  const t = useT();

  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pendingBlock, setPendingBlock] = useState(null);
  const [toast, setToast] = useState("");

  const load = useCallback((query) => {
    let live = true;
    fetchRestaurants({ q: query }).then((res) => live && setRows(res));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => load(q), [q, load]);

  const search = (next) => {
    setQ(next);
    setPage(1);
  };

  const toggleBlock = async (row) => {
    const next = !row.blocked;
    setPendingBlock(null);
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, blocked: next } : r)));
    await setRestaurantBlocked(row.id, next);
    setToast(next ? t("restaurants.blockedToast") : t("restaurants.unblockedToast"));
  };

  return (
    <>
      <PageHeader
        title={t("restaurants.title")}
        action={
          <Pill tone="brand" href="/restaurants/requests">
            {t("dashboard.restaurantRequest")}
          </Pill>
        }
      />

      <Panel>
        {!rows ? (
          <TableSkeleton />
        ) : (
          <DataTable
            searchable
            searchValue={q}
            onSearch={search}
            searchPlaceholder={t("restaurants.searchPlaceholder")}
            columns={[
              { key: "ref", label: t("common.sno") },
              { key: "name", label: t("restaurants.restaurantName") },
              { key: "total", label: t("restaurants.totalJobPost") },
              { key: "available", label: t("restaurants.availableJobPost") },
              { key: "action", label: t("common.actions"), align: "end" },
            ]}
            rows={rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("restaurants.empty")}
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
                  <Link href={`/restaurants/${r.id}`} className="flex items-center gap-3 group">
                    <Image
                      src={r.logo}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-800 group-hover:text-brand">
                          {r.name}
                        </span>
                        {r.blocked && <Badge tone="red">{t("restaurants.blocked")}</Badge>}
                      </span>
                      <span className="block truncate text-sm text-gray-500">{r.address}</span>
                    </span>
                  </Link>
                </Td>
                <Td className="text-gray-700">{r.totalJobPosts}</Td>
                <Td>
                  <Link
                    href={`/jobs/${r.id}`}
                    className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
                  >
                    {r.availableJobPosts > 0 ? r.websiteHost : t("jobs.noOffers")}
                  </Link>
                </Td>
                <Td align="end">
                  <IconAction
                    icon={r.blocked ? CircleCheck : Ban}
                    tone={r.blocked ? "brand" : "danger"}
                    label={r.blocked ? t("restaurants.unblock") : t("restaurants.block")}
                    // Unblocking is harmless and restores the previous state, so
                    // only blocking asks for confirmation.
                    onClick={() => (r.blocked ? toggleBlock(r) : setPendingBlock(r))}
                  />
                </Td>
              </tr>
            )}
          />
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingBlock)}
        title={t("restaurants.confirmBlock")}
        body={t("restaurants.confirmBlockBody")}
        confirmLabel={t("restaurants.block")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setPendingBlock(null)}
        onConfirm={() => toggleBlock(pendingBlock)}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
