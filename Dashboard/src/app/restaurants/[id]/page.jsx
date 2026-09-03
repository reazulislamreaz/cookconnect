"use client";

// Restaurant Details — an established restaurant's record.
//
// Distinct from the request screen at /restaurants/requests/[id]: this
// establishment is already on the platform, so the action here is block /
// unblock, not approve / reject.

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Ban,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CircleCheck,
  Clock,
  Eye,
  Handshake,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Users,
} from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchRestaurant, setRestaurantBlocked } from "@/mock/adminApi";
import { getCity } from "@/mock/cities";
import { ESTABLISHMENT_TYPES } from "@/mock/jobOptions";
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  InfoRow,
  PageHeader,
  Panel,
  PhotoStrip,
  Pill,
  Stat,
  StatGrid,
  Toast,
} from "@/components/ui";

export default function RestaurantDetailsPage({ params }) {
  const { id } = use(params);

  const t = useT();
  const { pick } = useLocale();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchRestaurant(id).then((res) => {
      setPlace(res);
      setLoading(false);
    });
  }, [id]);

  const toggleBlock = async () => {
    const next = !place.blocked;
    setConfirming(false);
    setPlace((p) => ({ ...p, blocked: next }));
    await setRestaurantBlocked(id, next);
    setToast(next ? t("restaurants.blockedToast") : t("restaurants.unblockedToast"));
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t("restaurants.details")} backHref="/restaurants" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </>
    );
  }

  if (!place) {
    return (
      <>
        <PageHeader title={t("common.notFound")} backHref="/restaurants" />
        <EmptyState
          title={t("common.notFound")}
          hint={t("common.notFoundHint")}
          action={<Pill tone="brand" href="/restaurants">{t("restaurants.title")}</Pill>}
        />
      </>
    );
  }

  const type = pick(ESTABLISHMENT_TYPES.find((e) => e.id === place.type)) || place.type;

  return (
    <>
      <PageHeader
        title={t("restaurants.details")}
        backHref="/restaurants"
        action={
          place.blocked ? (
            <Pill tone="green" onClick={toggleBlock}>
              <CircleCheck size={16} />
              {t("restaurants.unblock")}
            </Pill>
          ) : (
            <Pill tone="red" onClick={() => setConfirming(true)}>
              <Ban size={16} />
              {t("restaurants.block")}
            </Pill>
          )
        }
      />

      {/* Improvement points 15: what this establishment actually does on the
          platform. The contact-request count sits beside the offer counts on
          purpose — together they show whether an employer is recruiting or only
          harvesting candidate details. */}
      {place.activity && (
        <section className="mb-5">
          <StatGrid>
            <Stat
              icon={Briefcase}
              label={t("restaurants.offersPublished")}
              value={place.activity.offersPublished}
            />
            <Stat
              icon={Briefcase}
              tone="brand"
              label={t("restaurants.offersActive")}
              value={place.activity.offersActive}
            />
            <Stat
              icon={Clock}
              tone="amber"
              label={t("restaurants.offersPending")}
              value={place.activity.offersPending}
            />
            <Stat
              icon={Users}
              label={t("restaurants.applicationsReceived")}
              value={place.activity.applicationsReceived}
            />
            <Stat
              icon={Eye}
              label={t("restaurants.profilesViewed")}
              value={place.activity.profilesViewed}
            />
            <Stat
              icon={PhoneCall}
              tone="accent"
              label={t("restaurants.contactRequests")}
              value={place.activity.contactRequests}
            />
            <Stat
              icon={Handshake}
              label={t("restaurants.declaredHires")}
              value={place.activity.declaredHires}
            />
            <Stat
              icon={CalendarDays}
              label={t("restaurants.lastActivity")}
              value={place.activity.lastActivity}
            />
          </StatGrid>
        </section>
      )}

      <Panel>
        {/* Cover + avatar, as in the design. */}
        <div className="relative mb-16">
          <div className="h-40 w-full overflow-hidden rounded-xl border border-brand/40 bg-gray-100 sm:h-48">
            {place.cover && (
              <Image
                src={place.cover}
                alt=""
                width={1200}
                height={300}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <Image
            src={place.logo}
            alt=""
            width={128}
            height={128}
            className="absolute -bottom-12 start-1/2 h-28 w-28 -translate-x-1/2 rounded-full border-4 border-white object-cover rtl:translate-x-1/2"
          />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-bold text-gray-900">{place.name}</h2>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {place.verified && (
              <Badge tone="green">
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck size={13} />
                  {t("chefs.verified")}
                </span>
              </Badge>
            )}
            {place.blocked && <Badge tone="red">{t("restaurants.blocked")}</Badge>}
          </div>

          <dl className="mt-5 text-start text-sm">
            <InfoRow label={t("restaurants.establishmentType")}>{type}</InfoRow>
            <InfoRow label={t("chefs.cityLabel")}>
              {pick(getCity(place.city)) || place.city}
            </InfoRow>
            <InfoRow label={t("chefs.phoneNumber")}>{place.phone}</InfoRow>
            <InfoRow label={`${t("common.email")} :`}>{place.email}</InfoRow>
            <InfoRow label={`${t("restaurants.totalJobPost")} :`}>{place.totalJobPosts}</InfoRow>
            <InfoRow label={`${t("restaurants.availableJobPost")} :`}>
              {place.availableJobPosts}
            </InfoRow>
          </dl>

          <p className="mt-5 text-start font-medium text-gray-900">{t("restaurants.about")}</p>
          <p className="mt-2 text-start text-sm leading-relaxed text-gray-600">{place.about}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} /> {place.address}
            </span>
            <a href={`mailto:${place.email}`} className="inline-flex items-center gap-1.5 hover:text-brand">
              <Mail size={15} /> {place.email}
            </a>
            <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand">
              <Phone size={15} /> {place.phone}
            </a>
          </div>

          {place.jobs.length > 0 && (
            <Link
              href={`/jobs/${place.id}`}
              className="mt-5 inline-block text-sm font-medium text-brand underline underline-offset-2"
            >
              {t("jobs.offersOf", { name: place.name })}
            </Link>
          )}
        </div>

        <div className="mt-10">
          <h3 className="text-base font-semibold text-gray-900">{t("chefs.dishPhotos")}</h3>
          <p className="mb-3 mt-1 text-sm text-gray-500">{t("chefs.currentPhotos")}</p>
          <PhotoStrip photos={place.dishPhotos} emptyLabel={t("chefs.noPhotos")} />
        </div>
      </Panel>

      <ConfirmDialog
        open={confirming}
        title={t("restaurants.confirmBlock")}
        body={t("restaurants.confirmBlockBody")}
        confirmLabel={t("restaurants.block")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setConfirming(false)}
        onConfirm={toggleBlock}
      />

      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
