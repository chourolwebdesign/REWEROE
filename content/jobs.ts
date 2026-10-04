/**
 * Offene Stellen dieses Markts. Bewusst leer, bis der Markt echte Stellen nennt – die Seite /karriere
 * verweist so lange auf die REWE-Stellensuche und die Initiativbewerbung. Für jede Stelle hier erzeugt
 * die Seite automatisch einen Eintrag samt JobPosting-Daten für Google.
 */
export interface Job {
  id: string;
  title: string;
  employment: "Vollzeit" | "Teilzeit" | "Minijob" | "Ausbildung";
  text: string;
  /** ISO-Datum */
  datePosted: string;
  validThrough?: string;
}

export const jobs: Job[] = [];
