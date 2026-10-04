import type { Metadata } from "next";
import Image from "next/image";
import { Highlights } from "@/components/home/highlights";
import { PageHeader } from "@/components/layout/page-header";
import { OpenStatus } from "@/components/live/open-status";
import { Gallery } from "@/components/media/gallery";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { VisitSection } from "@/components/visit/visit-section";
import { galerie } from "@/content/galerie";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { media } from "@/lib/media";
import { resolveGallery } from "@/lib/resolve";

export const metadata: Metadata = {
  title: "Unser Markt",
  description: "REWE in der Thudichumstraße 18–22, Frankfurt-Rödelheim: Bäckerei und Sushi im Markt, Produkte aus der Region, REWE Bio – Montag bis Samstag 7 bis 22 Uhr.",
  alternates: { canonical: "/markt" },
};

export default function MarktPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/markt", label: "Unser Markt" }]}
        eyebrow="Unser Markt"
        title="Dein REWE in der Thudichumstraße."
        lede={`Ein selbstständig geführter REWE-Markt der ${markt.legalName} – mitten in Rödelheim, sechs Tage die Woche von 7 bis 22 Uhr.`}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <OpenStatus tone="soft" />
          <ButtonLink href={markt.links.flyer} external size="sm">
            Prospekt der Woche
          </ButtonLink>
        </div>
      </PageHeader>

      <section aria-label="Bilder aus dem Markt" className="wrap">
        <div className="grid gap-3 md:grid-cols-[1.35fr_1fr] md:gap-4">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-soft md:aspect-auto md:min-h-[32rem]">
            <Image
              src={media["resilienzwoche-obst"].src}
              alt={media["resilienzwoche-obst"].alt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 48rem) 57vw, 100vw"
              quality={75}
              className="object-cover"
              style={{ objectPosition: "70% 50%" }}
            />
          </figure>
          <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-soft md:aspect-auto">
            <Image
              src={media["markt-rundgang-poster"].src}
              alt={media["markt-rundgang-poster"].alt}
              fill
              sizes="(min-width: 48rem) 43vw, 100vw"
              quality={75}
              className="object-cover"
              style={{ objectPosition: "50% 40%" }}
            />
          </figure>
        </div>
      </section>

      <section aria-labelledby="marken" className="wrap pt-24 md:pt-32">
        <SectionHeading
          id="marken"
          eyebrow="Sortiment & Services"
          title="Regional, Bio und frisch gebacken."
          lede="Im Markt findest du eine Bäckerei und frisches Sushi – und an den gelben Schildern Produkte aus der Region."
        />
        <Highlights className="mt-10" />
      </section>

      <section aria-labelledby="galerie-titel" className="wrap pt-24 md:pt-32">
        <SectionHeading
          id="galerie-titel"
          eyebrow="Aus dem Markt"
          title="Einblicke."
          action={
            <ButtonLink href={markt.links.instagram} external variant="ink" icon={<InstagramIcon className="size-[1.1em]" />}>
              @{markt.instagramHandle}
            </ButtonLink>
          }
        />
        <Gallery items={resolveGallery(galerie)} className="mt-10" />
      </section>

      <section aria-labelledby="besuch-titel" className="wrap py-24 md:py-32">
        <SectionHeading id="besuch-titel" eyebrow="Besuch" title="Öffnungszeiten & Anfahrt." />
        <VisitSection className="mt-10" />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Unser Markt", path: "/markt" }]))} />
    </>
  );
}
