// Selectable option lists. Change Requirements section 08 is explicit that job
// requirements and benefits must be checkboxes / dropdowns, never free text.
// Option values come verbatim from ClientDoc section 10.

/** Job requirements — grouped checkboxes on the "Post a Job" form. */
export const JOB_REQUIREMENTS = [
  {
    id: "availability",
    fr: "Disponibilité",
    ar: "التوفر",
    en: "Availability",
    options: [
      { id: "immediate", fr: "Disponible immédiatement", ar: "متوفر دابا", en: "Available immediately" },
      { id: "morning", fr: "Disponible le matin", ar: "متوفر فالصباح", en: "Available mornings" },
      { id: "evening", fr: "Disponible le soir", ar: "متوفر فالعشية", en: "Available evenings" },
      { id: "weekends", fr: "Disponible week-ends et jours fériés", ar: "متوفر فالويكاند والأعياد", en: "Available weekends and public holidays" },
    ],
  },
  {
    id: "skills",
    fr: "Compétences",
    ar: "المهارات",
    en: "Skills",
    options: [
      { id: "diploma", fr: "Diplôme de cuisine ou sans diplôme", ar: "ديبلوم دالطبخ ولا بلا ديبلوم", en: "Culinary diploma or no diploma" },
      { id: "moroccan-cuisine", fr: "Cuisine marocaine", ar: "الطبخ المغربي", en: "Moroccan cuisine" },
      { id: "international-cuisine", fr: "Cuisine internationale", ar: "الطبخ العالمي", en: "International cuisine" },
      { id: "italian-cuisine", fr: "Cuisine italienne", ar: "الطبخ الإيطالي", en: "Italian cuisine" },
      { id: "asian-cuisine", fr: "Cuisine asiatique", ar: "الطبخ الآسيوي", en: "Asian cuisine" },
      { id: "collective-catering", fr: "Expérience en restauration collective", ar: "تجربة فالإطعام الجماعي", en: "Contract catering experience" },
      { id: "bakery-pastry", fr: "Compétences boulangerie / pâtisserie", ar: "مهارات المخبزة والحلويات", en: "Bakery / pastry skills" },
      { id: "hotel-experience", fr: "Expérience hôtelière", ar: "تجربة فالأوطيل", en: "Hotel experience" },
      { id: "management", fr: "Expérience en management", ar: "تجربة فالتسيير", en: "Management experience" },
    ],
  },
  {
    id: "hygiene",
    fr: "Hygiène",
    ar: "النظافة",
    en: "Hygiene",
    options: [
      { id: "haccp", fr: "Connaissance HACCP", ar: "معرفة HACCP", en: "HACCP knowledge" },
      { id: "food-hygiene", fr: "Formation hygiène alimentaire", ar: "تكوين فالنظافة الغذائية", en: "Food hygiene training" },
      { id: "uniform", fr: "Tenue professionnelle exigée", ar: "لباس مهني ضروري", en: "Professional uniform required" },
    ],
  },
  {
    id: "mobility",
    fr: "Mobilité",
    ar: "التنقل",
    en: "Mobility",
    options: [
      { id: "driving-licence", fr: "Permis de conduire", ar: "بيرمي", en: "Driving licence" },
      { id: "geographic-mobility", fr: "Mobilité géographique", ar: "استعداد للتنقل", en: "Willing to relocate" },
    ],
  },
  {
    id: "languages",
    fr: "Langues",
    ar: "اللغات",
    en: "Languages",
    options: [
      { id: "french", fr: "Français", ar: "الفرنسية", en: "French" },
      { id: "arabic", fr: "Arabe", ar: "العربية", en: "Arabic" },
      { id: "english", fr: "Anglais", ar: "الإنجليزية", en: "English" },
      { id: "spanish", fr: "Espagnol", ar: "الإسبانية", en: "Spanish" },
    ],
  },
];

