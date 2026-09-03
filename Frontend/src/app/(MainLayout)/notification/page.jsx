"use client";

// Notifications list. Change Requirements section 12: profile/offer approvals,
// reminder nudges and feedback replies all appear in-app as well as by email.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck, Briefcase, Send, Clock, Bell, MessageSquare,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchNotifications } from "@/mock/api";
import EmptyState from "@/app/component/ui/EmptyState";

const ICONS = {
  approval: { icon: BadgeCheck, tone: "bg-brand-soft text-brand" },
  job: { icon: Briefcase, tone: "bg-accent-tint text-accent" },
  application: { icon: Send, tone: "bg-blue-50 text-blue-600" },
  offer: { icon: Clock, tone: "bg-amber-50 text-amber-600" },
  reminder: { icon: Bell, tone: "bg-gray-100 text-gray-500" },
  feedback: { icon: MessageSquare, tone: "bg-purple-50 text-purple-600" },
};

export default function NotificationsPage() {
  const t = useT();
  const { pick } = useLocale();
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetchNotifications().then(setItems);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-poppins">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("notifications.title")}
      </h1>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title={t("notifications.empty")} />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const { icon: Icon, tone } = ICONS[n.type] || ICONS.reminder;
            return (
              <li key={n.id}>
                <Link
                  href={`/notification/${n.id}`}
                  className={`flex gap-3 rounded-xl border p-4 transition hover:shadow-sm ${
                    n.read ? "border-gray-200 bg-white" : "border-brand/30 bg-brand-soft/40"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900">
                        {pick(n, "title")}
                      </p>
                      {!n.read && (
                        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                          {t("notifications.new")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{pick(n, "body")}</p>
                    <p className="mt-1.5 text-xs text-gray-400">{n.date}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
