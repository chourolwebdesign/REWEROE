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
2. **Vorschau-Leiste zentriert** die aktuelle Seite bzw. die Doppelseite als Paar: Die Leiste (`ul`) bekommt `relative`, damit
   `offsetLeft` sich auf sie bezieht; gescrollt wird auf die Mitte zwischen erstem und letztem sichtbaren Bild. Test: Abstand ≤ 2 px
   auf dem Handy (Seite 5) und auf dem Desktop (Paar 10–11).
3. **Vorschau-Leiste als ein Tab-Stopp:** Das Vorschaubild der sichtbaren Seite hat `tabIndex=0` – liegt der Fokus in der Leiste,
   bleibt das fokussierte Bild der Tab-Stopp, auch wenn die Seiten weiterlaufen. Pfeiltasten links/rechts wechseln Bild und Fokus
   (Home/Ende springen an den Anfang/das Ende), Enter/Leertaste blättern hin; Tastenkombinationen mit Alt/Cmd/Strg bleiben dem
   Browser. Test: Tab-Stopps in `#prospekt` bei geschlossener Übersicht höchstens 8; Pfeil rechts → Fokus und Markierung auf dem
   nächsten Bild; nach zwei Pfeiltasten ab Bild 1 ist Bild 3 der Tab-Stopp (nicht Bild 2 der Doppelseite).
4. **Bildgrößen auf dem Desktop:** `sizes` für Hochformat `(min-width: 64rem) min(50vw, calc(min(78vh, 56rem) * B/H)), 92vw`;
   das Bild wird in der Höhe begrenzt statt fest gesetzt (`max-h`), damit es in schmalen Spalten (Tablet quer) nicht gestaucht wird.
   Test: bei 1440 × 900 und Faktor 2 wird für die Titelseite höchstens die nächstgrößere Fassung über der benötigten Breite geladen.
5. **„Weiter“/„Zurück“ am Ende:** `aria-disabled` statt `disabled`, der Klick tut dann nichts; der Fokus bleibt auf dem Knopf.
   Test: am Ende Enter auf „Weiter“ → Fokus bleibt, Seite bleibt.

`components/prospekt/flyer-viewer.tsx`:

6. **„Alle 1 Seiten ansehen“** → „Die Seite ansehen“ bei einer Seite, sonst „Alle n Seiten ansehen“ (`pagesLabel(n)` in
   `lib/prospekt/pager.ts`, Unit-Test).

## 2. Startseite

7. **Video-Fehler** (`components/home/use-hero-clip.ts`, `rundgang-hero.tsx`): Lädt die gewählte Datei nicht (`error`-Ereignis),
   wird die nächste Fassung versucht (AV1 → HEVC → H.264; verglichen über den gesetzten relativen Pfad). Ist keine mehr übrig oder
   spielt der Browser von vornherein keine ab, bleibt das Poster und der Pause-Knopf fehlt. Verschwindet der Knopf unter dem Fokus,
   wandert der Fokus auf den Hero statt auf `<body>`. Ohne JavaScript ist der Knopf ausgeblendet (`js-only`); damit das auch nach
   einer Client-Navigation von einer Seite ohne Server-HTML gilt, setzt `components/motion/js-class.tsx` die Klasse `js` zusätzlich
   nach der Hydrierung (sie trägt auch Einblendungen, Schnellzugriff-Leiste und Bewerbungsformular). Tests: AV1-Anfragen abgebrochen →
   HEVC oder H.264 läuft; alle `.mp4` abgebrochen → kein Knopf, Poster bleibt; `canPlayType` leer → kein Knopf; Knopf verschwindet
   unter dem Fokus → Fokus im Hero; ohne JS kein Knopf; von `/aktuelles/<unbekannt>` zur Startseite navigiert → Knopf sichtbar.
8. **Einblend-Animation in den Wisch-Reihen** (`app/globals.css`): Unter 768 px bekommen Kacheln in `.snap-row` keine
   Reveal-Animation – sie sind sofort sichtbar, auch die außerhalb des Bildes. Test (ohne reduzierte Bewegung): nach dem Laden sind
   alle Reihen-Kacheln deckend; während 1 s keine senkrechte Vergrößerung der Reihe.

## 3. Fehlerseiten und Robustheit

9. **404-Seiten** (`app/not-found.tsx`, neu `app/(site)/not-found.tsx`, `components/layout/not-found-content.tsx`,
   `components/layout/site-header.tsx`): Ein unbekannter Beitrag (`notFound()` in `/aktuelles/[slug]`) rendert die 404 innerhalb
   des Seiten-Layouts – mit der alten Root-404 standen dort Kopf, Footer und `main` doppelt. Jetzt gibt es eine 404 im Layout
   (nur Inhalt) und die Root-404 für Adressen ohne Route (mit Kopf, Footer und Schnellzugriff-Leiste). Beide zeigen denselben
   Inhalt mit rotem Kopf wie die Unterseiten; die Leiste darüber ist transparent und nie weiß auf weiß. Die Root-404 übergibt
   `SiteHeader` dafür `hero`. Prospekt-Knöpfe führen auf die eigene Prospektseite `/angebote#prospekt` (die ohne Prospekt selbst zu
   rewe.de verweist), weil die 404 beim Build erzeugt wird und ein eingefrorener Link später falsch wäre. Test (`public-qa.mjs`,
   beide Adressen): genau ein Kopf, ein Footer, ein `main`; roter Kopf vorhanden; die Leiste war zu keinem Zeitpunkt transparent
   ohne roten Kopf; Prospekt-Knöpfe auf `/angebote#prospekt`.
