/**
 * Auswahlmöglichkeiten im Bewerbungsformular (/karriere/bewerben).
 * Bewusst keine Fragen nach Alter, Herkunft, Familienstand oder Foto (AGG).
 */
export const AREAS = [
  { id: "kasse", label: "Kasse & Service" },
  { id: "obst", label: "Obst & Gemüse" },
  { id: "ware", label: "Ware & Lager" },
  { id: "egal", label: "Egal – ich bin flexibel" },
] as const;

export const EMPLOYMENT = [
  { id: "minijob", label: "Minijob" },
  { id: "teilzeit", label: "Teilzeit" },
  { id: "vollzeit", label: "Vollzeit" },
  { id: "ausbildung", label: "Ausbildung" },
  { id: "aushilfe", label: "Ferienjob / Aushilfe" },
] as const;

export const DAYS = [
  { id: "mo", label: "Mo", long: "Montag" },
  { id: "di", label: "Di", long: "Dienstag" },
  { id: "mi", label: "Mi", long: "Mittwoch" },
  { id: "do", label: "Do", long: "Donnerstag" },
  { id: "fr", label: "Fr", long: "Freitag" },
  { id: "sa", label: "Sa", long: "Samstag" },
] as const;

export const DAYPARTS = [
  { id: "vm", label: "vormittags" },
  { id: "nm", label: "nachmittags & abends" },
] as const;

export const UPLOAD = {
  /** Gesamtgröße aller Anhänge; Vercel nimmt höchstens 4,5 MB pro Anfrage an. */
  maxBytes: 4 * 1024 * 1024,
  maxFiles: 3,
  accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
} as const;

export type AreaId = (typeof AREAS)[number]["id"];
export type EmploymentId = (typeof EMPLOYMENT)[number]["id"];
export type SlotId = `${(typeof DAYS)[number]["id"]}-${(typeof DAYPARTS)[number]["id"]}`;
