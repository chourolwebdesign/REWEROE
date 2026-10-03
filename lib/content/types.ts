import type { L10n } from "@/lib/l10n";

export type Img = { src: string; alt: L10n; ratio?: "4:5" | "16:9" | "1:1" };
export type Status = "pending" | "published";

export type Badge = "bio" | "regional" | "neu" | "vegan" | "glutenfrei" | "angebot";

export interface Settings {
  brand: {
    name: string; merchant: string; merchantLegal: string; owner: string; district: string;
    claim: string; premiumClaim: L10n; tagline: L10n; logo: string | null; siteUrl: string; voice: L10n;
  };
  contact: { status: Status; phone: string; email: string; hoursNote: L10n };
  social: { id: string; label: string; url: string }[];
  freshnessClock: { from: number; to: number; message: L10n }[];
  marquee: L10n[];
  newsletter: { discount: number; status: Status };
  payments: string[];
  delivery: {
    pickup: boolean; deliveryFee: number; freeFrom: number; minOrder: number;
    slots: { id: string; day: "today" | "tomorrow"; from: string; to: string; price: number }[];
  };
  pfand: { types: { id: string; label: L10n; amount: number }[] };
  payback: { eurosPerPoint: number; centPerPoint: number; welcomePoints: number };
  stats: { id: string; value: number; suffix: string; label: L10n }[];
}

export interface Category { slug: string; order: number; name: L10n; teaser: L10n; image: Img }

export interface Product {
  slug: string; sku: string; category: string; name: L10n; subtitle: L10n;
  price: number; unit: { amount: number; unit: string }; basePrice: { per: string; amount: number };
  pfand?: { type: string; amount: number };
  badges: Badge[]; rating: number; reviews: number; weightGrams: number; images: Img[];
  origin: { producer: string; story: L10n };
  nutrition: { kcal: number; fat: number; carbs: number; sugar: number; protein: number; salt: number };
  tags: string[]; recipes: string[];
}

export interface Producer {
  slug: string; name: string; region: L10n; distanceKm: number; coords: [number, number];
  international?: boolean; image: Img; story: L10n;
}

export interface Ingredient { name: L10n; amount: number; unit: string; productSlug: string | null }

export interface Recipe {
  slug: string; featured?: boolean; title: L10n; teaser: L10n; image: Img;
  time: number; servings: number; difficulty: "leicht" | "mittel" | "schwer";
  season: "fruehling" | "sommer" | "herbst" | "winter" | "ganzjaehrig";
  diet: string[]; rating: number; ingredients: Ingredient[]; steps: L10n[]; tips: L10n[];
  nutrition: { kcal: number; fat: number; carbs: number; protein: number };
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Store {
  slug: string; name: string; merchant: string; owner: string; storeNumber: string;
  address: { status: Status; street: string; zip: string; city: string; district: string };
  coords: [number, number]; coordsNote?: string; phone: string; email: string;
  hours: Record<Weekday, [string, string] | null>; hoursStatus: Status;
  services: string[]; images: Img[]; intro: L10n; status: Status;
}

export interface Campaign {
  slug: string; title: L10n; productSlug: string; percent: number;
  validFrom: string; validUntil: string; page: number;
}

export interface Article {
  slug: string; category: "saison" | "gesundheit" | "region"; featured?: boolean;
  title: L10n; excerpt: L10n; author: { name: string; status: Status }; readMinutes: number;
  publishedAt: string; cover: Img; relatedRecipes: string[]; body: L10n;
}

export interface Job {
  slug: string; title: L10n; location: string; type: string; department: L10n; teaser: L10n;
  description: L10n; datePosted: string; validThrough: string; salary: null | { min: number; max: number };
}

export interface LegalPage { slug: string; title: L10n; status: Status; body: L10n | null; updatedAt: string | null }

export interface About {
  hero: { title: L10n; subtitle: L10n; image: Img };
  timeline: { year: string; title: L10n; text: L10n; status?: Status }[];
  values: { id: string; title: L10n; text: L10n }[];
  team: { name: string | null; role: L10n; image: Img; status: Status }[];
}

export interface Sustainability {
  hero: { title: L10n; quote: L10n; image: Img };
  goals: { id: string; label: L10n; progress: number; target: string }[];
  sections: { id: string; eyebrow: string; title: L10n; text: L10n }[];
  certificates: { id: string; label: string }[];
}

export interface Bonus {
  hero: { title: L10n; subtitle: L10n; image: Img };
  steps: { n: string; title: L10n; text: L10n }[];
  benefits: { title: L10n; text: L10n }[];
}

export interface Faq { q: L10n; a: L10n }
