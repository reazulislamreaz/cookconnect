"use client";

// Chef Details — the record an administrator acts on.
//
// Improvement points 14 lists twelve things an admin must be able to do here.
// Two of them existed: view the profile, and verify it. The rest are added as an
// action bar plus five tabs, because a profile with twelve buttons across the
// top and no structure is not a profile any more.
//
// Delete is soft. The client asked for a restore action in the same breath, and
// a record that is really gone cannot be restored, cannot be audited, and cannot
// answer "which employers asked for this person's number".

import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  Check,
  CircleCheck,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserX,
  X,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  addCandidateSkill,
  decidePhoto,
  fetchCandidateApplications,
  fetchCandidateHistory,
  fetchChef,
  removeCandidateSkill,
  setCandidateBlocked,
  setCandidateStatus,
  setChefVerified,
  updateCandidate,
} from "@/mock/adminApi";
import { getCity, CITIES } from "@/mock/cities";
import {
  AVAILABILITY,
  EXPERIENCE_LEVELS,
  JOB_REQUIREMENTS,
  PHOTO_REJECTION_REASONS,
  REQUIREMENT_BY_ID,
} from "@/mock/jobOptions";
import {
  Badge,
  Chip,
  ConfirmDialog,
  EmptyState,
  InfoRow,
  PageHeader,
  Panel,
  PhotoStrip,
  Pill,
  ReasonDialog,
  SegmentedToggle,
  Select,
  Toast,
} from "@/components/ui";

const TABS = ["profile", "applications", "photos", "access", "history"];

/** Every skill the platform knows, flattened out of its requirement groups. */
const ALL_SKILLS = JOB_REQUIREMENTS.flatMap((g) => g.options);

