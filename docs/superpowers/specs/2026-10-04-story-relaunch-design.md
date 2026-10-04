# REWE Rödelheim · Relaunch „Story" — Design

Stand: 2026-10-04 · Branch `relaunch-story` · Ersetzt `PROMPT-TASARIM.md` (v2, Online-Shop-Konzept)

## 1. Ziel

Die Website des REWE-Markts Thudichumstraße 18–22 (REWE Ali Alamyaar oHG) soll die Kaufmannsseiten der Region
(rewe-dortmund.de, rewe-dreysse.de, rewe-mueller.de, rewe-richrath.de; Analyse in `../analyse/Referenzanalyse.md`)
deutlich übertreffen: echte Bilder und Clips aus dem Markt, live richtige Öffnungszeiten, der Wochenprospekt mit
einem Tipp erreichbar, sehr schnell, ohne Cookie-Banner.

## 2. Entscheidungen der Agentur (Chat 2026-10-04)

| Frage | Entscheidung |
|---|---|
| Gestaltung | Richtung **C „Story"**: Der erste Screen ist der Markt-Clip — mobil als Vollbild-Story, Desktop als hochkant gerahmter Clip mit unscharfem Abbild dahinter. Darunter helle Seite. |
| Online-Shop | **Entfernt**: Produkte mit erfundenen Preisen/Sternen/Bewertungen, Warenkorb, Checkout, Konto, Login, Bonus-Rechner, Pfand-Kompass, erfundene Erzeuger, Artikel, Stellen, Zitate, „10 % Willkommensrabatt". Angebote kommen ausschließlich aus dem offiziellen REWE-Prospekt. |
| Sprache | **Nur Deutsch** (next-intl, `/en`, `messages/` entfallen). |
| Veröffentlichung | Branch + Vercel-Preview; `main` (= reweroe.vercel.app) erst nach Freigabe. |

## 3. Grundsätze

1. **Nur Belegtes.** Jede Tatsache hat eine Quelle (rewe.de-Marktseite, Instagram @rewealialamyaar, Pressemitteilung HMdI 10.09.2026). Was fehlt, steht in `docs/BETREIBER-CHECKLISTE.md` und wird nicht erfunden.
2. **Echte Medien zuerst.** Clip + Instagram-Fotos sind die Bildsprache; keine KI-Stockfotos.
3. **Keine Drittanbieter beim Laden.** Schriften selbst gehostet (next/font), Karte als statisches Bild, Google Maps/Instagram/REWE nur als Links → kein Cookie-Banner.
4. **Mobil zuerst.** Feste Leiste unten: Prospekt · Route · Anrufen.
5. **Zugänglich.** WCAG 2.2 AA; bewegte Inhalte pausierbar; `prefers-reduced-motion` = kein Autoplay.

## 4. Seiten

| Route | Inhalt |
|---|---|
| `/` | Story-Hero (Clip + Fotos als Story, Live-Status, Prospekt-CTA) → Prospekt-Ticket (KW, Mo–Sa) → „Aus dem Markt" (Galerie, Lightbox, Instagram) → „Bei uns im Markt" (Bäckerei, Sushi, Aus deiner Region, REWE Regional, REWE Bio) → Aktuelles-Teaser → Öffnungszeiten & Anfahrt → Karriere-Band |
| `/angebote` | Prospekt der Woche (KW, Gültigkeit, Button zum offiziellen Prospekt), kurze Hinweise |
| `/markt` | Unser Markt: Services, Marken (Regional/Bio/Region), Galerie, Öffnungszeiten & Anfahrt |
| `/aktuelles`, `/aktuelles/[slug]` | Nur echte Beiträge (Start: Resilienzwoche 2026, mit Quelle und Bildnachweis) |
| `/karriere` | Arbeiten im Markt, Link zur REWE-Stellensuche (PLZ 60489), Initiativbewerbung; `content/jobs.json` für echte Stellen (+ JobPosting-JSON-LD) |
| `/kontakt` | Adresse, Telefon, Öffnungszeiten, statische Karte, Route (Google/Apple), Instagram |
| `/impressum`, `/datenschutz` | Bekannte Angaben; fehlende Pflichtangaben sichtbar markiert |
| alte Routen | 308-Weiterleitungen auf die nächstliegende neue Seite |

## 5. Gestaltung

- **Schrift:** Bricolage Grotesque 800 (Display), Inter 400–700 (Text), beide via `next/font/google`.
- **Farben:** REWE-Rot `#CC071E` (auf Dunkel `#FF5A6B`), Tinte `#121212`, Nacht `#0C0C0C`, Papier `#FFFFFF`, warmes Grau `#F4F2ED`, gedämpft `#66625C`, Linie `#E6E2DA`, Offen-Grün `#15803D` (auf Dunkel `#4ADE80`), Regional-Gelb `#FFCC00`. Nur Light-Mode.
- **Form:** Medien/Karten 24–32 px Radius, Pills 999 px, weiche große Schatten.
- **Bewegung:** Story-Fortschritt, sanftes Einblenden per CSS (`animation-timeline: view()`), sonst ruhig.
- **Story-Hero:** Einträge aus `content/story.json` (Clip + Fotos, je mit Dauer und Bildunterschrift). Fortschrittsbalken, Pause-Knopf, Tippen links/rechts (mobil), Pfeiltasten. Desktop-Hintergrund = Mini-Clip (≈ 100 × 180 px) stark unscharf.

## 6. Daten & Logik

- `content/markt.json` — Stammdaten, Zeiten, Sonderzeiten, Services, Links, Quellen.
- `content/story.json`, `content/galerie.json`, `content/aktuelles/*.md`, `content/jobs.json`.
- `lib/media.ts` — statische Bildimporte (Breite/Höhe/Blur automatisch) + Alt-Texte + Bildnachweise.
- `lib/hours.ts` — Status in Europe/Berlin: Sonderzeiten > Feiertage Hessen > reguläre Zeiten, begrenzt durch § 3 HLöG (24.12./31.12. 14 Uhr, Gründonnerstag 20 Uhr, „vorläufig").
- `lib/flyer.ts` — Prospektwoche Mo–Sa (sonntags schon die neue Woche, Feiertag am Montag → ab Dienstag), ISO-KW.
- Seiten statisch, `revalidate = 3600` wo Datum/KW gerendert wird; Live-Status/KW zusätzlich clientseitig.
- Tests: Vitest für `hours` und `flyer`.

## 7. SEO

GroceryStore-JSON-LD (Adresse, Geo, Telefon, Öffnungszeiten, sameAs), Article, BreadcrumbList, JobPosting nur bei echten Stellen.
Indexierung nur mit `SITE_INDEXABLE=true` (Preview/vercel.app bleibt `noindex`). `SITE_URL` setzt Canonical/OG.

## 8. Qualität

Lighthouse mobil 100/100/100/100 auf allen Seiten, axe 0 Verstöße, kein horizontales Scrollen bei 360 px, 0 Drittanbieter-Requests, Startseite ohne Clip < 400 KB.
