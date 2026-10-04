/**
 * Bewerbung: Prüfung der Formulardaten (Server), Bot-Erkennung, Dateiprüfung und E-Mail-Text.
 * Reine Funktionen ohne Seiteneffekte – getestet in application.test.ts.
 */
import { AREAS, DAYPARTS, DAYS, EMPLOYMENT, type AreaId, type EmploymentId, type SlotId } from "@/content/bewerbung";
import { addDays, berlinNow } from "./hours";

export interface Application {
  bereich: AreaId[];
  art: EmploymentId;
  /** "sofort" oder ISO-Datum */
  start: "sofort" | string;
  verfuegbarkeit: SlotId[];
  vorname: string;
  nachname: string;
  telefon: string | null;
  email: string | null;
  nachricht: string | null;
  talentpool: boolean;
}

export type FieldName = "bereich" | "art" | "start" | "vorname" | "nachname" | "telefon" | "email" | "nachricht" | "datenschutz" | "lebenslauf";
export type FieldErrors = Partial<Record<FieldName, string>>;

const AREA_IDS = new Set<string>(AREAS.map((a) => a.id));
const EMPLOYMENT_IDS = new Set<string>(EMPLOYMENT.map((e) => e.id));
const SLOT_IDS = new Set<string>(DAYS.flatMap((d) => DAYPARTS.map((p) => `${d.id}-${p.id}`)));
const URLISH = /(https?:\/\/|www\.)/i;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const list = (fd: FormData, key: string) =>
  fd
    .getAll(key)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim());

export function parseApplication(fd: FormData, now: Date = new Date()): { ok: true; data: Application } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const bereich = [...new Set(list(fd, "bereich").filter((id) => AREA_IDS.has(id)))] as AreaId[];
  if (!bereich.length) errors.bereich = "Bitte wähle mindestens einen Bereich.";

  const art = str(fd, "art");
  if (!EMPLOYMENT_IDS.has(art)) errors.art = "Bitte wähle aus, wie du arbeiten möchtest.";

  let start: Application["start"] = "sofort";
  if (str(fd, "start") === "datum") {
    const d = str(fd, "startDatum");
    const today = berlinNow(now).date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.start = "Bitte gib ein Startdatum an – oder wähle „so schnell wie möglich“.";
    else if (d < today) errors.start = "Das Startdatum liegt in der Vergangenheit.";
    else if (d > addDays(today, 366)) errors.start = "Bitte wähle ein Datum innerhalb der nächsten 12 Monate.";
    else start = d;
  }

  const verfuegbarkeit = [...new Set(list(fd, "verfuegbarkeit").filter((id) => SLOT_IDS.has(id)))] as SlotId[];

  const name = (key: "vorname" | "nachname", label: string) => {
    const v = str(fd, key).replace(/\s+/g, " ");
    if (!v) errors[key] = `Bitte gib deinen ${label} an.`;
    else if (v.length > 60 || URLISH.test(v)) errors[key] = `Bitte prüfe deinen ${label}.`;
    return v;
  };
  const vorname = name("vorname", "Vornamen");
  const nachname = name("nachname", "Nachnamen");

  const telefonRaw = str(fd, "telefon");
  const emailRaw = str(fd, "email");
  const digits = telefonRaw.replace(/\D/g, "");
  if (telefonRaw && (!/^[+()\d\s/-]+$/.test(telefonRaw) || digits.length < 6 || digits.length > 20)) {
    errors.telefon = "Bitte prüfe deine Telefonnummer.";
  }
  if (emailRaw && (emailRaw.length > 120 || !EMAIL.test(emailRaw))) errors.email = "Bitte prüfe deine E-Mail-Adresse.";
  if (!telefonRaw && !emailRaw) errors.telefon = "Bitte gib eine Telefonnummer oder E-Mail-Adresse an, damit wir dich erreichen.";

  const nachricht = str(fd, "nachricht");
  if (nachricht.length > 1500) errors.nachricht = "Bitte fasse dich etwas kürzer (höchstens 1.500 Zeichen).";

  if (!fd.get("datenschutz")) errors.datenschutz = "Bitte bestätige, dass du die Datenschutzhinweise gelesen hast.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      bereich,
      art: art as EmploymentId,
      start,
      verfuegbarkeit,
      vorname,
      nachname,
      telefon: telefonRaw || null,
      email: emailRaw || null,
      nachricht: nachricht || null,
      talentpool: Boolean(fd.get("talentpool")),
    },
  };
}

