/**
 * Alle Fotos der Website an einer Stelle: statische Imports (Breite, Höhe und Blur-Vorschau liefert Next.js),
 * Alt-Texte und Bildnachweise. Inhalte in content/ verweisen nur über den Schlüssel auf ein Bild.
 *
 * Herkunft: Instagram @rewealialamyaar (Resilienzwoche 2026, Sept. 2026), REWE-Pressebilder (Regional/Bio),
 * Karte © OpenStreetMap-Mitwirkende. Rechte offen → docs/BETREIBER-CHECKLISTE.md.
 */
import type { StaticImageData } from "next/image";
import aktion from "@/assets/media/resilienzwoche-aktion.jpg";
import broschueren from "@/assets/media/resilienzwoche-broschueren.jpg";
import gruppenbild from "@/assets/media/resilienzwoche-gruppenbild.jpg";
import nina from "@/assets/media/resilienzwoche-nina.jpg";
import obst from "@/assets/media/resilienzwoche-obst.jpg";
import rundgang1 from "@/assets/media/resilienzwoche-rundgang-1.jpg";
import rundgang2 from "@/assets/media/resilienzwoche-rundgang-2.jpg";
import stand from "@/assets/media/resilienzwoche-stand.jpg";
import wagen from "@/assets/media/resilienzwoche-wagen.jpg";
import poster from "@/assets/media/markt-rundgang-poster.jpg";
import regionalLieferung from "@/assets/media/regional-lieferung.jpg";
import regionalBauer from "@/assets/media/regional-bauer.jpg";
import regionalLabel from "@/assets/media/regional-label.jpg";
import bioProdukte from "@/assets/media/bio-produkte.jpg";
import karte from "@/assets/media/karte-roedelheim.jpg";
import logoBio from "@/assets/brand/rewe-bio.png";
import logoRegion from "@/assets/brand/aus-deiner-region.png";

export interface MediaItem {
  src: StaticImageData;
  /** Kurze Bildunterschrift für Galerien */
  caption: string;
  alt: string;
  credit: string;
}

const instagram = "Foto: REWE Ali Alamyaar (Instagram)";
const rewe = "Foto: REWE";

export const media = {
  "markt-rundgang-poster": {
    src: poster,
    caption: "Weihnachtssterne am Eingang",
    alt: "Blick in den Markt: eine große Pyramide aus roten und weißen Weihnachtssternen vor der Obst- und Gemüseabteilung",
    credit: instagram,
  },
  "resilienzwoche-obst": {
    src: obst,
    caption: "Obst & Gemüse",
    alt: "Obst- und Gemüseabteilung mit gelben Marktständen, links ein Banner der Resilienzwoche: „Notfälle kommen plötzlich. Vorbereitung zahlt sich aus.“",
    credit: instagram,
  },
  "resilienzwoche-wagen": {
    src: wagen,
    caption: "Notvorrat im Hessen-Wagen",
    alt: "Einkaufswagen mit dem hessischen Wappen, gepackt mit Wasser, Toilettenpapier und haltbaren Lebensmitteln",
    credit: instagram,
  },
  "resilienzwoche-nina": {
    src: nina,
    caption: "Warn-App NINA",
    alt: "Roll-up des Bundesamts für Bevölkerungsschutz zur Warn-App NINA im Markt",
    credit: instagram,
  },
  "resilienzwoche-stand": {
    src: stand,
    caption: "Vorsorge-Stand",
    alt: "Info-Stand zur Resilienzwoche mit Beispielen für einen Notvorrat, einem Rucksack und Broschüren vor der Obstabteilung",
    credit: instagram,
  },
  "resilienzwoche-broschueren": {
    src: broschueren,
    caption: "Ratgeber zum Mitnehmen",
    alt: "Broschüren „Vorsorgen für Krisen und Katastrophen“, auch in Leichter Sprache und auf Englisch, neben Nüssen und Snacks",
    credit: instagram,
  },
  "resilienzwoche-aktion": {
    src: aktion,
    caption: "Aktionstisch",
    alt: "Aktionstisch der Resilienzwoche mit haltbaren Lebensmitteln, Küchenrollen und einem Einkaufswagen mit Hessen-Schild",
    credit: instagram,
  },
  "resilienzwoche-rundgang-1": {
    src: rundgang1,
    caption: "Rundgang durch die Gänge",
    alt: "Gäste der Landesregierung schauen sich mit dem Hessen-Einkaufswagen Produkte in einem Gang des Markts an",
    credit: instagram,
  },
  "resilienzwoche-rundgang-2": {
    src: rundgang2,
    caption: "Mit dem Hessen-Wagen unterwegs",
    alt: "Rundgang durch den Markt mit dem Hessen-Einkaufswagen",
    credit: instagram,
  },
  "resilienzwoche-gruppenbild": {
    src: gruppenbild,
    caption: "Gruppenfoto zum Aktionstag",
    alt: "Gruppenfoto im Markt: Gäste von Landesregierung, Handel und Feuerwehr Frankfurt hinter einem Tisch mit Notvorrat, Powerstation und Notfallrucksack",
    credit: "Foto: © Jörg Halisch",
  },
  "regional-lieferung": {
    src: regionalLieferung,
    caption: "Frisch aus deiner Region",
    alt: "Ein REWE-Mitarbeiter nimmt von einem Landwirt eine Kiste Äpfel entgegen, dahinter ein Lkw mit der Aufschrift „Frisch aus deiner Region.“",
    credit: rewe,
  },
  "regional-bauer": {
    src: regionalBauer,
    caption: "Aus deiner Region",
    alt: "Landwirt mit einer Kiste Salat vor einem Fachwerkhof, daneben ein REWE-Lieferwagen",
    credit: rewe,
  },
  "regional-label": {
    src: regionalLabel,
    caption: "REWE Regional",
    alt: "Logo REWE Regional auf einem Etikett vor Obst und Apfelsaft",
    credit: rewe,
  },
  "bio-produkte": {
    src: bioProdukte,
    caption: "REWE Bio",
    alt: "Verschiedene Produkte von REWE Bio auf einem Holztisch",
    credit: rewe,
  },
  karte: {
    src: karte,
    caption: "Lage des Markts",
    alt: "Kartenausschnitt von Frankfurt-Rödelheim; eine rote Markierung zeigt den Markt in der Thudichumstraße",
    credit: "Karte © OpenStreetMap-Mitwirkende",
  },
  "logo-rewe-bio": { src: logoBio,
    caption: "REWE Bio", alt: "REWE Bio", credit: "Logo: REWE" },
  "logo-aus-deiner-region": { src: logoRegion,
    caption: "Aus deiner Region", alt: "Aus deiner Region", credit: "Zeichen: REWE" },
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;

/**
 * Video-Dateien liegen in public/media (ohne Ton, H.264 High@4.0, „faststart“). `src` hat 720 × 1280 für Tablet und
 * Desktop, `srcSmall` 540 × 960 für Handys (ein Drittel weniger Daten). /media wird ein Jahr lang gecacht –
 * geänderte Videos deshalb immer unter neuem Dateinamen ablegen.
 */
export const clips = {
  "markt-rundgang": {
    src: "/media/markt-rundgang-720.mp4",
    srcSmall: "/media/markt-rundgang-540.mp4",
    poster: "markt-rundgang-poster" as MediaKey,
    label: "Rundgang durch den Markt",
    credit: instagram,
  },
} as const;

export type ClipKey = keyof typeof clips;
