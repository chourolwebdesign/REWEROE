# Betreiber-Checkliste – was der Markt noch liefern oder bestätigen muss

Stand: 04.10.2026. Alles hier fehlt auf der Website oder ist als Lücke markiert – es wurde bewusst nichts erfunden.

## Vor dem Livegang (Pflicht)

- [ ] **Impressum** (`app/impressum/page.tsx`): Namen der persönlich haftenden Gesellschafter, Registergericht + HRA-Nummer, USt-IdNr., verantwortliche Person nach § 18 Abs. 2 MStV.
- [ ] **E-Mail-Adresse** (Pflicht im Impressum) → `content/markt.ts → email`. Erscheint dann automatisch in Impressum, Datenschutz und JSON-LD.
- [ ] **Verbraucherstreitbeilegung**: Ist der Markt zur Teilnahme bereit/verpflichtet? Text im Impressum ggf. anpassen.
- [ ] **Datenschutzerklärung** prüfen lassen (`app/datenschutz/page.tsx`): Hosting-Vertrag/AVV mit Vercel (läuft über das Konto der Agentur), Aufbewahrungsdauer der Server-Logs.
- [ ] **Domain** festlegen (z. B. rewe-roedelheim.de) → in Vercel verbinden, `SITE_URL` setzen, dann `SITE_INDEXABLE=true`.

## Online-Bewerbung freischalten

- [ ] **E-Mail-Adresse für Bewerbungen** (z. B. bewerbung@… oder das Postfach der Marktleitung) → `BEWERBUNG_TO`.
- [ ] **Versandweg**: SMTP-Zugang des Markt-Postfachs (Server, Port, Benutzer, Passwort) **oder** Resend-Konto mit verifizierter Domain → Vercel-Umgebungsvariablen, dann neu deployen.
- [ ] Eingangsbestätigung an Bewerber gewünscht? (`BEWERBUNG_CONFIRM=true`)
- [ ] **Datenschutz**: Name des E-Mail-Dienstleisters eintragen (`app/datenschutz/page.tsx`, Abschnitt „Bewerbung“), AVV abschließen.
- [ ] Wer liest die Bewerbungen und löscht sie nach 6 Monaten (Talentpool: 12 Monate)?

## Bildrechte

- [ ] **Instagram-Fotos und Clip** (@rewealialamyaar): Freigabe des Markts für die Website (Fotograf/Urheber klären).
- [ ] **Resilienzwoche 2026**: Auf Gruppen- und Rundgangsfotos sind Minister, Gäste und Feuerwehrleute zu sehen. Personenfotos stehen nur im Beitrag unter Aktuelles. Freigabe/Bildnachweis bestätigen (Gruppenfoto laut Pressemitteilung: © Jörg Halisch).
- [ ] **REWE-Bilder** (REWE Regional, REWE Bio, „Aus deiner Region“, Landwirt-/Lieferfotos): Nutzung über das REWE-Partnerportal bestätigen bzw. offizielle Dateien von dort verwenden.
- [ ] **Offizielles REWE-Logo** als Datei (aktuell als SVG nachgebaut).

## Inhalte, die die Website besser machen

- [ ] **Weitere Clips und Fotos** aus dem Markt (Bäckerei, Sushi, Obst & Gemüse, Team) – am besten hochkant für die Story, quer für die Galerie.
- [ ] **Weitere Services** bestätigen: Pfandautomat, Parkplätze, barrierefreier Zugang, Bezahlarten, REWE Bonus, Abhol-/Lieferservice. Auf rewe.de sind nur „Bäckerei“ und „Sushi“ gelistet – mehr steht deshalb nicht auf der Seite.
- [ ] **Sortimentsgröße** (z. B. „rund 8.000 Artikel“) – nur mit Bestätigung.
- [ ] **Sonderöffnungszeiten** für Heiligabend, Silvester und Gründonnerstag (aktuell: gesetzliche Grenze nach § 3 HLöG, als „vorläufig“ markiert).
- [ ] **Offene Stellen** des Markts → `content/jobs.ts` (erzeugt automatisch Google-Jobdaten).
- [ ] **Team**: Namen/Fotos, falls gewünscht (Freigaben der Personen nötig).
- [ ] **Google-Unternehmensprofil**-Link (Bewertungen) und Feedback-Seite (Projekt rewe-feedback), sobald live.
- [ ] Neue **Aktuelles-Beiträge** (Aktionen, Feste, Spenden) mit Datum und Fotos.
- [ ] **Termine im Markt** (Verkostung, Aktionstag, Kinderaktion) → `content/termine.ts`; erscheinen auf der Startseite und im Markt-Kalender.
- [ ] **Aushang** (`/aushang`) ausdrucken und im Markt aufhängen – nach dem Domainwechsel neu drucken.

## Ideen für später (nur mit echten Zahlen)

- [ ] **„Wann ist es ruhig?“**: durchschnittliche Kassenbons pro Stunde und Wochentag aus dem Kassenbericht → Grafik der ruhigen Zeiten.
- [ ] **Pfand-Zähler**: Monatsauswertung des Pfandautomaten → „Diesen Monat haben unsere Kunden … Flaschen zurückgebracht“.
- [ ] **Einkaufs-Entdecker für Kinder**: kleines Suchspiel im Markt; eine Belohnung an der Kasse entscheidet die Marktleitung.
