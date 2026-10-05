/**
 * Öffnungsstatus des Markts, immer als Berliner Wandzeit gerechnet – egal, wo der Besucher sitzt.
 * Die Zeitumstellung ist dadurch automatisch richtig.
 *
 * Reihenfolge: bestätigte Sonderzeiten > Feiertage Hessen > reguläre Zeiten, begrenzt durch die
 * gesetzlichen Schlusszeiten nach § 3 Abs. 2 HLöG (Gründonnerstag 20 Uhr, 24.12. und 31.12. 14 Uhr).
 * Aus dem Gesetz abgeleitete Zeiten sind „vorläufig“, bis der Markt sie im Cockpit (Inhalte → Sondertage) festlegt.
 */
import { markt } from "@/content/markt";
import type { HoursConfig, TimeRange, Weekday } from "./types";

export interface DayPlan {
  date: string;
  weekday: Weekday;
  hours: TimeRange | null;
  /** z. B. „Tag der Deutschen Einheit“ oder „Heiligabend“; null an normalen Tagen */
  label: string | null;
  /** true, wenn die Zeit aus dem Gesetz abgeleitet und vom Markt noch nicht bestätigt ist */
  provisional: boolean;
}

export interface OpenStatus {
  open: boolean;
  today: DayPlan;
  closesAt: string | null;
  next: { plan: DayPlan; inDays: number } | null;
  /** „Jetzt geöffnet · bis 22 Uhr“ / „Geschlossen · öffnet morgen um 7 Uhr“ */
  text: string;
  short: "Geöffnet" | "Geschlossen";
}

export const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] as const;
export const WEEKDAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;
const LEGAL_LIMITS = [
  { rule: "gruendonnerstag", latest: "20:00", label: "Gründonnerstag" },
  { rule: "12-24", latest: "14:00", label: "Heiligabend" },
  { rule: "12-31", latest: "14:00", label: "Silvester" },
] as const;

// ---------- Kalender (reine UTC-Rechnung ohne Zeitzoneneffekte) ----------

const pad = (n: number) => String(n).padStart(2, "0");
const isoFromUtc = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const utcFromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
export const addDays = (iso: string, n: number) => {
  const d = utcFromIso(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoFromUtc(d);
};
export const weekdayOf = (iso: string) => utcFromIso(iso).getUTCDay() as Weekday;
export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** „07:00“ → „7 Uhr“, „07:30“ → „7:30 Uhr“ */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return m ? `${h}:${pad(m)} Uhr` : `${h} Uhr`;
}

/** „2026-10-05“ → „05.10.“ */
export const formatDayMonth = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;

const berlinFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Berliner Wandzeit zu einem Zeitpunkt. */
export function berlinNow(now: Date): { date: string; minutes: number } {
  const p: Record<string, string> = {};
  for (const part of berlinFormat.formatToParts(now)) p[part.type] = part.value;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}

// ---------- Feiertage Hessen ----------

