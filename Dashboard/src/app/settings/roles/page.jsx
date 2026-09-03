"use client";

// Administrators and permissions — Improvement points 18.
//
// The main account keeps every right and cannot have them revoked — that is the
// point of a super-admin, and a UI that offers to strip it is offering to lock
// everyone out.
//
// The toggles used to be cosmetic: `setGrants` plus a success toast, with no
// write anywhere, so a reload discarded every change after the UI had confirmed
// it. They persist now, and each change is logged.

import { useCallback, useEffect, useState } from "react";
import { Plus, ShieldCheck, UserCog } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  createAdmin,
  fetchAdmins,
  setAdminDisabled,
  setAdminPermissions,
} from "@/mock/adminApi";
import { PERMISSIONS } from "@/mock/admin";
import { useAdminSession } from "@/lib/adminSession";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  TableSkeleton,
  Toast,
} from "@/components/ui";

export default function RolesPage() {
  const t = useT();
  const { pick } = useLocale();
  const { admin: signedIn } = useAdminSession();

  const [admins, setAdmins] = useState(null);
  const [busy, setBusy] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", permissions: [] });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => fetchAdmins().then(setAdmins), []);

  useEffect(() => {
    load();
  }, [load]);

  const mayManage = admins?.find((a) => a.id === signedIn?.id)?.permissions.includes("manage-admins");

  const toggle = async (target, permissionId) => {
    const next = target.permissions.includes(permissionId)
      ? target.permissions.filter((p) => p !== permissionId)
      : [...target.permissions, permissionId];

    setBusy(target.id);
    const res = await setAdminPermissions(target.id, next);
    setBusy(null);

    if (!res.ok) {
      setToast(t("roles.forbidden"));
      return;
    }
    await load();
    setToast(t("roles.granted"));
  };

  const toggleDisabled = async (target) => {
    setBusy(target.id);
    await setAdminDisabled(target.id, !target.disabled);
    setBusy(null);
    await load();
    setToast(target.disabled ? t("roles.enabledToast") : t("roles.disabledToast"));
  };

  const submit = async () => {
    setError("");

    if (!draft.name.trim() || !draft.email.trim()) {
      setError(t("roles.errorRequired"));
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email.trim())) {
      setError(t("roles.errorEmail"));
      return;
    }

    const res = await createAdmin(draft);
    if (!res.ok) {
      setError(t(res.reason === "email-taken" ? "roles.errorTaken" : "roles.forbidden"));
      return;
    }

    setCreating(false);
    setDraft({ name: "", email: "", permissions: [] });
    await load();
    setToast(t("roles.createdToast", { name: res.admin.name }));
  };

  const toggleDraftPermission = (id) =>
    setDraft((d) => ({
      ...d,
      permissions: d.permissions.includes(id)
        ? d.permissions.filter((p) => p !== id)
        : [...d.permissions, id],
    }));

  return (
    <>
      <PageHeader
        title={t("roles.title")}
        subtitle={t("roles.subtitle")}
        action={
          mayManage && (
            <Pill tone="brand" onClick={() => setCreating(true)}>
              <Plus size={15} />
              {t("roles.create")}
            </Pill>
          )
        }
      />

      {!admins ? (
        <Panel>
          <TableSkeleton rows={3} />
        </Panel>
      ) : admins.length === 0 ? (
        <EmptyState title={t("common.noResults")} />
      ) : (
        <ul className="space-y-4">
          {admins.map((a) => {
            const isSuper = a.role === "super";

            return (
              <li key={a.id}>
                <Panel className={a.disabled ? "opacity-60" : ""}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          isSuper ? "bg-brand-soft text-brand" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isSuper ? <ShieldCheck size={20} /> : <UserCog size={20} />}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.disabled && <Badge tone="red">{t("roles.disabled")}</Badge>}
                        <Badge tone={isSuper ? "green" : "gray"}>
                          {isSuper ? t("roles.superAdmin") : t("roles.subAdmin")}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">
                        {t("roles.lastActive")}: {a.lastActive}
                      </span>
                      {mayManage && !isSuper && (
                        <Pill tone="ghost" disabled={busy === a.id} onClick={() => toggleDisabled(a)}>
                          {a.disabled ? t("roles.enable") : t("roles.disable")}
                        </Pill>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("roles.permissions")}
                    </p>

                    {isSuper ? (
                      <p className="text-sm text-gray-600">{t("roles.fullControl")}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {PERMISSIONS.map((p) => {
                          const on = a.permissions.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              // Only an account holding manage-admins may change
                              // who can do what.
                              disabled={!mayManage || busy === a.id}
                              onClick={() => toggle(a, p.id)}
                              aria-pressed={on}
                              className={`rounded-full border px-4 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                on
                                  ? "border-brand bg-brand-soft font-medium text-brand-dark"
                                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pick(p)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      {/* Create an internal account */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setCreating(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("roles.create")}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-base font-semibold text-gray-900">{t("roles.create")}</h3>
            <p className="mt-1 text-sm text-gray-600">{t("roles.createHint")}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("roles.name")}
                </span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("common.email")}
                </span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t("roles.permissions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {PERMISSIONS.map((p) => {
                const on = draft.permissions.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleDraftPermission(p.id)}
                    aria-pressed={on}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      on
                        ? "border-brand bg-brand-soft font-medium text-brand-dark"
                        : "border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pick(p)}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-gray-500">{t("roles.leastPrivilege")}</p>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Pill tone="ghost" onClick={() => setCreating(false)}>
                {t("common.cancel")}
              </Pill>
              <Pill tone="brand" onClick={submit}>
                {t("roles.create")}
              </Pill>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
