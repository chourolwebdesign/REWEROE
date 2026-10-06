# Stufe 5: Design und Tempo – Design

Stand: 2026-10-06 · Branch `markt-design` (auf `markt-inhalte`) · Auftrag (Agentur): Design und Geschwindigkeit verbessern; Video und
Fotos schärfer („4K“). Grundlage: Spec `2026-10-05-markt-cockpit-design.md`, Abschnitte 6 und 8 (Stufe 5).
Richtung (Agentur, 2026-10-06): Das bestehende Design (roter Hero, Bänder, Farben, Schrift) bleibt und wird verfeinert – kein Neuentwurf.

## Ausgangslage (gemessen 2026-10-06)

Lighthouse 13.5, mobil, Median aus 3 Läufen, lokaler Produktions-Build (`next start`, HTTP/1.1 – der LCP ist lokal eher zu hoch),
mit dem echten Prospekt KW 41 (34 Seiten, JPEG) in der Datenbank:

| Seite | Perf | LCP | Übertragung | Größte Posten |
|---|---:|---:|---:|---|
| `/` | 93 | 3,2 s | 2 053 KB | Video 1 450 KB, Titelseite 184 KB, JS 179 KB, Schrift 76 KB |
| `/angebote` | 81 | 5,2 s | 3 309 KB | 17 Vorschaubilder à ~200 KB = 3 005 KB |
| `/kontakt` | 96 | 2,8 s | 535 KB | Titelseite 184 KB (Prefetch der Startseite) |
| `/markt` | 92 | 3,4 s | 773 KB | Fotos 445 KB |
| `/karriere` | 96 | 2,8 s | 540 KB | |
| `/aktuelles` | 96 | 2,8 s | 551 KB | |
| Beitrag | 94 | 3,1 s | 586 KB | |

Barrierefreiheit und Best Practices überall 100; SEO 69 nur wegen `noindex` (bis zur eigenen Domain gewollt).

Befunde:
- **Vorschaubilder** entstehen im Browser des Redakteurs. Ohne WebP-Encoder (Safari) werden es JPEGs mit rund 200 KB je Seite; die Übersicht
  lädt durch den Lazy-Loading-Vorlauf des Browsers 17 davon sofort.
- **Titelseite im Startseiten-Ticket** ist ein `<img>` ohne `loading="lazy"`. React lädt sie beim Prefetch der Startseite auf jeder Unterseite vor.
- **Video**: Quelle ist ein Instagram-Download mit 720×1280 bei 1,95 Mbit/s. Die Website-Fassungen haben weniger als die halbe Bitrate;
  Telefone bekommen 540×960 und vergrößern es auf etwa 1 100 Gerätepixel – daher wirkt es weich. Es lädt sofort mit.
- **Fotos**: Quellen 1 200–2 000 px; AVIF/WebP ist aktiv (`images.qualities: [70, 75, 85]`).

## Ziele

- Lighthouse mobil **≥ 95** auf jeder öffentlichen Seite (gleiche Messung), CLS 0, axe ohne Befund, keine Drittanbieter-Anfragen.
- `/angebote` mit Prospekt: Übertragung beim Laden **≤ 1 MB** (heute 3,3 MB), LCP ≤ 2,5 s (lokal gemessen).
- Startseite: Das Video lädt erst nach dem Laden der Seite; Übertragung ohne Video ≤ 700 KB.
- Video sichtbar schärfer: auf allen Geräten in der Auflösung der Quelle (720×1280), Qualität nahe der Quelle (SSIM ≥ 0,97 gegen die Quelle).

## 1. Tempo

- **Titelseite im Ticket**: `loading="lazy"` und `decoding="async"` – kein Vorladen mehr auf Unterseiten.
- **Prospektbilder** über die Next-Bildoptimierung (`next/image`: AVIF/WebP in der angezeigten Breite). Quelle bleibt Supabase Storage;
  das wirkt auch für schon hochgeladene Prospekte. Die Vergrößerung (PhotoSwipe) nutzt weiter die großen Originalseiten.
  Kosten: Vercel zählt Bildtransformationen (je Woche etwa 34 Seiten × 2–3 Breiten × 2 Formate) – im Rahmen der Tarife.
- **Video**: `preload="none"`; die Quelle wird erst nach dem `load`-Ereignis im Leerlauf gesetzt. Bei Save-Data und reduzierter
  Bewegung wie bisher kein Video. Das Poster bleibt das LCP-Bild.
- **Schrift und JavaScript** bleiben unverändert: Die Schrift (76 KB) liegt nach dem ersten Besuch im Cache, und Kürzen änderte die
  Titelschnitte (optische Größe); das JavaScript ist überwiegend Next/React.

## 2. Prospektseite `/angebote`

