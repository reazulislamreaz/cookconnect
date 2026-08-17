// Sector -> job position taxonomy.
// Source: ClientDoc section 5 (candidate job categories), confirmed by
// Change Requirements section 06 "Sector -> Job Position Flow":
// a position can never be picked before its sector.

export const SECTORS = [
  { id: "hotel", fr: "Hôtellerie", ar: "الفندقة" },
  { id: "restaurant", fr: "Restaurant / Café / Restauration collective", ar: "ريسطو / قهوة / إطعام جماعي" },
  { id: "bakery", fr: "Boulangerie / Pâtisserie", ar: "مخبزة / حلويات" },
  { id: "asian", fr: "Cuisine asiatique", ar: "الطبخ الآسيوي" },
];

// Positions keyed by sector id. `photos: true` marks the kitchen / bakery /
// pastry roles from ClientDoc section 4 that may upload food photos.
export const POSITIONS = {
  restaurant: [
    { id: "executive-chef", fr: "Chef exécutif", ar: "شيف تنفيذي", photos: true },
    { id: "head-chef", fr: "Chef de cuisine", ar: "شيف دكوزينة", photos: true },
    { id: "sous-chef", fr: "Sous-chef", ar: "سو شيف", photos: true },
    { id: "chef-de-partie", fr: "Chef de partie", ar: "شيف دي بارتي", photos: true },
    { id: "garde-manger", fr: "Chef garde-manger", ar: "شيف كارد مانجي", photos: true },
    { id: "demi-chef-de-partie", fr: "Demi-chef de partie", ar: "دمي شيف دي بارتي", photos: true },
    { id: "cook", fr: "Cuisinier", ar: "طباخ", photos: true },
    { id: "kitchen-commis", fr: "Commis de cuisine", ar: "كومي دكوزينة", photos: true },
    { id: "sushiman", fr: "Sushiman / Chef sushi", ar: "سوشيمان / شيف سوشي", photos: true },
    { id: "apprentice", fr: "Apprenti / Stagiaire", ar: "متمرن / ستاجير", photos: true },
    { id: "dishwasher", fr: "Plongeur", ar: "بلونجور" },
    { id: "cleaning-worker", fr: "Agent d'entretien / de nettoyage", ar: "عامل النظافة" },
    { id: "chef-de-rang", fr: "Chef de rang", ar: "شيف دي رون", photos: true },
    { id: "delivery-driver", fr: "Livreur", ar: "ليفرور", photos: true },
    { id: "cashier", fr: "Caissier", ar: "كيسيي" },
    { id: "pizzaiolo", fr: "Pizzaïolo", ar: "بيتزايولو", photos: true },
    { id: "barman", fr: "Barman / Barmaid", ar: "بارمان / بارميد", photos: true },
    { id: "barista", fr: "Barista", ar: "باريستا", photos: true },
    { id: "waiter", fr: "Serveur", ar: "سيرفور" },
    { id: "restaurant-manager", fr: "Directeur de site / Responsable de restaurant", ar: "مسؤول الريسطو" },
    { id: "storekeeper", fr: "Magasinier / Gestionnaire de stock", ar: "ماغازينيي" },
    { id: "valet", fr: "Voiturier", ar: "فواتوريي" },
  ],
  hotel: [
    { id: "hotel-director", fr: "Directeur d'hôtel", ar: "مدير الأوطيل" },
    { id: "guest-relations", fr: "Relations clients / Service client", ar: "خدمة الزبناء" },
    { id: "front-office-manager", fr: "Chef de réception", ar: "شيف دي ريسبسيون" },
    { id: "receptionist", fr: "Réceptionniste", ar: "ريسبسيونيست" },
    { id: "bellman", fr: "Bagagiste / Portier", ar: "باݣاجيست" },
    { id: "concierge", fr: "Concierge", ar: "كونسييرج" },
    { id: "housekeeper", fr: "Femme / Valet de chambre", ar: "خدامة الشومبرات" },
    { id: "linen-attendant", fr: "Lingère", ar: "لانجيرة" },
    { id: "hotel-valet", fr: "Voiturier", ar: "فواتوريي" },
    { id: "cleaning-agent", fr: "Agent de nettoyage", ar: "عامل النظافة" },
    { id: "gardener", fr: "Jardinier", ar: "جاردينيي" },
    { id: "security-guard", fr: "Agent de sécurité", ar: "عسّاس" },
  ],
  bakery: [
    { id: "head-baker", fr: "Chef boulanger", ar: "شيف بولانجي", photos: true },
    { id: "head-pastry-chef", fr: "Chef pâtissier", ar: "شيف باتيسيي", photos: true },
    { id: "baker", fr: "Boulanger", ar: "خباز", photos: true },
    { id: "pastry-chef", fr: "Pâtissier", ar: "باتيسيي", photos: true },
    { id: "baker-assistant", fr: "Aide-boulanger", ar: "معاون الخباز", photos: true },
    { id: "pastry-assistant", fr: "Aide-pâtissier", ar: "معاون الباتيسيي", photos: true },
    { id: "baker-apprentice", fr: "Apprenti boulanger", ar: "متمرن خباز", photos: true },
    { id: "pastry-apprentice", fr: "Apprenti pâtissier", ar: "متمرن باتيسيي", photos: true },
    { id: "salesperson", fr: "Vendeur", ar: "بايع" },
    { id: "viennoisier", fr: "Viennoisier", ar: "فيينوازيي", photos: true },
    { id: "chocolatier", fr: "Chocolatier", ar: "شوكولاتيي", photos: true },
    { id: "ice-cream-maker", fr: "Glacier", ar: "ݣلاسيي", photos: true },
    { id: "production-manager", fr: "Responsable de production", ar: "مسؤول الإنتاج" },
    { id: "boutique-manager", fr: "Responsable de boutique", ar: "مسؤول المحل" },
  ],
  asian: [
    { id: "asian-chef", fr: "Chef de cuisine asiatique", ar: "شيف طبخ آسيوي", photos: true },
    { id: "asian-sous-chef", fr: "Sous-chef de cuisine asiatique", ar: "سو شيف آسيوي", photos: true },
    { id: "asian-chef-de-partie", fr: "Chef de partie cuisine asiatique", ar: "شيف دي بارتي آسيوي", photos: true },
    { id: "asian-cook", fr: "Cuisinier asiatique", ar: "طباخ آسيوي", photos: true },
    { id: "asian-kitchen-commis", fr: "Commis de cuisine asiatique", ar: "كومي آسيوي", photos: true },
    { id: "sushi-chef", fr: "Chef sushi", ar: "شيف سوشي", photos: true },
    { id: "sushiwoman", fr: "Sushiman / Sushiwoman", ar: "سوشيمان / سوشيومان", photos: true },
    { id: "sushi-commis", fr: "Commis sushi", ar: "كومي سوشي", photos: true },
    { id: "teppanyaki-chef", fr: "Chef teppanyaki", ar: "شيف تيبانياكي", photos: true },
    { id: "teppanyaki-cook", fr: "Cuisinier teppanyaki", ar: "طباخ تيبانياكي", photos: true },
    { id: "sushi-preparer", fr: "Préparateur sushi", ar: "محضّر السوشي", photos: true },
  ],
};

/** Max food photos per profile — ClientDoc section 4 ("6 for example or 8"). */
export const MAX_FOOD_PHOTOS = 8;

export const getPositions = (sectorId) => POSITIONS[sectorId] || [];

export const getPosition = (sectorId, positionId) =>
  getPositions(sectorId).find((p) => p.id === positionId) || null;

/** Only kitchen / bakery / pastry / Asian roles may upload food photos. */
export const canUploadFoodPhotos = (sectorId, positionId) =>
  Boolean(getPosition(sectorId, positionId)?.photos);

export const ALL_POSITIONS = Object.entries(POSITIONS).flatMap(([sectorId, list]) =>
  list.map((p) => ({ ...p, sectorId }))
);
