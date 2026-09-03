"use client";

// Platform statistics — Improvement points 5 and 16.
//
// The client listed seven figures they could not find. Most of them were already
// computed in mock/admin.js and had no screen to appear on; the rest are new
// series over `registeredAt`. Everything here reads through one fetch so the
// panels can never disagree with each other about the same period.
//
// Each panel exports what it shows rather than the screen exporting one
// combined file: the numbers go into different reports, and a single CSV with
// seven unrelated tables in it is worse than seven files.

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChefHat,
  Download,
  Briefcase,
  BadgeCheck,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchStatistics } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { POSITION_BY_ID } from "@/mock/sectors";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import { MONTHS } from "@/mock/adminDashboard";
import { toCsv, downloadCsv } from "@/lib/csv";
import { AreaChart, BarChart } from "@/components/Charts";
import {
  BarList,
  PageHeader,
  Panel,
  Pill,
  SegmentedToggle,
  Stat,
  StatGrid,
  Toast,
} from "@/components/ui";

const RANGES = [7, 30, 90];

/** Download control that sits in a panel's header. */
function ExportButton({ label, onClick }) {
  return (
    <Pill tone="ghost" onClick={onClick}>
      <Download size={15} />
      {label}
    </Pill>
  );
}

export default function StatisticsPage() {
  const t = useT();
  const { pick, locale } = useLocale();

  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let live = true;
    fetchStatistics({ days }).then((res) => live && setData(res));
    return () => {
      live = false;
    };
  }, [days]);

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale),
    [locale]
  );

  /** Day labels are dense at 90 days, so only every nth one is drawn. */
  const dayLabels = (series) => {
    const every = series.length > 30 ? 10 : series.length > 7 ? 5 : 1;
    return series.map((p, i) => (i % every === 0 ? p.day.slice(5) : ""));
  };

  const exportCsv = (name, rows, columns) => {
    downloadCsv(name, toCsv(rows, columns));
    setToast(t("common.exported"));
  };

  if (!data) {
    return (
      <>
        <PageHeader title={t("stats.title")} />
        <div className="grid gap-5">
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </>
    );
  }

  const { candidates, employers, offers, registrations, market } = data;

  const positionRows = registrations.candidatesByPosition.map((r) => ({
    ...r,
    label: pick(POSITION_BY_ID[r.id]) || r.id,
  }));

  const typeRows = registrations.employersByType.map((r) => ({
    ...r,
    label: pick(ESTABLISHMENT_TYPES.find((e) => e.id === r.id)) || r.id,
  }));

  const cityRows = market.searchedCities.map((c) => ({
    ...c,
    label: pick(getCity(c.id)) || pick(c),
  }));

  const titleRows = market.searchedTitles.map((c) => ({ ...c, label: pick(c) }));

  return (
    <>
      <PageHeader
        title={t("stats.title")}
        subtitle={t("stats.subtitle")}
        action={
          <SegmentedToggle
            value={String(days)}
            onChange={(next) => setDays(Number(next))}
            options={RANGES.map((d) => ({ id: String(d), label: t("stats.lastDays", { n: d }) }))}
          />
        }
      />

      {/* Headline counters, so the series below have context */}
      <section className="mb-5">
        <StatGrid>
          <Stat icon={ChefHat} label={t("stats.totalCandidates")} value={nf.format(candidates.total)} />
          <Stat
            icon={Clock}
            tone="brand"
            label={t("stats.newToday")}
            value={nf.format(candidates.newToday)}
          />
          <Stat
            icon={BadgeCheck}
            label={t("stats.verifiedCandidates")}
            value={nf.format(candidates.verified)}
          />
          <Stat
            icon={Building2}
            label={t("stats.totalEmployers")}
            value={nf.format(employers.total)}
          />
          <Stat
            icon={Briefcase}
            label={t("stats.activeOffers")}
            value={nf.format(offers.active)}
          />
          <Stat
            icon={Clock}
            tone="amber"
            label={t("stats.pendingOffers")}
            value={nf.format(offers.pendingApproval)}
          />
          <Stat
            icon={Clock}
            tone="accent"
            label={t("stats.expiringSoon")}
            value={nf.format(offers.expiringSoon)}
          />
          <Stat
            icon={Wallet}
            label={t("stats.averageSalary")}
            value={`${nf.format(market.averageSalary)} MAD`}
          />
        </StatGrid>
      </section>

      {/* New candidates per day */}
      <Panel
        title={t("stats.candidatesPerDay")}
        action={
          <ExportButton
            label={t("common.export")}
            onClick={() =>
              exportCsv(`candidats-par-jour-${days}j`, registrations.candidatesPerDay, [
                { key: "day", label: t("stats.day") },
                { key: "count", label: t("stats.registrations") },
              ])
            }
          />
        }
      >
        <AreaChart
          points={registrations.candidatesPerDay.map((p) => p.count)}
          labels={dayLabels(registrations.candidatesPerDay)}
          legend={t("stats.candidatesPerDayLegend", { n: days })}
          max={Math.max(...registrations.candidatesPerDay.map((p) => p.count), 1)}
          color="#8B8BE8"
        />
      </Panel>

      {/* New employers per day and per month */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title={t("stats.employersPerDay")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv(`employeurs-par-jour-${days}j`, registrations.employersPerDay, [
                  { key: "day", label: t("stats.day") },
                  { key: "count", label: t("stats.registrations") },
                ])
              }
            />
          }
        >
          <BarChart
            points={registrations.employersPerDay.map((p) => p.count)}
            labels={dayLabels(registrations.employersPerDay)}
            legend={t("stats.employersPerDayLegend", { n: days })}
            max={Math.max(...registrations.employersPerDay.map((p) => p.count), 1)}
            color="#F08A82"
          />
        </Panel>

        <Panel
          title={t("stats.employersPerMonth")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv("employeurs-par-mois", registrations.employersPerMonth, [
                  { key: "month", label: t("stats.month") },
                  { key: "count", label: t("stats.registrations") },
                ])
              }
            />
          }
        >
          <BarChart
            points={registrations.employersPerMonth.map((p) => p.count)}
            labels={MONTHS.map((m) => pick(m))}
            legend={t("stats.employersPerMonthLegend")}
            max={Math.max(...registrations.employersPerMonth.map((p) => p.count), 1)}
            color="#679046"
          />
        </Panel>
      </div>

      {/* Breakdowns */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title={t("stats.candidatesByPosition")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv("candidats-par-poste", positionRows, [
                  { key: "label", label: t("stats.position") },
                  { key: "count", label: t("stats.candidates") },
                ])
              }
            />
          }
        >
          <BarList items={positionRows} valueLabel={t("stats.candidatesUnit")} />
        </Panel>

        <Panel
          title={t("stats.employersByType")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv("etablissements-par-type", typeRows, [
                  { key: "label", label: t("stats.type") },
                  { key: "count", label: t("stats.establishments") },
                ])
              }
            />
          }
        >
          <BarList items={typeRows} valueLabel={t("stats.establishmentsUnit")} />
        </Panel>
      </div>

      {/* Labour-market data */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title={t("stats.searchedTitles")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv("postes-les-plus-recherches", titleRows, [
                  { key: "label", label: t("stats.position") },
                  { key: "count", label: t("stats.searches") },
                ])
              }
            />
          }
        >
          <BarList items={titleRows} valueLabel={t("stats.searchesUnit")} />
        </Panel>

        <Panel
          title={t("stats.searchedCities")}
          action={
            <ExportButton
              label={t("common.export")}
              onClick={() =>
                exportCsv("villes-les-plus-recherchees", cityRows, [
                  { key: "label", label: t("common.city") },
                  { key: "count", label: t("stats.searches") },
                ])
              }
            />
          }
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={15} />
            {t("stats.searchedCitiesHint")}
          </span>
          <BarList items={cityRows} valueLabel={t("stats.searchesUnit")} />
        </Panel>
      </div>

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
