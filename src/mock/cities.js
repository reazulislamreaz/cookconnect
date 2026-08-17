// Change Requirements 07 "Country Lock": country is fixed to Morocco while
// Morocco is the primary market; only city-level filtering is offered.

export const COUNTRY = { id: "MA", fr: "Maroc", ar: "المغرب" };

export const CITIES = [
  { id: "casablanca", fr: "Casablanca", ar: "الدار البيضاء" },
  { id: "rabat", fr: "Rabat", ar: "الرباط" },
  { id: "marrakech", fr: "Marrakech", ar: "مراكش" },
  { id: "fes", fr: "Fès", ar: "فاس" },
  { id: "tanger", fr: "Tanger", ar: "طنجة" },
  { id: "agadir", fr: "Agadir", ar: "أݣادير" },
  { id: "meknes", fr: "Meknès", ar: "مكناس" },
  { id: "oujda", fr: "Oujda", ar: "وجدة" },
  { id: "kenitra", fr: "Kénitra", ar: "القنيطرة" },
  { id: "tetouan", fr: "Tétouan", ar: "تطوان" },
  { id: "essaouira", fr: "Essaouira", ar: "الصويرة" },
  { id: "eljadida", fr: "El Jadida", ar: "الجديدة" },
  { id: "nador", fr: "Nador", ar: "الناظور" },
  { id: "ouarzazate", fr: "Ouarzazate", ar: "ورزازات" },
  { id: "dakhla", fr: "Dakhla", ar: "الداخلة" },
];

export const getCity = (id) => CITIES.find((c) => c.id === id) || null;
