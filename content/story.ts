import type { ClipKey, MediaKey } from "@/lib/media";

/**
 * Die Story im ersten Screen der Startseite: läuft automatisch durch, pausierbar, ohne Bewegung bei
 * `prefers-reduced-motion`. Nur Bilder ohne erkennbare Personen (Personenfotos stehen im Beitrag unter Aktuelles).
 * `position` = object-position für den Hochkant-Ausschnitt.
 */
export type StoryItem =
  | { type: "clip"; clip: ClipKey; caption: string }
  | { type: "image"; media: MediaKey; caption: string; seconds: number; position?: string };

export const story: StoryItem[] = [
  { type: "clip", clip: "markt-rundgang", caption: "Rundgang durch unseren Markt" },
  { type: "image", media: "resilienzwoche-obst", caption: "Obst & Gemüse", seconds: 6, position: "72% 50%" },
  { type: "image", media: "resilienzwoche-stand", caption: "Resilienzwoche 2026 · Vorsorge-Stand", seconds: 6 },
  { type: "image", media: "resilienzwoche-wagen", caption: "Notvorrat im Hessen-Einkaufswagen", seconds: 6 },
];