10. **`getJson`** (`lib/data/rest.ts`): `res.on("error")` und eine Gesamtfrist (15 s), nach der die Anfrage abgebrochen wird; das
    Modul wählt `http` oder `https` nach der Adresse, damit ein Unit-Test mit einem lokalen `http`-Server läuft: Antwort nach den
    Headern abgebrochen → Fehler; keine Antwort → Fehler nach der Frist.
11. **`images.localPatterns`** (`next.config.ts`): nur `/_next/static/media/**` und `/prospekt-bilder/**`, jeweils ohne Query.
    Test: `/_next/image?url=%2Ffavicon.ico&w=64&q=75` antwortet 400; alle Bild-Tests bleiben grün.

## 4. Handy

12. **Footer auf schmalen Handys** (`components/layout/site-footer.tsx`): Die Listen bekommen `gap-1`; bis 376 px (Android-Breiten
    360–375 eingeschlossen) nimmt „Service“ beide Spalten, Impressum/Datenschutz folgen darunter. Test bei 320 px: zwischen den
    Service-Links mindestens 4 px, kein Link breiter als seine Spalte; bei 360 px alle Service-Links einzeilig.
13. **Beitragsbild Qualität 85** (`app/(site)/aktuelles/[slug]/page.tsx`), wie Spec Stufe 5 §4. Test in `medien.mjs`.
14. **`coverSizes`** (`lib/sizes.ts`) skaliert auch `rem`; andere Einheiten bleiben unverändert (Unit-Test).

## 5. SEO und Kleinigkeiten

15. **Beschreibung des Beitrags** höchstens 160 Zeichen: `metaDescription(text)` in `lib/site.ts` kürzt an der letzten Satzgrenze,
    die hineinpasst – ein Punkt zählt nur nach einem Wort mit mindestens drei Buchstaben und vor einem Großbuchstaben, damit „26.“
    oder „z. B.“ keine Satzenden sind – sonst an einer Wortgrenze mit „…“ (Unit-Tests); `generateMetadata` des Beitrags nutzt sie.
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

## Ergebnis (2026-10-09)

Alle 17 Punkte sind umgesetzt, jeder mit einem Test, der vorher rot war (Browser-Tests lesend, Unit-Tests mit lokalem http-Server
für `getJson`). Reihe am Ende: `tsc`, `lint`, Unit 156/156, `public-qa` 95, `hero` 25, `mobil` 29, `prospekt-viewer` 47,
`hero-kontrast` 5, `medien` 12, `seitenkopf` 36, `start-ticket` 9, `cockpit-axe` 16 – alle grün.

Lighthouse 13.5 mobil, Median aus 3 Läufen, lokaler Produktions-Build (vorher = Ergebnis Stufe 6): `/` 93 → 93, `/angebote`
91 → 90, `/markt` 91 → 91, `/kontakt` 95 → 95, `/karriere` 95 → 95, `/aktuelles` 97 → 96, Beitrag 93 → 93; CLS überall 0.
Unterschiede von einem Punkt liegen innerhalb der Streuung zwischen Läufen. Nach dem Merge auf Vercel nachmessen.

Abschluss-Review (frischer Reviewer): zwei wichtige Befunde, beide behoben, jeder mit einem Test, der vorher rot war:
- Die 404 für unbekannte Beiträge rendert Next innerhalb des Seiten-Layouts – mit der Root-404 standen Kopf, Footer und `main`
  doppelt, und die Leiste des Layouts war kurz transparent über Weiß. Meine Prüfung dafür war wirkungslos (der Beobachter wurde
  auf `document.documentElement` gesetzt, das in `evaluateOnNewDocument` noch nicht existiert). Jetzt: eigene 404 im Layout,
  gemeinsamer Inhalt mit rotem Kopf, Beobachter auf `document`, Zählung von Kopf, Footer und `main`.
- Der Pause-Knopf mit `js-only` verschwand nach einer Client-Navigation von genau dieser 404 (ohne Server-HTML läuft das
  Inline-Skript für `html.js` nicht), während das Video weiterlief. Jetzt setzt `JsClass` die Klasse zusätzlich nach der Hydrierung.

Kleinere Befunde, ebenfalls behoben: Satzgrenzen bei „26.“ und „z. B.“; kein Knopf, wenn der Browser kein Format abspielt; Fokus
bleibt im Hero, wenn der Knopf verschwindet; der Tab-Stopp der Vorschau-Leiste folgt dem fokussierten Bild; Tastenkombinationen
mit Alt/Cmd/Strg bleiben dem Browser; die Leiste zentriert Doppelseiten als Paar; `sizes` mit Höhenlimit 56rem und Bild ohne
Stauchung in schmalen Spalten; Footer-Ausnahme bis 376 px; `getJson` behält die Fehlerursache (`cause`); die beiden fehlenden
Spec-Prüfungen in `mobil.mjs`.

Zurückgestellt (vom Reviewer gesehen, nicht geändert):
- Unbekannte Beiträge liefern kein Server-HTML (Next rendert die 404 dieser ISR-Route im Browser; ohne JavaScript bleibt die Seite
  leer). Bestand vorher; eigenes Thema.
- Drehen über 768 px spielt die Einblendung schon sichtbarer Karten noch einmal; Drehen während eines weichen „Weiter“ bricht den
  Schritt ab. Kosmetik.
- Die Wochen-Reiter sind kein ARIA-Tabs-Muster. Bestand vorher.
- Nach einem vorübergehenden Netzfehler bleibt das Poster stehen (kein erneuter Versuch) – so in Punkt 7 entschieden.

