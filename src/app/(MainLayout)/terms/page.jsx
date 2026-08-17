"use client";

// Terms & conditions. Placeholder text replaced with clauses that match the
// rules the client specified (offer approval, 60-day expiry, contact privacy,
// photo eligibility). Have a lawyer review before launch.

import { useT } from "@/i18n/LocaleProvider";

const SECTIONS = [
  {
    title: "1. Objet de la plateforme",
    body: [
      "Nkhedmou.ma met en relation les professionnels de la restauration, de la boulangerie-pâtisserie et de l'hôtellerie avec les établissements qui recrutent au Maroc.",
      "La plateforme est un intermédiaire : elle n'est pas l'employeur et n'est pas partie au contrat de travail conclu entre un candidat et un établissement.",
    ],
  },
  {
    title: "2. Inscription et compte",
    body: [
      "L'inscription est gratuite et requiert un prénom, un nom, une adresse email et un mot de passe.",
      "Votre mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      "Après trois tentatives de connexion échouées, votre compte est temporairement suspendu et un code de vérification vous est envoyé pour réinitialiser votre mot de passe.",
      "Vous êtes responsable de l'exactitude des informations de votre profil.",
    ],
  },
  {
    title: "3. Accès des visiteurs",
    body: [
      "Les visiteurs non inscrits peuvent consulter la première page des offres et des profils. La consultation d'une offre ou d'un profil complet nécessite la création d'un compte.",
    ],
  },
  {
    title: "4. Offres d'emploi",
    body: [
      "Toutes les offres publiées par les employeurs sont contrôlées et approuvées par l'administration avant d'être visibles par les candidats.",
      "La durée maximale de publication d'une offre est de 60 jours. Passé ce délai, l'offre est automatiquement retirée des offres actives.",
      "Une offre expirée reste consultable dans l'historique de l'employeur, avec les candidatures reçues, et peut être republiée.",
      "L'administration se réserve le droit de refuser, modifier ou retirer toute offre non conforme.",
    ],
  },
  {
    title: "5. Contenus publiés",
    body: [
      "Vous garantissez détenir les droits sur les photos et documents que vous importez.",
      "Les photos de préparations culinaires sont réservées aux métiers de cuisine, de boulangerie et de pâtisserie, et sont limitées à 8 photos par profil.",
      "L'administration peut retirer tout contenu inapproprié et bloquer les comptes en cas de manquements répétés.",
    ],
  },
  {
    title: "6. Confidentialité des coordonnées",
    body: [
      "Les numéros de téléphone des candidats ne sont pas publics et ne sont accessibles qu'aux employeurs vérifiés, dans le cadre des règles de recrutement de la plateforme.",
      "Toute consultation de coordonnées est enregistrée et traçable.",
      "L'utilisation des coordonnées à des fins de démarchage, de revente ou de collecte massive est strictement interdite et entraîne la fermeture du compte.",
    ],
  },
  {
    title: "7. Publicité",
    body: [
      "La plateforme affiche des espaces publicitaires. Nkhedmou.ma n'est pas responsable du contenu ou des offres des annonceurs tiers.",
    ],
  },
  {
    title: "8. Contact",
    body: ["Pour toute question relative aux présentes conditions : contact@nkhedmou.ma"],
  },
];

export default function TermsPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-poppins">
      <h1 className="text-3xl font-bold text-gray-900">{t("footer.terms")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        En créant un compte sur Nkhedmou.ma, vous acceptez les conditions ci-dessous.
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
