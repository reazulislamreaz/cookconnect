"use client";

// The CV database — Improvement points 6.
//
// Distinct from /chefs, which is a moderation queue: five columns split into
// verified and unverified, built for working through an approval backlog. This
// screen is the recruiting view — every candidate, every field, filtered the way
// a search is actually run, and exportable.
//
// Contact columns are opt-in and permission-gated, and exporting them is logged
// as contact access: a spreadsheet of thirty phone numbers is the largest
// disclosure this dashboard can make.

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Download, Eye, FileText, ShieldAlert } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchCandidateDatabase, logCandidateExport } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { toCsv, downloadCsv } from "@/lib/csv";
import {
  Badge,
  DataTable,
  IconAction,
  PageHeader,
  Panel,
  Pill,
  Select,
  TableSkeleton,
  Td,
  Toast,
} from "@/components/ui";

const EMPTY_FILTERS = {
  q: "",
  sector: "",
  position: "",
  city: "",
  experience: "",
  availability: "",
  verified: "all",
  minCompletion: 0,
};

export default function CandidateDatabasePage() {
  const t = useT();
  const { pick, locale } = useLocale();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [includeContact, setIncludeContact] = useState(false);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let live = true;
    fetchCandidateDatabase({ ...filters, includeContact }).then(
      (res) => live && setData(res)
    );
    return () => {
      live = false;
    };
  }, [filters, includeContact]);

  const set = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale),
    [locale]
  );

  const label = (list, id) => pick(list?.find((o) => o.id === id)) || id;

  const exportRows = async () => {
    const columns = [
      { key: "name", label: t("db.name") },
      { key: "title", label: t("db.position"), value: (r) => pick(r, "title") },
      { key: "sector", label: t("db.sector"), value: (r) => label(data.options.sectors, r.sectorId) },
      { key: "city", label: t("common.city"), value: (r) => pick(getCity(r.city)) || r.city },
      { key: "experience", label: t("db.experience"), value: (r) => label(data.options.experience, r.experience) },
      { key: "availability", label: t("db.availability"), value: (r) => label(data.options.availability, r.availability) },
      { key: "expectedSalary", label: t("db.expectedSalary") },
      { key: "completion", label: t("db.completion"), value: (r) => `${r.completion}%` },
      { key: "verified", label: t("db.verified"), value: (r) => (r.verified ? t("db.yes") : t("db.no")) },
      { key: "hasCv", label: t("db.cv"), value: (r) => (r.hasCv ? t("db.yes") : t("db.no")) },
      { key: "applications", label: t("jobs.applications") },
      { key: "registeredAt", label: t("db.registeredAt") },
    ];

    if (data.contactIncluded) {
      columns.push(
        { key: "email", label: t("common.email") },
        { key: "phone", label: t("common.phone") }
      );
    }

    downloadCsv(`base-cv-${data.rows.length}`, toCsv(data.rows, columns));
    await logCandidateExport({
      rows: data.rows.length,
      filters,
      withContact: data.contactIncluded,
    });
    setToast(t("db.exportedToast", { n: data.rows.length }));
  };

  const positions = data
    ? data.options.positions.filter((p) => !filters.sector || p.sectorId === filters.sector)
    : [];

  return (
    <>
      <PageHeader
        title={t("db.title")}
        subtitle={data ? t("db.subtitle", { n: data.rows.length, total: data.total }) : undefined}
        backHref="/chefs"
        action={
          <Pill tone="brand" disabled={!data || data.rows.length === 0} onClick={exportRows}>
            <Download size={15} />
            {t("common.export")}
          </Pill>
        }
      />

      <Panel>
        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          <Select
            label={t("db.sector")}
            value={filters.sector}
            allLabel={t("common.all")}
            options={(data?.options.sectors || []).map((s) => ({ id: s.id, label: pick(s) }))}
            onChange={(v) => {
              // A position from another sector cannot survive the switch, or the
              // table silently returns nothing and the filters look broken.
              setFilters((f) => ({ ...f, sector: v, position: "" }));
              setPage(1);
            }}
          />
          <Select
            label={t("db.position")}
            value={filters.position}
            allLabel={t("common.all")}
            options={positions.map((p) => ({ id: p.id, label: pick(p) }))}
            onChange={set("position")}
          />
          <Select
            label={t("common.city")}
            value={filters.city}
            allLabel={t("common.all")}
            options={(data?.options.cities || []).map((c) => ({ id: c.id, label: pick(c) }))}
            onChange={set("city")}
          />
          <Select
            label={t("db.experience")}
            value={filters.experience}
            allLabel={t("common.all")}
            options={(data?.options.experience || []).map((e) => ({ id: e.id, label: pick(e) }))}
            onChange={set("experience")}
          />
          <Select
            label={t("db.availability")}
            value={filters.availability}
            allLabel={t("common.all")}
            options={(data?.options.availability || []).map((a) => ({ id: a.id, label: pick(a) }))}
            onChange={set("availability")}
          />
          <Select
            label={t("db.verified")}
            value={filters.verified}
            options={[
              { id: "all", label: t("common.all") },
              { id: "verified", label: t("chefs.verified") },
              { id: "unverified", label: t("chefs.unverified") },
            ]}
            onChange={set("verified")}
          />
          <Select
            label={t("db.completion")}
            value={String(filters.minCompletion)}
            options={[0, 50, 80, 100].map((n) => ({
              id: String(n),
              label: n === 0 ? t("common.all") : `≥ ${n}%`,
            }))}
            onChange={(v) => set("minCompletion")(Number(v))}
          />
        </div>

        {/* Contact disclosure */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
          <label className="flex items-center gap-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeContact}
              disabled={data ? !data.canExportContact : true}
              onChange={(e) => setIncludeContact(e.target.checked)}
              className="h-4 w-4 accent-brand disabled:opacity-40"
            />
            {t("db.includeContact")}
          </label>

          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldAlert size={14} />
            {data && !data.canExportContact ? t("db.contactDenied") : t("db.contactLogged")}
          </span>
        </div>

        {!data ? (
          <TableSkeleton />
        ) : (
          <DataTable
            searchable
            searchValue={filters.q}
            onSearch={set("q")}
            searchPlaceholder={t("db.searchPlaceholder")}
            columns={[
              { key: "name", label: t("db.name") },
              { key: "city", label: t("common.city") },
              { key: "experience", label: t("db.experience") },
              { key: "availability", label: t("db.availability") },
              { key: "completion", label: t("db.completion") },
              ...(data.contactIncluded ? [{ key: "phone", label: t("common.phone") }] : []),
              { key: "registeredAt", label: t("db.registeredAt") },
              { key: "action", label: t("common.actions"), align: "end" },
            ]}
            rows={data.rows}
            page={page}
            onPageChange={setPage}
            emptyLabel={t("db.empty")}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              page: t("common.page"),
              of: t("common.of"),
            }}
            renderRow={(c) => (
              <tr key={c.id} className="transition hover:bg-gray-50">
                <Td>
                  <span className="flex items-center gap-3">
                    <Image
                      src={c.photo}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium text-gray-800">{c.name}</span>
                        {c.verified && <BadgeCheck size={14} className="shrink-0 text-brand" />}
                        {c.hasCv && <FileText size={13} className="shrink-0 text-gray-400" />}
                      </span>
                      <span className="block truncate text-sm text-gray-500">
                        {pick(c, "title")}
                      </span>
                    </span>
                  </span>
                </Td>
                <Td className="text-gray-600">{pick(getCity(c.city)) || c.city}</Td>
                <Td className="text-gray-600">{label(data.options.experience, c.experience)}</Td>
                <Td className="text-gray-600">
                  {label(data.options.availability, c.availability)}
                </Td>
                <Td>
                  <Badge
                    tone={c.completion === 100 ? "green" : c.completion >= 70 ? "amber" : "gray"}
                  >
                    {nf.format(c.completion)}%
                  </Badge>
                </Td>
                {data.contactIncluded && (
                  <Td className="whitespace-nowrap text-gray-600">{c.phone}</Td>
                )}
                <Td className="whitespace-nowrap text-gray-500">{c.registeredAt}</Td>
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

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
