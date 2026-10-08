# Betreiber-Checkliste – was der Markt noch liefern oder bestätigen muss

Stand: 04.10.2026. Alles hier fehlt auf der Website oder ist als Lücke markiert – es wurde bewusst nichts erfunden.

## Vor dem Livegang (Pflicht)

- [ ] **Impressum** (`app/(site)/impressum/page.tsx`): Namen der persönlich haftenden Gesellschafter, Registergericht + HRA-Nummer, USt-IdNr., verantwortliche Person nach § 18 Abs. 2 MStV.
- [ ] **E-Mail-Adresse** (Pflicht im Impressum) → `content/markt.ts → email`. Erscheint dann automatisch in Impressum, Datenschutz und JSON-LD.
- [ ] **Verbraucherstreitbeilegung**: Ist der Markt zur Teilnahme bereit/verpflichtet? Text im Impressum ggf. anpassen.
- [ ] **Datenschutzerklärung** prüfen lassen (`app/(site)/datenschutz/page.tsx`): Hosting-Vertrag/AVV mit Vercel (läuft über das Konto der Agentur), Aufbewahrungsdauer der Server-Logs.
- [ ] **Domain** festlegen (z. B. rewe-roedelheim.de) → in Vercel verbinden, `SITE_URL` setzen, dann `SITE_INDEXABLE=true`.

## Online-Bewerbung freischalten

- [ ] **E-Mail-Adresse für Bewerbungen** (z. B. bewerbung@… oder das Postfach der Marktleitung) → `BEWERBUNG_TO`.
- [ ] **Versandweg**: SMTP-Zugang des Markt-Postfachs (Server, Port, Benutzer, Passwort) **oder** Resend-Konto mit verifizierter Domain → Vercel-Umgebungsvariablen, dann neu deployen.
- [ ] Eingangsbestätigung an Bewerber gewünscht? (`BEWERBUNG_CONFIRM=true`)
- [ ] **Datenschutz**: Name des E-Mail-Dienstleisters eintragen (`app/(site)/datenschutz/page.tsx`, Abschnitt „Bewerbung“), AVV abschließen.
- [ ] Wer liest die Bewerbungen und löscht sie nach 6 Monaten (Talentpool: 12 Monate)?

## Markt-Cockpit, Prospekt, Feedback und Inhalte

- [ ] **Prospekt-PDF**: Bekommt der Markt den Wochenprospekt als PDF (z. B. „KW41_2026_final_proof.pdf“ aus dem REWE-Werbemittelportal)? Freigabe, ihn auf der eigenen Website zu zeigen?
- [ ] **Cockpit-Konten**: E-Mail-Adressen von Ali Alamyaar und der Marktleitung.
- [ ] **Passwort vergessen**: Mail-Versand in Supabase einrichten (gleicher Weg wie für Bewerbungen).
- [ ] **Probe am Markt**: einmal einen echten Prospekt am Markt-iPhone (iOS 17.4 oder neuer) und am Büro-PC hochladen.
- [ ] **Supabase-Sicherheit**: „Leaked password protection“ einschalten (Authentication → Passwords, ab Pro-Tarif).
- [ ] **Google-Bewertungslink**: im Google-Unternehmensprofil „Nach Bewertungen fragen“ → `g.page/r/…/review` (bis dahin öffnet der Knopf das Profil).
- [ ] **Feedback-Alarm**: E-Mail-Adresse(n) der Marktleitung für 1–2 Sterne (`FEEDBACK_ALARM_AN`), Mail-Versand einrichten.
- [ ] **Vercel**: `FEEDBACK_KEY` für Preview und Production eintragen (Wert aus `.env.local`), sonst meldet `/feedback` „Senden hat nicht geklappt“.
- [ ] **Plakat**: `/aushang` Seite 2 in A4 oder A3 drucken; an Kasse und Ausgang auf Augenhöhe aufhängen.
- [ ] **REWE-Umfrage**: Gilt der Umfrage-Link (mit `FingerprintHash`) für alle Kunden des Markts – oder nur für einen Kassenbon? Und ist es mit REWE abgestimmt, dass zufriedene Kunden (4–5 Sterne) dorthin geleitet werden? Bis zur Klärung steht der Link der Agentur in `content/markt.ts`.

## Bildrechte

