/**
 * Welche Woche ein hochgeladener Prospekt abdeckt. Gültigkeit (Feiertags-Montag → ab Dienstag) kommt aus lib/flyer.ts,
 * damit Website, Markt-Kalender und Cockpit dieselben Daten zeigen.
 */
import { flyerWeek, isoWeek } from "@/lib/flyer";
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";

export interface UploadWeek {
  kw: number;
  /** ISO-Wochenjahr (KW 53/2026 endet im Januar 2027, gehört aber zu 2026) */
  year: number;
  /** Montag der Woche (ISO-Datum) */
  weekStart: string;
  validFrom: string;
  validTo: string;
  /** „Mo 05.10. – Sa 10.10.2026“ */
  range: string;
}

export function mondayOfIsoWeek(kw: number, year: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const offset = (jan4.getUTCDay() + 6) % 7; // 0 = Montag
  return new Date(Date.UTC(year, 0, 4 - offset + (kw - 1) * 7)).toISOString().slice(0, 10);
}

export function uploadWeek(weekStart: string): UploadWeek {
  const w = flyerWeek(new Date(`${addDays(weekStart, 2)}T10:00:00Z`));
  return { kw: w.kw, year: Number(addDays(weekStart, 3).slice(0, 4)), weekStart, validFrom: w.from, validTo: w.to, range: w.range };
}

const mondayOf = (iso: string) => addDays(iso, weekdayOf(iso) === 0 ? -6 : 1 - weekdayOf(iso));

export function weekFromFilename(name: string, now: Date): { kw: number; year: number } | null {
  const m = name.match(/kw[\s_-]?(\d{1,2})(?:[\s_-]+(20\d{2}))?/i);
  if (!m) return null;
  const kw = Number(m[1]);
  if (kw < 1 || kw > 53) return null;
  let year: number;
  if (m[2]) year = Number(m[2]);
  else {
    // ohne Jahr: das Jahr, dessen Woche am nächsten an heute liegt
    const today = berlinNow(now).date;
    const thisYear = Number(today.slice(0, 4));
    const dist = (y: number) => Math.abs(Date.parse(mondayOfIsoWeek(kw, y)) - Date.parse(today));
    year = [thisYear - 1, thisYear, thisYear + 1].reduce((best, y) => (dist(y) < dist(best) ? y : best));
  }
  if (isoWeek(mondayOfIsoWeek(kw, year)) !== kw) return null; // z. B. KW 53 in einem Jahr mit 52 Wochen
  return { kw, year };
}

export function defaultUploadWeekStart(now: Date): string {
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = mondayOf(today);
  return wd === 0 || wd >= 4 ? addDays(monday, 7) : monday;
}

export function suggestUploadWeek(filename: string, now: Date): UploadWeek {
  const fromName = weekFromFilename(filename, now);
  return uploadWeek(fromName ? mondayOfIsoWeek(fromName.kw, fromName.year) : defaultUploadWeekStart(now));
}

export function uploadWeekChoices(now: Date): UploadWeek[] {
  const monday = mondayOf(berlinNow(now).date);
  return [0, 1, 2, 3].map((k) => uploadWeek(addDays(monday, 7 * k)));
}
