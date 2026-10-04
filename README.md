# REWE Rödelheim · Website

Website des REWE-Markts Thudichumstraße 18–22, 60489 Frankfurt-Rödelheim (REWE Ali Alamyaar oHG).
Richtung **„Story“**: Der erste Screen zeigt Clip und Fotos aus dem Markt als Story; darunter Prospekt der Woche,
Bilder aus dem Markt, Regional/Bio, Aktuelles, Öffnungszeiten & Anfahrt, Karriere.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Vitest. Nur Deutsch.
Design und Entscheidungen: [`docs/superpowers/specs/2026-10-04-story-relaunch-design.md`](docs/superpowers/specs/2026-10-04-story-relaunch-design.md).
Was der Markt noch liefern muss: [`docs/BETREIBER-CHECKLISTE.md`](docs/BETREIBER-CHECKLISTE.md).

## Starten

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Öffnungszeiten- und Prospektlogik
npm run lint
npm run build && npm start
```

## Umgebung

| Variable | Wirkung |
|---|---|
| `SITE_URL` | Kanonische Adresse (z. B. `https://rewe-roedelheim.de`). Ohne Angabe: Vercel-Produktionsadresse. |
| `SITE_INDEXABLE=true` | Erst dann dürfen Suchmaschinen indexieren (robots.txt + Meta). Vorschau und vercel.app bleiben `noindex`. |

## Inhalte pflegen (ohne Design-Änderung)

| Was | Wo |
|---|---|
| Adresse, Telefon, E-Mail, Öffnungszeiten, Services, Links (Prospekt, Instagram, Stellensuche) | `content/markt.ts` |
| Sonderöffnungszeiten (z. B. Heiligabend) | `content/markt.ts → hours.specialDays` – Feiertage in Hessen und § 3 HLöG rechnet `lib/hours.ts` selbst |
| Story im ersten Screen (Clip/Fotos, Reihenfolge, Dauer) | `content/story.ts` |
| Galerie „Aus dem Markt“ | `content/galerie.ts` |
| Beiträge unter /aktuelles (Markdown) | `content/aktuelles.ts` |
| Offene Stellen (erzeugen automatisch JobPosting-Daten) | `content/jobs.ts` |
| Neue Fotos | Datei nach `assets/media/`, in `lib/media.ts` mit Alt-Text, Kurztitel und Bildnachweis eintragen |
| Neue Clips | MP4 (H.264, stumm, `faststart`) nach `public/media/`, Posterbild nach `assets/media/`, Eintrag in `lib/media.ts → clips` |

Clips komprimieren (so wurde der Rundgang erstellt):

```bash
ffmpeg -i quelle.mp4 -an -c:v libx264 -profile:v high -preset veryslow -crf 31 -pix_fmt yuv420p -g 60 -movflags +faststart public/media/name.mp4
ffmpeg -i quelle.mp4 -an -vf "scale=90:160,fps=15" -c:v libx264 -crf 30 -pix_fmt yuv420p -movflags +faststart public/media/name-bg.mp4
```

## Grundsätze

- **Nur Belegtes.** Keine Preise, Bewertungen, Zitate oder Stellen erfinden. Angebote kommen ausschließlich aus dem offiziellen REWE-Prospekt (Link in `content/markt.ts`).
- **Keine Drittanbieter beim Laden.** Schriften via `next/font` (selbst gehostet), Karte als statisches Bild (`assets/media/karte-roedelheim.jpg`, © OpenStreetMap-Mitwirkende). Wer Google Maps, YouTube, Instagram-Embeds o. Ä. einbaut, braucht Einwilligung und muss die Datenschutzerklärung anpassen.
- **Bewegung ist pausierbar** und entfällt bei `prefers-reduced-motion`.

## Struktur

```
app/            Seiten (/, /angebote, /markt, /aktuelles, /karriere, /kontakt, /impressum, /datenschutz), Layout, robots, sitemap
components/     home/ (Story, Prospekt-Ticket, Highlights, Karriere), layout/, live/ (Öffnungsstatus, KW), media/ (Galerie), visit/, ui/
content/        Inhalte (siehe oben)
lib/            hours.ts, flyer.ts (+ Tests), media.ts, jsonld.ts, site.ts
assets/         Fotos und Logos (statische Imports → Next.js optimiert sie)
public/media/   Clips
```
