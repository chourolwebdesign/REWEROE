import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { formatDate } from "@/components/news/post-card";
import { posts } from "@/content/aktuelles";
import { markt } from "@/content/markt";
import { logoSvg } from "./brand";
import { weekRows } from "./hours";
import type { MediaKey } from "./media";

/**
 * Teilen-Bilder (Open Graph, 1200 × 630) im Look des roten Hero: Logo, Dachzeile, Titel, Adresszeile und ein
 * Foto im Hochkant-Rahmen. Werden beim Build als JPEG erzeugt (app/og/[slug]/route.tsx) – PNG mit Foto wäre für
 * WhatsApp-Vorschauen zu groß.
 */
export interface OgCard {
  eyebrow: string;
  title: string;
  /** letztes Wort weiß hinterlegt wie „Markt.“ im Hero */
  highlightLast?: boolean;
  photo: MediaKey;
  /** Bildausschnitt im Hochkant-Rahmen (sharp: centre, east, west, north …) */
  position?: string;
}

const PAGES: Record<string, OgCard> = {
  start: { eyebrow: "REWE in Frankfurt-Rödelheim", title: "Willkommen in deinem Markt.", highlightLast: true, photo: "markt-rundgang-poster" },
  angebote: { eyebrow: "Angebote", title: "Prospekt der Woche.", photo: "bio-produkte" },
  markt: { eyebrow: "Unser Markt", title: "Dein REWE in der Thudichumstraße.", photo: "resilienzwoche-obst", position: "east" },
  aktuelles: { eyebrow: "Aktuelles", title: "Neues aus Rödelheim.", photo: "resilienzwoche-rundgang-2" },
  karriere: { eyebrow: "Karriere", title: "Arbeiten im Supermarkt um die Ecke.", photo: "regional-lieferung", position: "centre" },
  bewerben: { eyebrow: "Bewerben", title: "Bewerben in 60 Sekunden.", photo: "regional-lieferung", position: "centre" },
  kontakt: { eyebrow: "Kontakt & Anfahrt", title: "So erreichst du uns.", photo: "karte" },
};

/** Alle Karten nach Dateiname (ohne .jpg): feste Seiten plus eine je Beitrag. */
export function ogCards(): Record<string, OgCard> {
  const cards = { ...PAGES };
  for (const p of posts) cards[`beitrag-${p.slug}`] = { eyebrow: formatDate(p.date), title: p.title, photo: p.cover };
  return cards;
}

const W = 1200;
const H = 630;
const FRAME = { w: 360, h: 518 };
const TITLE_WIDTH = 600;

/** Schriftgröße: kurze Titel groß, lange kleiner – und das längste Wort muss in die Spalte passen. */
function titleSize(title: string) {
  const byLength = title.length <= 22 ? 92 : title.length <= 36 ? 80 : title.length <= 56 ? 66 : 56;
  const longestWord = Math.max(...title.split(" ").map((w) => w.length));
  return Math.min(byLength, Math.floor(TITLE_WIDTH / (longestWord * 0.6)));
}

/** Dateien zu den Bildschlüsseln in assets/media (statische Imports liefern beim Build nur URLs, keine Pfade). */
const MEDIA_FILES: Record<MediaKey, string> = {
  "markt-rundgang-poster": "markt-rundgang-poster-1080.jpg",
  "resilienzwoche-obst": "resilienzwoche-obst.jpg",
  "resilienzwoche-rundgang-2": "resilienzwoche-rundgang-2.jpg",
  "resilienzwoche-rundgang-1": "resilienzwoche-rundgang-1.jpg",
  "resilienzwoche-gruppenbild": "resilienzwoche-gruppenbild.jpg",
  "resilienzwoche-aktion": "resilienzwoche-aktion.jpg",
  "resilienzwoche-wagen": "resilienzwoche-wagen.jpg",
  "resilienzwoche-stand": "resilienzwoche-stand.jpg",
  "resilienzwoche-broschueren": "resilienzwoche-broschueren.jpg",
  "resilienzwoche-nina": "resilienzwoche-nina.jpg",
  "regional-lieferung": "regional-lieferung.jpg",
  "regional-bauer": "regional-bauer.jpg",
  "regional-label": "regional-label.jpg",
  "bio-produkte": "bio-produkte.jpg",
  karte: "karte-roedelheim.jpg",
  "logo-rewe-bio": "../brand/rewe-bio.png",
  "logo-aus-deiner-region": "../brand/aus-deiner-region.png",
};

