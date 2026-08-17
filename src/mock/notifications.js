// In-app notifications. Change Requirements 12: approvals, reminders and
// feedback replies all produce an in-app notification alongside an email.

export const NOTIFICATIONS = [
  {
    id: "ntf-1",
    type: "approval",
    title: "Votre profil a été validé",
    titleAr: "البروفيل ديالك تصادق عليه",
    body: "Félicitations, votre profil est maintenant visible par les employeurs et vous pouvez postuler aux offres.",
    date: "2026-08-16",
    read: false,
  },
  {
    id: "ntf-2",
    type: "job",
    title: "3 nouvelles offres correspondent à votre profil",
    titleAr: "3 عروض جداد كيتناسبو مع البروفيل ديالك",
    body: "Chef de cuisine à Casablanca, Sous-chef à Casablanca et Chef de partie à Meknès.",
    date: "2026-08-15",
    read: false,
  },
  {
    id: "ntf-3",
    type: "application",
    title: "Votre candidature a été présélectionnée",
    titleAr: "الترشيح ديالك تختار",
    body: "La Table Casablancaise a présélectionné votre candidature pour le poste de Chef de cuisine.",
    date: "2026-08-13",
    read: true,
  },
  {
    id: "ntf-4",
    type: "offer",
    title: "Votre offre est en cours de validation",
    titleAr: "العرض ديالك فطريق المصادقة",
    body: "L'offre « Serveur — court terme » sera publiée dès validation par l'administration.",
    date: "2026-08-12",
    read: true,
  },
  {
    id: "ntf-5",
    type: "reminder",
    title: "Complétez votre profil pour postuler",
    titleAr: "كمّل البروفيل ديالك باش تقدر تسّجل",
    body: "Il vous manque encore quelques champs obligatoires avant de pouvoir postuler aux offres.",
    date: "2026-08-10",
    read: true,
  },
  {
    id: "ntf-6",
    type: "feedback",
    title: "L'administration a répondu à votre message",
    titleAr: "الإدارة جاوبات على الرسالة ديالك",
    body: "Merci pour votre retour, nous avons pris en compte votre remarque sur les filtres de recherche.",
    date: "2026-08-06",
    read: true,
  },
];

export const getNotification = (id) => NOTIFICATIONS.find((n) => n.id === id) || null;

export const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
