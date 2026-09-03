"use client";

// Request Details — the Approve / Cancel screen from the Figma.
//
// Approving or rejecting removes the row from the queue, so the screen sends
// the admin back to the list afterwards rather than leaving them looking at a
// record that no longer exists anywhere else.

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { decideRequest, fetchRequest } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { ESTABLISHMENT_REJECTION_REASONS, ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import {
  EmptyState,
  InfoRow,
  PageHeader,
  Panel,
  PhotoStrip,
  Pill,
  ReasonDialog,
  Toast,
} from "@/components/ui";

export default function RequestDetailsPage({ params }) {
  const { id } = use(params);

  const t = useT();
  const router = useRouter();
  const { pick } = useLocale();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchRequest(id).then((res) => {
      setRequest(res);
      setLoading(false);
    });
  }, [id]);

  const decide = async (decision, reason) => {
    setBusy(true);
    setRejecting(false);
    await decideRequest(id, decision, reason);
    setToast(
      decision === "approved" ? t("restaurants.approvedToast") : t("restaurants.rejectedToast")
    );
    // Let the toast register before the route changes, otherwise the
    // confirmation unmounts in the same frame it appears.
    setTimeout(() => router.push("/restaurants/requests"), 900);
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t("restaurants.requestDetails")} backHref="/restaurants/requests" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </>
    );
  }

  if (!request) {
    return (
      <>
        <PageHeader title={t("common.notFound")} backHref="/restaurants/requests" />
        <EmptyState
          title={t("common.notFound")}
          hint={t("common.notFoundHint")}
          action={
            <Pill tone="brand" href="/restaurants/requests">
              {t("dashboard.restaurantRequest")}
            </Pill>
          }
        />
      </>
    );
  }

  const type = pick(ESTABLISHMENT_TYPES.find((e) => e.id === request.type)) || request.type;

  return (
    <>
      <PageHeader title={t("restaurants.requestDetails")} backHref="/restaurants/requests" />

      <Panel>
        <div className="relative mb-16">
          <div className="h-40 w-full rounded-xl border border-brand/40 bg-gray-50 sm:h-48" />
          <Image
            src={request.logo}
            alt=""
            width={128}
            height={128}
            className="absolute -bottom-12 start-1/2 h-28 w-28 -translate-x-1/2 rounded-full border-4 border-white object-cover rtl:translate-x-1/2"
          />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-bold text-gray-900">{t("chefs.profileInfo")}</h2>

          <dl className="mt-5 text-start text-sm">
            <InfoRow label={t("chefs.fullName")}>{request.name}</InfoRow>
            <InfoRow label={t("restaurants.establishmentType")}>{type}</InfoRow>
            <InfoRow label={t("chefs.phoneNumber")}>{request.phone}</InfoRow>
            <InfoRow label={`${t("common.email")} :`}>{request.email}</InfoRow>
            <InfoRow label={t("chefs.cityLabel")}>
              {pick(getCity(request.city)) || request.city}
            </InfoRow>
            <InfoRow label={t("restaurants.requestedOn")}>{request.requestedAt}</InfoRow>
          </dl>

          <p className="mt-5 text-start font-medium text-gray-900">{t("restaurants.about")}</p>
          <p className="mt-2 text-start text-sm leading-relaxed text-gray-600">{request.about}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} /> {pick(getCity(request.city)) || request.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={15} /> {request.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={15} /> {request.phone}
            </span>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-base font-semibold text-gray-900">{t("chefs.dishPhotos")}</h3>
          <p className="mb-3 mt-1 text-sm text-gray-500">{t("chefs.currentPhotos")}</p>
          <PhotoStrip photos={request.dishPhotos} emptyLabel={t("chefs.noPhotos")} />
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Pill tone="green" disabled={busy} onClick={() => decide("approved")}>
            {t("common.approve")}
          </Pill>
          {/* Refusing asks for a reason, so the establishment is told what to
              correct rather than just being turned away (Improvement points 17). */}
          <Pill tone="red" disabled={busy} onClick={() => setRejecting(true)}>
            {t("common.reject")}
          </Pill>
        </div>
      </Panel>

      <ReasonDialog
        open={rejecting}
        title={t("restaurants.rejectTitle")}
        body={t("restaurants.rejectBody")}
        reasons={ESTABLISHMENT_REJECTION_REASONS.map((r) => ({ ...r, label: pick(r) }))}
        reasonLabel={t("pending.reasonLabel")}
        noteLabel={t("pending.noteLabel")}
        notePlaceholder={t("restaurants.notePlaceholder")}
        confirmLabel={t("common.reject")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setRejecting(false)}
        onConfirm={(reason) => decide("rejected", reason)}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
