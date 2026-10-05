# REWE Rödelheim · Markt-Cockpit, Prospekt und Feedback — Design

Stand: 2026-10-05 · Branch `markt-cockpit` (auf `feinschliff-v5`) · Auftrag (Agentur): Wochenprospekt auf der Website zeigen; der Markt
soll Prospekt und Inhalte selbst pflegen; die eigene QR-Feedback-App (`02-Projeler/kendi/rewe-feedback`) übernehmen und verbessern;
Design weiter ausbauen. Ziel: die beste Website eines Supermarkts in der Region.

Leitplanken bleiben: nur Belegtes, keine Drittanbieter beim Laden der öffentlichen Seiten, kein Tracking, WCAG 2.2 AA, mobil zuerst.
Neu: Die öffentlichen Seiten bleiben vorgerendert und schnell, auch wenn ihre Inhalte aus der Datenbank kommen.

## 0. Ausgangslage und Entscheidungen

- **Prospekt automatisch von rewe.de: nein.** Es gibt kein offizielles PDF und keine Einbettung; rewe.de liegt hinter Cloudflare,
  die Inhalte gehören REWE, Kopieren widerspräche den Nutzungsbedingungen und bräche bei jeder Änderung. Die Prospektseite von rewe.de
  lädt außerdem über 20 Tracking-Dienste.
- **Branchenpraxis:** REWE Richrath lädt jede Woche das PDF hoch (`KW41_2026_final_proof.pdf`, 23 Seiten, 12,4 MB, hochgeladen
  Fr 02.10. für die Woche ab Mo 05.10.) und zeigt es als Flipbook. Der Prospekt dieses Markts trägt „REWE Ali Alamyaar – Dein Markt“ –
  der Markt bekommt eine eigene Ausgabe. PDF-Zugang und Recht zur Online-Veröffentlichung klärt der Betreiber (Abschnitt 11).
- **Datenhaltung:** Supabase (Agentur, 2026-10-05) – Postgres, Storage, Auth; Region `eu-central-1` (Frankfurt).
- **Lesen:** Seiten bleiben vorgerendert (ISR); nach jedem Speichern im Cockpit werden die betroffenen Daten sofort neu geladen.
- **PDF-Verarbeitung:** im Browser des Redakteurs (pdf.js); hochgeladen werden fertige Seitenbilder, nicht das PDF.
- **Cockpit:** im selben Next.js-Projekt unter `/cockpit` (noindex), ein Deployment.
- **Feedback-Sprache:** „du“ wie auf der übrigen Website (die Vorlage nutzte „Sie“); fünf Sprachen bleiben.

## 1. Architektur

### Supabase-Projekt

- Neues Projekt `rewe-roedelheim`, Region Frankfurt. Entwicklung und Vorschau im kostenlosen Tarif (lokal gibt es kein Docker,
  daher keine lokale Supabase-Instanz); vor dem Livegang Pro empfohlen (pausiert nicht, tägliche Sicherung).
- Schlüssel als Umgebungsvariablen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (öffentlich, durch RLS
  abgesichert), `SUPABASE_SECRET_KEY` (nur Server, nie im Browser).
- Schema und Richtlinien als SQL-Migrationen im Repo (`supabase/migrations/*.sql`), damit jede Änderung nachvollziehbar ist.

### Datenmodell

| Tabelle | Felder (Auswahl) | Zweck |
|---|---|---|
| `editors` | `user_id` (→ auth.users), `name` | Wer im Cockpit schreiben darf |
| `flyers` | `id`, `week_start` (Montag, eindeutig), `kw`, `year`, `valid_from`, `valid_to`, `page_count`, `page_width`, `page_height`, `format` (`webp`/`jpg`), `status` (`draft`/`published`), `created_by` | Wochenprospekte |
| `posts` | `id`, `slug`, `title`, `date`, `excerpt`, `body` (Markdown-Teilmenge wie `lib/markdown.tsx`), `cover`, `gallery` (JSON: Pfad, Maße, Alt-Text, Bildnachweis), `source_title`, `source_url`, `status` | Aktuelles |
| `special_days` | `date` (eindeutig), `label`, `closed`, `opens`, `closes` | Sonderöffnungszeiten (Feiertage rechnet weiter `lib/hours.ts`) |
| `events` | `id`, `date`, `time`, `title`, `text`, `status` | Termine (Startseite, Markt-Kalender) |
| `jobs` | `id`, `title`, `employment`, `text`, `active` | Offene Stellen (JobPosting-Daten wie bisher) |
| `gallery_items` | `id`, Bildpfade und Maße, `caption`, `alt`, `credit`, `sort`, `status` | Galerie „Aus dem Markt“ (nur Fotos; Clips bleiben im Code) |
| `feedback` | `id`, `created_at`, `rating` (1–5), `aspects`, `comment`, `contact`, `lang`, `google_click`, `status` (`neu`/`erledigt`), `handled_at`, `handled_by` | Rückmeldungen aus dem Markt |

