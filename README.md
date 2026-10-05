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
| `BEWERBUNG_TO` | Empfänger der Online-Bewerbungen (kommagetrennt). |
| `MAIL_FROM` | Absender, z. B. `Website REWE Rödelheim <bewerbung@…>` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Versand über das eigene Postfach des Markts (Port 465 = SSL, 587 = STARTTLS) … |
| `RESEND_API_KEY` | … oder über Resend (Domain dort verifizieren). |
| `BEWERBUNG_CONFIRM=true` | Bewerber bekommen eine Eingangsbestätigung (nur wenn sie eine E-Mail angeben). |
| `MAIL_DRY_RUN=true` | Lokal/Test: nichts senden, nur protokollieren. |

Ohne Mail-Konfiguration zeigt das Formular einen Hinweis und die Telefonnummer und nimmt keine Bewerbungen an. Nach dem Setzen der Variablen in Vercel neu deployen.

## Inhalte pflegen (ohne Design-Änderung)

| Was | Wo |
|---|---|
| Adresse, Telefon, E-Mail, Öffnungszeiten, Services, Links (Prospekt, Instagram, Stellensuche) | `content/markt.ts` |
| Sonderöffnungszeiten (z. B. Heiligabend) | `content/markt.ts → hours.specialDays` – Feiertage in Hessen und § 3 HLöG rechnet `lib/hours.ts` selbst |
| Story im ersten Screen (Clip/Fotos, Reihenfolge, Dauer) | `content/story.ts` |
| Galerie „Aus dem Markt“ | `content/galerie.ts` |
| Beiträge unter /aktuelles (Markdown) | `content/aktuelles.ts` |
| Offene Stellen (erzeugen automatisch JobPosting-Daten) | `content/jobs.ts` |
| Termine im Markt (Startseite + Markt-Kalender) | `content/termine.ts` |
| Auswahl im Bewerbungsformular | `content/bewerbung.ts` |
| Neue Fotos | Datei nach `assets/media/`, in `lib/media.ts` mit Alt-Text, Kurztitel und Bildnachweis eintragen |
| Neue Clips | zwei MP4 (H.264, stumm, `faststart`: 720 px und 540 px breit) nach `public/media/`, Posterbild nach `assets/media/`, Eintrag in `lib/media.ts → clips`. Geänderte Videos immer unter neuem Namen (`/media` wird ein Jahr gecacht) |

Clips komprimieren (so wurde der Rundgang erstellt – Handys bekommen automatisch die 540er-Datei, im Datensparmodus läuft gar kein Video):

```bash
ffmpeg -i quelle.mp4 -an -c:v libx264 -profile:v high -level:v 4.0 -preset veryslow -crf 31 -pix_fmt yuv420p -movflags +faststart public/media/name-720.mp4
ffmpeg -i quelle.mp4 -an -vf "scale=540:960:flags=lanczos" -c:v libx264 -profile:v high -level:v 4.0 -preset veryslow -crf 31 -pix_fmt yuv420p -movflags +faststart public/media/name-540.mp4
```

## Service-Funktionen

| Funktion | Wo | Hinweis |
|---|---|---|
| Bewerben in 60 Sekunden | `/karriere/bewerben` | 4 Schritte, ohne JS eine lange Seite; Entwurf nur im Browser; Honeypot + Mindestzeit + Rate-Limit; Versand per Mail (siehe Umgebung) |
| Markt-Kalender | `/kalender.ics` | Prospektwochen, Feiertage, § 3 HLöG, Termine; Abo-Knöpfe für Apple, Google, Outlook |
| Als App / offline | `app/manifest.ts`, `public/sw.js`, `/offline` | Seiten network-first mit Offline-Kopie; bei Änderungen an der Cache-Logik `VERSION` in `sw.js` erhöhen |
| Teilen | Prospekt-Ticket | System-Teilen-Menü, sonst WhatsApp / Link kopieren |
| Aushang mit QR-Codes | `/aushang` (noindex) | A4 drucken; nach dem Domainwechsel neu drucken |
| Teilen-Vorschau | `/og/<karte>.jpg`, `lib/og.tsx` | eigene Karte je Seite und Beitrag (roter Hero-Look, beim Build erzeugt); neue Seite: Karte in `lib/og.tsx → PAGES`, Metadaten mit `pageMetadata()` aus `lib/site.ts` |

## Markt-Cockpit

`/cockpit` – Anmeldung mit E-Mail und Passwort (Supabase, Projekt `rewe-roedelheim`, Frankfurt). Der Markt lädt hier den Wochenprospekt als PDF hoch; die Seiten werden im Browser in Bilder umgewandelt, nach einer Vorschau veröffentlicht und auf `/angebote` sowie im Startseiten-Ticket gezeigt – alle „Prospekt“-Knöpfe führen dann auf die eigene Seite statt zu rewe.de. Ab Samstag erscheint ein schon hochgeladener Prospekt als „Nächste Woche“; Prospekte, deren Woche länger als vier Wochen vorbei ist, löscht das nächste Veröffentlichen.

| Aufgabe | So geht's |
|---|---|
| Konto anlegen | Supabase-Dashboard → Authentication → Add user (E-Mail, Passwort, „Auto Confirm“), dann im SQL-Editor `insert into public.editors (user_id, name) values ('<uuid>', '<Vorname>');` |
| Registrierung sperren | Authentication → Sign In / Providers → „Allow new users to sign up“ aus (einmalig) |
| Datenbank ändern | neue Datei in `supabase/migrations/`, per Supabase-MCP `apply_migration` oder SQL-Editor anwenden |
| Tests | Server auf Port 3100 starten, dann `node --env-file=.env.local e2e/<skript>.mjs` (`rls-check`, `cockpit-login`, `cockpit-prospekt`, `prospekt-viewer`, `start-ticket`, `cockpit-axe`, `public-qa`); Test-Editor in `.env.local` (siehe `.env.example`) |
| Tarif | Für den Livegang Supabase Pro (pausiert nicht, tägliche Sicherung); Vercel-Tarif auf kommerzielle Nutzung prüfen |

## Grundsätze

- **Nur Belegtes.** Keine Preise, Bewertungen, Zitate oder Stellen erfinden. Angebote kommen ausschließlich aus dem offiziellen REWE-Prospekt (Link in `content/markt.ts`).
- **Keine Drittanbieter beim Laden.** Schriften via `next/font` (selbst gehostet), Karte als statisches Bild (`assets/media/karte-roedelheim.jpg`, © OpenStreetMap-Mitwirkende). Wer Google Maps, YouTube, Instagram-Embeds o. Ä. einbaut, braucht Einwilligung und muss die Datenschutzerklärung anpassen.
- **Bewegung ist pausierbar** und entfällt bei `prefers-reduced-motion`.

## Struktur

```
app/(site)/     öffentliche Seiten (/, /angebote, /markt, /aktuelles, /karriere, /kontakt, /impressum, /datenschutz) mit Kopf und Footer
app/            Root-Layout, 404, robots, sitemap, Manifest, /kalender.ics, /og (Teilen-Bilder)
e2e/            Browser-Tests (puppeteer-core): node e2e/public-qa.mjs bei laufendem Server auf Port 3100
components/     home/ (Story, Prospekt-Ticket, Highlights, Karriere), layout/, live/ (Öffnungsstatus, KW), media/ (Galerie), visit/, ui/
content/        Inhalte (siehe oben)
lib/            hours.ts, flyer.ts (+ Tests), media.ts, jsonld.ts, site.ts
assets/         Fotos und Logos (statische Imports → Next.js optimiert sie)
public/media/   Clips
```