- **Roter Seitenkopf** (wie Abschnitt 3) mit KW, Gültigkeit und „Teilen“; die Wochen-Reiter („Diese Woche“/„Nächste Woche“) bleiben.
- **Blätter-Ansicht** als waagerechte Leiste mit CSS-Scroll-Snap (kein Slider-Paket):
  - Telefon und Tablet: eine Seite je Schritt.
  - Ab 1024 px: Doppelseiten wie im gedruckten Prospekt – die Titelseite allein, danach Seite 2–3, 4–5 usw.
  - Pfeile „Zurück“/„Weiter“, Anzeige „Seite 3 von 34“, Wischen auf Touch-Geräten, Pfeiltasten.
  - Antippen öffnet die vorhandene Vergrößerung an dieser Seite (Preise lesen, zoomen).
- **Vorschau-Leiste** darunter: kleine Seiten, waagerecht scrollbar, zum Springen. Die bisherige Übersicht aller Seiten gibt es
  weiter unter „Alle Seiten“ zum Aufklappen.
- **Laden**: Die erste Seite mit Vorrang (LCP), die übrigen erst beim Blättern bzw. Aufklappen.
- **Links** `?kw=&seite=` öffnen wie bisher die Vergrößerung und stellen die Leiste auf diese Seite.
- **Ohne Prospekt** bleibt die Seite wie heute (Karte mit Link zum REWE-Prospekt).
- **Barrierefreiheit**: Leiste als benannte Region, Pfeile mit Text, Seitenanzeige `aria-live="polite"`, sichtbarer Fokus;
  bei reduzierter Bewegung kein weiches Scrollen.

## 3. Seitenköpfe der Unterseiten

- `/markt`, `/kontakt`, `/karriere`, `/aktuelles` und die Beiträge bekommen einen roten Kopf wie der Hero der Startseite: weiße Schrift,
  ein großes blasses Wort im Hintergrund (je Seite eines, z. B. „Markt“, „Kontakt“, „Karriere“, „Aktuell“), helle Brotkrumen.
- Die Kopfleiste liegt darüber transparent wie auf der Startseite, bis gescrollt wird. Gesteuert wird das über ein Attribut am
  Seitenkopf, nicht über eine Liste von Pfaden.
- Impressum, Datenschutz, 404, `/feedback`, `/aushang` und das Cockpit bleiben, wie sie sind.
- Kontrast: Text ≥ 4,5:1 (Weiß auf `--color-red` 5,9:1; die hellen Brotkrumen werden mit axe geprüft).

## 4. Medienqualität

- **Video** aus der Quelle (720×1280) neu kodiert: AV1 (`libsvtav1`), HEVC (`libx265`, Tag `hvc1`) und H.264 als Rückfall, alle
  720×1280 mit `faststart`. Die Fassung mit 540 px entfällt. `<source>` in dieser Reihenfolge mit `type` und `codecs`.
- **Qualitätsziel**: SSIM ≥ 0,97 gegen die Quelle. Die Dateigrößen werden beim Kodieren gemessen und im Plan festgelegt.
- **Fotos**: Qualität 85 für Galerie, Story und große Bilder; die `sizes`-Angaben je Komponente werden geprüft, damit Retina-Displays
  die passende Breite bekommen.
- **4K**: mit der Quelle (720p) nicht möglich – Hochrechnen erfindet keine Schärfe. Mit Originaldateien vom Markt läuft dieselbe
  Kodierung in 1080p; die Betreiber-Checkliste fragt danach.

## 5. Prospekt-Knöpfe

- `/kontakt` („Prospekt öffnen“) und `/markt` („Prospekt der Woche“) führen wie Kopfleiste und mobile Leiste auf `/angebote#prospekt`,
  wenn ein Prospekt online ist, sonst zu rewe.de.

## 6. Tests

- Lighthouse vorher/nachher mit derselben Messung; die Ziele oben sind die Abnahme.
- Screenshots 390/768/1024/1280 px der geänderten Seiten.
- `e2e/prospekt-viewer.mjs` auf die Blätter-Ansicht umstellen: Wischen und Pfeile, Seitenanzeige, Deep Link, Vergrößerung,
  keine Drittanbieter. `start-ticket.mjs`, `public-qa.mjs` (axe, 320 px) und die Cockpit-Tests bleiben grün.
- Unit-Tests für neue Logik (Seitenindex aus `?seite=`, Aufteilung in Doppelseiten).
- Video: SSIM-Messung mit ffmpeg gegen die Quelle.

## Nicht in dieser Stufe

- Stufe 4b (Beiträge und Galerie im Cockpit).
- Neue Inhalte oder Abschnitte; Umbau von Schrift oder JavaScript.
