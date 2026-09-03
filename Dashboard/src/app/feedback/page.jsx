"use client";

// User feedback — Improvement points 19.
//
// This used to allow exactly one reply per message: `reply` was a string, and
// once it was set the compose box was replaced by the reply text with no way to
// follow up or correct it. The client asked for the conversation to stay
// accessible, so it is a thread now.
//
// The note under the box has always promised the user would be notified. Since
// A3 that is true — in the platform. The email is queued until there is a mail
// provider to send it, and the outbox says so rather than implying it left.

import { useCallback, useEffect, useState } from "react";
import { MessageSquareReply, Send, Star } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { fetchFeedback, replyToFeedback } from "@/mock/adminApi";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  SegmentedToggle,
  Select,
  TableSkeleton,
  Toast,
} from "@/components/ui";

function Rating({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < value ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </span>
  );
}

export default function FeedbackPage() {
  const t = useT();

  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(
    () => fetchFeedback({ q, filter, role }).then(setData),
    [q, filter, role]
  );

  useEffect(() => {
    let live = true;
    fetchFeedback({ q, filter, role }).then((res) => live && setData(res));
    return () => {
      live = false;
    };
  }, [q, filter, role]);

  const send = async (id) => {
    const text = draft.trim();
    if (!text) return;

    setBusy(true);
    await replyToFeedback(id, text);
    await load();

    setBusy(false);
    setOpenId(null);
    setDraft("");
    setToast(t("feedback.replied"));
  };

  return (
    <>
      <PageHeader
        title={t("feedback.title")}
        subtitle={
          data ? t("feedback.subtitle", { n: data.total, p: data.unanswered }) : undefined
        }
      />

      <Panel className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <SegmentedToggle
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: t("common.all") },
              { id: "unanswered", label: t("feedback.awaiting"), count: data?.unanswered },
              { id: "answered", label: t("feedback.answered") },
            ]}
          />
          <Select
            label={t("feedback.role")}
            value={role}
            options={[
              { id: "all", label: t("common.all") },
              { id: "candidate", label: t("feedback.candidate") },
              { id: "employer", label: t("feedback.employer") },
            ]}
            onChange={setRole}
          />
          <label className="block min-w-[12rem] flex-1">
            <span className="mb-1 block text-xs font-medium text-gray-500">
              {t("common.search")}
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("feedback.searchPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </label>
        </div>
      </Panel>

      {!data ? (
        <Panel>
          <TableSkeleton rows={4} />
        </Panel>
      ) : data.rows.length === 0 ? (
        <EmptyState title={t("feedback.empty")} />
      ) : (
        <ul className="space-y-4">
          {data.rows.map((f) => (
            <li key={f.id}>
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-medium text-gray-900">{f.from}</span>
                    <Badge tone={f.role === "candidate" ? "blue" : "green"}>
                      {f.role === "candidate" ? t("feedback.candidate") : t("feedback.employer")}
                    </Badge>
                    <Rating value={f.rating} />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{f.at}</span>
                    {!f.answered && <Badge tone="amber">{t("feedback.awaiting")}</Badge>}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-700">{f.message}</p>

                {/* The thread. Every reply stays, so a follow-up reads as a
                    conversation rather than replacing what came before. */}
                {f.messages.length > 0 && (
                  <ol className="mt-4 space-y-2">
                    {f.messages.map((m) => (
                      <li key={m.id} className="rounded-xl bg-brand-soft p-4">
                        <p className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                          <MessageSquareReply size={14} />
                          {m.authorName || t("feedback.yourReply")}
                          <span className="font-normal normal-case tracking-normal text-gray-500">
                            {m.at}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">{m.body}</p>
                      </li>
                    ))}
                  </ol>
                )}

                {openId === f.id ? (
                  <div className="mt-4">
                    <textarea
                      autoFocus
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={t("feedback.replyPlaceholder")}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">{t("feedback.notifyNote")}</p>
                      <div className="flex gap-2">
                        <Pill tone="ghost" onClick={() => setOpenId(null)}>
                          {t("common.cancel")}
                        </Pill>
                        <Pill
                          tone="brand"
                          disabled={busy || !draft.trim()}
                          onClick={() => send(f.id)}
                        >
                          <Send size={15} />
                          {t("feedback.send")}
                        </Pill>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Pill
                      tone="brand"
                      onClick={() => {
                        setOpenId(f.id);
                        setDraft("");
                      }}
                    >
                      <MessageSquareReply size={15} />
                      {f.answered ? t("feedback.followUp") : t("feedback.reply")}
                    </Pill>
                  </div>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
