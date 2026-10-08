# Stufe 7: Feinschliff – Design

Stand: 2026-10-08 · Branch `feinschliff-7` (auf `rundgang-mobil`, PR #11) · Auftrag (Agentur, 2026-10-08): „alles noch einmal prüfen
und alles verbessern, was verbessert werden muss“. Stehende Vorgabe: keine neuen Funktionen. Entscheidungen der Agentur: Umfang wie
unten; kein eigenes Test-Projekt für Supabase, deshalb nur Änderungen, die sich lesend oder mit Unit-Tests prüfen lassen.

## Prüfung (2026-10-08, lokaler Build von e8cfb3d)

Automatisch geprüft: 14 öffentliche Seiten (auch 404, `/offline`, `/aushang`, `/feedback`) in 320, 390, 768, 1024, 1280 und 1440 px:
axe (WCAG 2.2 AA + Best Practice) in vier Breiten, Konsole, kaputte Bilder und Alt-Texte, Überschriftenfolge, Tippflächen,
`target="_blank"`, Animationen bei reduzierter Bewegung, Metadaten und JSON-LD, interne Links, Tab-Reihenfolge mit Fokusring,
Screenshots für 768 und 1024 px. Dazu `npm audit` (keine Lücken) und die Antwort-Header der Live-Seite.

Befund: keine axe-Verstöße, keine kaputten Bilder oder Links, keine Konsolenfehler, Fokusring überall sichtbar, keine Animation bei
reduzierter Bewegung. Neu nur zwei Kleinigkeiten (16, 15). Alles Weitere sind die aufgeschobenen Befunde der Reviews der Stufen 4a–6.

## Ziele

Jeder Punkt unten ist behoben und durch einen Test gesichert, der vorher rot war (Browser-Test lesend oder Unit-Test). Alle lesenden
Browser-Tests, Unit-Tests, `tsc` und `lint` bleiben grün; Lighthouse lokal nicht schlechter als in Stufe 6 (`/` 93).

## 1. Prospekt-Viewer (`components/prospekt/flyer-pager.tsx`)

1. **Drehen und Fensterbreite:** Wechselt `(min-width: 64rem)` (Doppelseiten an/aus), bleibt die zuerst sichtbare Seite stehen:
   Listener auf `matchMedia(...).change` → `show(visibleRef.current[0])`. Test: Desktop-Seite von 1180 auf 820 px und zurück, die
   Anzeige bleibt bei Seite 5.
2. **Vorschau-Leiste zentriert** die aktuelle Seite: Die Leiste (`ul`) bekommt `relative`, damit `offsetLeft` sich auf sie bezieht.
   Test: Abstand der Mitte des aktuellen Vorschaubilds zur Mitte der Leiste ≤ 2 px (Handy und 1920 px).
3. **Vorschau-Leiste als ein Tab-Stopp:** Nur das Vorschaubild der sichtbaren Seite hat `tabIndex=0`; Pfeiltasten links/rechts
   wechseln das Bild und den Fokus (Home/Ende springen an den Anfang/das Ende), Enter/Leertaste blättern hin. Test: Tab-Stopps in
   `#prospekt` bei geschlossener Übersicht höchstens 8 (Reiter, Teilen, sichtbare Seite, Zurück, Weiter, ein Vorschaubild,
   „Alle Seiten“); Pfeil rechts im Vorschaubild → Fokus und Markierung auf dem nächsten.
4. **Bildgrößen auf dem Desktop:** `sizes` für Hochformat `(min-width: 64rem) min(40vw, calc(78vh * B/H)), 92vw`. Test: bei
   1440 × 900 und Faktor 2 wird für eine 397 px breite Seite höchstens die 828er-Fassung angefordert.
5. **„Weiter“/„Zurück“ am Ende:** `aria-disabled` statt `disabled`, der Klick tut dann nichts; der Fokus bleibt auf dem Knopf.
   Test: am Ende Enter auf „Weiter“ → Fokus bleibt, Seite bleibt.

`components/prospekt/flyer-viewer.tsx`:

6. **„Alle 1 Seiten ansehen“** → „Die Seite ansehen“ bei einer Seite, sonst „Alle n Seiten ansehen“ (`pagesLabel(n)` in
   `lib/prospekt/pager.ts`, Unit-Test).

## 2. Startseite

7. **Video-Fehler** (`components/home/use-hero-clip.ts`, `rundgang-hero.tsx`): Lädt die gewählte Datei nicht (`error`-Ereignis),
   wird die nächste Fassung versucht (AV1 → HEVC → H.264). Ist keine mehr übrig oder spielt der Browser keine ab, bleibt das
   Poster und der Pause-Knopf verschwindet. Ohne JavaScript ist der Knopf ausgeblendet (`js-only`). Test: AV1-Anfragen abgebrochen →
   HEVC oder H.264 läuft; alle `.mp4` abgebrochen → kein Knopf, Poster bleibt; ohne JS kein Knopf.
8. **Einblend-Animation in den Wisch-Reihen** (`app/globals.css`): Unter 768 px bekommen Kacheln in `.snap-row` keine
   Reveal-Animation – sie sind sofort sichtbar, auch die außerhalb des Bildes. Test (ohne reduzierte Bewegung): nach dem Laden sind
   alle Reihen-Kacheln deckend; während 1 s keine senkrechte Vergrößerung der Reihe.

## 3. Fehlerseiten und Robustheit

9. **404-Seite** (`app/not-found.tsx`, `components/layout/site-header.tsx`): `NotFound` wird `async` und nutzt
   `currentFlyerLink()` für Kopfleiste und Knopf. `SiteHeader` bekommt `hero?: boolean`; `NotFound` übergibt `false`, damit die
   Leiste auch unter `/aktuelles/<unbekannt>` weiß ist. Test: `/aktuelles/gibts-nicht` → Leiste ohne `on-dark`, Knopf und Kopf
   führen auf `/angebote#prospekt` (mit Prospekt) bzw. rewe.de (ohne).
10. **`getJson`** (`lib/data/rest.ts`): `res.on("error")` und eine Gesamtfrist (15 s), nach der die Anfrage abgebrochen wird; das
    Modul wählt `http` oder `https` nach der Adresse, damit ein Unit-Test mit einem lokalen `http`-Server läuft: Antwort nach den
    Headern abgebrochen → Fehler; keine Antwort → Fehler nach der Frist.
11. **`images.localPatterns`** (`next.config.ts`): nur `/_next/static/media/**` und `/prospekt-bilder/**`, jeweils ohne Query.
    Test: `/_next/image?url=%2Ffavicon.ico&w=64&q=75` antwortet 400; alle Bild-Tests bleiben grün.

## 4. Handy

12. **Footer bei 320 px** (`components/layout/site-footer.tsx`): Die Listen bekommen `gap-1`; unter 360 px nimmt „Service“ beide
    Spalten, Impressum/Datenschutz folgen darunter. Test bei 320 px: zwischen den Service-Links mindestens 4 px, kein Link breiter
    als seine Spalte.
13. **Beitragsbild Qualität 85** (`app/(site)/aktuelles/[slug]/page.tsx`), wie Spec Stufe 5 §4. Test in `medien.mjs`.
14. **`coverSizes`** (`lib/sizes.ts`) skaliert auch `rem`; andere Einheiten bleiben unverändert (Unit-Test).

## 5. SEO und Kleinigkeiten

15. **Beschreibung des Beitrags** höchstens 160 Zeichen: `metaDescription(text)` in `lib/site.ts` kürzt an einer Satz- oder
    Wortgrenze mit „…“ (Unit-Test); `generateMetadata` des Beitrags nutzt sie.
16. **`rel="noopener"`** am Datenschutz-Link im Bewerbungsformular; `public-qa.mjs` prüft dauerhaft: kein `target="_blank"` ohne
    `noopener`.
17. **Dokumentation:** Spec Stufe 6 „Zurückgestellt“ wird auf das reduziert, was offen bleibt; README nennt die neuen Tests.

## Tests

- Neue Prüfungen in `e2e/prospekt-viewer.mjs` (1–5), `e2e/hero.mjs` (7), `e2e/mobil.mjs` (8, 12), `e2e/public-qa.mjs` (9, 11, 16),
  `e2e/medien.mjs` (13); Unit-Tests für 6, 10, 14, 15.
- Reihenfolge je Punkt: Test schreiben, rot sehen, beheben, grün sehen, Commit.
- Ganze Reihe am Ende: `tsc`, `lint`, Unit, `hero`, `hero-kontrast`, `mobil`, `medien`, `public-qa`, `seitenkopf`,
  `prospekt-viewer`, `start-ticket`, `cockpit-axe`, Lighthouse lokal; Abschluss-Review durch einen frischen Reviewer.

## Nicht in dieser Stufe

- Cockpit-Befunde aus Stufe 4a (Meldung „Gespeichert“ nach Löschung, zweiter Sondertag am selben Tag ohne Rückfrage, „Keine
  Verbindung“ nach einem Update in Prospekt und Feedback, Ansagen für Screenreader) und Stufe 3 (Idempotenz-Schlüssel,
  Obergrenze für Alarm-Mails): brauchen schreibende Tests, also ein eigenes Test-Projekt.
- Datumsabhängige Inhalte nach Mitternacht (bis zu 1 h alt bis zur stündlichen Neuerzeugung): bräuchte eine zeitgesteuerte
  Neuerzeugung (Cron), neue Infrastruktur.
- Kopfleiste kurz weiß auf weiß nach einem Neuladen mit gemerkter Scrollposition: nur bis zur Hydrierung sichtbar.
- Paket-Updates: keine Sicherheitslücken; Next/React-Minor-Updates ohne Anlass.
- Inhalte vom Markt: Impressum, Mail-Konfiguration, neuer Rundgang ohne Saisonware, Gruppenfoto in voller Größe, arabische
  Wörter im Feedback (Muttersprachler).