Storage: Bucket `prospekte` (öffentlich lesbar; `{flyer_id}/{n}.{format}` und `{flyer_id}/thumb-{n}.{format}`) und Bucket `medien`
(öffentlich lesbar; Fotos in zwei Größen: 1600 px und 640 px breit). Bilder werden im Browser fertig skaliert und direkt aus dem Supabase-CDN ausgeliefert –
keine Vercel-Bildoptimierung nötig.

### Zugriff (Row Level Security überall)

- Öffentlich lesbar: veröffentlichte Prospekte, Beiträge, Termine, Galeriebilder; aktive Stellen; Sondertage.
- Editoren (`auth.uid()` in `editors`): lesen und schreiben alles, auch Storage (anlegen, ersetzen, löschen).
- `feedback`: kein öffentlicher Zugriff. Neue Rückmeldungen schreibt nur der Server (Server Action mit Secret Key) nach Prüfung und
  Rate-Limit; lesen und bearbeiten nur Editoren.

### Anmeldung

- E-Mail + Passwort über Supabase Auth (`@supabase/ssr`, Cookies). Selbstregistrierung aus; Konten legt die Agentur an.
- „Passwort vergessen“ per Mail – braucht SMTP/Resend in Supabase (dieselbe Mail-Einrichtung wie für Bewerbungen).
- `proxy.ts` hält die Sitzung aktuell und leitet ohne Anmeldung von `/cockpit/*` auf `/cockpit/anmelden`; jede Server Action prüft
  zusätzlich die Editor-Rolle.

### Lesen auf der Website

- Datenzugriff gebündelt in `lib/data/*` (server-only): `fetch` mit Cache-Tags je Inhaltsart (`prospekte`, `beitraege`, …).
- Nach dem Speichern ruft die Server Action `updateTag(…)` auf; Seiten mit diesen Daten werden beim nächsten Aufruf frisch erzeugt.
  Das stündliche `revalidate` bleibt für den automatischen Wochenwechsel.
- Fehlerfälle: Ist Supabase beim Build nicht erreichbar, bricht der Build ab – der letzte gute Stand bleibt online, eine leere Seite
  geht nie live. Zur Laufzeit liefert ISR bei einem Fehler weiter den letzten guten Stand.
- Bestehende Inhalte (Resilienzwoche-Beitrag mit Bildern, Galerie) übernimmt ein einmaliges Seed-Skript. Danach ist die Datenbank die
  einzige Quelle; `content/aktuelles.ts`, `galerie.ts`, `jobs.ts`, `termine.ts` entfallen. Im Code bleiben Stammdaten
  (`content/markt.ts`: Adresse, Telefon, reguläre Zeiten, Links), Story und Clips.

## 2. Markt-Cockpit (`/cockpit`)

- Deutsch, „du“, für das Handy mit einer Hand gebaut: große Tippflächen, eine Hauptaktion je Ansicht, gleiche Marke (Rot, Bricolage),
  ruhiger als die Website.
- Navigation: mobil unten Übersicht · Prospekt · Feedback · Inhalte; auf dem Desktop links.
- **Übersicht:** drei Statuskarten – „Prospekt KW 41 ✓ online · KW 42 fehlt noch → Hochladen“ (ab Freitag rot hervorgehoben, wenn die
  nächste Woche fehlt), „3 neue Rückmeldungen“, „Nächster Sondertag: Heiligabend → Zeiten festlegen“; darunter Schnellaktionen.
- Nach jedem Speichern: „Gespeichert – in wenigen Sekunden online“ und „Auf der Website ansehen“.
- Löschen nur mit Rückfrage. Fehlermeldungen in Alltagssprache („Das PDF ist größer als 60 MB“ statt Fehlercode).
- Barrierefreiheit wie die Website (axe ohne Befund), `noindex`, keine Links von der öffentlichen Website.

## 3. Prospekt

### Hochladen (Cockpit → Prospekt)

1. PDF wählen (auf dem Handy aus „Dateien“ oder einem Mail-Anhang); bis 60 MB und 80 Seiten.
2. Woche bestimmen: zuerst aus dem Dateinamen (`KW41_2026…` → KW 41/2026); sonst Upload Do–So → nächste Woche, Mo–Mi → laufende
   Woche. Änderbar über eine Wochenauswahl („KW 42 · 12.–17.10.“). Gültigkeit rechnet `lib/flyer.ts` (Feiertags-Montag → ab Dienstag).
