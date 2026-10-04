/**
 * Minimaler iCalendar-Generator (RFC 5545) für Ganztagstermine: Prospektwochen, Feiertage, Termine.
 */
export interface IcsEvent {
  /** stabile ID, damit Kalender-Apps Termine aktualisieren statt verdoppeln */
  uid: string;
  /** ISO-Datum JJJJ-MM-TT (Ganztagstermin) */
  date: string;
  summary: string;
  description?: string;
  url?: string;
}

const CRLF = "\r\n";

export const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Zeilen über 75 Bytes falten (Fortsetzung beginnt mit Leerzeichen), ohne Mehrbyte-Zeichen zu teilen. */
export function foldLine(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const len = enc.encode(ch).length;
    const limit = out.length ? 74 : 75; // Fortsetzungszeilen haben ein führendes Leerzeichen
    if (bytes + len > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += len;
  }
  out.push(current);
  return out.map((p, i) => (i ? ` ${p}` : p)).join(CRLF);
}

const compactDate = (iso: string) => iso.replaceAll("-", "");
const nextDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return `${t.getUTCFullYear()}${String(t.getUTCMonth() + 1).padStart(2, "0")}${String(t.getUTCDate()).padStart(2, "0")}`;
};
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function buildCalendar({ name, description, events, now = new Date() }: { name: string; description: string; events: IcsEvent[]; now?: Date }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//REWE Rödelheim//Markt-Kalender//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-CALDESC:${escapeText(description)}`,
    "X-WR-TIMEZONE:Europe/Berlin",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${compactDate(e.date)}`,
      `DTEND;VALUE=DATE:${nextDay(e.date)}`,
      `SUMMARY:${escapeText(e.summary)}`,
      ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
      ...(e.url ? [`URL:${e.url}`] : []),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join(CRLF) + CRLF;
}
