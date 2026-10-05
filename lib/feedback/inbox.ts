import { ASPECTS, type Aspect } from "./rules";
import { FEEDBACK_TEXTS } from "./texts";

/** Eine Rückmeldung, wie das Cockpit sie liest */
export interface FeedbackRow {
  id: string;
  created_at: string;
  rating: number;
  aspects: string[];
  comment: string;
  contact: string;
  lang: string;
  google_click: boolean;
  status: "neu" | "erledigt";
  handled_at: string | null;
}

export const FEEDBACK_FIELDS = "id,created_at,rating,aspects,comment,contact,lang,google_click,status,handled_at";

export interface InboxFilter {
  status: "neu" | "erledigt" | "alle";
  stars: number | null;
}

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Filter aus der Adresse (?status=erledigt&sterne=1); Standard: neue Rückmeldungen, alle Sterne. */
export function inboxFilter(p: Params): InboxFilter {
  const status = first(p.status);
  const stars = Number(first(p.sterne));
  return {
    status: status === "erledigt" || status === "alle" ? status : "neu",
    stars: Number.isInteger(stars) && stars >= 1 && stars <= 5 ? stars : null,
  };
}

export function inboxHref(f: InboxFilter): string {
  const q = new URLSearchParams();
  if (f.status !== "neu") q.set("status", f.status);
  if (f.stars) q.set("sterne", String(f.stars));
  const s = q.toString();
  return s ? `/cockpit/feedback?${s}` : "/cockpit/feedback";
}

/** Kennzahlen der letzten 30 Tage: Anzahl, Durchschnitt (eine Nachkommastelle), die drei häufigsten Bereiche. */
export function feedbackStats(rows: Pick<FeedbackRow, "created_at" | "rating" | "aspects">[], now: Date) {
  const since = now.getTime() - 30 * 864e5;
  const recent = rows.filter((r) => Date.parse(r.created_at) >= since);
  const average = recent.length ? Math.round((recent.reduce((s, r) => s + r.rating, 0) / recent.length) * 10) / 10 : null;
  const counts = new Map<Aspect, number>();
  for (const r of recent) {
    for (const a of r.aspects) if ((ASPECTS as readonly string[]).includes(a)) counts.set(a as Aspect, (counts.get(a as Aspect) ?? 0) + 1);
  }
  const top = [...counts]
    .map(([aspect, count]) => ({ aspect, count }))
    .sort((a, b) => b.count - a.count || ASPECTS.indexOf(a.aspect) - ASPECTS.indexOf(b.aspect))
    .slice(0, 3);
  return { count: recent.length, average, top };
}

/** Zeile der Übersichtskarte */
export const newFeedbackLine = (n: number) => (n === 0 ? "Keine neuen Rückmeldungen" : n === 1 ? "1 neue Rückmeldung" : `${n} neue Rückmeldungen`);

/** mailto:/tel: für einen Tipp; null, wenn weder E-Mail noch Telefonnummer erkennbar ist (dann nur als Text zeigen). */
export function contactHref(contact: string): string | null {
  const c = contact.trim();
  if (/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(c)) return `mailto:${c}`;
  let digits = c.replace(/[\s()/.-]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
}

const berlin = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** „05.10.2026, 14:30“ in Berliner Zeit */
export const formatBerlin = (iso: string) => berlin.format(new Date(iso));

const de = FEEDBACK_TEXTS.de;

/** CSV für deutsches Excel: BOM, Semikolon, Anführungszeichen bei Bedarf; Formeln am Zellanfang (= + - @) entschärft. */
export function toCsv(rows: FeedbackRow[]): string {
  const cell = (value: string) => {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const head = ["Datum", "Sterne", "Bereiche", "Kommentar", "Kontakt", "Sprache", "Google", "Status"];
  const lines = rows.map((r) =>
    [formatBerlin(r.created_at), String(r.rating), r.aspects.map((a) => de.aspects[a as Aspect] ?? a).join(", "), r.comment, r.contact, r.lang, r.google_click ? "ja" : "nein", r.status]
      .map(cell)
      .join(";"),
  );
  return `﻿${[head.join(";"), ...lines].join("\r\n")}`;
}
