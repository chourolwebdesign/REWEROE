# Stufe 6: Rundgang-Hero und Mobil – Design

Stand: 2026-10-06 · Branch `rundgang-mobil` (auf `main` fdfa565) · Auftrag (Agentur, 2026-10-06): Der Rundgang-Clip wird das
Hauptthema der Startseite, und die Website wird auf dem Handy deutlich besser. Grundlage: Spec `2026-10-06-design-tempo-design.md`
(Stufe 5).

Entscheidungen der Agentur (2026-10-06):
- Handy: Das Video füllt den ersten Bildschirm randlos über die volle Höhe; Text und Knöpfe liegen unten darüber.
- Desktop: Text links, großes Video rechts, nur der Rundgang (keine Story mit Fotos mehr).
- Startseite auf dem Handy „straffen“: Doppeltes und Schmuck fällt weg, Galerie und Service-Karten werden waagerechte Reihen.
- Die übrigen Befunde der Mobil-Prüfung (unten) werden alle umgesetzt.

„Handy“ heißt in dieser Spec: unter 768 px (`md`). Der Hero wechselt wie heute erst ab 1024 px (`lg`) in den Desktop-Aufbau.

## Ausgangslage (gemessen 2026-10-06)

Lokaler Produktions-Build von `main` (fdfa565), 390 × 844 px, Faktor 3, alle öffentlichen Seiten auch mit 360 und 430 px geprüft:

| Seite | Länge in Bildschirmen | Roter Kopf, Anteil am ersten Bildschirm |
|---|---:|---:|
| `/` | 14,4 | Hero 1,25 Bildschirme hoch; die Story beginnt erst bei etwa zwei Dritteln der Höhe |
| `/angebote` | 6,1 | 0,53 – von der ersten Prospektseite liegen 39 % im ersten Bildschirm |
| `/markt` | 8,4 | 0,69 |
| `/kontakt` | 5,3 | 0,45 |
| `/karriere` | 5,5 | 0,77 |
| `/aktuelles` | 3,6 | 0,50 |
| Beitrag | 7,6 | 0,76 |

Der Footer ist auf jeder Seite 1,88 Bildschirme hoch. Keine Seite scrollt seitlich, und die Schnellzugriff-Leiste verdeckt am
Seitenende nichts. Lighthouse mobil auf Vercel (2026-10-06): 95–99, LCP 2,3–2,9 s.

Befunde:
- **Startseite:** Die Öffnungszeiten stehen an sechs Stellen (Lede, Status, Laufband, Zahlenband, „Besuch“, Footer). Karriere
  kommt zweimal (Karte „Bewerben in 60 Sekunden“ in „Mehr als einkaufen“ und `CareerBand`). Die Galerie braucht zweispaltig
  etwa 2,5 Bildschirme.
- **`/feedback`:** Die Sprachauswahl hat 15 px. iOS Safari zoomt beim Antippen von Feldern unter 16 px in die Seite.
- **Brotkrumen:** Die Tippfläche von „Start“ ist 32 × 17 px.
- **Kleine Schrift:** Eyebrows und Footer-Überschriften 13 px, der Zusatz „Ali Alamyaar oHG“ im Logo 12 px.
- **Unscharf auf 3×-Displays** (echte Pixelbreite gegen benötigte):
  - Rundgang-Poster: 720 statt 1 070 px.
  - Galerie-Kacheln mit Querformat-Fotos, z. B. `resilienzwoche-aktion` 640 statt 984 px, weil `sizes` den Zuschnitt
    (`object-cover`) nicht mitrechnet.
  - Gruppenfoto im Beitrag: 709 statt 2 040 px. Die Quelle hat nur 709 px und wird stark beschnitten.
