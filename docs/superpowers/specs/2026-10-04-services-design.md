# REWE Rödelheim · Service-Funktionen — Design

Stand: 2026-10-04 · Branch `features-service` · Auftrag: Bewerbungsformular + nützliche Funktionen, die keine Kaufmannsseite der Region hat (Referenzen: rewe-dortmund, -dreysse, -mueller, -richrath).

Leitplanken bleiben: nur Belegtes, keine Drittanbieter beim Laden, kein Tracking, WCAG 2.2 AA, mobil zuerst.

## 1. Bewerbung in 60 Sekunden — `/karriere/bewerben`

- Vier Schritte (Job · Zeit · Kontakt · Absenden), ohne JS eine lange Seite (progressive enhancement, Server Action + `useActionState`).
- Kein Lebenslauf nötig; optional PDF/JPG/PNG bis 4 MB gesamt, Fotos werden im Browser verkleinert.
- Verfügbarkeit als Raster Mo–Sa × vormittags/nachmittags-abends; Start „sofort“ oder Datum.
- Entwurf nur lokal im Browser (localStorage), nach dem Absenden gelöscht.
- Pflicht: Name, Telefon oder E-Mail, Hinweis auf Datenschutz gelesen. Optional: Talentpool-Einwilligung (12 Monate).
- Keine Fragen nach Alter, Herkunft, Foto o. Ä. (AGG).
- Spam: Honeypot + Mindestzeit + einfache Rate-Begrenzung, kein CAPTCHA.
- Zustellung per E-Mail an den Markt: SMTP (eigenes Postfach) oder Resend; ohne Konfiguration klare Meldung + Telefon. Bestätigung an Bewerber optional.
- Konfiguration: `BEWERBUNG_TO`, `MAIL_FROM`, `SMTP_*` oder `RESEND_API_KEY`, optional `BEWERBUNG_CONFIRM=true`, lokal `MAIL_DRY_RUN=true`.

## 2. Markt-Kalender — `/kalender.ics`

Abonnierbarer Kalender (Apple, Google, Outlook): jede Prospektwoche ein Ganztagstermin „Neuer Prospekt“ mit Link,
Feiertage („geschlossen“), gesetzliche Schlusszeiten (24.12./31.12., Gründonnerstag; „voraussichtlich“) und bestätigte Sonderzeiten.
Erzeugt aus `lib/flyer.ts` + `lib/hours.ts`, alle 6 h neu. Keine Anmeldung, keine Daten.

## 3. Notvorrat-Rechner — `/notvorrat`

Personen × Tage → Mengen nach BBK-Checkliste (10 Tage, 1 Person, ca. 2.200 kcal/Tag): Getränke 20 l, Getreide/Brot/Kartoffeln/Nudeln/Reis 3,5 kg,
Gemüse/Hülsenfrüchte 4 kg, Obst/Nüsse 2,5 kg, Milch(produkte) 2,6 kg, Fisch/Fleisch/Eier 1,5 kg, Fette/Öle 0,357 kg.
Dazu abhakbare Listen (Hygiene, Hausapotheke, Stromausfall, Dokumente; lokal gespeichert), Drucken, Teilen. Quelle sichtbar.

## 4. Als App — PWA

`app/manifest.ts`, Icons (auch maskable), minimaler Service Worker: Seiten network-first mit Kopie für offline,
`/_next/static` + Bilder cache-first, Offline-Seite mit Zeiten/Adresse/Telefon. Installieren-Knopf (Android/Chrome) bzw. Anleitung (iOS).

## 5. Teilen

Prospekt, Stellen und Vorratsliste über das Teilen-Menü des Telefons; Fallback WhatsApp-Link und „Link kopieren“.

## 6. Aushang — `/aushang` (noindex)

Druckbares A4-Plakat mit QR-Codes (Prospekt, Bewerben, Kalender, Instagram), QR als SVG beim Build erzeugt.
