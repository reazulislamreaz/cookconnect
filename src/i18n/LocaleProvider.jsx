"use client";

// Language support — Change Requirements section 02.
//   - French is the default on first load
//   - Moroccan Arabic (Darija), not Modern Standard Arabic, is the second locale
//   - dynamic content (job offers written in French) must also render in Darija,
//     which `pick()` handles by reading the `ar` field off the data object
//
// Deliberately dependency-free: locale lives in a context and in localStorage,
// with no URL segment, so no route restructuring is needed. Swapping this for
// next-intl later only touches this folder.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import fr from "./dictionaries/fr.json";
import ar from "./dictionaries/ar.json";

const DICTIONARIES = { fr, ar };
const STORAGE_KEY = "nkhedmou.locale";
export const DEFAULT_LOCALE = "fr";

export const LOCALES = [
  { id: "fr", label: "Français", short: "FR", dir: "ltr" },
  { id: "ar", label: "الدارجة", short: "AR", dir: "rtl" },
];

const LocaleContext = createContext(null);

/** Walks "a.b.c" through the dictionary; returns undefined if any hop is missing. */
const lookup = (dict, key) =>
  key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);

export function LocaleProvider({ children }) {
  // Always start on the default so server and client agree on the first paint;
  // the stored preference is applied in the effect below, after hydration.
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && DICTIONARIES[stored]) setLocaleState(stored);
    setReady(true);
  }, []);

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale === "ar" ? "ar-MA" : "fr";
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((next) => {
    if (!DICTIONARIES[next]) return;
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key, vars) => {
      // Fall back to French, then to the key itself, so a missing Darija string
      // shows readable French rather than an empty slot.
      const raw = lookup(DICTIONARIES[locale], key) ?? lookup(DICTIONARIES.fr, key) ?? key;
      if (typeof raw !== "string" || !vars) return raw;
      return Object.entries(vars).reduce(
        (out, [k, v]) => out.replace(new RegExp(`{${k}}`, "g"), String(v)),
        raw
      );
    },
    [locale]
  );

  /**
   * Reads the active language off a data object that carries its own
   * translations, e.g. `{ fr: "Chef de cuisine", ar: "شيف دكوزينة" }`.
   * This is how offers and job titles stay translated (Change Req 02).
   */
  const pick = useCallback(
    (obj, field = "") => {
      if (!obj) return "";
      if (field) {
        const arKey = `${field}Ar`;
        return locale === "ar" ? obj[arKey] || obj[field] : obj[field];
      }
      return locale === "ar" ? obj.ar || obj.fr : obj.fr;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, pick, dir, isRTL: dir === "rtl", ready }),
    [locale, setLocale, t, pick, dir, ready]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/** Shorthand for the common case: `const t = useT()`. */
export function useT() {
  return useLocale().t;
}