/** Honeypot ausgefüllt oder schneller als 4 s abgeschickt → sehr wahrscheinlich ein Bot. */
export function isLikelyBot({ honeypot, startedAt }: { honeypot: string; startedAt: number }, now: Date = new Date()) {
  if (honeypot) return true;
  if (!Number.isFinite(startedAt)) return true;
  return now.getTime() - startedAt < 4_000;
}

const SIGNATURES: { type: string; ext: string; bytes: number[] }[] = [
  { type: "application/pdf", ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: "image/jpeg", ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

/** Prüft den Dateiinhalt (nicht die Endung). */
export function checkFile(name: string, head: Uint8Array): { ok: true; type: string } | { ok: false; error: string } {
  const sig = SIGNATURES.find((s) => s.bytes.every((b, i) => head[i] === b));
  if (!sig) return { ok: false, error: `„${name}“ ist kein PDF, JPG oder PNG.` };
  return { ok: true, type: sig.type };
}

/** Dateiname für den Anhang: nur sichere Zeichen, Endung passend zum Inhalt. */
export function safeFilename(name: string, type: string) {
  const ext = SIGNATURES.find((s) => s.type === type)?.ext ?? "bin";
  const base =
    name
      .replace(/\.[^.]*$/, "")
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "anhang";
  return `${base}.${ext}`;
}

const label = <T extends { id: string; label: string }>(items: readonly T[], id: string) => items.find((i) => i.id === id)?.label ?? id;

function slotLabel(slot: SlotId) {
  const [day, part] = slot.split("-");
  return `${label(DAYS, day)} ${label(DAYPARTS, part)}`;
}

const berlinStamp = (d: Date) =>
  new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d) + " Uhr";

export const formatStart = (start: Application["start"]) =>
  start === "sofort" ? "so schnell wie möglich" : `ab ${start.slice(8, 10)}.${start.slice(5, 7)}.${start.slice(0, 4)}`;

/** Klartext für die E-Mail an den Markt. */
export function formatApplicationText(app: Application, files: { name: string; size: number }[], now: Date = new Date()) {
  const lines = [
    "Neue Bewerbung über die Website",
    "",
    `Name: ${app.vorname} ${app.nachname}`,
    `Telefon: ${app.telefon ?? "–"}`,
    `E-Mail: ${app.email ?? "–"}`,
    "",
    `Bereich: ${app.bereich.map((b) => label(AREAS, b)).join(", ")}`,
    `Beschäftigung: ${label(EMPLOYMENT, app.art)}`,
    `Start: ${formatStart(app.start)}`,
    `Verfügbarkeit: ${app.verfuegbarkeit.length ? app.verfuegbarkeit.map(slotLabel).join(", ") : "keine Angabe"}`,
    "",
    "Nachricht:",
    app.nachricht ?? "–",
    "",
    `Anhänge: ${files.length ? files.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`).join(", ") : "keine"}`,
    `Talentpool (12 Monate aufbewahren): ${app.talentpool ? "ja" : "nein"}`,
    "",
    `Eingegangen: ${berlinStamp(now)}`,
    "",
    "Datenschutz: Bitte die Unterlagen spätestens 6 Monate nach Abschluss des Verfahrens löschen",
    app.talentpool ? "(mit Talentpool-Einwilligung: 12 Monate, jederzeit widerrufbar)." : "(keine Talentpool-Einwilligung).",
  ];
  return lines.join("\n");
}
