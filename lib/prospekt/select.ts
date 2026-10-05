/**
 * Welche Prospekte die Website zeigt (Berliner Zeit), Spec Abschnitt 3:
 * „Diese Woche“ = Prospekt der laufenden Woche (Mo–So); „Nächste Woche“ ab Samstag, sonntags vorausgewählt.
 * Ein älterer Prospekt wird nie gezeigt – dann fällt die Seite auf den Link zu rewe.de zurück.
 */
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";
import { uploadWeek } from "@/lib/prospekt/week";

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

/**
 * Reiter auf /angebote. null = Rückfall auf den Link zu rewe.de: kein Prospekt – oder sonntags fehlt der Prospekt der
 * neuen Woche (der alte ist dann abgelaufen, die „Prospekt“-Knöpfe führen schon zu rewe.de).
 */
export function viewerTabs(choice: FlyerChoice): { key: "current" | "next"; flyer: FlyerRecord }[] | null {
  if (choice.defaultTab === "next" && !choice.next) return null;
  const tabs = [
    ...(choice.current ? [{ key: "current" as const, flyer: choice.current }] : []),
    ...(choice.next ? [{ key: "next" as const, flyer: choice.next }] : []),
  ];
  return tabs.length ? tabs : null;
}

/**
 * Geteilter Link /angebote?kw=42&seite=3 → Reiter und Seite. Ohne kw (ältere Links) gilt der vorausgewählte Reiter;
 * eine Woche, die nicht mehr online ist, öffnet keine Seite (sonst zeigte der Link einen anderen Prospekt).
 */
export function linkTarget(
  search: string,
  weeks: { key: "current" | "next"; kw: number; pages: number }[],
  defaultTab: "current" | "next",
): { tab: "current" | "next"; page: number | null } {
  const params = new URLSearchParams(search);
  const fallback = (weeks.find((w) => w.key === defaultTab) ?? weeks[0]).key;
  const kw = params.get("kw");
  const week = kw === null ? weeks.find((w) => w.key === fallback) : weeks.find((w) => String(w.kw) === kw);
  if (!week) return { tab: fallback, page: null };
  const n = Number(params.get("seite"));
  return { tab: week.key, page: Number.isInteger(n) && n >= 1 && n <= week.pages ? n : null };
}

const dayMonth = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;

/** Meldung nach dem Veröffentlichen: sofort sichtbar (laufende Woche, am Wochenende auch die nächste) oder ab dem Samstag davor. */
export function publishNotice(weekStart: string, now: Date): { online: boolean; title: string; text: string } {
  const { kw } = uploadWeek(weekStart);
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = addDays(today, wd === 0 ? -6 : 1 - wd);
  const online = { online: true, title: `Fertig! KW ${kw} ist online.` };
  const saved = { online: false, title: `Fertig! KW ${kw} ist gespeichert.` };
  if (weekStart === monday) return { ...online, text: "Die Website zeigt den Prospekt in wenigen Sekunden." };
  if (weekStart === addDays(monday, 7) && wd === 6) {
    return { ...online, text: "Die Website zeigt ihn in wenigen Sekunden unter „Nächste Woche“ – ab Montag als aktuellen Prospekt." };
  }
  if (weekStart === addDays(monday, 7) && wd === 0) return { ...online, text: "Die Website zeigt ihn in wenigen Sekunden als Prospekt der neuen Woche." };
  if (weekStart < monday) return { ...saved, text: "Diese Woche ist schon vorbei – die Website zeigt ihn nicht mehr." };
  return {
    ...saved,
    text: `Die Website zeigt ihn ab Samstag, ${dayMonth(addDays(weekStart, -2))}, unter „Nächste Woche“ – ab Montag, ${dayMonth(weekStart)}, als aktuellen Prospekt.`,
  };
}
