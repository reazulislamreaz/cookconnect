// Selectable option lists. Change Requirements section 08 is explicit that job
// requirements and benefits must be checkboxes / dropdowns, never free text.
// Option values come verbatim from ClientDoc section 10.

/** Job requirements — grouped checkboxes on the "Post a Job" form. */
export const JOB_REQUIREMENTS = [
  {
    id: "availability",
    fr: "Disponibilité",
    ar: "التوفر",
    options: [
      { id: "immediate", fr: "Disponible immédiatement", ar: "متوفر دابا" },
      { id: "morning", fr: "Disponible le matin", ar: "متوفر فالصباح" },
      { id: "evening", fr: "Disponible le soir", ar: "متوفر فالعشية" },
      { id: "weekends", fr: "Disponible week-ends et jours fériés", ar: "متوفر فالويكاند والأعياد" },
    ],
  },
  {
    id: "skills",
    fr: "Compétences",
    ar: "المهارات",
    options: [
      { id: "diploma", fr: "Diplôme de cuisine ou sans diplôme", ar: "ديبلوم دالطبخ ولا بلا ديبلوم" },
      { id: "moroccan-cuisine", fr: "Cuisine marocaine", ar: "الطبخ المغربي" },
      { id: "international-cuisine", fr: "Cuisine internationale", ar: "الطبخ العالمي" },
      { id: "italian-cuisine", fr: "Cuisine italienne", ar: "الطبخ الإيطالي" },
      { id: "asian-cuisine", fr: "Cuisine asiatique", ar: "الطبخ الآسيوي" },
      { id: "collective-catering", fr: "Expérience en restauration collective", ar: "تجربة فالإطعام الجماعي" },
      { id: "bakery-pastry", fr: "Compétences boulangerie / pâtisserie", ar: "مهارات المخبزة والحلويات" },
      { id: "hotel-experience", fr: "Expérience hôtelière", ar: "تجربة فالأوطيل" },
      { id: "management", fr: "Expérience en management", ar: "تجربة فالتسيير" },
    ],
  },
  {
    id: "hygiene",
    fr: "Hygiène",
    ar: "النظافة",
    options: [
      { id: "haccp", fr: "Connaissance HACCP", ar: "معرفة HACCP" },
      { id: "food-hygiene", fr: "Formation hygiène alimentaire", ar: "تكوين فالنظافة الغذائية" },
      { id: "uniform", fr: "Tenue professionnelle exigée", ar: "لباس مهني ضروري" },
    ],
  },
  {
    id: "mobility",
    fr: "Mobilité",
    ar: "التنقل",
    options: [
      { id: "driving-licence", fr: "Permis de conduire", ar: "بيرمي" },
      { id: "geographic-mobility", fr: "Mobilité géographique", ar: "استعداد للتنقل" },
    ],
  },
  {
    id: "languages",
    fr: "Langues",
    ar: "اللغات",
    options: [
      { id: "french", fr: "Français", ar: "الفرنسية" },
      { id: "arabic", fr: "Arabe", ar: "العربية" },
      { id: "english", fr: "Anglais", ar: "الإنجليزية" },
      { id: "spanish", fr: "Espagnol", ar: "الإسبانية" },
    ],
  },
];

/** Job benefits — same checkbox treatment. */
export const JOB_BENEFITS = [
  {
    id: "salary",
    fr: "Salaire",
    ar: "الأجرة",
    options: [
      { id: "fixed-salary", fr: "Salaire fixe", ar: "أجرة قارة" },
      { id: "bonuses", fr: "Primes", ar: "بريمات" },
      { id: "tips", fr: "Pourboires", ar: "البقشيش" },
      { id: "paid-overtime", fr: "Heures supplémentaires payées", ar: "ساعات إضافية مخلصة" },
    ],
  },
  {
    id: "social-protection",
    fr: "Protection sociale",
    ar: "الحماية الاجتماعية",
    options: [
      { id: "cnss", fr: "Déclaration CNSS", ar: "تصريح CNSS" },
      { id: "health-insurance", fr: "Assurance maladie", ar: "تأمين صحي" },
      { id: "contract", fr: "Contrat de travail", ar: "عقد الخدمة" },
    ],
  },
  {
    id: "meals-transport",
    fr: "Repas / Transport",
    ar: "الماكلة والتنقل",
    options: [
      { id: "meals", fr: "Repas ou déjeuner fourni", ar: "الماكلة مضمونة" },
      { id: "transport", fr: "Transport assuré", ar: "النقل مضمون" },
      { id: "transport-allowance", fr: "Indemnité de transport", ar: "تعويض عن النقل" },
    ],
  },
  {
    id: "working-conditions",
    fr: "Conditions de travail",
    ar: "ظروف الخدمة",
    options: [
      { id: "uniform-provided", fr: "Tenue fournie", ar: "اللباس مضمون" },
      { id: "paid-leave", fr: "Congés payés", ar: "عطل مخلصة" },
      { id: "accommodation", fr: "Logement fourni", ar: "السكن مضمون" },
    ],
  },
];

/** Change Requirements 07: offers filter by job type (long / short term). */
export const CONTRACT_TYPES = [
  { id: "long-term", fr: "Long terme", ar: "مدة طويلة" },
  { id: "short-term", fr: "Court terme", ar: "مدة قصيرة" },
];

/** Change Requirements 07: establishment type filter. */
export const ESTABLISHMENT_TYPES = [
  { id: "restaurant", fr: "Restaurant", ar: "ريسطو" },
  { id: "hotel", fr: "Hôtel", ar: "أوطيل" },
  { id: "bakery", fr: "Boulangerie / Pâtisserie", ar: "مخبزة / حلويات" },
  { id: "cafe", fr: "Café", ar: "قهوة" },
  { id: "catering", fr: "Restauration collective / Traiteur", ar: "إطعام جماعي / تريتور" },
];

export const EXPERIENCE_LEVELS = [
  { id: "0-1", fr: "Moins d'un an", ar: "أقل من عام" },
  { id: "1-3", fr: "1 à 3 ans", ar: "من 1 ل 3 سنين" },
  { id: "3-5", fr: "3 à 5 ans", ar: "من 3 ل 5 سنين" },
  { id: "5-10", fr: "5 à 10 ans", ar: "من 5 ل 10 سنين" },
  { id: "10+", fr: "Plus de 10 ans", ar: "أكثر من 10 سنين" },
];

export const AVAILABILITY = [
  { id: "immediate", fr: "Immédiatement", ar: "دابا" },
  { id: "1-month", fr: "Sous 1 mois", ar: "فشهر" },
  { id: "3-months", fr: "Sous 3 mois", ar: "ف 3 شهور" },
];

/** Flattened lookup so a stored option id can be rendered in either language. */
const flatten = (groups) =>
  groups.reduce((acc, g) => {
    g.options.forEach((o) => {
      acc[o.id] = o;
    });
    return acc;
  }, {});

export const REQUIREMENT_BY_ID = flatten(JOB_REQUIREMENTS);
export const BENEFIT_BY_ID = flatten(JOB_BENEFITS);
