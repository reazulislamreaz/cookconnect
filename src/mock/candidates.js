// Demo candidate profiles. Deterministic for the same hydration reason as jobs.js.
//
// Change Requirements 07: the candidate search area shows 12 profiles per page.
// Change Requirements 13: phone numbers are sensitive and are never exposed to a
// guest — `phone` is only surfaced through the mock API for a signed-in employer.

import { POSITIONS, canUploadFoodPhotos, MAX_FOOD_PHOTOS } from "./sectors";
import { getCity } from "./cities";

const PHOTOS = [
  "https://i.ibb.co/HD6WMnhg/Rectangle-119.png",
  "https://i.ibb.co/9kBThpjC/Rectangle-118.png",
  "https://i.ibb.co/1Gfd7RtB/Rectangle-117.png",
  "https://i.ibb.co/j9Wwj0H0/Rectangle-116.png",
];

const NAMES = [
  ["Youssef", "El Amrani"], ["Fatima", "Bennani"], ["Karim", "Ouazzani"],
  ["Salma", "Idrissi"], ["Mehdi", "Tazi"], ["Nadia", "Chraibi"],
  ["Omar", "Berrada"], ["Imane", "Fassi"], ["Hamza", "Alaoui"],
  ["Sanaa", "Belkadi"], ["Rachid", "Naciri"], ["Khadija", "Sbai"],
  ["Anas", "Lahlou", ], ["Meryem", "Kettani"], ["Ilyas", "Bouhaddou"],
  ["Zineb", "Harti"], ["Adil", "Mansouri"], ["Houda", "Reda"],
  ["Bilal", "Skalli"], ["Amina", "Cherkaoui"], ["Soufiane", "Benjelloun"],
  ["Loubna", "Hakimi"], ["Tarik", "Ziani"], ["Ghita", "Sefrioui"],
  ["Yassine", "Amrani"], ["Hind", "Bakkali"], ["Reda", "Moujahid"],
  ["Asmae", "Filali"], ["Walid", "Guessous"], ["Siham", "Rifai"],
];

const SEED = [
  ["restaurant", "head-chef", "casablanca", "5-10", "immediate"],
  ["bakery", "pastry-chef", "rabat", "3-5", "1-month"],
  ["hotel", "receptionist", "marrakech", "1-3", "immediate"],
  ["asian", "sushi-chef", "tanger", "5-10", "immediate"],
  ["restaurant", "sous-chef", "casablanca", "3-5", "1-month"],
  ["restaurant", "waiter", "agadir", "0-1", "immediate"],
  ["hotel", "housekeeper", "marrakech", "1-3", "immediate"],
  ["bakery", "baker", "fes", "3-5", "3-months"],
  ["restaurant", "pizzaiolo", "casablanca", "1-3", "immediate"],
  ["asian", "asian-cook", "rabat", "1-3", "1-month"],
  ["restaurant", "barista", "tanger", "0-1", "immediate"],
  ["hotel", "concierge", "marrakech", "3-5", "1-month"],
  ["bakery", "chocolatier", "casablanca", "5-10", "immediate"],
  ["restaurant", "chef-de-partie", "meknes", "3-5", "immediate"],
  ["hotel", "front-office-manager", "agadir", "5-10", "3-months"],
  ["restaurant", "cook", "oujda", "1-3", "immediate"],
  ["asian", "teppanyaki-chef", "casablanca", "10+", "1-month"],
  ["bakery", "head-baker", "rabat", "10+", "immediate"],
  ["restaurant", "barman", "essaouira", "1-3", "immediate"],
  ["hotel", "security-guard", "kenitra", "0-1", "immediate"],
  ["restaurant", "kitchen-commis", "casablanca", "0-1", "immediate"],
  ["bakery", "viennoisier", "tetouan", "3-5", "1-month"],
  ["asian", "sushi-commis", "tanger", "0-1", "immediate"],
  ["restaurant", "restaurant-manager", "casablanca", "10+", "3-months"],
  ["hotel", "guest-relations", "marrakech", "1-3", "immediate"],
  ["bakery", "ice-cream-maker", "agadir", "1-3", "immediate"],
  ["restaurant", "garde-manger", "rabat", "3-5", "1-month"],
  ["hotel", "gardener", "eljadida", "0-1", "immediate"],
  ["restaurant", "delivery-driver", "casablanca", "0-1", "immediate"],
  ["asian", "asian-sous-chef", "casablanca", "5-10", "immediate"],
];

