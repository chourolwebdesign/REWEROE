/**
 * Single source for the store's opening state: header StoreChip, Frische-Uhr dot, store-teaser chip,
 * Filiale page, StoreFinder. Pure functions, Europe/Berlin aware, Hessen public holidays, unit-testable.
 */
import type { Weekday } from "@/lib/content/types";

export type Hours = Record<Weekday, [string, string] | null>;
export type HoursStatus = "pending" | "published";

export type OpenState =
  | { kind: "pending" }
  | { kind: "open"; closesAt: string; closesInMin: number }
  | { kind: "closed"; opensDay: Weekday; opensAt: string; today: boolean };

/** Minimal translator shape shared by next-intl's `t` and test doubles. */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

const TZ = "Europe/Berlin";
const DAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEKDAY_FROM_SHORT: Record<string, Weekday> = { Sun: "sun", Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat" };

const pad2 = (n: number) => String(n).padStart(2, "0");
const isoOf = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
export const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };

/** Calendar facts of `now` in Europe/Berlin. */
export function berlinParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const y = Number(get("year")), m = Number(get("month")), d = Number(get("day"));
  const hour = Number(get("hour")) % 24; // some engines print "24" for midnight
  return { y, m, d, iso: isoOf(y, m, d), weekday: WEEKDAY_FROM_SHORT[get("weekday")] ?? "mon", minutes: hour * 60 + Number(get("minute")) };
}

/** Gregorian Easter Sunday (anonymous algorithm) as [month, day]. */
export function easterSunday(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return [month, day];
}

function shiftIso(y: number, m: number, d: number, days: number) {
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return { iso: isoOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()), weekday: DAYS[t.getUTCDay()] };
}

/** Public holidays in Hessen (store closed): fixed dates + the five Easter-based ones. */
export function hessenHolidays(y: number): string[] {
  const [em, ed] = easterSunday(y);
  const easterBased = [-2, 1, 39, 50, 60].map((off) => shiftIso(y, em, ed, off).iso); // Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam
  return [`${y}-01-01`, `${y}-05-01`, `${y}-10-03`, `${y}-12-25`, `${y}-12-26`, ...easterBased];
}
export const isHessenHoliday = (iso: string) => hessenHolidays(Number(iso.slice(0, 4))).includes(iso);

/**
 * Opening state at `now` (Europe/Berlin). Sunday and holidays count as closed; when closed, walks forward
 * up to 7 days to the next day with hours. `status === "pending"` short-circuits to `{ kind: "pending" }`.
 */
export function openState(hours: Hours, status: HoursStatus = "published", now: Date = new Date()): OpenState {
  if (status === "pending") return { kind: "pending" };
  const p = berlinParts(now);
  const today = isHessenHoliday(p.iso) ? null : hours[p.weekday];
  if (today) {
    const [open, close] = [toMinutes(today[0]), toMinutes(today[1])];
    if (p.minutes >= open && p.minutes < close) return { kind: "open", closesAt: today[1], closesInMin: close - p.minutes };
    if (p.minutes < open) return { kind: "closed", opensDay: p.weekday, opensAt: today[0], today: true };
  }
  for (let i = 1; i <= 7; i++) {
    const next = shiftIso(p.y, p.m, p.d, i);
    const h = isHessenHoliday(next.iso) ? null : hours[next.weekday];
    if (h) return { kind: "closed", opensDay: next.weekday, opensAt: h[0], today: false };
  }
  return { kind: "pending" };
}

/** "2 h 14 min" / "14 min" — locale-neutral units. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h > 0 ? `${h} h ${pad2(m)} min` : `${m} min`;
}

/** Below this many minutes the open state says "schließt in …" instead of "bis 22:00". */
export const CLOSES_SOON_MIN = 180;

/**
 * Full sentence for the Filiale page / finder, from `common.*` keys:
 * "Geöffnet · schließt in 2 h 14 min" (≤ 3 h) · "Geöffnet · bis 22:00" · "Geschlossen · öffnet Mo 07:00" ·
 * "Geschlossen · öffnet 07:00" (today) · "Öffnungszeiten folgen".
 */
export function formatOpenState(s: OpenState, t: Translate): { text: string; tone: "open" | "closed" | "pending" } {
  if (s.kind === "pending") return { text: t("hoursPendingShort"), tone: "pending" };
  if (s.kind === "open") {
    return { text: s.closesInMin <= CLOSES_SOON_MIN ? t("openClosesIn", { time: formatDuration(s.closesInMin) }) : t("openUntil", { time: s.closesAt }), tone: "open" };
  }
  return { text: s.today ? t("closedOpensToday", { time: s.opensAt }) : t("closedOpens", { day: t(`days.${s.opensDay}`), time: s.opensAt }), tone: "closed" };
}

/** Two-part rendering for chips: state word (Figtree) + detail (mono data): "Geöffnet" · "bis 22:00". */
export function storeChipParts(s: OpenState, t: Translate): { state: string; detail: string | null; tone: "open" | "closed" | "pending" } {
  if (s.kind === "pending") return { state: t("hoursPendingShort"), detail: null, tone: "pending" };
  if (s.kind === "open") {
    return { state: t("open"), detail: s.closesInMin <= CLOSES_SOON_MIN ? t("closesIn", { time: formatDuration(s.closesInMin) }) : t("until", { time: s.closesAt }), tone: "open" };
  }
  return { state: t("closed"), detail: s.today ? t("opensTodayAt", { time: s.opensAt }) : t("opensDayAt", { day: t(`days.${s.opensDay}`), time: s.opensAt }), tone: "closed" };
}
