"use client";

// Privacy policy. The lorem ipsum is replaced with copy that reflects the
// commitments the client actually specified in ClientDoc section 20 — contact
// protection, upload scanning, traceable employer access and activity logs.
//
// This is drafting support, not legal advice: have it reviewed by a lawyer and
// checked against Moroccan law 09-08 before launch.

import { useT } from "@/i18n/LocaleProvider";

const SECTIONS = [
  {
    title: "Quelles données collectons-nous ?",
    body: [
      "À l'inscription, nous collectons uniquement votre prénom, votre nom, votre adresse email et votre mot de passe.",
      "Lorsque vous complétez votre profil, vous pouvez ajouter votre numéro de téléphone, votre ville, votre secteur, votre poste, votre expérience, votre formation, vos expériences précédentes, une photo de profil, un CV et, pour certains métiers de cuisine et de pâtisserie, des photos de vos préparations.",
    ],
  },
  {
    title: "Protection de vos coordonnées",
    body: [
      "Votre numéro de téléphone n'est jamais affiché publiquement. Il n'est accessible qu'aux employeurs vérifiés, dans le cadre des règles de recrutement de la plateforme.",
      "Chaque accès d'un employeur à vos coordonnées est enregistré et traçable par l'administration.",
      "Les employeurs disposent également d'une option leur permettant de masquer leur propre numéro de téléphone aux candidats.",
    ],
  },
  {
    title: "Fichiers importés",
    body: [
      "Les CV et les photos sont contrôlés avant d'être stockés : type de fichier, taille et qualité d'image sont vérifiés.",
      "Les fichiers ne correspondant pas aux formats autorisés sont refusés. Un CV doit être au format PDF, DOC ou DOCX et ne pas dépasser 5 Mo.",
      "L'administration peut retirer toute photo inappropriée et bloquer un compte en cas d'envois abusifs répétés.",
    ],
  },
  {
    title: "Journal d'activité",
    body: [
      "La plateforme conserve un historique des actions administratives importantes, des accès aux coordonnées des candidats et des envois de photos.",
    ],
  },
  {
    title: "Modération des offres et des profils",
    body: [
      "Toutes les offres d'emploi sont contrôlées et approuvées par l'administration avant publication.",
      "Vous êtes notifié sur la plateforme et par email lorsque votre profil ou votre offre est approuvé.",
    ],
  },
  {
    title: "Vos droits",
    body: [
      "Vous pouvez à tout moment consulter, corriger ou supprimer les informations de votre profil depuis la page « Modifier mon profil ».",
      "Pour toute demande relative à vos données, écrivez-nous à contact@nkhedmou.ma.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-poppins">
      <h1 className="text-3xl font-bold text-gray-900">{t("footer.privacy")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Cette politique explique quelles données Nkhedmou.ma collecte, comment elles sont utilisées
        et comment elles sont protégées.
      </p>

      <div className="mt-10 space-y-9">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{section.title}</h2>
            <div className="space-y-3">
              {section.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-700">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
