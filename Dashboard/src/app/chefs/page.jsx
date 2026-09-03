"use client";

// Chef Manage — the cook directory, split by verification state.
//
// The Verified / Unverified toggle is the screen's primary control: an admin
// opens this page to work through the unverified queue, so the two states are
// separate lists rather than a status column to be eyeballed.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Database, Eye } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchChefs } from "@/mock/adminApi";
import { EXPERIENCE_LEVELS } from "@/mock/jobOptions";
import {
  DataTable,
  IconAction,
  PageHeader,
  Panel,
  Pill,
  SegmentedToggle,
  Stars,
  TableSkeleton,
  Td,
} from "@/components/ui";

export default function ChefManagePage() {
  const t = useT();
  const { pick } = useLocale();

  const [tab, setTab] = useState("verified");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    let live = true;
    // Guard against an out-of-order response overwriting a newer one: the mock
    // layer has a delay, so a slow request for "verified" can land after a fast
    // one for "unverified" and repopulate the table with the wrong list.
    fetchChefs({ verified: tab, q }).then((res) => live && setData(res));
    return () => {
      live = false;
    };
  }, [tab, q]);

  // Any change of filter invalidates the current page number.
  const changeTab = useCallback((next) => {
    setTab(next);
    setPage(1);
  }, []);

  const search = useCallback((next) => {
    setQ(next);
    setPage(1);
  }, []);

  const experienceLabel = (id) => pick(EXPERIENCE_LEVELS.find((e) => e.id === id)) || id;

  return (
    <>
      <PageHeader
        title={t("chefs.title")}
        action={
          <Pill tone="brand" href="/chefs/database">
            <Database size={15} />
            {t("db.openDatabase")}
          </Pill>
        }
      />

      <Panel
        action={
          <SegmentedToggle
            value={tab}
            onChange={changeTab}
            options={[
              { id: "verified", label: t("chefs.verified"), count: data?.verifiedCount },
              { id: "unverified", label: t("chefs.unverified"), count: data?.unverifiedCount },
              // A profile the admin took down has to stay findable, or the
              // restore action the client asked for has nothing to act on.
              { id: "deactivated", label: t("chefs.deactivatedTab"), count: data?.deactivatedCount },
              { id: "deleted", label: t("chefs.deletedTab"), count: data?.deletedCount },
            ]}
          />
        }
      >
        {!data ? (
          <TableSkeleton />
        ) : (
          <DataTable
            searchable
            searchValue={q}
            onSearch={search}
            searchPlaceholder={t("chefs.searchPlaceholder")}
            columns={[
              { key: "ref", label: t("common.sno") },
              { key: "name", label: t("chefs.chefName") },
              { key: "rating", label: t("chefs.rating") },
              { key: "restaurants", label: t("chefs.totalRestaurant") },
              { key: "view", label: t("common.viewDetails"), align: "end" },
            ]}
            rows={data.rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("chefs.empty")}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              page: t("common.page"),
              of: t("common.of"),
            }}
            renderRow={(c) => (
              <tr key={c.id} className="transition hover:bg-gray-50">
                <Td className="text-gray-500">{c.ref}</Td>
                <Td>
                  <span className="flex items-center gap-3">
                    <Image
                      src={c.photo}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-800">{c.name}</span>
                      <span className="block truncate text-sm text-gray-500">
                        {t("chefs.yearsEx", { n: experienceLabel(c.experience) })}
                      </span>
                    </span>
                  </span>
                </Td>
                <Td>
                  <Stars rating={c.rating} />
                </Td>
                <Td className="text-gray-700">
                  {String(c.totalRestaurants).padStart(2, "0")}
                </Td>
                <Td align="end">
                  <IconAction
                    icon={Eye}
                    label={t("common.viewDetails")}
                    href={`/chefs/${c.id}`}
                  />
                </Td>
              </tr>
            )}
          />
        )}
      </Panel>
    </>
  );
}