- **Video:** Bisher kodiert aus dem Instagram-Download (720 × 1280, 1,95 Mbit/s). Neu vom Nutzer:
  `~/Downloads/hf_20261006_120813_ef4ca865-0212-431e-aae7-b270a8204abc.mp4`, eine KI-Hochrechnung desselben Clips.
  - Technisch: 2160 × 3840, 24 fps, H.264 mit 20,6 Mbit/s, mit Ton.
  - In Webgröße deutlich schärfer.
  - Bei 1:1 wirken Flächen gemalt, und die Schrift auf Schildern ist verschmiert.
  - Der Inhalt ist saisonal: Weihnachtssterne, Schoko-Nikoläuse, Schild „Festlich sparen“.

## Ziele

- Handy (390 × 844):
  - Startseite höchstens 10 Bildschirme.
  - Footer höchstens 1,2 Bildschirme.
  - Roter Kopf der Unterseiten höchstens die Hälfte des ersten Bildschirms.
  - Auf `/angebote` liegen mindestens zwei Drittel der ersten Prospektseite im ersten Bildschirm.
- Erster Bildschirm der Startseite auf dem Handy: das Video randlos über die volle Höhe. Überschrift, Öffnungsstatus und beide
  Knöpfe liegen vollständig im ersten Bildschirm.
- Alle Formularfelder der öffentlichen Seiten haben mindestens 16 px. Die Brotkrumen-Links sind mindestens 24 px hoch. Eyebrows
  und Footer-Überschriften haben auf dem Handy mindestens 14 px.
- Galerie-Kacheln bekommen auf 3×-Displays mindestens die benötigte Breite geteilt durch 1,15. Ausnahme ist das Gruppenfoto,
  dessen Quelle zu klein ist.
- Das Hero-Poster hat die Auflösung des Videos (1080 × 1920). Randlos auf einem 3×-Handy (390 × 844) wird ein 9:16-Bild auf etwa
  475 px Breite gezogen und braucht dann rund 1 420 px. Poster und Video werden dort also etwa 1,3-fach vergrößert; heute sind es
  rund 2-fach. 1440p wäre schärfer, die Datei aber knapp doppelt so groß. Entschieden ist 1080p.
- Video in 1080 × 1920 mit SSIM ≥ 0,97 gegen die auf 1080 × 1920 verkleinerte Quelle.
- Lighthouse mobil: lokal auf `/` mindestens 91 wie heute, auf Vercel nach dem Merge überall ≥ 95. Dazu CLS 0, axe ohne Befund
  und keine Drittanbieter.

## 1. Video

- **Quelle:** die KI-Hochrechnung oben. Eine Kopie kommt neben die bisherige Quelle in den Projektordner, außerhalb des Repos.
- **Kodierung:** verkleinert auf 1080 × 1920 (lanczos), 24 fps, ohne Ton, `faststart`. Drei Fassungen in dieser Reihenfolge:
  AV1 (`libsvtav1`), HEVC (`libx265`, Tag `hvc1`) und H.264 (High).
- **Dateinamen:** neu, `markt-rundgang-1080-{av1,hevc,h264}.mp4`, denn `/media` wird ein Jahr lang gecacht. Die 720er-Dateien
  entfallen. Die `codecs`-Angaben kommen aus ffprobe.
- **Qualität:** SSIM ≥ 0,97 gegen die verkleinerte Quelle, bei möglichst kleinen Dateien. Die Größen werden beim Kodieren gemessen
  und im Plan festgehalten.
- **Poster:** das erste Bild der Quelle, 1080 × 1920, unter neuem Namen in `assets/media/`, ausgeliefert über `next/image`.
- Die Clip-Kachel und die Vergrößerung der Galerie nutzen dieselben Dateien.
- **Dokumentation:** README „Neue Clips“ und Betreiber-Checkliste nennen Quelle und Verfahren. Neuer Punkt der Checkliste: ein
  Rundgang ohne Saisonware, mit dem Handy in 4K, hochkant, ruhig geführt, 15–20 s. Das Original kommt per AirDrop oder Drive, nicht
  über WhatsApp oder Instagram, die beide neu komprimieren.

