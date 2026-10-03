# QA-Report · REWE Rödelheim

Stand: 2026-10-04 · Lighthouse 13 (lokaler Production-Build `next build && next start`, Chrome headless)

## Lighthouse

| Seite | Gerät | Performance | Accessibility | Best Practices | SEO | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|---|
| category | mobile | 85 | 100 | 100 | 100 | 4.3 s | 1.4 s | 0 ms | 0 |
| home | mobile | 86 | 100 | 100 | 100 | 4.2 s | 1.4 s | 0 ms | 0.001 |
| home-desktop | desktop | 99 | 100 | 100 | 100 | 0.9 s | 0.4 s | 0 ms | 0 |
| product | mobile | 85 | 100 | 100 | 100 | 4.4 s | 1.4 s | 0 ms | 0 |
| recipe | mobile | 87 | 100 | 100 | 100 | 4.0 s | 1.4 s | 0 ms | 0 |
| stores | mobile | 87 | 100 | 96 | 100 | 4.0 s | 1.4 s | 0 ms | 0 |

**Verbleibende Hinweise (nicht Score-relevant oder lokal bedingt):**

- `best-practices/image-size-responsive`

### Einordnung Performance (Ziel ≥ 95)

Desktop erreicht 99. Mobil liegt die Seite bei 85–88, weil Lighthouse mobil ein simuliertes langsames 4G (1,6 Mbit/s, 150 ms RTT) und 4× CPU-Drosselung ansetzt; der LCP-Wert (~4 s simuliert, 0,1 s real gemessen) hängt dort an der Gesamtmenge der vor dem ersten Paint gestarteten Ressourcen (≈ 280 KB JS für React 19 + Next 16 + Framer/Radix, 3 Font-Dateien, CSS). Bereits umgesetzt: minimale Font-Gewichte, `font-display: optional`, Framer `LazyMotion`, kein verstecktes First Paint, AVIF/WebP + Blur-Up, Leaflet nur per `dynamic()`.
Weitere Hebel, falls 95+ mobil gefordert ist: (1) Framer Motion auf Startseite durch reine CSS-Animationen ersetzen (−40 KB), (2) Header/Mega-Menü ohne Client-JS rendern, (3) Hero-Bild als statisches AVIF mit `fetchpriority=high` direkt im HTML, (4) Edge-CDN mit Brotli (Vercel) – lokal wird nur gzip gemessen.

Mobile-Werte sind mit Lighthouse-Drosselung (simuliertes langsames 4G, 4× CPU-Slowdown) gemessen; Desktop ohne Netzdrosselung.
`best-practices/image-size-responsive` auf der Filialseite stammt von den OpenStreetMap-Kacheln (Leaflet), nicht von eigenen Bildern.

## Manuelle Tests (Desktop 1280 px · Mobil 375 px, Dark & Light)

| Bereich | Ergebnis |
|---|---|
| Startseite: Hero (Ken Burns, Buchstaben-Reveal, Frische-Uhr), Marquee, Kategorien, Angebots-Carousel mit Countdown, Rezepte, Manifest-Zähler, Meine-Filiale-Selector, Newsletter-Validierung | ✅ |
| Sortiment: Filter (Preis-Slider, Ernährung, Regional/Bio, Bewertung), Sortierung, Chips, Paginierung, Bottom-Sheet-Filter mobil, Quick-View | ✅ |
| Produktdetail: Galerie-Zoom, Preis/Grundpreis/Pfand, Warenkorb-Button + Toast + Badge-Sprung, Akkordeons, Produktreise-Karte (Linien-Animation, Zoom auf Region), ähnliche Produkte, Rezepte | ✅ |
| Rezepte: Filter, Rezept des Monats, Detail mit „Alle Zutaten in den Warenkorb“, „Habe ich schon“, Schritte, Nährwerte | ✅ |
| Filialen: Leaflet-Karte, Geolocation-Button, Öffnungsstatus, Services, Pfand-Kompass, Filialdetail mit Wochentabelle & Routenlink | ✅ |
| Angebote: Flip-Prospekt (Seiten, Kategoriefilter, „Endet bald“), Magazin (Feature + Grid, Artikel mit Markdown, verwandte Rezepte) | ✅ |
| Über uns (Timeline, Werte, Zähler, Team-Platzhalter), Nachhaltigkeit (Fortschrittsbalken, Siegel), Karriere (JobPosting-JSON-LD, 3-Schritt-Formular mit Validierung), Bonus (Karten-Tilt, Punkte-Rechner), Kontakt (Live-Validierung, FAQ-Akkordeon + FAQPage-JSON-LD) | ✅ |
| Rechtliches: `/impressum` `/datenschutz` `/agb` `/widerruf` zeigen den „Wir arbeiten an diesen Inhalten“-Platzhalter; Umschalten auf `status: "published"` in `content/legalPages.json` rendert den Text | ✅ |
| Konto/Login (Demo-Modus, Tabs, Einkaufsliste, Favoriten), Warenkorb (Gewicht + Pfand-Zeile, Lieferung/Abholung, Gutschein `WILLKOMMEN10`), Checkout (4 Schritte, Zeitfenster, Zahlart, Bestätigung) | ✅ |
| i18n: `/` Deutsch, `/en` Englisch, Sprachumschalter behält den Pfad, hreflang/canonical pro Seite, Sitemap + robots | ✅ |
| 404: „Dieses Regal ist leer.“ + Suche + 3 beliebte Produkte | ✅ |
| Cookie-Consent (3 Ebenen, Standard nur notwendig, erneut öffnen über Footer) | ✅ |
| `prefers-reduced-motion`: alle Framer-/CSS-Animationen deaktiviert | ✅ |
| Dark Mode (Systemeinstellung) · Kontraste AA nach Token-Korrektur | ✅ |

## Bekannte offene Punkte (warten auf Kundeninhalte)

- Adresse, Telefon, E-Mail, Öffnungszeiten, Eröffnungsjahr → `content/stores.json`, `content/settings.json`, `content/about.json` (`status: "pending"`)
- Rechtstexte → `content/legalPages.json`
- Team-Namen & echte Fotos, offizielles Logo → `content/about.json`, `public/brand/`
- Zahlungs-/Login-Backend: UI ist fertig, Submit-Handler in `checkout-flow.tsx` und `login-form.tsx` sind Demo-Implementierungen
