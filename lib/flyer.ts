/**
 * Prospektwoche des Markts: Der REWE-Wochenprospekt gilt Montag bis Samstag.
 * Sonntags zeigt die Website schon die kommende Woche („gültig ab morgen“), weil rewe.de das ebenso tut.
 * Fällt der Montag auf einen Feiertag, beginnt die Woche am nächsten Öffnungstag.
 */
import { markt } from "@/content/markt";
import { addDays, berlinNow, dayPlan, formatDayMonth, weekdayOf, WEEKDAYS, WEEKDAYS_SHORT } from "./hours";
import type { HoursConfig } from "./types";

export interface FlyerWeek {
  kw: number;
  /** ISO-Daten des ersten und letzten gültigen Tages */
  from: string;
  to: string;
  /** „Mo 05.10. – Sa 10.10.2026“ */
  range: string;
  /** true, wenn die Woche noch nicht begonnen hat (sonntags, Feiertags-Montag) */
  startsLater: boolean;
  /** „gültig ab morgen“ / „gültig ab Dienstag“ / „gültig bis Samstag“ */
  note: string;
}

/** ISO-8601-Kalenderwoche eines ISO-Datums. */
export function isoWeek(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

const label = (iso: string) => `${WEEKDAYS_SHORT[weekdayOf(iso)]} ${formatDayMonth(iso)}`;

export function flyerWeek(now: Date = new Date(), cfg: HoursConfig = markt.hours): FlyerWeek {
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = wd === 0 ? addDays(today, 1) : addDays(today, 1 - wd);
  const saturday = addDays(monday, 5);

  let from = monday;
  while (from < saturday && !dayPlan(from, cfg).hours) from = addDays(from, 1);
  let to = saturday;
  while (to > from && !dayPlan(to, cfg).hours) to = addDays(to, -1);

  const startsLater = from > today;
  const note = !startsLater
    ? `gültig bis ${WEEKDAYS[weekdayOf(to)]}`
    : from === addDays(today, 1)
      ? "gültig ab morgen"
      : `gültig ab ${WEEKDAYS[weekdayOf(from)]}`;

  return { kw: isoWeek(monday), from, to, range: `${label(from)} – ${label(to)}${to.slice(0, 4)}`, startsLater, note };
}