## 2. Startseite: Rundgang-Hero

- **Ein Clip statt Story:** `StoryHero` wird ein Video-Hero mit genau einem Clip (`markt-rundgang`), der in Schleife läuft
  (`loop`). Es entfallen:
  - Fortschrittsbalken und Tippzonen,
  - Weiter/Zurück und die Anzeige „1 / 4“,
  - das automatische Weiterschalten,
  - `content/story.ts`.
- **Handy und Tablet (unter 1024 px):**
  - Der Hero ist genau einen Bildschirm hoch (`100svh`). Video und Poster liegen randlos (`object-cover`) hinter der transparenten
    Kopfleiste.
  - Oben sorgt ein Verlauf dafür, dass die Kopfleiste lesbar bleibt.
  - Unten liegt ein dunkler Verlauf mit Eyebrow, H1 „Willkommen in deinem Markt.“, Öffnungsstatus und den Knöpfen
    „Prospekt KW …“ und „Route“.
  - Die Lede entfällt im Hero; Bäckerei, Sushi und Zeiten stehen weiter unten.
  - Pause/Abspielen ist ein runder Knopf von mindestens 44 px über dem Video.
  - Es gibt keinen roten Grund, keine Farbkleckse und keinen „Rödelheim“-Schriftzug.
- **Desktop (ab 1024 px):**
  - Aufbau wie heute: roter Grund, Text links.
  - Der Rahmen rechts wird höher: `min(88svh, 52rem)` statt `min(78svh, 46rem)`.
  - Instagram-Zeile („rewealialamyaar · Rundgang durch unseren Markt“) und Pause-Knopf bleiben; die Navigation unter dem Rahmen
    entfällt.
- **Laden wie bisher:**
  - Das Poster ist das LCP-Bild (`eager`, `fetchPriority="high"`). Seine `sizes` lauten auf dem Handy `100vw` und auf dem Desktop
    die Rahmenbreite.
  - Die Videoquelle wird nach `load` im Leerlauf gesetzt.
  - Bei Save-Data und bei reduzierter Bewegung startet das Video nicht von selbst; der Knopf startet es.
- **Schnellzugriff:** `#hero-aktionen` bleibt. Die Schnellzugriff-Leiste erscheint erst, wenn die Knöpfe aus dem Bild sind.
- **Barrierefreiheit:**
  - Das Video ist `aria-hidden`, das Poster hat einen Alt-Text.
  - Der Pause-Knopf hat einen Namen und `aria-pressed` (WCAG 2.2.2: Bewegung über 5 s lässt sich anhalten).
  - Die Schrift auf dem Verlauf erreicht mindestens 4,5:1 gegen das hellste Videobild an dieser Stelle; das wird am Screenshot
    gemessen.

## 3. Startseite auf dem Handy straffen

- Unter 768 px ausgeblendet: `MarqueeBand` und `NumbersBand`.
- **Galerie der Startseite:**
  - Der Rundgang-Clip fällt dort in allen Breiten weg, weil er jetzt der Hero ist; die erste Kachel wird das erste Foto.
  - Unter 768 px wird die Galerie eine waagerechte Reihe mit Scroll-Snap: Kacheln etwa 72 % breit, 4:5.
  - `/markt` behält Clip und Raster.
- **„Mehr als einkaufen“ (`Services`):**
  - Unter 768 px eine waagerechte Reihe mit Scroll-Snap.
  - Die Karte „Bewerben in 60 Sekunden“ entfällt unter 768 px; `CareerBand` bleibt. Auf dem Desktop bleibt die Karte.
- Die Reihenfolge der Abschnitte bleibt.

## 4. Alle Seiten auf dem Handy

- **Footer:**
  - Unter 768 px ohne die Liste „Seiten“, die im Menü steht.
  - Die übrigen Linklisten zweispaltig, die Abstände enger.
  - Ziel: höchstens 1,2 Bildschirme.
