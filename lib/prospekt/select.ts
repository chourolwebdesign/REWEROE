/**
 * Welche Prospekte die Website zeigt (Berliner Zeit), Spec Abschnitt 3:
 * „Diese Woche“ = Prospekt der laufenden Woche (Mo–So); „Nächste Woche“ ab Samstag, sonntags vorausgewählt.
 * Ein älterer Prospekt wird nie gezeigt – dann fällt die Seite auf den Link zu rewe.de zurück.
 */
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";

export interface FlyerRecord {
  id: string;
  week_start: string;
  kw: number;
  year: number;
  valid_from: string;
  valid_to: string;
  page_count: number;
  page_width: number;
  page_height: number;
  format: "webp" | "jpg";
}

export interface FlyerChoice {
  current: FlyerRecord | null;
  next: FlyerRecord | null;
  defaultTab: "current" | "next";
}

export function pickFlyers(flyers: FlyerRecord[], now: Date): FlyerChoice {
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = addDays(today, wd === 0 ? -6 : 1 - wd);
  const current = flyers.find((f) => f.week_start === monday) ?? null;
  const upcoming = flyers.find((f) => f.week_start === addDays(monday, 7)) ?? null;
  const next = wd === 6 || wd === 0 ? upcoming : null;
  // sonntags gilt die neue Woche (wie das Ticket „gültig ab morgen“) – fehlt ihr Prospekt, zeigt die Website keinen Titel
  return { current, next, defaultTab: wd === 0 ? "next" : "current" };
}

/** Der Prospekt, den die Website gerade zeigt (Startseiten-Ticket, „Prospekt“-Knöpfe): der vorausgewählte Reiter. */
export function shownFlyer(choice: FlyerChoice): FlyerRecord | null {
  return choice.defaultTab === "next" ? choice.next : choice.current;
}

/** Ziel der „Prospekt“-Knöpfe: der eigene Viewer, wenn ein Prospekt online ist – sonst der REWE-Prospekt. */
export function flyerLink(shown: FlyerRecord | null, rewePdf: string): { href: string; external: boolean } {
  return shown ? { href: "/angebote#prospekt", external: false } : { href: rewePdf, external: true };
}
