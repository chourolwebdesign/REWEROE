import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DraftNotice, Missing } from "@/components/legal/missing";
import { markt } from "@/content/markt";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Impressum",
  description: "Impressum der Website von REWE Rödelheim (REWE Ali Alamyaar oHG).",
  path: "/impressum",
  card: "start",
});

export default function ImpressumPage() {
  return (
    <>
      <PageHeader crumbs={[{ href: "/impressum", label: "Impressum" }]} title="Impressum." />
      <div className="wrap pb-24 md:pb-32">
        <DraftNotice />
        <div className="prose-article mx-auto max-w-[68ch]">
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            {markt.legalName}
            <br />
            {markt.address.street}
            <br />
            {markt.address.zip} {markt.address.city}
          </p>
          <p>
            Vertreten durch die persönlich haftenden Gesellschafter: <Missing>Namen der Gesellschafter</Missing>
          </p>

          <h2>Kontakt</h2>
          <p>
            Telefon: <a href={`tel:${markt.phone.e164}`}>{markt.phone.display}</a>
            <br />
            E-Mail: {markt.email ? <a href={`mailto:${markt.email}`}>{markt.email}</a> : <Missing>E-Mail-Adresse</Missing>}
          </p>

          <h2>Registereintrag</h2>
          <p>
            Eintragung im Handelsregister
            <br />
            Registergericht: <Missing>Amtsgericht</Missing>
            <br />
            Registernummer: <Missing>HRA-Nummer</Missing>
          </p>

          <h2>Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <Missing>USt-IdNr.</Missing>
          </p>

          <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>
            <Missing>Name</Missing>
            <br />
            {markt.address.street}, {markt.address.zip} {markt.address.city}
          </p>

          <h2>Verbraucherstreitbeilegung</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>Marken</h2>
          <p>
            REWE, REWE Regional, REWE Bio und das Zeichen „Aus deiner Region“ sind Marken der REWE-Gruppe. Dieser Markt wird von der{" "}
            {markt.legalName} selbstständig betrieben.
          </p>

          <h2>Bildnachweise</h2>
          <ul>
            <li>Fotos und Clip aus dem Markt: REWE Ali Alamyaar (Instagram @{markt.instagramHandle})</li>
            <li>Gruppenfoto Resilienzwoche 2026: © Jörg Halisch</li>
            <li>Bilder zu REWE Regional, REWE Bio und „Aus deiner Region“: REWE</li>
            <li>Kartengrundlage: © OpenStreetMap-Mitwirkende (ODbL)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
