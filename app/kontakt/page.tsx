import type { Metadata } from "next";
import { MapPin, Phone, Tag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { VisitSection } from "@/components/visit/visit-section";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt & Anfahrt",
  description: "REWE Rödelheim, Thudichumstraße 18–22, 60489 Frankfurt am Main. Telefon 069 945158650. Montag bis Samstag 7 bis 22 Uhr.",
  path: "/kontakt",
  card: "kontakt",
});

export default function KontaktPage() {
  const cards = [
    {
      icon: Phone,
      title: "Anrufen",
      text: "Fragen zu Produkten oder Angeboten? Ruf uns während der Öffnungszeiten an.",
      action: <ButtonLink href={`tel:${markt.phone.e164}`}>{markt.phone.display}</ButtonLink>,
    },
    {
      icon: MapPin,
      title: "Vorbeikommen",
      text: `${markt.address.street}, ${markt.address.zip} ${markt.address.city}`,
      action: (
        <ButtonLink href={markt.links.googleMaps} external variant="ink">
          Route planen
        </ButtonLink>
      ),
    },
    {
      icon: InstagramIcon,
      title: "Instagram",
      text: "Neuigkeiten, Clips und Einblicke aus dem Markt.",
      action: (
        <ButtonLink href={markt.links.instagram} external variant="ink">
          @{markt.instagramHandle}
        </ButtonLink>
      ),
    },
    {
      icon: Tag,
      title: "Angebote",
      text: "Alle Angebote der Woche stehen im offiziellen REWE-Prospekt deines Marktes.",
      action: (
        <ButtonLink href={markt.links.flyer} external variant="ink">
          Prospekt öffnen
        </ButtonLink>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/kontakt", label: "Kontakt" }]}
        eyebrow="Kontakt"
        title="So erreichst du uns."
        lede="Am schnellsten per Telefon oder direkt im Markt – Montag bis Samstag von 7 bis 22 Uhr."
      />

      <section aria-label="Kontaktwege" className="wrap">
        <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title, text, action }) => (
            <li
              key={title}
              className="reveal card-lift flex flex-col rounded-[var(--radius-media)] bg-soft p-6 ring-1 ring-line/60 md:p-7"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-ink text-white ring-1 ring-inset ring-white/10">
                <Icon className="size-7" strokeWidth={1.7} aria-hidden />
              </span>
              <h2 className="mt-6 text-h3">{title}</h2>
              <p className="mt-2 flex-1 text-muted">{text}</p>
              <div className="mt-6">{action}</div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="besuch-titel" className="wrap py-20 md:py-28">
        <h2 id="besuch-titel" className="sr-only">
          Öffnungszeiten und Anfahrt
        </h2>
        <VisitSection />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Kontakt", path: "/kontakt" }]))} />
    </>
  );
}
