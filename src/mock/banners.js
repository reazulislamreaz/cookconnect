// Advertising slots — Change Requirements section 04.
//   - two sliding banners on the home page (middle + bottom), ~3s auto-rotate
//   - one sticky banner that follows the user across the whole session
//   - all of them admin-managed later; here they are static demo data
// Third-party ad sales are explicitly "not needed at launch".

export const AD_ROTATE_MS = 3000;

export const HOME_BANNERS_MIDDLE = [
  {
    id: "mid-1",
    title: "Équipez votre cuisine avec ProChef Maroc",
    subtitle: "Matériel professionnel — livraison partout au Maroc",
    cta: "Découvrir",
    href: "#",
    image: "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    bg: "from-[#679046] to-[#4F6F35]",
  },
  {
    id: "mid-2",
    title: "Formation HACCP certifiante",
    subtitle: "Sessions à Casablanca, Rabat et Marrakech",
    cta: "S'inscrire",
    href: "#",
    image: "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
    bg: "from-[#E87B35] to-[#D2691E]",
  },
  {
    id: "mid-3",
    title: "Assurance santé pour les professionnels",
    subtitle: "Couverture adaptée aux métiers de la restauration",
    cta: "En savoir plus",
    href: "#",
    image: "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
    bg: "from-slate-700 to-slate-900",
  },
];

export const HOME_BANNERS_BOTTOM = [
  {
    id: "bot-1",
    title: "Votre marque ici",
    subtitle: "Espace publicitaire disponible pour restaurants, hôtels et marques alimentaires",
    cta: "Nous contacter",
    href: "/contactUs",
    image: "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
    bg: "from-[#4F6F35] to-[#679046]",
  },
  {
    id: "bot-2",
    title: "Fournitures et consommables",
    subtitle: "Tarifs professionnels pour les établissements inscrits",
    cta: "Voir l'offre",
    href: "#",
    image: "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
    bg: "from-amber-600 to-amber-800",
  },
];

/** Follows the user across pages — must never block content. */
export const STICKY_BANNER = {
  id: "sticky-1",
  title: "Nkhedmou.ma",
  subtitle: "Inscrivez-vous gratuitement et recevez les offres qui vous correspondent",
  cta: "Créer un compte",
  href: "/signUp",
};