/** Ostersonntag (anonymer gregorianischer Algorithmus) als ISO-Datum. */
export function easterSunday(year: number): string {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Gesetzliche Feiertage in Hessen (HFeiertagsG § 1): ISO-Datum → Name. */
export function hessenHolidays(year: number): Map<string, string> {
  const easter = easterSunday(year);
  return new Map([
    [`${year}-01-01`, "Neujahr"],
    [addDays(easter, -2), "Karfreitag"],
    [easter, "Ostersonntag"],
    [addDays(easter, 1), "Ostermontag"],
    [`${year}-05-01`, "Tag der Arbeit"],
    [addDays(easter, 39), "Christi Himmelfahrt"],
    [addDays(easter, 49), "Pfingstsonntag"],
    [addDays(easter, 50), "Pfingstmontag"],
    [addDays(easter, 60), "Fronleichnam"],
    [`${year}-10-03`, "Tag der Deutschen Einheit"],
    [`${year}-12-25`, "1. Weihnachtsfeiertag"],
    [`${year}-12-26`, "2. Weihnachtsfeiertag"],
  ]);
}

const holidayCache = new Map<number, Map<string, string>>();
function holiday(iso: string) {
  const year = Number(iso.slice(0, 4));
  if (!holidayCache.has(year)) holidayCache.set(year, hessenHolidays(year));
  return holidayCache.get(year)!.get(iso) ?? null;
}

/** Gesetzliche Schlusszeit dieses Tages (Gründonnerstag 20 Uhr, 24.12. und 31.12. 14 Uhr) oder null. */
export function legalLimit(iso: string) {
  const maundyThursday = addDays(easterSunday(Number(iso.slice(0, 4))), -3);
  return LEGAL_LIMITS.find((l) => (l.rule === "gruendonnerstag" ? iso === maundyThursday : iso.slice(5) === l.rule)) ?? null;
}

// ---------- Tagesplan & Status ----------

export function dayPlan(date: string, cfg: HoursConfig = markt.hours): DayPlan {
  const weekday = weekdayOf(date);
  const special = cfg.specialDays.find((s) => s.date === date);
  if (special) return { date, weekday, hours: special.hours, label: special.label, provisional: false };

  const holidayName = holiday(date);
  if (holidayName) return { date, weekday, hours: null, label: holidayName, provisional: false };

  const regular = cfg.regular[weekday];
  if (!regular) return { date, weekday, hours: null, label: null, provisional: false };

  const limit = legalLimit(date);
  if (limit && toMinutes(regular[1]) > toMinutes(limit.latest)) {
    return { date, weekday, hours: [regular[0], limit.latest], label: limit.label, provisional: true };
  }
  return { date, weekday, hours: regular, label: null, provisional: false };
}

function whenText(plan: DayPlan, inDays: number) {
  if (inDays === 0) return "heute";
  if (inDays === 1) return "morgen";
  if (inDays === 2) return WEEKDAYS[plan.weekday];
  return `${WEEKDAYS[plan.weekday]}, ${formatDayMonth(plan.date)},`;
}

export function openStatus(now: Date = new Date(), cfg: HoursConfig = markt.hours): OpenStatus {
  const { date, minutes } = berlinNow(now);
  const today = dayPlan(date, cfg);

  if (today.hours && minutes >= toMinutes(today.hours[0]) && minutes < toMinutes(today.hours[1])) {
    const left = toMinutes(today.hours[1]) - minutes;
    const text = left <= 60 ? `Geöffnet · schließt in ${left} Min.` : `Jetzt geöffnet · bis ${formatTime(today.hours[1])}`;
    return { open: true, today, closesAt: today.hours[1], next: null, text, short: "Geöffnet" };
  }

  for (let n = 0; n <= 14; n++) {
    const plan = n === 0 ? today : dayPlan(addDays(date, n), cfg);
    if (!plan.hours) continue;
    if (n === 0 && minutes >= toMinutes(plan.hours[0])) continue;
    const text = `Geschlossen · öffnet ${whenText(plan, n)} um ${formatTime(plan.hours[0])}`;
    return { open: false, today, closesAt: null, next: { plan, inDays: n }, text, short: "Geschlossen" };
  }
  return { open: false, today, closesAt: null, next: null, text: "Geschlossen", short: "Geschlossen" };
}

/** Besondere Tage (Feiertage, Sonderzeiten, gesetzliche Schlusszeiten) ab `from` für `days` Tage. */
export function upcomingSpecialDays(from: string, days: number, cfg: HoursConfig = markt.hours): DayPlan[] {
  const list: DayPlan[] = [];
  for (let n = 0; n < days; n++) {
    const plan = dayPlan(addDays(from, n), cfg);
    // Feiertage an Tagen, an denen ohnehin geschlossen ist (Ostersonntag, Pfingstsonntag), ändern nichts.
    if (plan.label && !(cfg.regular[plan.weekday] === null && plan.hours === null)) list.push(plan);
  }
  return list;
}

/** Wochentabelle Mo–So mit zusammengefassten Zeilen, z. B. „Montag – Samstag · 7 – 22 Uhr“. */
export function weekRows(cfg: HoursConfig = markt.hours) {
  const order: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  const rows: { from: Weekday; to: Weekday; hours: TimeRange | null }[] = [];
  for (const d of order) {
    const h = cfg.regular[d];
    const last = rows.at(-1);
    if (last && JSON.stringify(last.hours) === JSON.stringify(h)) last.to = d;
    else rows.push({ from: d, to: d, hours: h });
  }
  return rows.map((r) => ({
    ...r,
    days: r.from === r.to ? WEEKDAYS[r.from] : `${WEEKDAYS[r.from]} – ${WEEKDAYS[r.to]}`,
    daysShort: r.from === r.to ? WEEKDAYS_SHORT[r.from] : `${WEEKDAYS_SHORT[r.from]} – ${WEEKDAYS_SHORT[r.to]}`,
    time: r.hours ? `${formatTime(r.hours[0]).replace(" Uhr", "")} – ${formatTime(r.hours[1])}` : "geschlossen",
  }));
}