- [ ] **Instagram-Fotos und Clip** (@rewealialamyaar): Freigabe des Markts für die Website (Fotograf/Urheber klären).
- [ ] **Resilienzwoche 2026**: Auf Gruppen- und Rundgangsfotos sind Minister, Gäste und Feuerwehrleute zu sehen. Personenfotos stehen nur im Beitrag unter Aktuelles. Freigabe/Bildnachweis bestätigen (Gruppenfoto laut Pressemitteilung: © Jörg Halisch).
- [ ] **Gruppenfoto in voller Größe**: Das Gruppenfoto der Resilienzwoche (© Jörg Halisch) liegt nur mit 709 × 465 px vor – auf Handys wird es vergrößert und wirkt unscharf. Eine größere Fassung beim Fotografen oder der Pressestelle erfragen.
- [ ] **REWE-Bilder** (REWE Regional, REWE Bio, „Aus deiner Region“, Landwirt-/Lieferfotos): Nutzung über das REWE-Partnerportal bestätigen bzw. offizielle Dateien von dort verwenden.
- [ ] **Offizielles REWE-Logo** als Datei (aktuell als SVG nachgebaut).
- [ ] **Originaldateien**: Video und Fotos in Originalqualität – direkt vom Handy oder der Kamera, nicht aus Instagram (z. B. per AirDrop, USB-Stick oder Cloud-Link). Der Rundgang läuft jetzt in 1080 × 1920 aus einer KI-Hochrechnung unseres Instagram-Downloads (720 × 1280): in Webgröße schärfer, aber kein Original – bei voller Größe wirken Flächen gemalt, und Schrift auf Schildern ist verschmiert. Mit dem Original vom Handy wird er neu kodiert.
- [ ] **Neuer Rundgang ohne Saisonware**: Der Clip ist jetzt das Hauptmotiv der Startseite und zeigt Weihnachtssterne, Schoko-Nikoläuse und das Schild „Festlich sparen“ – ab Januar wirkt er alt. Neu drehen: Handy, 4K, hochkant, ruhig gehen, 15–20 Sekunden; das Original per AirDrop oder Drive schicken, nicht über WhatsApp oder Instagram (beide komprimieren neu).

## Inhalte, die die Website besser machen

- [ ] **Weitere Clips und Fotos** aus dem Markt (Bäckerei, Sushi, Obst & Gemüse, Team) – am besten hochkant für die Story, quer für die Galerie.
- [ ] **Weitere Services** bestätigen: Pfandautomat, Parkplätze, barrierefreier Zugang, Bezahlarten, REWE Bonus, Abhol-/Lieferservice. Auf rewe.de sind nur „Bäckerei“ und „Sushi“ gelistet – mehr steht deshalb nicht auf der Seite.
- [ ] **Sortimentsgröße** (z. B. „rund 8.000 Artikel“) – nur mit Bestätigung.
- [ ] **Sonderöffnungszeiten** für Heiligabend, Silvester und Gründonnerstag im Cockpit unter Inhalte → Sondertage festlegen (bis dahin: gesetzliche Grenze nach § 3 HLöG, als „vorläufig“ markiert; die Cockpit-Übersicht erinnert 45 Tage vorher).
- [ ] **Offene Stellen** des Markts im Cockpit unter Inhalte → Stellen (erzeugt automatisch Google-Jobdaten) – nur echte, freigegebene Stellen.
- [ ] **Team**: Namen/Fotos, falls gewünscht (Freigaben der Personen nötig).
- [ ] **Feedback**: die QR-App ist jetzt Teil der Website (`/feedback`); ältere Plakate mit einer anderen Adresse (Projekt rewe-feedback) durch das neue Plakat ersetzen.
- [ ] Neue **Aktuelles-Beiträge** (Aktionen, Feste, Spenden) mit Datum und Fotos.
- [ ] **Termine im Markt** (Verkostung, Aktionstag, Kinderaktion) im Cockpit unter Inhalte → Termine; erscheinen auf der Startseite und im Markt-Kalender.
- [ ] **Aushang** (`/aushang`) ausdrucken und im Markt aufhängen – nach dem Domainwechsel neu drucken.

## Ideen für später (nur mit echten Zahlen)

- [ ] **„Wann ist es ruhig?“**: durchschnittliche Kassenbons pro Stunde und Wochentag aus dem Kassenbericht → Grafik der ruhigen Zeiten.
- [ ] **Pfand-Zähler**: Monatsauswertung des Pfandautomaten → „Diesen Monat haben unsere Kunden … Flaschen zurückgebracht“.
- [ ] **Einkaufs-Entdecker für Kinder**: kleines Suchspiel im Markt; eine Belohnung an der Kasse entscheidet die Marktleitung.
