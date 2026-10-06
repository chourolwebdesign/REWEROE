/** Wochentag wie `Date#getUTCDay`: 0 = Sonntag … 6 = Samstag. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Öffnungszeit als Berliner Wandzeit, "HH:MM". */
export type TimeRange = readonly [open: string, close: string];

export interface SpecialDay {
  /** ISO-Datum JJJJ-MM-TT */
  date: string;
  label: string;
  /** null = geschlossen */
  hours: TimeRange | null;
}

export interface HoursConfig {
  regular: Record<Weekday, TimeRange | null>;
  /** Vom Markt bestätigte Ausnahmen. Haben Vorrang vor Feiertagen und gesetzlichen Grenzen. */
  specialDays: readonly SpecialDay[];
}

export interface Service {
  id: string;
  name: string;
  text: string;
}

export interface Markt {
  name: string;
  legalName: string;
  /** REWE-Marktnummer (rewe.de) */
  marketId: string;
  address: { street: string; zip: string; city: string; district: string; country: "DE" };
  geo: { lat: number; lng: number };
  phone: { display: string; e164: string };
  /** null, solange der Betreiber keine Adresse genannt hat – wird dann nirgends angezeigt. */
  email: string | null;
  hours: HoursConfig;
  services: readonly Service[];
  instagramHandle: string;
  links: {
    flyer: string;
    marktseite: string;
    instagram: string;
    /** Google-Bewertung (Feedback-Dank); bis zum g.page/r/…/review-Link das Profil */
    googleReview: string;
    jobs: string;
    ausbildung: string;
    googleMaps: string;
    appleMaps: string;
  };
}
