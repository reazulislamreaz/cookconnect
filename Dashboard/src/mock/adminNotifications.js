// What the platform tells a user after an administrator decides something.
//
// Improvement points 17: an approval, a rejection or a reply must reach the user
// twice — once in the platform and once by email — and a photo rejection has to
// explain itself well enough that the candidate can upload a compliant photo
// without guessing.
//
// Templates rather than strings written at the call site: the same decision has
// to read identically wherever an admin makes it, and every message has to exist
// in all three languages. `{placeholders}` are filled from the action's own
// parameters.
//
// Nothing here sends an email. `notifyUser` in adminApi.js queues a record and
// the outbox shows it as queued, which is the honest state until the backend's
// mail provider exists (docs/backend, task 4.2).

export const NOTIFICATION_TEMPLATES = {
  "profile.verified": {
    audience: "candidate",
    title: "Votre profil a été validé",
    titleAr: "البروفيل ديالك تصادق عليه",
    titleEn: "Your profile has been approved",
    body: "Félicitations, votre profil est maintenant visible par les employeurs et vous pouvez postuler aux offres.",
    bodyAr: "مبروك، البروفيل ديالك دابا كيبان للمشغّلين وتقدر ترشّح للعروض.",
    bodyEn: "Congratulations — your profile is now visible to employers and you can apply to offers.",
  },

  "establishment.approved": {
    audience: "employer",
    title: "Votre établissement a été approuvé",
    titleAr: "المؤسسة ديالك تصادق عليها",
    titleEn: "Your establishment has been approved",
    body: "Votre compte est actif. Vous pouvez publier vos offres — chacune est vérifiée par notre équipe avant sa mise en ligne.",
    bodyAr: "الحساب ديالك خدام. تقدر تنشر العروض ديالك — كل عرض كيتشيك من الفريق ديالنا قبل ما يطلع.",
    bodyEn: "Your account is active. You can post your offers — each one is checked by our team before it goes live.",
  },

  "establishment.rejected": {
    audience: "employer",
    title: "Votre inscription n'a pas été retenue",
    titleAr: "التسجيل ديالك ما تقبلش",
    titleEn: "Your registration was not accepted",
    body: "Motif : {reason}. Vous pouvez corriger les informations de votre établissement et soumettre à nouveau.",
    bodyAr: "السبب: {reason}. تقدر تصلّح المعلومات ديال المؤسسة وتعاود تصيفط.",
    bodyEn: "Reason: {reason}. You can correct your establishment's details and submit again.",
  },

  "offer.approved": {
    audience: "employer",
    title: "Votre offre est en ligne",
    titleAr: "العرض ديالك تنشر",
    titleEn: "Your offer is live",
    body: "« {offer} » est publiée et visible par les candidats jusqu'au {expiresAt}.",
    bodyAr: "«{offer}» تنشرات وكتبان للمترشحين حتى ل {expiresAt}.",
    bodyEn: "“{offer}” is published and visible to candidates until {expiresAt}.",
  },

  "offer.rejected": {
    audience: "employer",
    title: "Votre offre n'a pas été publiée",
    titleAr: "العرض ديالك ما تنشرش",
    titleEn: "Your offer was not published",
    body: "« {offer} » a été refusée. Motif : {reason}. Corrigez l'offre et soumettez-la à nouveau.",
    bodyAr: "«{offer}» مرفوض. السبب: {reason}. صلّح العرض وعاود صيفطو.",
    bodyEn: "“{offer}” was rejected. Reason: {reason}. Correct the offer and submit it again.",
  },

  "photo.rejected": {
    audience: "candidate",
    title: "Votre photo n'a pas été acceptée",
    titleAr: "التصويرة ديالك ما تقبلاتش",
    titleEn: "Your photo was not accepted",
    body: "Motif : {reason}. Importez une nouvelle photo qui respecte ce point et elle sera vérifiée à nouveau.",
    bodyAr: "السبب: {reason}. دخّل تصويرة جديدة كتحترم هاد الشي وغادي تتشاف من جديد.",
    bodyEn: "Reason: {reason}. Upload a new photo that meets this requirement and it will be reviewed again.",
  },

  "account.blocked": {
    audience: "both",
    title: "Votre compte a été suspendu",
    titleAr: "الحساب ديالك توقف",
    titleEn: "Your account has been suspended",
    body: "Motif : {reason}. Contactez l'assistance si vous pensez qu'il s'agit d'une erreur.",
    bodyAr: "السبب: {reason}. تواصل مع الدعم إلا كتظن أن كاين شي غلط.",
    bodyEn: "Reason: {reason}. Contact support if you believe this is a mistake.",
  },

  "account.unblocked": {
    audience: "both",
    title: "Votre compte a été rétabli",
    titleAr: "الحساب ديالك ترجّع",
    titleEn: "Your account has been restored",
    body: "Vous pouvez de nouveau utiliser la plateforme normalement.",
    bodyAr: "تقدر ترجع تستعمل المنصة بشكل عادي.",
    bodyEn: "You can use the platform normally again.",
  },

  "feedback.replied": {
    audience: "both",
    title: "Réponse à votre message",
    titleAr: "جواب على الرسالة ديالك",
    titleEn: "A reply to your message",
    body: "L'équipe CookconneKt vous a répondu : « {reply} »",
    bodyAr: "الفريق ديال CookconneKt جاوبك: «{reply}»",
    bodyEn: "The CookconneKt team replied: “{reply}”",
  },
};

/** Fills `{placeholders}` from `params`; an unknown key is left visible, not blanked. */
export const fillTemplate = (text, params = {}) =>
  String(text).replace(/\{(\w+)\}/g, (whole, key) =>
    params[key] === undefined ? whole : String(params[key])
  );
