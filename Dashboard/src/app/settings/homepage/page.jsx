"use client";

// Homepage — Improvement points 1 and 2.
//
// The client asked twice for this: set the homepage background from an uploaded
// image or keep the blank one, and they could not find the section that does it.
// There was no section — the dashboard had no content-editing surface at all.
//
// The upload is validated before it is stored, not after: type, weight and
// dimensions. A hero image that is 800px wide will look torn on a desktop
// header, and the admin should learn that while choosing the file rather than
// from the live site.

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Info, Monitor, Smartphone, Trash2, Upload } from "lucide-react";

import { useLocale, useT, LOCALES } from "@/i18n/LocaleProvider";
import {
  BANNER_RULES,
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettings,
  saveSiteSettings,
} from "@/mock/adminApi";
import { PageHeader, Panel, Pill, SegmentedToggle, Toast } from "@/components/ui";

/** Reads an image file into a data URL plus its natural dimensions. */
const readImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("unreadable"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("unreadable"));
      img.onload = () =>
        resolve({ dataUrl: reader.result, width: img.naturalWidth, height: img.naturalHeight });
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/** The homepage hero as the visitor sees it, at whichever width is selected. */
function HeroPreview({ settings, locale, width }) {
  const phone = width === "mobile";
  const text = (field) => settings[field]?.[locale] || settings[field]?.fr || "";

  return (
    <div
      className={`mx-auto overflow-hidden rounded-xl border border-gray-200 ${
        phone ? "max-w-[320px]" : "w-full"
      }`}
    >
      <div
        className="relative flex flex-col items-center justify-center gap-3 px-6 text-center"
        style={{
          minHeight: phone ? 260 : 300,
          backgroundImage:
            settings.background === "image" && settings.backgroundImage
              ? `url(${settings.backgroundImage})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: settings.background === "image" ? undefined : "#F0F4EC",
        }}
      >
        {/* Without a scrim, light photography leaves white text unreadable —
            the same overlay the public hero uses over its image. */}
        {settings.background === "image" && settings.backgroundImage && (
          <span className="absolute inset-0 bg-black/45" />
        )}

        <h3
          className={`relative text-balance font-bold leading-snug ${
            phone ? "text-lg" : "text-2xl"
          } ${settings.background === "image" ? "text-white" : "text-gray-900"}`}
        >
          {text("headline")}
        </h3>
        <p
          className={`relative text-sm ${
            settings.background === "image" ? "text-white/90" : "text-gray-600"
          }`}
        >
          {text("subheadline")}
        </p>
        <span className="relative mt-1 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white">
          {text("ctaLabel")}
        </span>
      </div>
    </div>
  );
}

export default function HomepageSettingsPage() {
  const t = useT();
  const { locale } = useLocale();

  const fileInput = useRef(null);
  const [settings, setSettings] = useState(null);
  const [preview, setPreview] = useState("desktop");
  const [editing, setEditing] = useState(locale);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  const setText = (field, value) =>
    setSettings((s) => ({ ...s, [field]: { ...s[field], [editing]: value } }));

  const choose = async (event) => {
    const file = event.target.files?.[0];
    // Clear immediately: picking the same file twice must fire onChange again.
    event.target.value = "";
    if (!file) return;

    setError("");

    if (!BANNER_RULES.types.includes(file.type)) {
      setError(t("homepage.errorType"));
      return;
    }
    if (file.size > BANNER_RULES.maxBytes) {
      setError(
        t("homepage.errorSize", {
          max: Math.round(BANNER_RULES.maxBytes / 1024 / 1024),
          actual: (file.size / 1024 / 1024).toFixed(1),
        })
      );
      return;
    }

    try {
      const { dataUrl, width, height } = await readImage(file);

      if (width < BANNER_RULES.minWidth || height < BANNER_RULES.minHeight) {
        setError(
          t("homepage.errorDimensions", {
            min: `${BANNER_RULES.minWidth}×${BANNER_RULES.minHeight}`,
            actual: `${width}×${height}`,
          })
        );
        return;
      }

      setSettings((s) => ({
        ...s,
        background: "image",
        backgroundImage: dataUrl,
        imageName: file.name,
      }));
    } catch {
      setError(t("homepage.errorUnreadable"));
    }
  };

  const clearImage = () =>
    setSettings((s) => ({ ...s, background: "blank", backgroundImage: null, imageName: "" }));

  const save = async () => {
    setBusy(true);
    setError("");
    const res = await saveSiteSettings(settings);
    setBusy(false);

    if (!res.ok) {
      setError(t("homepage.errorStorage"));
      return;
    }
    setToast(t("homepage.savedToast"));
  };

  const reset = () => {
    setSettings({ ...DEFAULT_SITE_SETTINGS });
    setError("");
  };

  if (!settings) {
    return (
      <>
        <PageHeader title={t("homepage.title")} />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </>
    );
  }

  const hasImage = Boolean(settings.backgroundImage);

  return (
    <>
      <PageHeader
        title={t("homepage.title")}
        subtitle={t("homepage.subtitle")}
        action={
          <span className="flex flex-wrap gap-2">
            <Pill tone="ghost" onClick={reset}>
              {t("homepage.reset")}
            </Pill>
            <Pill tone="brand" disabled={busy} onClick={save}>
              {t("common.save")}
            </Pill>
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Controls */}
        <div className="space-y-5">
          <Panel title={t("homepage.background")}>
            <SegmentedToggle
              value={settings.background}
              onChange={(next) =>
                next === "blank"
                  ? clearImage()
                  : setSettings((s) => ({ ...s, background: "image" }))
              }
              options={[
                { id: "blank", label: t("homepage.blank") },
                { id: "image", label: t("homepage.image") },
              ]}
            />

            {settings.background === "image" && (
              <div className="mt-4">
                <input
                  ref={fileInput}
                  type="file"
                  accept={BANNER_RULES.types.join(",")}
                  onChange={choose}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone="brand" onClick={() => fileInput.current?.click()}>
                    <Upload size={15} />
                    {hasImage ? t("homepage.replace") : t("homepage.upload")}
                  </Pill>

                  {hasImage && (
                    <>
                      <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
                        <ImageIcon size={15} className="shrink-0 text-gray-400" />
                        <span className="truncate">{settings.imageName}</span>
                      </span>
                      <Pill tone="ghost" onClick={clearImage}>
                        <Trash2 size={15} />
                        {t("common.delete")}
                      </Pill>
                    </>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {t("homepage.rules", {
                    formats: "JPG, PNG, WebP",
                    max: Math.round(BANNER_RULES.maxBytes / 1024 / 1024),
                    min: `${BANNER_RULES.minWidth}×${BANNER_RULES.minHeight}`,
                  })}
                </p>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}
          </Panel>

          <Panel
            title={t("homepage.content")}
            action={
              <SegmentedToggle
                value={editing}
                onChange={setEditing}
                options={LOCALES.map((l) => ({ id: l.id, label: l.short }))}
              />
            }
          >
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("homepage.headline")}
                </span>
                <input
                  value={settings.headline[editing] || ""}
                  onChange={(e) => setText("headline", e.target.value)}
                  dir={editing === "ar" ? "rtl" : "ltr"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("homepage.subheadline")}
                </span>
                <textarea
                  rows={2}
                  value={settings.subheadline[editing] || ""}
                  onChange={(e) => setText("subheadline", e.target.value)}
                  dir={editing === "ar" ? "rtl" : "ltr"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("homepage.cta")}
                </span>
                <input
                  value={settings.ctaLabel[editing] || ""}
                  onChange={(e) => setText("ctaLabel", e.target.value)}
                  dir={editing === "ar" ? "rtl" : "ltr"}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              {t("homepage.frontendNote")}
            </p>
          </Panel>
        </div>

        {/* Preview */}
        <Panel
          title={t("homepage.preview")}
          action={
            <SegmentedToggle
              value={preview}
              onChange={setPreview}
              options={[
                { id: "desktop", label: t("homepage.desktop") },
                { id: "mobile", label: t("homepage.mobile") },
              ]}
            />
          }
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
            {preview === "desktop" ? <Monitor size={14} /> : <Smartphone size={14} />}
            {t("homepage.previewHint", {
              lang: LOCALES.find((l) => l.id === editing)?.label || editing,
            })}
          </span>
          <HeroPreview settings={settings} locale={editing} width={preview} />
        </Panel>
      </div>

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
