"use client";

// Administrator sign-in.
//
// Rendered outside AdminShell (see components/Providers.jsx) — showing the
// admin navigation to someone who is signed out would make no sense.
//
// The demo accounts are listed on the page on purpose: this is a mock, and an
// unlabelled login screen with no way in is a dead end for whoever opens the
// app next.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Loader2 } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { useAdminSession } from "@/lib/adminSession";
import { fetchDemoAccounts } from "@/mock/adminApi";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const { login } = useAdminSession();

  const [accounts, setAccounts] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDemoAccounts().then((list) => {
      setAccounts(list);
      // Only prefill an empty field: an admin who has already typed should not
      // have it overwritten when the list arrives.
      setEmail((current) => current || list[0]?.email || "");
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const admin = await login(email);
    if (!admin) {
      setBusy(false);
      setError(t("auth.disabled"));
      return;
    }
    router.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-poppins">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <ChefHat size={22} />
          </span>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            {t("brand.name")}
          </span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900">{t("auth.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("auth.subtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("auth.email")}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              {t("auth.password")}
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {t("auth.signIn")}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("auth.demoTitle")}
          </p>
          <ul className="mt-2 space-y-1.5">
            {accounts.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setEmail(a.email)}
                  className="text-start text-sm text-gray-700 transition hover:text-brand"
                >
                  <span className="font-medium">{a.email}</span>
                  <span className="block text-xs text-gray-500">{a.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">{t("auth.demoHint")}</p>
        </div>
      </div>
    </main>
  );
}