- **Roter Seitenkopf (`PageHeader tone="red"`):**
  - Unter 768 px weniger Abstand oben und unten; Brotkrumen und Eyebrow rücken näher; die Lede bleibt.
  - Ziel: höchstens die Hälfte des ersten Bildschirms; dazu `/angebote` wie in den Zielen.
- **Formularfelder:** mindestens 16 px auf allen öffentlichen Seiten. Heute liegt nur die Sprachauswahl in `/feedback` darunter.
- **Brotkrumen:** Tippfläche mindestens 24 px hoch, über Padding; die Optik bleibt gleich.
- **Schrift:** Eyebrows und Footer-Überschriften auf dem Handy 14 px.
- **Bilder:**
  - Galerie-Kacheln rechnen den Zuschnitt in `sizes` ein: Ein Querformat in einer 4:5-Kachel bekommt eine breitere Fassung.
  - Das Gruppenfoto im Beitrag wird nicht mehr beschnitten und erscheint in seinem natürlichen Seitenverhältnis.
  - Neuer Punkt der Betreiber-Checkliste: eine größere Fassung beim Fotografen erfragen.

## 5. Tests

- **Neuer Browser-Test `e2e/mobil.mjs`, lesend:**
  - Bei 390 × 844 mit Faktor 3: Seitenlängen, Footer, roter Kopf, die erste Prospektseite auf `/angebote`, Formularfelder ab
    16 px, Brotkrumen ab 24 px, Eyebrows ab 14 px, echte Bildbreiten der Galerie-Kacheln und 1080 px beim Hero-Poster.
  - Bei 360 und 430 px: kein seitliches Scrollen.
- **Hero-Prüfungen, neu oder in bestehenden Tests:**
  - Handy:
    - Hero gleich Bildschirmhöhe, Poster und Video randlos.
    - H1 und beide Knöpfe im ersten Bildschirm, Kopfleiste transparent.
    - Der Pause-Knopf schaltet.
    - Bei reduzierter Bewegung kein Autoplay; der Knopf startet das Video.
  - Desktop 1440 × 900: Rahmen mindestens 85 % der Höhe, keine Story-Navigation.
- **`medien.mjs`:** neue Quellen in 1080, Reihenfolge der Codecs, Poster mit 1080 px.
- **Bestehende lesende Tests** bleiben grün: `public-qa`, `seitenkopf`, `start-ticket`, `prospekt-viewer`, `medien`.
- **Schreibende Tests** (`feedback`, `cockpit-*`, `inhalte-website`, `rls-check`) laufen in dieser Stufe nicht. Die Website liest
  seit dem 6. Oktober live aus demselben Supabase-Projekt, und über ein eigenes Test-Projekt ist noch nicht entschieden. Die
  Änderung in `/feedback` (Schriftgröße) prüft `mobil.mjs` lesend.
- **Lighthouse:** lokal mit der Messung aus Stufe 5, nach dem Merge auf Vercel.
- **Screenshots:** Startseite und geänderte Seiten bei 360, 390, 430 und 1440 px.
- **Unit-Tests** für neue Logik, zum Beispiel `sizes` mit Zuschnitt.

## Nicht in dieser Stufe

- Das Desktop-Layout außer dem Hero und der Galerie der Startseite ohne Clip.
- Auslieferung in 4K: 1080p reicht für Handy und Laptop, 4K vervierfacht die Datei.
- Ton im Video.
- Neue Inhalte und Stufe 4b (Beiträge und Galerie im Cockpit).
- Ein neuer Rundgang ohne Saisonware; dafür gibt es den Punkt in der Checkliste.

## Hinweis

Vercel hat den Merge-Commit von #10 (Feedback-Umfrage) nicht gebaut. Mit dem Merge dieser Stufe nach `main` geht #10 automatisch
mit live.

## Ergebnis (gemessen 2026-10-06, gleiche Messung wie oben, nach dem Abschluss-Review)

