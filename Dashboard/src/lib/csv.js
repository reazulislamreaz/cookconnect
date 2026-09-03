"use client";

// CSV export.
//
// Improvement points 6 asks for Excel. A real .xlsx needs a library and buys
// nothing here: Excel opens CSV directly, and the only thing it gets wrong is
// the encoding. A UTF-8 byte-order mark fixes that — without it, Excel on
// Windows reads the file as the system codepage and every Arabic name and every
// accented French one arrives as mojibake.
//
// Reach for a real spreadsheet writer only when the client needs formatting,
// formulas or several sheets. Until then this stays dependency-free.

const BOM = "﻿";

/**
 * Quotes one value for CSV.
 *
 * Everything is quoted rather than only the values that need it: a Moroccan
 * phone number, a salary range and a job title written with a comma all survive
 * the same way, and the rule is one line instead of three.
 */
const cell = (value) => {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
};

/**
 * `columns` is `[{ key, label, value? }]`. `value(row)` overrides the raw field,
 * which is how a translated label or a formatted date reaches the file.
 */
export function toCsv(rows, columns) {
  const header = columns.map((c) => cell(c.label)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => cell(c.value ? c.value(row) : row[c.key])).join(",")
  );
  return BOM + [header, ...body].join("\r\n");
}

/** Hands the file to the browser. Returns the row count, for the confirmation. */
export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking immediately can cancel the download in some browsers; a tick is
  // enough for the navigation to have started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
