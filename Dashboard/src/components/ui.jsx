"use client";

// The dashboard's UI kit. One file, because every piece here is used only by
// the admin screens and splitting eleven ~20-line components across eleven
// files makes them harder to keep visually consistent, not easier.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";

/* ------------------------------------------------------------- headers */

/** Screen header with the back arrow every Figma sub-page carries. */
export function PageHeader({ title, subtitle, backHref, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="back"
            className="rounded-md p-1 text-gray-700 transition hover:bg-gray-100"
          >
            {/* Points "backwards", which is rightwards in Arabic. */}
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </Link>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Card wrapper for dashboard panels and table screens. */
export function Panel({ title, subtitle, action, children, className = "", padded = true }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white ${padded ? "p-5" : "p-5 pb-0"} ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <div>
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------- metrics */

const KPI_TONES = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
  orange: "bg-accent text-white",
  amber: "bg-amber-50 text-amber-500",
};

/** Headline metric with a tinted icon chip — the four cards across the top. */
export function KpiCard({ icon: Icon, tone = "blue", value, label, href }) {
  const body = (
    <>
      <span
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${KPI_TONES[tone]}`}
      >
        <Icon size={26} />
      </span>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </>
  );

  const cls =
    "block rounded-2xl border border-gray-200 bg-white p-5 text-center transition hover:border-gray-300 hover:shadow-sm";

  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Compact label / number tile for the secondary statistics screens. */
export function Stat({ label, value, tone = "default", icon: Icon }) {
  const tones = {
    default: "text-gray-900",
    brand: "text-brand",
    accent: "text-accent",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {Icon && <Icon size={17} className="mb-2 text-gray-400" />}
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs leading-snug text-gray-600">{label}</p>
    </div>
  );
}

export function StatGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

/* -------------------------------------------------------------- badges */

const BADGE_TONES = {
  green: "bg-brand-soft text-brand-dark",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * The badge for an offer's state, in one place because three screens show it and
 * a status that renders green on one of them and grey on another is a bug the
 * admin has to resolve by guessing.
 *
 * Expiry is derived, not stored: an offer whose deadline has passed reads as
 * expired whatever its stored status says, which is what `daysLeft` already
 * decides everywhere else.
 */
const OFFER_TONES = {
  active: "green",
  pending: "amber",
  rejected: "red",
  closed: "gray",
  expired: "gray",
};

export function OfferStatusBadge({ job }) {
  const t = useT();
  const status = job.status === "active" && job.expired ? "expired" : job.status;

  return <Badge tone={OFFER_TONES[status] || "gray"}>{t(`jobs.${status}`)}</Badge>;
}

/** Chip used for skills, specialties and permissions. */
export function Chip({ tone = "brand", children }) {
  const tones = {
    brand: "bg-brand-soft text-brand-dark",
    blue: "bg-blue-50 text-blue-600",
    accent: "bg-accent-tint text-accent-dark",
  };
  return (
    <span className={`rounded-full px-4 py-1.5 text-sm ${tones[tone]}`}>{children}</span>
  );
}

/* ------------------------------------------------------------- buttons */

const PILL_TONES = {
  green: "bg-emerald-500 text-white hover:bg-emerald-600",
  red: "bg-red-500 text-white hover:bg-red-600",
  blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  brand: "bg-brand text-white hover:bg-brand-dark",
  accent: "bg-accent text-white hover:bg-accent-dark",
  ghost: "border border-gray-300 text-gray-700 hover:bg-gray-50",
};

/** Filled pill — Details / Approve / Cancel / View. */
export function Pill({ tone = "green", onClick, href, children, type = "button", disabled }) {
  const cls = `inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${PILL_TONES[tone]}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

const ICON_TONES = {
  default: "text-gray-700 hover:bg-gray-100",
  danger: "text-red-500 hover:bg-red-50",
  brand: "text-brand hover:bg-brand-soft",
};

/** Bare icon button for the table Action columns. */
export function IconAction({ icon: Icon, label, onClick, href, tone = "default", disabled }) {
  const cls = `inline-flex items-center justify-center rounded-md p-1.5 transition disabled:opacity-40 ${ICON_TONES[tone]}`;
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        <Icon size={19} />
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cls}
    >
      <Icon size={19} />
    </button>
  );
}

/** Two-state pill switch — "Verified Chef / Unverified Chef". */
export function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              active ? "bg-brand text-white" : "border border-brand/40 text-brand hover:bg-brand-soft"
            }`}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span
                className={`ms-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  active ? "bg-white/20" : "bg-brand-soft"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Labelled dropdown for the filter bars.
 *
 * `options` is `[{ id, label }]`; `allLabel` supplies the "no filter" entry, so
 * a filter can always be cleared without a separate reset control next to it.
 */
export function Select({ label, value, onChange, options, allLabel }) {
  return (
    <label className="block min-w-[9rem] flex-1">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
      >
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* --------------------------------------------------------------- table */

/**
 * Scrollable data table with optional search and pagination.
 *
 * `columns` is `[{ key, label, align, className }]` and `renderRow(row, index)`
 * returns the cells. Pagination is built in because the fixtures run to 30
 * candidates — the Figma shows a single long list, but an admin table that
 * cannot be paged is unusable the moment the data is real.
 *
 * The wrapper scrolls horizontally on its own: admin tables are wide, and
 * without `overflow-x-auto` here the whole page would scroll sideways on
 * mobile instead of just the table.
 */
export function DataTable({
  columns,
  rows,
  renderRow,
  searchable,
  searchValue,
  onSearch,
  searchPlaceholder,
  emptyLabel,
  pageSize = 12,
  page,
  onPageChange,
  labels = {},
}) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page ?? 1), totalPages);
  const visible = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );

  return (
    <div>
      {searchable && (
        <div className="mb-4 relative max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 ps-9 pe-3 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`whitespace-nowrap px-4 py-3 text-base font-semibold text-gray-900 ${
                    c.align === "end" ? "text-end" : c.align === "center" ? "text-center" : "text-start"
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-sm text-gray-400"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => renderRow(row, (safePage - 1) * pageSize + i))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={onPageChange}
          labels={labels}
        />
      )}
    </div>
  );
}

