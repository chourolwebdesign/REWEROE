import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DraftNotice, Missing } from "@/components/legal/missing";
import { markt } from "@/content/markt";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Website von REWE Rödelheim: keine Cookies, kein Tracking.",
  alternates: { canonical: "/datenschutz" },
};

/**
 * Beschreibt genau diese Website: Hosting bei Vercel, keine Cookies, kein Tracking, Schriften lokal,
 * Karte als statisches Bild, Drittanbieter nur über Links. Ändert sich das (z. B. Kontaktformular,
 * eingebettete Karte), muss dieser Text angepasst werden.
 */
export default function DatenschutzPage() {
  return (
    <>
      <PageHeader crumbs={[{ href: "/datenschutz", label: "Datenschutz" }]} title="Datenschutz." lede="Kurz gesagt: Diese Website setzt keine Cookies, nutzt kein Tracking und lädt keine Inhalte von Drittanbietern." />
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
            Wir setzen keine Cookies und verwenden keine Analyse-, Werbe- oder Tracking-Dienste. Deshalb gibt es auch keinen Cookie-Hinweis.
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