/** Job benefits — same checkbox treatment. */
export const JOB_BENEFITS = [
  {
    id: "salary",
    fr: "Salaire",
    ar: "الأجرة",
    en: "Salary",
    options: [
      { id: "fixed-salary", fr: "Salaire fixe", ar: "أجرة قارة", en: "Fixed salary" },
      { id: "bonuses", fr: "Primes", ar: "بريمات", en: "Bonuses" },
      { id: "tips", fr: "Pourboires", ar: "البقشيش", en: "Tips" },
      { id: "paid-overtime", fr: "Heures supplémentaires payées", ar: "ساعات إضافية مخلصة", en: "Paid overtime" },
    ],
  },
  {
    id: "social-protection",
    fr: "Protection sociale",
    ar: "الحماية الاجتماعية",
    en: "Social protection",
    options: [
      { id: "cnss", fr: "Déclaration CNSS", ar: "تصريح CNSS", en: "CNSS registration" },
      { id: "health-insurance", fr: "Assurance maladie", ar: "تأمين صحي", en: "Health insurance" },
      { id: "contract", fr: "Contrat de travail", ar: "عقد الخدمة", en: "Employment contract" },
    ],
  },
  {
    id: "meals-transport",
    fr: "Repas / Transport",
    ar: "الماكلة والتنقل",
    en: "Meals / Transport",
    options: [
      { id: "meals", fr: "Repas ou déjeuner fourni", ar: "الماكلة مضمونة", en: "Meals or lunch provided" },
      { id: "transport", fr: "Transport assuré", ar: "النقل مضمون", en: "Transport provided" },
      { id: "transport-allowance", fr: "Indemnité de transport", ar: "تعويض عن النقل", en: "Transport allowance" },
    ],
  },
  {
    id: "working-conditions",
    fr: "Conditions de travail",
    ar: "ظروف الخدمة",
    en: "Working conditions",
    options: [
      { id: "uniform-provided", fr: "Tenue fournie", ar: "اللباس مضمون", en: "Uniform provided" },
      { id: "paid-leave", fr: "Congés payés", ar: "عطل مخلصة", en: "Paid leave" },
      { id: "accommodation", fr: "Logement fourni", ar: "السكن مضمون", en: "Accommodation provided" },
    ],
  },
];

/**
 * Contract types, on offers and on candidate preferences.
 *
 * Supersedes the "Long terme / Court terme" pair that Change Requirements 07
 * specified for the offers filter. The client replaced it with the standard
 * French contract vocabulary, which is a different axis rather than a renaming:
 * CDI is the old "long terme", while CDD, intérim and stage all fall under the
 * old "court terme". Nothing is lost — the old distinction is still derivable
 * (CDI vs everything else) — and the new list is what an employer actually
 * writes on a job advert, so it is the more useful filter.
 *
 * "Non précisé" exists because an employer may genuinely not have decided yet;
 * without it they pick a contract type at random and the filter lies.
 *
 * `short` is for compact contexts — the tag on an offer card, where the full
 * "CDI (contrat à durée indéterminée)" swamps the salary next to it. Read it
 * with pick(contract, "short"); dropdowns and the offer detail keep the full
 * wording, which is what makes the abbreviation legible in the first place.
 */
export const CONTRACT_TYPES = [
  { id: "cdi", fr: "CDI (contrat à durée indéterminée)", ar: "CDI (عقد دائم)", en: "Permanent contract (CDI)", short: "CDI", shortAr: "CDI", shortEn: "CDI" },
  { id: "cdd", fr: "CDD (contrat à durée déterminée)", ar: "CDD (عقد محدد المدة)", en: "Fixed-term contract (CDD)", short: "CDD", shortAr: "CDD", shortEn: "CDD" },
  { id: "interim", fr: "Intérim", ar: "انتيريم (خدمة مؤقتة)", en: "Temporary work (Intérim)", short: "Intérim", shortAr: "انتيريم", shortEn: "Temp" },
  { id: "stage", fr: "Stage", ar: "ستاج (تدريب)", en: "Internship (Stage)", short: "Stage", shortAr: "ستاج", shortEn: "Internship" },
  { id: "unspecified", fr: "Non précisé", ar: "غير محدد", en: "Not specified", short: "Non précisé", shortAr: "غير محدد", shortEn: "Not specified" },
];

/** Change Requirements 07: establishment type filter. */
export const ESTABLISHMENT_TYPES = [
  { id: "restaurant", fr: "Restaurant", ar: "ريسطو", en: "Restaurant" },
  { id: "hotel", fr: "Hôtel", ar: "أوطيل", en: "Hotel" },
  { id: "bakery", fr: "Boulangerie / Pâtisserie", ar: "مخبزة / حلويات", en: "Bakery / Pastry" },
  { id: "cafe", fr: "Café", ar: "قهوة", en: "Café" },
  { id: "catering", fr: "Restauration collective / Traiteur", ar: "إطعام جماعي / تريتور", en: "Contract catering / Caterer" },
];