3. Vorbereiten mit Fortschritt („Seite 12 von 34“): pdf.js (Apache 2.0, nur in dieser Ansicht geladen) zeichnet jede Seite, der
   Browser speichert sie als WebP – Safari kann kein WebP erzeugen, dort JPEG (`format` hält fest, welches). Große Seite 1800 px breit,
   Vorschaubild 480 px. Seiten werden einzeln direkt nach Supabase hochgeladen; ein Abbruch lässt sich fortsetzen.
4. Vorschau aller Seiten → „Veröffentlichen“. Ein Prospekt pro Woche; erneutes Hochladen ersetzt ihn.

Das PDF selbst wird nicht gespeichert (Druckdatei, für Besucher unnötig). Prospekte älter als vier Wochen löscht ein täglicher
Aufräum-Job (Vercel Cron, Abschnitt 10) samt Bildern.

### Auf der Website

- **`/angebote`:** Kopf „Prospekt KW 41 · Mo 05.10. – Sa 10.10.“. Ist der Prospekt der nächsten Woche veröffentlicht, gibt es ab
  Samstag die Reiter „Diese Woche · Nächste Woche“; sonntags ist „Nächste Woche“ vorausgewählt (wie die bisherige Sonntagslogik).
  Darunter das Raster der Seiten (Titelseite groß).
- **Ansicht:** Antippen öffnet den Vollbild-Viewer – PhotoSwipe 5 (MIT, erst beim Öffnen geladen): Wischen, Doppeltippen und
  Zwei-Finger-Zoom, Pfeiltasten, „7 / 34“, Teilen einer einzelnen Seite per Link (`?seite=7`).
- **Tempo:** Zuerst laden nur Vorschaubilder; große Seiten beim Öffnen, Nachbarseiten vorab.
- **Barrierefreiheit:** Seitenbilder heißen „Prospektseite 7 von 34“; daneben der Link zur Textliste aller Angebote auf rewe.de.
- **Startseite:** Das Ticket zeigt die echte Titelseite (leicht gedreht wie die Story) und „Prospekt ansehen“ führt auf `/angebote`.
- **Kein Prospekt für die Woche:** automatisch das bisherige Ticket mit Link zu rewe.de. Markt-Kalender und Teilen bleiben unverändert.

## 4. Feedback (`/feedback`, aus der eigenen QR-App)

- Erreichbar über den QR-Code auf dem Plakat im Markt und einen kleinen Footer-Link „Feedback zum Einkauf“; `noindex`.
- Aussehen der Website (Rot, Bricolage), schlanker Kopf (Logo, Sprachwahl), fünf Sprachen DE/TR/AR/RU/EN mit automatischer Wahl,
  Arabisch von rechts nach links; die sprachunabhängigen Gesichter der Vorlage bleiben.
- Ablauf wie in der Vorlage:
  - 4–5: Dank, großer Knopf „Auf Google bewerten“, kleines Konfetti (nicht bei reduzierter Bewegung).
  - 1–3: „Was können wir besser machen?“ (Wartezeit, Personal, Frische, Sauberkeit, Sortiment, Kasse, Preis, Sonstiges), Kommentar,
    freiwillig Kontakt für einen Rückruf; danach Entschuldigung und ein ruhiger Google-Link.
  - Der Google-Link ist für alle sichtbar – keine selektive Einholung von Bewertungen (Google-Richtlinie; sonst droht die Löschung
    aller Bewertungen).
- Speicherung: Server Action prüft die Eingaben, lässt höchstens 10 Rückmeldungen je Stunde und IP zu (Zähler nur im Arbeitsspeicher)
  und schreibt in `feedback` (Frankfurt). Keine Cookies, keine IP-Speicherung. Kontaktangaben werden nach 90 Tagen gelöscht, Kommentare nach 12 Monaten (Aufräum-Job).
- Bei 1–2 Sternen geht eine Mail an die Marktleitung, sobald Mail eingerichtet ist.
- **Cockpit → Feedback:** Eingang mit Filter (neu/erledigt, Sterne), Kontakt mit einem Tipp anrufen oder mailen, „Erledigt“,
  Kennzahlen (Durchschnitt der letzten 30 Tage, häufigste Bereiche), Export als CSV. Google Sheets wird nicht mehr gebraucht.
