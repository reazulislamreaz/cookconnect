"use client";

// Admin overview — the "Admin Dashboard" Figma screen.
//
// Four KPI cards, the two growth charts side by side, and the queue of
// establishments waiting to be approved.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ChefHat, Briefcase, BadgeCheck, ClipboardCheck } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchDashboard } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { AreaChart, BarChart } from "@/components/Charts";
import {
  DataTable,
  KpiCard,
  Panel,
  PageHeader,
  Pill,
  TableSkeleton,
  Td,
} from "@/components/ui";

/** How many requests fit on the dashboard before "View All" takes over. */
const PREVIEW_ROWS = 5;

export default function DashboardPage() {
  const t = useT();
  const { pick, locale } = useLocale();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard().then(setData);
  }, []);

  const monthLabels = (data?.months || []).map((m) => pick(m));
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale);

  return (
    <>
      <PageHeader title={t("dashboard.title")} />

      {/* Headline counters */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={ChefHat}
          tone="blue"
          href="/chefs"
          value={data ? nf.format(data.totals.cooks) : "—"}
          label={t("dashboard.totalCooks")}
        />
        <KpiCard
          icon={Building2}
          tone="green"
          href="/restaurants"
          value={data ? nf.format(data.totals.restaurants) : "—"}
          label={t("dashboard.totalRestaurants")}
        />
        <KpiCard
          icon={BadgeCheck}
          tone="orange"
          href="/chefs"
          value={data ? nf.format(data.totals.verifiedProfiles) : "—"}
          label={t("dashboard.totalVerified")}
        />
        <KpiCard
          icon={Briefcase}
          tone="amber"
          href="/jobs"
          value={data ? nf.format(data.totals.availableJobs) : "—"}
          label={t("dashboard.availableJobs")}
        />
        {/* The queue the client could not find. It sits on the dashboard because
            an approval backlog nobody sees is an employer waiting for nothing. */}
        <KpiCard
          icon={ClipboardCheck}
          tone="orange"
          href="/jobs/pending"
          value={data ? nf.format(data.pendingOffers) : "—"}
          label={t("pending.queueCard")}
        />
      </section>

      {/* Growth */}
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title={t("dashboard.cookGrowth")}>
          {data ? (
            <AreaChart
              points={data.cookGrowth.points}
              labels={monthLabels}
              legend={`${t("dashboard.newCooks")} — ${data.cookGrowth.year}`}
              color="#8B8BE8"
            />
          ) : (
            <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
          )}
        </Panel>

        <Panel title={t("dashboard.restaurantGrowth")}>
          {data ? (
            <BarChart
              points={data.restaurantGrowth.points}
              labels={monthLabels}
              legend={`${t("dashboard.newRestaurants")} — ${data.restaurantGrowth.year}`}
              color="#F08A82"
            />
          ) : (
            <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
          )}
        </Panel>
      </section>

      {/* Approval queue */}
      <section className="mt-5">
        <Panel
          title={t("dashboard.restaurantRequest")}
          action={
            data?.requests.length > PREVIEW_ROWS ? (
              <Link
                href="/restaurants/requests"
                className="text-sm font-medium text-gray-600 underline underline-offset-2 transition hover:text-gray-900"
              >
                {t("common.viewAll")}
              </Link>
            ) : null
          }
        >
          {!data ? (
            <TableSkeleton rows={5} />
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
              rows={data.requests.slice(0, PREVIEW_ROWS)}
              pageSize={PREVIEW_ROWS}
              emptyLabel={t("dashboard.noRequests")}
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
      </section>
    </>
  );
}
