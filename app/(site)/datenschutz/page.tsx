import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DraftNotice, Missing } from "@/components/legal/missing";
import { markt } from "@/content/markt";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Datenschutz",
  description: "Datenschutzerklärung der Website von REWE Rödelheim: keine Cookies, kein Tracking.",
  path: "/datenschutz",
  card: "start",
});

/**
 * Beschreibt genau diese Website: Hosting bei Vercel, keine Cookies für Besucher (nur Sitzungs-Cookies im Markt-Cockpit),
 * kein Tracking, Schriften lokal,
 * Karte als statisches Bild, Drittanbieter nur über Links. Ändert sich das (z. B. Kontaktformular,
 * eingebettete Karte), muss dieser Text angepasst werden.
 */
export default function DatenschutzPage() {
  return (
    <>
      <PageHeader crumbs={[{ href: "/datenschutz", label: "Datenschutz" }]} title="Datenschutz." lede="Kurz gesagt: Beim Besuch dieser Website werden keine Cookies gesetzt, es gibt kein Tracking und keine Inhalte von Drittanbietern." />
      <div className="wrap pb-24 md:pb-32">
        <DraftNotice />
        <div className="prose-article mx-auto max-w-[68ch]">
          <h2>Verantwortlicher</h2>
          <p>
            {markt.legalName}
            <br />
            {markt.address.street}, {markt.address.zip} {markt.address.city}
            <br />
            Telefon: <a href={`tel:${markt.phone.e164}`}>{markt.phone.display}</a>
            <br />
            E-Mail: {markt.email ? <a href={`mailto:${markt.email}`}>{markt.email}</a> : <Missing>E-Mail-Adresse</Missing>}
          </p>

          <h2>Aufruf der Website und Hosting</h2>
          <p>
            Die Website wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf verarbeitet der
            Server technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Referrer sowie
            Browser und Betriebssystem. Das ist nötig, um die Website auszuliefern und vor Missbrauch zu schützen (Art. 6 Abs. 1 lit. f
            DSGVO). Die Protokolle werden nach kurzer Zeit automatisch gelöscht.
          </p>
          <p>
            Vercel ist nach dem EU-US Data Privacy Framework zertifiziert; die Übermittlung in die USA stützt sich auf den
            Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung.
          </p>

          <h2>Keine Cookies, kein Tracking</h2>
          <p>
            Beim Besuch dieser Website setzen wir keine Cookies und verwenden keine Analyse-, Werbe- oder Tracking-Dienste. Deshalb gibt es
            auch keinen Cookie-Hinweis. Nur das Markt-Cockpit für Mitarbeitende setzt nach der Anmeldung Sitzungs-Cookies (siehe unten).
          </p>

          <h2>Schriften, Bilder und Karte</h2>
          <p>
            Schriften, Fotos, Videos und die Karte liegen auf unserem eigenen Server. Beim Laden der Seite werden keine Daten an Google,
            Kartendienste oder soziale Netzwerke übertragen. Die Karte ist ein statisches Bild auf Grundlage von OpenStreetMap.
          </p>

          <h2>Links zu anderen Anbietern</h2>
          <p>
            Wir verlinken auf den Prospekt bei rewe.de (REWE Markt GmbH), auf Instagram (Meta Platforms Ireland Ltd.), auf Google Maps (Google
            Ireland Ltd.), Apple Karten (Apple Inc.) und die REWE-Stellensuche. Erst wenn du einen dieser Links anklickst, verlässt du
            unsere Website; dort gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
          </p>

          <h2 id="bewerbung">Bewerbung über unser Online-Formular</h2>
          <p>
            Wenn du dich über das Formular bewirbst, verarbeiten wir deine Angaben (Name, Telefon und/oder E-Mail, gewünschter Bereich, Beschäftigungsart,
            Startdatum, Verfügbarkeit, deine Nachricht) und – falls du sie hochlädst – deine Unterlagen. Zweck ist allein die Durchführung des
            Bewerbungsverfahrens (Art. 6 Abs. 1 lit. b DSGVO, Anbahnung eines Beschäftigungsverhältnisses).
          </p>
          <p>
            Die Daten werden verschlüsselt an unseren Server übertragen und von dort per E-Mail an das Postfach des Markts weitergeleitet; dafür nutzen wir
            einen E-Mail-Dienstleister als Auftragsverarbeiter: <Missing>Name des E-Mail-Dienstleisters</Missing>. Auf der Website selbst werden
            Bewerbungen nicht gespeichert.
          </p>
          <p>
            Wir löschen deine Unterlagen spätestens sechs Monate nach Abschluss des Verfahrens, sofern wir dich nicht einstellen. Wenn du dem Talentpool
            zustimmst, bewahren wir deine Bewerbung bis zu zwölf Monate auf (Art. 6 Abs. 1 lit. a DSGVO); diese Einwilligung kannst du jederzeit
            widerrufen, zum Beispiel telefonisch. Es findet keine automatisierte Entscheidung statt.
          </p>

          <h2>Speicherung in deinem Browser</h2>
          <p>
            Damit nichts verloren geht, speichert dein Browser einen angefangenen Bewerbungsentwurf lokal auf deinem Gerät (localStorage). Diese Daten werden nicht an uns übertragen und nach dem Absenden der Bewerbung gelöscht; du kannst sie
            auch jederzeit über die Einstellungen deines Browsers entfernen. Das ist für die von dir gewünschte Funktion unbedingt erforderlich (§ 25
            Abs. 2 Nr. 2 TDDDG).
          </p>

          <h2>Offline-Funktion und App</h2>
          <p>
            Ein sogenannter Service Worker legt Seiten, Bilder und Programmdateien dieser Website im Speicher deines Browsers ab, damit Öffnungszeiten und
            Adresse auch ohne Internet erreichbar sind und die Seite schneller lädt. Dabei werden keine personenbezogenen Daten gespeichert (§ 25 Abs. 2
            Nr. 2 TDDDG). Du kannst den Speicher in den Browser-Einstellungen löschen.
          </p>

          <h2>Markt-Kalender</h2>
          <p>
            Wenn du den Markt-Kalender abonnierst, ruft deine Kalender-App die Datei regelmäßig von unserem Server ab. Dabei fallen nur die unter „Aufruf
            der Website und Hosting“ beschriebenen Server-Protokolle an. Die Links zu Google Kalender und Outlook öffnen den jeweiligen Anbieter erst nach
            deinem Klick.
          </p>

          <h2>Teilen</h2>
          <p>
            Über „Teilen“ nutzt du das Teilen-Menü deines Geräts oder öffnest WhatsApp (WhatsApp Ireland Ltd.). Daten werden erst übertragen, wenn du
            selbst teilst.
          </p>

          <h2>Markt-Cockpit</h2>
          <p>
            Mitarbeitende des Markts melden sich mit E-Mail-Adresse und Passwort an, um den Prospekt und Inhalte zu pflegen. Die Anmeldedaten,
            Prospektseiten und Inhalte speichert die Supabase Inc. als Auftragsverarbeiter auf Servern in Frankfurt am Main (Art. 28 DSGVO).
            Prospektseiten werden über diese Website ausgeliefert – dein Browser verbindet sich dabei nicht mit Supabase. Für die Anmeldung
            speichert der Browser technisch notwendige Sitzungs-Cookies (§ 25 Abs. 2 Nr. 2 TDDDG); sie bleiben bis zur Abmeldung bestehen.
          </p>

          <h2 id="feedback">Feedback im Markt</h2>
          <p>
            Über den QR-Code im Markt oder den Link „Feedback zum Einkauf“ kannst du uns eine Rückmeldung geben. Wir speichern die
            Bewertung (1–5), die gewählten Bereiche, deinen freiwilligen Kommentar, die Sprache und den Zeitpunkt. Bei 1–3 Sternen kannst du
            freiwillig eine E-Mail-Adresse oder Telefonnummer angeben, damit sich die Marktleitung bei dir meldet. Dabei setzen wir keine
            Cookies und speichern keine IP-Adresse; zum Schutz vor Missbrauch zählt der Server nur kurz im Arbeitsspeicher mit, wie viele
            Rückmeldungen von einem Anschluss kommen.
          </p>
          <p>
            Zweck ist, unseren Markt besser zu machen (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO); Kontaktangaben nutzen wir nur für
            die Antwort (Art. 6 Abs. 1 lit. a DSGVO, Einwilligung durch die Angabe). Kontaktangaben löschen wir nach 90 Tagen, alles andere
            nach 12 Monaten. Gespeichert wird bei der Supabase Inc. in Frankfurt am Main (Auftragsverarbeitung, Art. 28 DSGVO); lesen können
            nur die Marktleitung und von ihr berechtigte Mitarbeitende. Bei 1–2 Sternen bekommt die Marktleitung eine kurze E-Mail mit
            Bewertung und Bereichen – ohne Kommentar und Kontaktangaben, die stehen nur im Markt-Cockpit. Deine Einwilligung zum Rückruf
            kannst du jederzeit widerrufen, zum Beispiel im Markt oder telefonisch; dann löschen wir deine Kontaktangaben sofort.
          </p>
          <p>
            „Auf Google bewerten“ ist ein Link zu Google; erst mit dem Antippen verlässt du unsere Seite. Ob du ihn antippst, vermerken wir
            bei deiner Rückmeldung.
          </p>

          <h2>Kontakt per Telefon</h2>
          <p>
            Wenn du uns anrufst, verarbeiten wir deine Angaben nur, um dein Anliegen zu bearbeiten (Art. 6 Abs. 1 lit. b bzw. f DSGVO).
          </p>

          <h2>Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung, auf Datenübertragbarkeit sowie das
            Recht, der Verarbeitung zu widersprechen (Art. 15–21 DSGVO). Wende dich dafür an den oben genannten Verantwortlichen.
          </p>
          <p>
            Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Hessischen Beauftragten für
            Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden.
          </p>

          <p className="text-[0.9375rem] text-muted">Stand: Oktober 2026</p>
        </div>
      </div>
    </>
  );
}