- **Plakat:** A4/A3 „Wie war dein Einkauf?“ im Website-Design mit QR-Code auf `/feedback`, druckbar unter `/aushang`.
- Konfiguration: echter Google-Bewertungslink (`g.page/r/…/review`) in `content/markt.ts`; bis dahin der Kartenlink.

## 5. Weitere Inhalte (Cockpit → Inhalte)

- **Beiträge:** Titel, Datum, Text mit einfacher Werkzeugleiste (Zwischenüberschrift, Liste, Fett, Link), Titelbild und weitere Fotos
  (im Browser verkleinert), Quelle; Vorschau, Veröffentlichen, Zurückziehen. Slug automatisch aus dem Titel.
- **Sondertage:** Datum, „geschlossen“ oder Uhrzeit von–bis, Bezeichnung. Feiertage bleiben automatisch; als „voraussichtlich“
  markierte Tage (24.12., 31.12., Gründonnerstag) lassen sich hier bestätigen.
- **Termine** und **Stellen:** einfache Formulare; Stellen erzeugen die JobPosting-Daten wie bisher.
- **Galerie:** Fotos mit Bildunterschrift hinzufügen, sortieren, entfernen. An erster Stelle bleibt der Clip „Rundgang durch den
  Markt“ aus dem Code, danach folgen die Fotos aus der Datenbank; Clips pflegt weiter die Agentur.

## 6. Design

- `/angebote` neu um den Prospekt herum (meistbesuchte Seite).
- Startseiten-Ticket mit echter Titelseite.
- Kopfbereiche der Unterseiten mit mehr Charakter (heute schlichtes Weiß), passend zum roten Hero.
- Eigenes, ruhiges Design für Cockpit und Feedback.
- Jede Stufe wird auf 390/768/1024/1280 px geprüft (Screenshots, axe, Lighthouse) wie im Feinschliff v5.

## 7. Datenschutz und Recht

- Datenschutzerklärung: neue Abschnitte zu Feedback (Zweck, Speicherdauer, freiwilliger Kontakt) und Cockpit-Anmeldung; Supabase
  als Auftragsverarbeiter (AVV, Server in Frankfurt).
- Prospekt: Veröffentlichung nur mit Freigabe des Betreibers (REWE-Werbemittel).
- Feedback: Google-Link für alle sichtbar (Abschnitt 4).

## 8. Reihenfolge und Auslieferung

Jede Stufe ein eigener Pull Request mit Vercel-Vorschau; nach `main` nur mit Freigabe der Agentur.

1. Infrastruktur und Cockpit-Gerüst: Supabase-Projekt, Migrationen, Anmeldung, Übersicht, Datenzugriff mit Cache-Tags.
2. Prospekt: Hochladen, Viewer, Startseiten-Ticket, Aufräum-Job.
3. Feedback: Seite, Speicherung, Cockpit-Eingang, Plakat.
4. Weitere Inhalte: Beiträge, Sondertage, Termine, Stellen, Galerie; Seed und Entfernen der Inhaltsdateien.
5. Abschließende Design- und Qualitätsrunde.

## 9. Tests

- Unit-Tests (Vitest): Wochenerkennung aus Dateinamen und Datum, Auswahl des aktuellen/nächsten Prospekts, Feedback-Prüfung,
  Löschfristen, Slug-Erzeugung.
- Browser-Tests (Puppeteer) gegen die Vorschau-Datenbank: Anmeldung, Test-PDF hochladen und veröffentlichen, Viewer bedienen,
  Feedback senden und im Eingang erledigen; danach Testdaten löschen.
- Weiterhin axe ohne Befund, Lighthouse wie bisher, keine Drittanbieter-Anfragen auf öffentlichen Seiten.

## 10. Betrieb und Kosten

- Supabase: Entwicklung kostenlos; Pro (rund 25 $ im Monat) vor dem Livegang. Das freie Projekt der Agentur ruht derzeit
  (Inaktivitätspause) – genau das soll beim Kunden nicht passieren.
- Vercel: Hobby ist nur für nicht-kommerzielle Projekte – vor dem Livegang Tarif prüfen. Aufräum-Job als täglicher Vercel Cron
  (`/api/cron/aufraeumen`, mit `CRON_SECRET` geschützt).
- Mail (Resend/SMTP) wird für Passwort-Reset, Feedback-Alarm und Bewerbungen gebraucht.

## 11. Offene Punkte beim Betreiber

- Zugang zum wöchentlichen Prospekt-PDF und Freigabe zur Veröffentlichung auf der Website.
- Google-Bewertungslink aus dem Unternehmensprofil (`g.page/r/…/review`).
- E-Mail-Adressen für Cockpit-Konten (Ali Bey, Marktleitung) und für Feedback-Alarme.