| Ziel | Ergebnis |
|---|---|
| Startseite höchstens 10 Bildschirme | 9,7 ohne den Abschnitt „Termine“, der nur mit eingetragenen Terminen erscheint (vorher 14,4) |
| Footer höchstens 1,2 Bildschirme | 1,13 (vorher 1,88) |
| Roter Kopf höchstens die Hälfte | erreicht: `/angebote` 0,34 · `/kontakt` 0,37 · `/aktuelles` 0,42 |
| | nicht erreicht: `/markt` 0,59 · `/karriere` 0,67 · Beitrag 0,62 (vorher 0,69 / 0,77 / 0,76) |
| `/angebote`: zwei Drittel der ersten Prospektseite im ersten Bildschirm | 69 % (vorher 39 %) |
| Formularfelder ≥ 16 px, Brotkrumen ≥ 24 px, Eyebrows ≥ 14 px | erreicht |
| Galerie-Kacheln scharf auf 3×-Displays | erreicht; das Gruppenfoto ist unbeschnitten, seine Quelle bleibt 709 px |
| Video 1080 × 1920, SSIM ≥ 0,97 | AV1 3,9 MB (0,978) · HEVC 5,7 MB (0,977) · H.264 7,1 MB (0,977) |
| Handy-Hero: Video randlos, Text und Knöpfe im ersten Bildschirm | erreicht (`e2e/hero.mjs`) |
| Schrift über dem Video ≥ 4,5:1, große Schrift und Symbole ≥ 3:1, am Screenshot gemessen | erreicht in 390 × 844, 390 × 664 (Safari mit Leisten), 360 × 640, 1000 × 700 und 844 × 390; schwächster Wert 6,9:1 (`e2e/hero-kontrast.mjs`) |
| Lighthouse lokal auf `/` ≥ 91 | 93, LCP 3,2 s |

Lighthouse 13.5 mobil, Median aus 3 Läufen, lokaler Produktions-Build (vorher = Ergebnis Stufe 5):

| Seite | Leistung | LCP | Übertragung |
|---|---|---|---|
| `/` | 91 → 93 | 3,4 → 3,2 s | 2 425 → 4 376 KB (ohne Video 530 → 852 KB) |
| `/angebote` | 91 → 91 | 3,5 → 3,5 s | 440 → 799 KB |
| `/markt` | 92 → 91 | 3,4 → 3,4 s | 661 → 779 KB |
| `/kontakt` | 96 → 95 | 2,8 → 2,9 s | 352 → 352 KB |
| `/karriere` | 96 → 95 | 2,8 → 2,9 s | 369 → 370 KB |
| `/aktuelles` | 97 → 97 | 2,7 → 2,7 s | 383 → 385 KB |
| Beitrag | 94 → 93 | 3,1 → 3,3 s | 406 → 493 KB |

Desktop: `/` erreicht 100, LCP 0,7 s (Lighthouse-Desktop-Profil, Median aus 3 Läufen). Unterschiede von einem Punkt und 0,1 s schwanken
zwischen Messläufen.

Mehr Übertragung, weil:
- das Video in 1080p größer ist (AV1 3,6 MB übertragen);
- die schärferen Galeriebilder größere Fassungen laden;
- auf der kürzeren Startseite Galerie- und Markenbilder schon in den Vorladebereich des Browsers fallen;
- auf `/angebote` die 34 Vorschaubilder (189 KB) und die Seiten 2–3 nach `load` mitladen – ohne Einfluss auf den LCP.

Ziel auf Vercel (≥ 95): nach dem Merge messen.

Entscheidungen bei der Umsetzung:
- **Desktop-Rahmen:** `min(100svh − 7rem, 52rem)` statt `min(88svh, 52rem)`. Sonst ragt der Rahmen bei 900 px über den ersten Bildschirm hinaus; jetzt hat er 87,6 % der Höhe und liegt ganz im Bild.
- **Startseite ≤ 10 Bildschirme:** Die Maßnahmen aus Abschnitt 3 ergaben 11,8. Zusätzlich:
  - Abschnittsabstände auf dem Handy 64 statt 96 px;
  - „Regional, Bio und frisch gebacken“ ebenfalls als Wisch-Reihe.