const SKILL_POOL = [
  ["moroccan-cuisine", "haccp", "french"],
  ["international-cuisine", "food-hygiene", "french", "english"],
  ["italian-cuisine", "diploma", "french", "arabic"],
  ["asian-cuisine", "haccp", "french", "english"],
  ["bakery-pastry", "food-hygiene", "french"],
  ["hotel-experience", "management", "french", "english", "spanish"],
];

const TRAINING = [
  { school: "OFPPT — Institut Spécialisé de Technologie Appliquée Hôtelière", diploma: "Technicien en cuisine", from: "2016", to: "2018" },
  { school: "École Hôtelière de Casablanca", diploma: "Diplôme de cuisine", from: "2014", to: "2016" },
  { school: "Centre de Formation Boulangerie-Pâtisserie", diploma: "CAP Pâtisserie", from: "2017", to: "2019" },
];

export const CANDIDATES = SEED.map(([sectorId, positionId, city, experience, availability], i) => {
  const [firstName, lastName] = NAMES[i];
  const position = POSITIONS[sectorId].find((p) => p.id === positionId);
  const eligible = canUploadFoodPhotos(sectorId, positionId);

  // 0-8 food photos, only for eligible roles.
  const photoCount = eligible ? (i % (MAX_FOOD_PHOTOS + 1)) : 0;

  // A few profiles are deliberately incomplete so the "Incomplete Profile"
  // gate (Change Requirements 06) has something to trigger on.
  const completion = i % 7 === 3 ? 60 : i % 5 === 2 ? 85 : 100;

  return {
    id: `cand-${i + 1}`,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    photo: PHOTOS[i % PHOTOS.length],
    sectorId,
    positionId,
    title: position.fr,
    titleAr: position.ar,
    city,
    country: "MA",
    experience,
    availability,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}@example.ma`,
    phone: `+212 6 ${10 + (i % 80)} ${20 + (i % 70)} ${30 + (i % 60)} ${40 + (i % 50)}`,
    verified: i % 4 !== 1,
    completion,
    expectedSalary: 4000 + (i % 12) * 1000,
    contractType: i % 3 === 0 ? "short-term" : "long-term",
    skills: SKILL_POOL[i % SKILL_POOL.length],
    training: [TRAINING[i % TRAINING.length]],
    history: [
      {
        establishment: ["Hôtel Atlas", "Café Central", "Le Petit Marocain", "Riad Nour"][i % 4],
        position: position.fr,
        from: `${2018 + (i % 4)}`,
        to: `${2021 + (i % 4)}`,
      },
    ],
    canUploadFoodPhotos: eligible,
    foodPhotos: Array.from({ length: photoCount }, (_, k) => PHOTOS[(i + k) % PHOTOS.length]),
    hasCv: i % 3 !== 1,
    about: `${position.fr} avec ${experience.replace("-", " à ")} ans d'expérience, basé(e) à ${getCity(city)?.fr || city}. Rigoureux(se), habitué(e) au rythme du service et au travail en brigade.`,
    registeredAt: `2026-0${1 + (i % 8)}-${String(1 + (i % 27)).padStart(2, "0")}`,
  };
});

export const getCandidate = (id) => CANDIDATES.find((c) => c.id === id) || null;

/** The candidate currently "signed in" in the demo. */
export const CURRENT_CANDIDATE_ID = "cand-1";
