"use client";

// Placeholder lorem ipsum replaced with real French copy describing the
// platform as the client's brief defines it. Final marketing wording is still
// the client's to supply.

import Image from "next/image";
import Link from "next/link";
import { ChefHat, Building2, ShieldCheck, Languages } from "lucide-react";

import chefImg from "../../../assets/chefImage.png";
import { useT } from "@/i18n/LocaleProvider";

export default function AboutUsPage() {
  const t = useT();

  const pillars = [
    {
      icon: ChefHat,
      title: "Pour les candidats",
      body: "Créez un profil complet ou générez votre CV directement sur la plateforme, puis postulez aux offres près de chez vous. L'inscription est gratuite.",
    },
    {
      icon: Building2,
      title: "Pour les employeurs",
      body: "Publiez vos offres, filtrez les profils par ville, secteur, poste et expérience, et gardez de côté les candidats qui vous intéressent.",
    },
    {
      icon: ShieldCheck,
      title: "Des offres vérifiées",
      body: "Chaque offre d'emploi est contrôlée et approuvée par notre équipe avant d'être publiée. Les coordonnées des candidats sont protégées.",
    },
    {
      icon: Languages,
      title: "En français et en darija",
      body: "Toute la plateforme est disponible en français et en arabe marocain, pour que la langue ne soit jamais un obstacle.",
    },
  ];

  return (
    <div className="font-poppins">
      <section className="bg-brand-tint px-4 py-14 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("footer.aboutUs")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
          {t("footer.aboutText")}
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 overflow-hidden rounded-xl">
          <Image src={chefImg} alt="" width={1000} height={600} className="h-auto w-full object-cover" />
        </div>

        <div className="space-y-5 text-gray-700">
          <p className="leading-relaxed">
            Nkhedmou.ma — « nkhedmou » veut dire « on travaille » en darija — est né d&apos;un constat
            simple : au Maroc, les cuisiniers, boulangers, pâtissiers et le personnel d&apos;hôtellerie
            trouvent encore leur travail par le bouche-à-oreille, tandis que les restaurants et les
            hôtels peinent à recruter des profils qualifiés.
          </p>
          <p className="leading-relaxed">
            Notre objectif est de rassembler ces deux mondes au même endroit, avec une plateforme
            simple, sécurisée et pensée d&apos;abord pour le mobile, puisque c&apos;est là que se
            trouvent la plupart de nos utilisateurs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-6">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-xl bg-brand-soft px-6 py-10 text-center">
          <p className="max-w-md text-sm text-gray-700 sm:text-base">{t("home.guestNotice")}</p>
          <Link
            href="/signUp"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("auth.createAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