- **Roter Kopf:** `/markt`, `/karriere` und Beiträge bleiben über der Hälfte. Knopfzeile bzw. langer Titel mit Einleitung sind dort Inhalt, und die Einleitung bleibt laut Spec. Der Test setzt je Seite eine Grenze knapp über dem Messwert.
- **`/angebote`:** Die erste Prospektseite ist auf dem Handy 617 px hoch. Zwei Drittel waren nur ohne Einleitung erreichbar, sonst etwa 58 %. Deshalb entfällt die Einleitung nur dort und nur unter 768 px. Der Abstand unter allen roten Köpfen ist auf dem Handy 24 statt 48 px.
- **Hero-Poster ohne `fetchPriority="high"`:**
  - Auf dem Handy gilt das randlose Poster für Chrome als Hintergrund. LCP ist die Überschrift, die auf die Titelschrift wartet, und das vorgezogene Poster nahm ihr die Leitung (`/` 90 → 93).
  - Auf dem Desktop ist das Poster der LCP; dort bleibt es bei 0,7 s.
  - Galerie-Bilder laden mit niedriger Priorität.
- **Kontrast:**
  - Die erste rechnerische Prüfung war falsch: Der Verlauf hing an der Höhe des Heros, auf kürzeren oder quer gehaltenen Bildschirmen lag der Text daher im blassen Teil (bis 1,4:1).
  - Jetzt ist der dunkle Grund am Textblock verankert: an der Oberkante des Textes 72 % Schwarz. Der Verlauf oben für die Kopfleiste ist kräftiger (72 → 62 %).
  - Gemessen wird am Screenshot über alle Videobilder, wie die Spec es verlangt.
- **Galerie:** Ohne den Clip hat die Startseite sechs Fotos. Die Regel „nur volle Reihen“ zeigte auf dem Desktop nur drei, auf dem Tablet vier. Jetzt nimmt die erste Kachel die Breite, mit der alle Zeilen voll werden (`lib/gallery-layout.ts`):
  - ab 1024 px über drei Spalten, darunter eine Spalte;
  - bei sieben Fotos (`/markt`, Beitrag) bleibt alles wie bisher.
- **Wisch-Reihen und Tastatur:**
  - Oben und unten 6 px Platz für den Fokusrahmen.
  - Der Fokus scrollt die Kachel ganz ins Bild (`components/layout/snap-rows.tsx`).
  - Die Marken-Reihe ist nur fokussierbar und benannt, solange sie scrollt; auf dem Desktop ist sie kein Tab-Stopp.
- **Pause-Knopf:**
  - Die Video-Ebene hat auf dem Handy keinen z-index. Mit `z-0` war sie ein eigener Stapelkontext, und quer oder bei 320 px lag der Textblock über dem Knopf.
  - Der Knopf hat einen festen Namen („Rundgang anhalten“); der Zustand steht in `aria-pressed`.
- **SSIM:** Die Bilder werden über ihre Nummer gepaart. Mit Zeitstempeln (MKV, auf Millisekunden gerundet) verschoben sich die Paare um ein Bild, und alle Werte lagen fälschlich bei 0,89.

Zurückgestellt (kleinere Punkte aus dem Review):
- Video-Fehler: Kein `onError` und keine nächste Fassung, wenn die gewählte Datei nicht lädt. Ohne abspielbare Fassung und ohne JS bleibt der Knopf wirkungslos.
- Einblend-Animation (`.reveal`) für Karten, die in den Reihen seitlich außerhalb starten.
- Footer bei 320 px: Die Service-Links brechen zweizeilig um und stehen ohne Abstand.
- `coverSizes` skaliert nur `px` und `vw`; die erste Kachel ab 768 px fordert etwas zu große Bilder an.

