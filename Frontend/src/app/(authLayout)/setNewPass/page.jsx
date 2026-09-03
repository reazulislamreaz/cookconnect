"use client";

// New password screen, enforcing the same policy as sign-up
// (Change Requirements 05).

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import AuthShell from "@/app/component/auth/AuthShell";
import PasswordField from "@/app/component/auth/PasswordField";
import { useT } from "@/i18n/LocaleProvider";
import { isPasswordValid } from "@/lib/validation";

export default function SetNewPassPage() {
  const t = useT();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = useWatch({ control, name: "password", defaultValue: "" });

  if (done) {
    return (
      <AuthShell title={t("auth.resetTitle")}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-brand-soft p-4">
            <Check size={28} className="text-brand" strokeWidth={3} />
          </span>
          <p className="text-sm text-gray-600">{t("profile.savedOk")}</p>
          <button
            onClick={() => router.push("/signIn")}
            className="mt-6 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("auth.signIn")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.resetTitle")} subtitle={t("auth.resetSubtitle")}>
      <form onSubmit={handleSubmit(() => setDone(true))} className="space-y-4">
        <PasswordField
          label={t("auth.password")}
          showRules
          value={password}
          error={errors.password?.message}
          registration={register("password", {
            required: t("common.required"),
            validate: (v) => isPasswordValid(v) || t("auth.passwordRules"),
          })}
        />

        <PasswordField
          label={t("auth.confirmPassword")}
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword", {
            required: t("common.required"),
            validate: (v) => v === password || t("auth.passwordMismatch"),
          })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {t("common.save")}
        </button>
      </form>
    </AuthShell>
  );
}
