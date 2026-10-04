import type { ClipKey, MediaKey } from "@/lib/media";

/** „Aus dem Markt“ – Fotos und Clips von Instagram @rewealialamyaar. Neue Einträge oben anfügen. */
export type GalleryItem = { clip: ClipKey; caption: string } | { media: MediaKey; caption: string };

export const galerie: GalleryItem[] = [
  { clip: "markt-rundgang", caption: "Rundgang durch den Markt" },
  { media: "resilienzwoche-obst", caption: "Obst & Gemüse" },
  { media: "resilienzwoche-aktion", caption: "Resilienzwoche 2026" },
  { media: "resilienzwoche-wagen", caption: "Notvorrat im Hessen-Wagen" },
  { media: "resilienzwoche-broschueren", caption: "Ratgeber zum Mitnehmen" },
  { media: "resilienzwoche-stand", caption: "Vorsorge-Stand" },
  { media: "resilienzwoche-nina", caption: "Warn-App NINA" },
];