async function photoDataUri(key: MediaKey, position = "centre") {
  const file = await readFile(join(process.cwd(), "assets/media", MEDIA_FILES[key]));
  const jpeg = await sharp(file)
    .resize(Math.round(FRAME.w * 1.5), Math.round(FRAME.h * 1.5), { fit: "cover", position })
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

let fonts: Promise<{ name: string; data: Buffer; weight: 600 | 800; style: "normal" }[]> | null = null;
function loadFonts() {
  fonts ??= Promise.all(
    ([600, 800] as const).map(async (weight) => ({
      name: "Bricolage",
      data: await readFile(join(process.cwd(), `assets/fonts/bricolage-grotesque-${weight}.ttf`)),
      weight,
      style: "normal" as const,
    })),
  );
  return fonts;
}

export async function renderOgCard(card: OgCard): Promise<Buffer> {
  const [fontData, photo] = await Promise.all([loadFonts(), photoDataUri(card.photo, card.position)]);
  const logo = `data:image/svg+xml;base64,${Buffer.from(logoSvg({ framed: true })).toString("base64")}`;
  const hours = weekRows().find((r) => r.hours);
  const footer = `${markt.address.street} · ${hours ? `${hours.daysShort} ${hours.time}` : markt.address.city}`;
  const size = titleSize(card.title);
  const words = card.title.split(" ");
  const titleStyle = {
    display: "flex",
    marginTop: 22,
    maxWidth: TITLE_WIDTH + 40,
    fontSize: size,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: size * -0.035,
  } as const;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          fontFamily: "Bricolage",
          backgroundColor: "#cc071e",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(255,90,107,0.45) 0%, rgba(255,90,107,0) 55%), radial-gradient(circle at 100% 100%, #9c0516 0%, rgba(156,5,22,0) 60%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -12,
            bottom: -86,
            display: "flex",
            fontSize: 300,
            fontWeight: 800,
            letterSpacing: -18,
            lineHeight: 1,
            color: "rgba(255,255,255,0.07)",
          }}
        >
          Rödelheim
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700, padding: "60px 0 60px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori braucht <img> */}
            <img src={logo} width={130} height={52} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>Rödelheim</div>
              <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{markt.legalName.replace(/^REWE /, "")}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>
              <div style={{ width: 32, height: 2, backgroundColor: "rgba(255,255,255,0.6)" }} />
              {card.eyebrow}
            </div>
            {card.highlightLast ? (
              // Wörter einzeln, damit das letzte wie im Hero weiß hinterlegt werden kann
              <div style={{ ...titleStyle, flexWrap: "wrap", columnGap: size * 0.24, rowGap: size * 0.06 }}>
                {words.map((w, i) =>
                  i === words.length - 1 ? (
                    <div key={i} style={{ display: "flex", backgroundColor: "#fff", color: "#cc071e", borderRadius: size * 0.16, padding: `0 ${size * 0.12}px` }}>
                      {w}
                    </div>
                  ) : (
                    <div key={i} style={{ display: "flex" }}>
                      {w}
                    </div>
                  ),
                )}
              </div>
            ) : (
              // ausgeglichene Zeilen statt eines einzelnen Worts in der letzten Zeile
              <div style={{ ...titleStyle, textWrap: "balance" }}>{card.title}</div>
            )}
          </div>

          <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>{footer}</div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 76,
            top: 56,
            width: FRAME.w,
            height: FRAME.h,
            display: "flex",
            overflow: "hidden",
            borderRadius: 32,
            border: "4px solid rgba(255,255,255,0.3)",
            backgroundColor: "#0c0c0c",
            boxShadow: "0 30px 80px rgba(60,0,8,0.55)",
            transform: "rotate(2deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori braucht <img> */}
          <img src={photo} width={FRAME.w} height={FRAME.h} alt="" style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fontData },
  );

  const png = Buffer.from(await image.arrayBuffer());
  // 4:4:4 hält weiße Schrift auf Rot ohne Farbsäume
  return sharp(png).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
}