export const EXPERIENCE_LEVELS = [
  { id: "0-1", fr: "Moins d'un an", ar: "أقل من عام", en: "Less than a year" },
  { id: "1-3", fr: "1 à 3 ans", ar: "من 1 ل 3 سنين", en: "1 to 3 years" },
  { id: "3-5", fr: "3 à 5 ans", ar: "من 3 ل 5 سنين", en: "3 to 5 years" },
  { id: "5-10", fr: "5 à 10 ans", ar: "من 5 ل 10 سنين", en: "5 to 10 years" },
  { id: "10+", fr: "Plus de 10 ans", ar: "أكثر من 10 سنين", en: "More than 10 years" },
];

/**
 * Why an admin turned an offer down (Improvement points 15).
 *
 * Predefined so the employer gets a reason they can act on rather than a bare
 * refusal, and so the same wording reaches them in whichever language they read
 * the platform in. `other` is the escape hatch: it expects a written note.
 */
export const OFFER_REJECTION_REASONS = [
  { id: "incomplete-description", fr: "Description incomplète", ar: "الوصف ناقص", en: "Incomplete description" },
  { id: "salary-non-compliant", fr: "Salaire non conforme", ar: "الأجرة ماشي مطابقة", en: "Salary does not comply" },
  { id: "duplicate", fr: "Offre en double", ar: "العرض مكرر", en: "Duplicate offer" },
  { id: "missing-contract-details", fr: "Type de contrat ou horaires manquants", ar: "نوع العقد ولا التوقيت ناقص", en: "Contract type or hours missing" },
  { id: "inappropriate-content", fr: "Contenu inapproprié", ar: "محتوى ماشي مناسب", en: "Inappropriate content" },
  { id: "other", fr: "Autre motif", ar: "سبب آخر", en: "Other reason" },
];

export const REJECTION_REASON_BY_ID = OFFER_REJECTION_REASONS.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

/**
 * Why a photo was turned down (Improvement points 4 and 17).
 *
 * This is the client's own list, kept in their order. The point of predefining
 * them is that the candidate can act on the answer: "face not clearly visible"
 * tells them what to photograph again, where a bare refusal tells them to guess.
 */
export const PHOTO_REJECTION_REASONS = [
  { id: "poor-quality", fr: "Qualité d'image insuffisante", ar: "جودة التصويرة ضعيفة", en: "Poor image quality" },
  { id: "face-not-visible", fr: "Visage peu visible", ar: "الوجه ما بايناش مزيان", en: "Face not clearly visible" },
  { id: "multiple-people", fr: "Plusieurs personnes sur la photo", ar: "بزاف ديال الناس فالتصويرة", en: "Multiple people in the photo" },
  { id: "inappropriate-content", fr: "Contenu inapproprié", ar: "محتوى ماشي مناسب", en: "Inappropriate content" },
  { id: "requirements", fr: "Photo non conforme aux exigences de la plateforme", ar: "التصويرة ما كتحترمش شروط المنصة", en: "Photo does not meet platform requirements" },
  { id: "other", fr: "Autre motif", ar: "سبب آخر", en: "Other reason" },
];

export const PHOTO_REASON_BY_ID = PHOTO_REJECTION_REASONS.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

/** Why an establishment's registration was turned down (Improvement points 17). */
export const ESTABLISHMENT_REJECTION_REASONS = [
  { id: "unverifiable", fr: "Établissement non vérifiable", ar: "المؤسسة ما يمكنش نتحققو منها", en: "Establishment could not be verified" },
  { id: "incomplete-details", fr: "Informations incomplètes", ar: "المعلومات ناقصة", en: "Incomplete details" },
  { id: "duplicate-account", fr: "Compte en double", ar: "الحساب مكرر", en: "Duplicate account" },
  { id: "out-of-scope", fr: "Activité hors du champ de la plateforme", ar: "النشاط خارج مجال المنصة", en: "Activity outside the platform's scope" },
  { id: "other", fr: "Autre motif", ar: "سبب آخر", en: "Other reason" },
];

export const AVAILABILITY = [
  { id: "immediate", fr: "Immédiatement", ar: "دابا", en: "Immediately" },
  { id: "1-month", fr: "Sous 1 mois", ar: "فشهر", en: "Within 1 month" },
  { id: "3-months", fr: "Sous 3 mois", ar: "ف 3 شهور", en: "Within 3 months" },
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
