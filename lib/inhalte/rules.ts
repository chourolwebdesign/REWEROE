/**
 * Regeln für Inhalte aus dem Cockpit (Stufe 4a): Sondertage, Termine, Stellen – geteilt von Cockpit, Website und Tests.
 * Alle Daten sind Berliner Kalendertage (JJJJ-MM-TT); `today` kommt von `berlinNow`.
 */
import { addDays, dayPlan, formatTime, legalLimit, toMinutes, type DayPlan } from "@/lib/hours";
import type { HoursConfig, SpecialDay } from "@/lib/types";

export const EMPLOYMENTS = ["Vollzeit", "Teilzeit", "Minijob", "Ausbildung"] as const;
export type Employment = (typeof EMPLOYMENTS)[number];

/** Termin wie auf der Website (Startseite, Markt-Kalender) */
export interface Termin {
  id: string;
  date: string;
  time: string;
  title: string;
  text: string;
}

/** Stelle wie auf der Website (/karriere, JobPosting) */
export interface Job {
  id: string;
  title: string;
  employment: Employment;
  text: string;
  datePosted: string;
  validThrough?: string;
}

/** Sondertag, wie ihn die Datenbank speichert */
export interface SpecialDayRow {
  date: string;
  label: string;
  closed: boolean;
  opens: string | null;
  closes: string | null;
}

type Checked<T> = { ok: T } | { error: string };

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const chars = (s: string) => [...s].length;

/** echtes Kalenderdatum JJJJ-MM-TT (kein 30. Februar) */
export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function checkSpecialDay(
  i: { date: string; label: string; closed: boolean; opens: string; closes: string },
  today: string,
): Checked<SpecialDayRow> {
  const label = i.label.trim();
  if (!isIsoDate(i.date)) return { error: "Bitte ein gültiges Datum wählen." };
  if (i.date < today) return { error: "Das Datum liegt in der Vergangenheit." };
  if (i.date > addDays(today, 730)) return { error: "Bitte ein Datum in den nächsten zwei Jahren wählen." };
  if (!label || chars(label) > 60) return { error: "Bitte eine Bezeichnung eingeben (höchstens 60 Zeichen)." };
  if (i.closed) return { ok: { date: i.date, label, closed: true, opens: null, closes: null } };
  if (!HHMM.test(i.opens) || !HHMM.test(i.closes) || toMinutes(i.opens) >= toMinutes(i.closes)) {
    return { error: "Bitte gültige Zeiten eingeben – „von“ vor „bis“." };
  }
  const limit = legalLimit(i.date);
  if (limit && toMinutes(i.closes) > toMinutes(limit.latest)) {
    return { error: `${limit.label} erlaubt das Ladenöffnungsgesetz höchstens bis ${formatTime(limit.latest)}.` };
  }
  return { ok: { date: i.date, label, closed: false, opens: i.opens, closes: i.closes } };
}

/** Zeile aus der Datenbank (Zeiten „07:00:00“) → Sondertag für lib/hours */
export function rowToSpecialDay(r: SpecialDayRow): SpecialDay {
  return { date: r.date, label: r.label, hours: r.closed || !r.opens || !r.closes ? null : [r.opens.slice(0, 5), r.closes.slice(0, 5)] };
}

/** Tage mit gesetzlicher Schlusszeit (Gründonnerstag, Heiligabend, Silvester), die der Markt noch nicht festgelegt hat */
export function openSuggestions(cfg: HoursConfig, from: string, days: number): DayPlan[] {
  const list: DayPlan[] = [];
  for (let n = 0; n < days; n++) {
    const plan = dayPlan(addDays(from, n), cfg);
    if (plan.provisional) list.push(plan);
  }
  return list;
}

export function checkEvent(
  i: { id: string; date: string; time: string; title: string; text: string },
  today: string,
): Checked<{ id: string | null; row: Omit<Termin, "id"> }> {
  const title = i.title.trim();
  const time = i.time.trim();
  const text = i.text.trim();
  if (i.id && !UUID.test(i.id)) return { error: "Dieser Termin ist nicht mehr vorhanden." };
  if (!isIsoDate(i.date)) return { error: "Bitte ein gültiges Datum wählen." };
  if (i.date < today) return { error: "Das Datum liegt in der Vergangenheit." };
  if (!title || chars(title) > 80) return { error: "Bitte einen Titel eingeben (höchstens 80 Zeichen)." };
  if (chars(time) > 40) return { error: "Die Uhrzeit ist zu lang (höchstens 40 Zeichen, z. B. „10–14 Uhr“)." };
  if (chars(text) > 600) return { error: "Der Text ist zu lang (höchstens 600 Zeichen)." };
  return { ok: { id: i.id || null, row: { date: i.date, time, title, text } } };
}

export function checkJob(
  i: { id: string; title: string; employment: string; text: string; validThrough: string; active: boolean },
  today: string,
): Checked<{ id: string | null; row: { title: string; employment: Employment; text: string; valid_through: string | null; active: boolean } }> {
  const title = i.title.trim();
  const text = i.text.trim();
  const validThrough = i.validThrough.trim();
  if (i.id && !UUID.test(i.id)) return { error: "Diese Stelle ist nicht mehr vorhanden." };
  if (!title || chars(title) > 80) return { error: "Bitte einen Titel eingeben (höchstens 80 Zeichen)." };
  if (!(EMPLOYMENTS as readonly string[]).includes(i.employment)) return { error: "Bitte eine Anstellungsart wählen." };
  if (!text || chars(text) > 1500) return { error: "Bitte eine Beschreibung eingeben (höchstens 1500 Zeichen)." };
  if (validThrough && (!isIsoDate(validThrough) || validThrough < today)) {
    return { error: "„Gültig bis“ muss ein Datum ab heute sein – oder leer bleiben." };
  }
  return { ok: { id: i.id || null, row: { title, employment: i.employment as Employment, text, valid_through: validThrough || null, active: i.active } } };
}
