/**
 * Termine im Markt (Verkostung, Aktionstag, Kinderaktion …). Nur echte, vom Markt bestätigte Termine eintragen –
 * sie erscheinen dann unter „Termine“ auf der Startseite und im abonnierbaren Markt-Kalender (/kalender.ics).
 *
 * Beispiel:
 * { id: "kuerbis-2026", date: "2026-10-24", time: "10–14 Uhr", title: "Kürbis-Verkostung", text: "Probieren am Stand vor der Obstabteilung." }
 */
export interface Termin {
  id: string;
  /** ISO-Datum */
  date: string;
  /** frei, z. B. „10–14 Uhr“ */
  time?: string;
  title: string;
  text: string;
}

export const termine: Termin[] = [];