export default function ChefDetailsPage({ params }) {
  // Next 16 hands route params to client components as a promise.
  const { id } = use(params);

  const t = useT();
  const { pick } = useLocale();

  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  const [applications, setApplications] = useState(null);
  const [history, setHistory] = useState(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [addingSkill, setAddingSkill] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [rejectingPhoto, setRejectingPhoto] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [toast, setToast] = useState("");

  const [revealed, setRevealed] = useState(false);

  const reload = useCallback(
    (revealContact = false) =>
      fetchChef(id, { revealContact }).then((res) => {
        setChef(res);
        setLoading(false);
        return res;
      }),
    [id]
  );

  // Improvement points 20: revealing a phone number is an event, not a render.
  const revealContact = async () => {
    setRevealed(true);
    await reload(true);
    setToast(t("chefs.contactLogged"));
  };

  useEffect(() => {
    reload();
  }, [reload]);

  // The two heavier tabs load only when they are opened.
  useEffect(() => {
    if (tab === "applications" && !applications) fetchCandidateApplications(id).then(setApplications);
    if ((tab === "access" || tab === "history") && !history)
      fetchCandidateHistory(id).then(setHistory);
  }, [tab, id, applications, history]);

  const toggleVerified = async (next) => {
    const verified = next === "verified";
    if (verified === chef.verified) return;

    // Optimistic: the mock write always succeeds, and waiting 250ms to move a
    // toggle the admin just clicked reads as a broken control.
    setChef((c) => ({ ...c, verified }));
    await setChefVerified(id, verified);
    setToast(verified ? t("chefs.verifiedToast") : t("chefs.unverifiedToast"));
  };

  const openEditor = () => {
    setDraft({
      firstName: chef.firstName,
      lastName: chef.lastName,
      city: chef.city,
      experience: chef.experience,
      availability: chef.availability,
      expectedSalary: chef.expectedSalary,
      about: chef.about,
      // Contact fields only when they are actually on screen. Seeding them from
      // a hidden value means seeding them from `undefined`, and saving would
      // then overwrite a real phone number with an empty string.
      ...(chef.contactVisible ? { phone: chef.phone, email: chef.email } : {}),
    });
    setEditing(true);
  };

  const saveEdits = async () => {
    setEditing(false);
    await updateCandidate(id, { ...draft, expectedSalary: Number(draft.expectedSalary) || 0 });
    await reload(revealed);
    setToast(t("chefs.editedToast"));
  };

  const changeStatus = async (status) => {
    setConfirming(null);
    await setCandidateStatus(id, status);
    await reload(revealed);
    setToast(
      t(
        status === "deleted"
          ? "chefs.deletedToast"
          : status === "deactivated"
            ? "chefs.deactivatedToast"
            : "chefs.restoredToast"
      )
    );
  };

  const addSkill = async () => {
    if (!addingSkill) return;
    const skill = addingSkill;
    setAddingSkill("");
    await addCandidateSkill(id, skill);
    await reload(revealed);
    setToast(t("chefs.skillAddedToast"));
  };

  const dropSkill = async (skillId) => {
    await removeCandidateSkill(id, skillId);
    await reload(revealed);
    setToast(t("chefs.skillRemovedToast"));
  };

  const judgePhoto = async (photo, decision, reason) => {
    setRejectingPhoto(null);
    await decidePhoto(photo.id, decision, reason);
    await reload(revealed);
    setToast(decision === "approved" ? t("moderation.approvedToast") : t("moderation.removedToast"));
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t("chefs.details")} backHref="/chefs" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </>
    );
  }

  if (!chef) {
    return (
      <>
        <PageHeader title={t("common.notFound")} backHref="/chefs" />
        <EmptyState
          title={t("common.notFound")}
          hint={t("common.notFoundHint")}
          action={<Pill tone="brand" href="/chefs">{t("chefs.title")}</Pill>}
        />
      </>
    );
  }

  const experience = pick(EXPERIENCE_LEVELS.find((e) => e.id === chef.experience)) || chef.experience;
  const availability = pick(AVAILABILITY.find((a) => a.id === chef.availability)) || chef.availability;

  // The candidate fixture stores skills as requirement ids; the design shows
  // them as the cook's culinary specialties.
  const specialties = (chef.skills || [])
    .map((s) => REQUIREMENT_BY_ID[s])
    .filter(Boolean);

  const unusedSkills = ALL_SKILLS.filter((s) => !(chef.skills || []).includes(s.id));
  const deleted = chef.status === "deleted";

  return (
    <>
      <PageHeader
        title={t("chefs.details")}
        backHref="/chefs"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {!deleted && (
              <SegmentedToggle
                value={chef.verified ? "verified" : "unverified"}
                onChange={toggleVerified}
                options={[
                  { id: "verified", label: t("chefs.verified") },
                  { id: "unverified", label: t("chefs.unverified") },
                ]}
              />
            )}

            {deleted ? (
              <Pill tone="green" onClick={() => changeStatus("active")}>
                <RotateCcw size={15} />
                {t("chefs.restore")}
              </Pill>
            ) : (
              <>
                <Pill tone="ghost" onClick={openEditor}>
                  <Pencil size={15} />
                  {t("chefs.edit")}
                </Pill>

                {chef.status === "deactivated" ? (
                  <Pill tone="green" onClick={() => changeStatus("active")}>
                    <CircleCheck size={15} />
                    {t("chefs.reactivate")}
                  </Pill>
                ) : (
                  <Pill tone="ghost" onClick={() => setConfirming("deactivated")}>
                    <UserX size={15} />
                    {t("chefs.deactivate")}
                  </Pill>
                )}

                {chef.blocked ? (
                  <Pill tone="green" onClick={() => setCandidateBlocked(id, false).then(reload)}>
                    <CircleCheck size={15} />
                    {t("chefs.unblock")}
                  </Pill>
                ) : (
                  <Pill tone="ghost" onClick={() => setBlocking(true)}>
                    <Ban size={15} />
                    {t("chefs.block")}
                  </Pill>
                )}

                <Pill tone="red" onClick={() => setConfirming("deleted")}>
                  <Trash2 size={15} />
                  {t("common.delete")}
                </Pill>
              </>
            )}
          </div>
        }
      />

      {/* State banners — an admin acting on a record has to know it is not live. */}
      {(deleted || chef.status === "deactivated" || chef.blocked) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          {deleted && <Badge tone="red">{t("chefs.deletedBadge")}</Badge>}
          {chef.status === "deactivated" && <Badge tone="gray">{t("chefs.deactivatedBadge")}</Badge>}
          {chef.blocked && <Badge tone="red">{t("chefs.blockedBadge")}</Badge>}
          <span>{deleted ? t("chefs.deletedHint") : t("chefs.restrictedHint")}</span>
        </div>
      )}

      <div className="mb-4">
        <SegmentedToggle
          value={tab}
          onChange={setTab}
          options={TABS.map((id2) => ({
            id: id2,
            label: t(`chefs.tab.${id2}`),
            count:
              id2 === "photos"
                ? chef.pendingPhotos.length || undefined
                : id2 === "applications"
                  ? applications?.length
                  : undefined,
          }))}
        />
      </div>

      {tab === "profile" && (
        <Panel>
          <div className="mx-auto max-w-2xl text-center">
            <Image
              src={chef.photo}
              alt=""
              width={200}
              height={200}
              className="mx-auto h-44 w-44 rounded-full object-cover"
            />

            <h2 className="mt-5 text-lg font-bold text-gray-900">{t("chefs.profileInfo")}</h2>

            {chef.verified && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                <BadgeCheck size={16} />
                {t("chefs.verifiedBadge")}
              </p>
            )}

            <dl className="mt-5 text-start text-sm">
              <InfoRow label={t("chefs.fullName")}>{chef.name}</InfoRow>
              <InfoRow label={t("chefs.yearsOfExperience")}>{experience}</InfoRow>
              {/* Contact details are hidden until asked for, and asking is
                  logged. An admin without the right never gets the control. */}
              <InfoRow label={t("chefs.phoneNumber")}>
                {chef.contactVisible ? (
                  chef.phone || "—"
                ) : chef.canRevealContact ? (
                  <button
                    onClick={revealContact}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline underline-offset-2"
                  >
                    <Eye size={14} />
                    {t("chefs.revealContact")}
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">{t("chefs.contactHidden")}</span>
                )}
              </InfoRow>
              <InfoRow label={`${t("common.email")} :`}>
                {chef.contactVisible ? chef.email || "—" : "•••"}
              </InfoRow>
              <InfoRow label={t("chefs.cityLabel")}>{pick(getCity(chef.city)) || chef.city}</InfoRow>
              <InfoRow label={t("chefs.experienceLevel")}>{pick(chef, "title")}</InfoRow>
              <InfoRow label={t("db.availability")}>{availability || "—"}</InfoRow>
              <InfoRow label={t("db.expectedSalary")}>{chef.expectedSalary}</InfoRow>
              <InfoRow label={t("db.completion")}>{chef.completion}%</InfoRow>
            </dl>

            <p className="mt-5 text-start font-medium text-gray-900">{t("chefs.specialties")}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2.5">
              {specialties.length ? (
                specialties.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1">
                    <Chip>{pick(s)}</Chip>
                    {!deleted && (
                      <button
                        onClick={() => dropSkill(s.id)}
                        aria-label={`${t("chefs.removeSkill")} — ${pick(s)}`}
                        className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>

            {!deleted && (
              <div className="mt-4 flex flex-wrap items-end justify-center gap-2">
                <Select
                  label={t("chefs.addSkill")}
                  value={addingSkill}
                  allLabel={t("chefs.pickSkill")}
                  options={unusedSkills.map((s) => ({ id: s.id, label: pick(s) }))}
                  onChange={setAddingSkill}
                />
                <Pill tone="brand" disabled={!addingSkill} onClick={addSkill}>
                  <Plus size={15} />
                  {t("chefs.addSkill")}
                </Pill>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h3 className="text-base font-semibold text-gray-900">{t("chefs.dishPhotos")}</h3>
            <p className="mb-3 mt-1 text-sm text-gray-500">{t("chefs.currentPhotos")}</p>
            <PhotoStrip photos={chef.dishPhotos} emptyLabel={t("chefs.noPhotos")} />
          </div>
        </Panel>
      )}

      {tab === "applications" && (
        <Panel title={t("chefs.tab.applications")}>
          {!applications ? (
            <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ) : applications.length === 0 ? (
            <EmptyState title={t("chefs.noApplications")} />
          ) : (
            <ul className="space-y-3">
              {applications.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {a.job ? pick(a.job, "title") : a.jobTitle}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {a.employer?.name} · {a.appliedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={
                        a.status === "hired"
                          ? "green"
                          : a.status === "rejected"
                            ? "red"
                            : a.status === "shortlisted"
                              ? "blue"
                              : "amber"
                      }
                    >
                      {t(`applications.${a.status}`)}
                    </Badge>
                    {a.job && (
                      <Pill tone="ghost" href={`/jobs/offer/${a.jobId}`}>
                        {t("common.view")}
                      </Pill>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "photos" && (
        <Panel
          title={t("chefs.tab.photos")}
          subtitle={t("chefs.photosSubtitle", { n: chef.pendingPhotos.length })}
        >
          {chef.pendingPhotos.length === 0 ? (
            <EmptyState title={t("moderation.empty")} />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chef.pendingPhotos.map((p) => (
                <li key={p.id} className="overflow-hidden rounded-xl border border-gray-200">
                  <Image
                    src={p.url}
                    alt=""
                    width={400}
                    height={240}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={p.type === "profile" ? "blue" : "gray"}>
                        {p.type === "profile"
                          ? t("moderation.profilePhoto")
                          : t("moderation.foodPhoto")}
                      </Badge>
                      <span className="text-xs text-gray-500">{p.uploadedAt}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Pill tone="green" onClick={() => judgePhoto(p, "approved")}>
                        <Check size={15} />
                        {t("moderation.approve")}
                      </Pill>
                      <Pill tone="red" onClick={() => setRejectingPhoto(p)}>
                        <X size={15} />
                        {t("moderation.remove")}
                      </Pill>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "access" && (
        <Panel title={t("chefs.tab.access")} subtitle={t("chefs.accessSubtitle")}>
          {!history ? (
            <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ) : history.contactRequests.length === 0 ? (
            <EmptyState title={t("chefs.noAccess")} hint={t("chefs.noAccessHint")} />
          ) : (
            <ul className="space-y-2">
              {history.contactRequests.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                    <Eye size={15} className="text-gray-400" />
                    {pick(l, "actor")}
                  </span>
                  <span className="text-gray-500">{pick(l, "detail")}</span>
                  <span className="whitespace-nowrap text-gray-400">{l.at}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "history" && (
        <Panel title={t("chefs.tab.history")} subtitle={t("chefs.historySubtitle")}>
          {!history ? (
            <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ) : history.adminActions.length === 0 ? (
            <EmptyState title={t("chefs.noHistory")} hint={t("chefs.noHistoryHint")} />
          ) : (
            <ol className="space-y-2">
              {history.adminActions.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm"
                >
                  <span className="font-medium text-gray-800">{pick(l, "detail")}</span>
                  <span className="text-gray-500">{pick(l, "actor")}</span>
                  <span className="whitespace-nowrap text-gray-400">{l.at}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-gray-500">
            <Link href="/settings/activity" className="underline underline-offset-2">
              {t("chefs.fullLog")}
            </Link>
          </p>
        </Panel>
      )}

      {/* Edit drawer */}
      {editing && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setEditing(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("chefs.edit")}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-base font-semibold text-gray-900">{t("chefs.edit")}</h3>
            <p className="mt-1 text-sm text-gray-600">{t("chefs.editHint")}</p>
            {!chef.contactVisible && (
              <p className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
                {t("chefs.editContactHint")}
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["firstName", t("chefs.firstName")],
                ["lastName", t("chefs.lastName")],
                ...(chef.contactVisible
                  ? [
                      ["phone", t("common.phone")],
                      ["email", t("common.email")],
                    ]
                  : []),
              ].map(([field, fieldLabel]) => (
                <label key={field} className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">{fieldLabel}</span>
                  <input
                    value={draft[field] || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </label>
              ))}

              <Select
                label={t("common.city")}
                value={draft.city}
                options={CITIES.map((c) => ({ id: c.id, label: pick(c) }))}
                onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
              />
              <Select
                label={t("db.experience")}
                value={draft.experience}
                options={EXPERIENCE_LEVELS.map((e) => ({ id: e.id, label: pick(e) }))}
                onChange={(v) => setDraft((d) => ({ ...d, experience: v }))}
              />
              <Select
                label={t("db.availability")}
                value={draft.availability}
                options={AVAILABILITY.map((a) => ({ id: a.id, label: pick(a) }))}
                onChange={(v) => setDraft((d) => ({ ...d, availability: v }))}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t("db.expectedSalary")}
                </span>
                <input
                  type="number"
                  value={draft.expectedSalary}
                  onChange={(e) => setDraft((d) => ({ ...d, expectedSalary: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-gray-500">
                {t("restaurants.about")}
              </span>
              <textarea
                rows={3}
                value={draft.about || ""}
                onChange={(e) => setDraft((d) => ({ ...d, about: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <Pill tone="ghost" onClick={() => setEditing(false)}>
                {t("common.cancel")}
              </Pill>
              <Pill tone="brand" onClick={saveEdits}>
                {t("common.save")}
              </Pill>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={t(confirming === "deleted" ? "chefs.confirmDelete" : "chefs.confirmDeactivate")}
        body={t(confirming === "deleted" ? "chefs.confirmDeleteBody" : "chefs.confirmDeactivateBody")}
        confirmLabel={t(confirming === "deleted" ? "common.delete" : "chefs.deactivate")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setConfirming(null)}
        onConfirm={() => changeStatus(confirming)}
      />

      <ReasonDialog
        open={Boolean(rejectingPhoto)}
        title={t("moderation.rejectTitle")}
        body={t("moderation.rejectBody")}
        reasons={PHOTO_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("moderation.reasonLabel")}
        noteLabel={t("moderation.noteLabel")}
        notePlaceholder={t("moderation.notePlaceholder")}
        confirmLabel={t("moderation.remove")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setRejectingPhoto(null)}
        onConfirm={(reason) => judgePhoto(rejectingPhoto, "removed", reason)}
      />

      <ReasonDialog
        open={blocking}
        title={t("moderation.blockTitle")}
        body={t("moderation.blockBody")}
        reasons={PHOTO_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("moderation.blockReasonLabel")}
        noteLabel={t("moderation.noteLabel")}
        notePlaceholder={t("moderation.notePlaceholder")}
        confirmLabel={t("chefs.block")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setBlocking(false)}
        onConfirm={async (reason) => {
          setBlocking(false);
          await setCandidateBlocked(id, true, reason);
          await reload();
          setToast(t("chefs.blockedToast"));
        }}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