export function Td({ children, className = "", align }) {
  const alignment =
    align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start";
  return <td className={`px-4 py-3 align-middle ${alignment} ${className}`}>{children}</td>;
}

export function Pagination({ page, totalPages, onChange, labels = {} }) {
  return (
    <nav className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft size={15} className="rtl:rotate-180" />
        {labels.previous || "Previous"}
      </button>

      <span className="text-sm text-gray-500">
        {labels.page || "Page"} {page} {labels.of || "of"} {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
      >
        {labels.next || "Next"}
        <ChevronRight size={15} className="rtl:rotate-180" />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------- detail screens */

/** Rating shown as "4.5 ★". */
export function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" aria-hidden>
        <path d="M12 2l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.3 6.1 20.5l1.2-6.7L2.5 9.1l6.6-.9L12 2z" />
      </svg>
    </span>
  );
}

/** Label / value row on the profile detail screens. */
export function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 last:border-0 sm:grid-cols-2 sm:gap-6">
      <dt className="font-medium text-gray-900">{label}</dt>
      <dd className="text-gray-600 sm:text-center">{children || "—"}</dd>
    </div>
  );
}

/** "Photos of your dishes" strip. */
export function PhotoStrip({ photos, emptyLabel }) {
  if (!photos?.length) return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={src}
          alt=""
          loading="lazy"
          className="h-24 w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------- overlays / feedback */

/**
 * Confirmation prompt for destructive row actions.
 *
 * Rendered inline rather than through window.confirm(): the native dialog
 * blocks the tab, cannot be translated and cannot be styled, and these tables
 * fire it constantly.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-hidden
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {body && <p className="mt-2 text-sm text-gray-600">{body}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Pill tone="ghost" onClick={onCancel}>
            {cancelLabel}
          </Pill>
          <Pill tone="red" onClick={onConfirm}>
            {confirmLabel}
          </Pill>
        </div>
      </div>
    </div>
  );
}

/**
 * Refusal dialog: pick a predefined reason, optionally write one.
 *
 * Improvement points 4 and 15 are the same complaint about two different
 * screens — a bare "Reject" tells the user nothing they can act on. Predefined
 * reasons keep the wording consistent and translatable; the note is there for
 * the case the list does not cover, and is required when "other" is chosen so
 * the escape hatch cannot be used to send an empty explanation.
 *
 * `onConfirm` receives the chosen reason with `note` attached.
 */
export function ReasonDialog({
  open,
  title,
  body,
  reasons,
  reasonLabel,
  noteLabel,
  notePlaceholder,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const [chosen, setChosen] = useState(null);
  const [note, setNote] = useState("");

  if (!open) return null;

  const needsNote = chosen?.id === "other";
  const ready = Boolean(chosen) && (!needsNote || note.trim().length > 0);

  const close = () => {
    setChosen(null);
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-hidden
        tabIndex={-1}
        onClick={() => {
          close();
          onCancel();
        }}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {body && <p className="mt-2 text-sm text-gray-600">{body}</p>}

        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {reasonLabel}
          </legend>
          <div className="space-y-1.5">
            {reasons.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm transition ${
                  chosen?.id === r.id
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="rejection-reason"
                  checked={chosen?.id === r.id}
                  onChange={() => setChosen(r)}
                  className="mt-0.5 accent-brand"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {noteLabel}
          </span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={notePlaceholder}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Pill
            tone="ghost"
            onClick={() => {
              close();
              onCancel();
            }}
          >
            {cancelLabel}
          </Pill>
          <Pill
            tone="red"
            disabled={!ready}
            onClick={() => {
              onConfirm({ ...chosen, note: note.trim() });
              close();
            }}
          >
            {confirmLabel}
          </Pill>
        </div>
      </div>
    </div>
  );
}

/**
 * Asks for a single date — the "extend exceptionally" case.
 *
 * `min` keeps the picker from offering a deadline in the past, which is the one
 * value that would silently expire the offer the admin is trying to save.
 */
export function DateDialog({
  open,
  title,
  body,
  label,
  min,
  defaultValue,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue || "");

  // The dialog is mounted once per screen and reused for every row, so the field
  // has to follow whichever offer opened it.
  const [seeded, setSeeded] = useState(defaultValue);
  if (open && defaultValue !== seeded) {
    setSeeded(defaultValue);
    setValue(defaultValue || "");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-hidden
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {body && <p className="mt-2 text-sm text-gray-600">{body}</p>}

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-gray-500">{label}</span>
          <input
            type="date"
            value={value}
            min={min}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Pill tone="ghost" onClick={onCancel}>
            {cancelLabel}
          </Pill>
          <Pill tone="brand" disabled={!value} onClick={() => onConfirm(value)}>
            {confirmLabel}
          </Pill>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation toast for actions that mutate mock state.
 *
 * Without it, approving a restaurant makes the row silently disappear and the
 * admin has no signal that anything happened.
 */
export function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-lg"
    >
      {message}
      <button
        onClick={onDismiss}
        aria-label="close"
        className="text-lg leading-none text-white/60 transition hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

/** Skeleton rows shown while a mock fetch is in flight. */
export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center">
      <p className="font-medium text-gray-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Row overflow menu, for actions that do not warrant their own icon. */
export function RowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter(Boolean);
  if (!visible.length) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="actions"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-start shadow-lg">
            {visible.map((a) => {
              const cls = `block w-full px-4 py-2 text-start text-sm transition hover:bg-gray-50 ${
                a.tone === "danger" ? "text-red-600" : "text-gray-700"
              }`;

              // An action that navigates has to be a link, or it is invisible to
              // middle-click, to "open in new tab", and to a screen reader
              // announcing the menu.
              return a.href ? (
                <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className={cls}>
                  {a.label}
                </Link>
              ) : (
                <button
                  key={a.label}
                  onClick={() => {
                    setOpen(false);
                    a.onClick?.();
                  }}
                  className={cls}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** Horizontal bar list for the "most searched" panels. */
export function BarList({ items, valueLabel }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-gray-700">{item.label}</span>
            <span className="shrink-0 text-xs text-gray-500">
              {item.count.toLocaleString()} {valueLabel}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
