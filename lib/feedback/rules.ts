/** Regeln für Rückmeldungen aus dem Markt – geteilt von Seite, Server Action, Cockpit und Tests. */
export const ASPECTS = ["wartezeit", "personal", "frische", "sauberkeit", "sortiment", "kasse", "preis", "sonstiges"] as const;
export type Aspect = (typeof ASPECTS)[number];
export const LANGS = ["de", "tr", "ar", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
/** Ab dieser Bewertung: Dank und großer Google-Knopf; darunter erst zuhören (der Google-Link bleibt sichtbar). */
export const PROMOTE = 4;
export const MAX_COMMENT = 500;
export const MAX_CONTACT = 120;

export interface FeedbackInput {
  rating: number;
  aspects: string[];
  comment: string;
  contact: string;
  lang: string;
}

export interface CleanFeedback {
  rating: number;
  aspects: Aspect[];
  comment: string;
  contact: string;
  lang: Lang;
}

/** Zeichen wie in Postgres (char_length), nicht UTF-16-Einheiten wie String#length. */
const chars = (s: string) => [...s].length;

/** Prüft und bereinigt; null = ungültig. Kontakt nur bei 1–3 Sternen, Bereiche in fester Reihenfolge. */
export function checkFeedback(i: FeedbackInput): CleanFeedback | null {
  if (!Number.isInteger(i.rating) || i.rating < 1 || i.rating > 5) return null;
  if (!(LANGS as readonly string[]).includes(i.lang)) return null;
  const picked = new Set(i.aspects);
  if (![...picked].every((a) => (ASPECTS as readonly string[]).includes(a))) return null;
  const comment = String(i.comment ?? "").trim();
  const contact = i.rating < PROMOTE ? String(i.contact ?? "").trim() : "";
  if (chars(comment) > MAX_COMMENT || chars(contact) > MAX_CONTACT) return null;
  return { rating: i.rating, aspects: ASPECTS.filter((a) => picked.has(a)), comment, contact, lang: i.lang as Lang };
}

/** Höchstens `limit` Rückmeldungen je Schlüssel (IP) im Zeitfenster – nur im Arbeitsspeicher, nichts wird gespeichert. */
export function createLimiter(limit = 10, windowMs = 3_600_000) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    // Speicher begrenzen: abgelaufene Adressen vergessen
    if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    return true;
  };
}

/** Bei 1–2 Sternen bekommt die Marktleitung eine Mail (sobald Mail eingerichtet ist). */
export const needsAlarm = (rating: number) => rating <= 2;
