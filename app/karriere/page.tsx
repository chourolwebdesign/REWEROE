import type { Metadata } from "next";
import Image from "next/image";
import { Apple, GraduationCap, Package, ScanBarcode } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { jobs } from "@/content/jobs";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, jobJsonLd, ldScript } from "@/lib/jsonld";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Karriere",
  description: "Arbeiten bei REWE in Frankfurt-Rödelheim: Bereiche im Markt, Ausbildung und aktuelle Stellen in der REWE-Stellensuche.",
  alternates: { canonical: "/karriere" },
};

/** Typische Bereiche in einem Supermarkt – Beschreibung der Arbeit, keine Stellenzusage. */
const AREAS = [
  { icon: ScanBarcode, title: "Kasse & Service", text: "Du bist das Gesicht des Markts: kassieren, beraten, freundlich bleiben, wenn es voll wird." },
  { icon: Apple, title: "Obst & Gemüse", text: "Frische präsentieren, Ware prüfen und dafür sorgen, dass die Abteilung jeden Morgen glänzt." },
  { icon: Package, title: "Ware & Lager", text: "Lieferungen annehmen, Regale auffüllen, den Überblick behalten – gern auch früh am Morgen." },
  { icon: GraduationCap, title: "Ausbildung", text: "Mit einer Ausbildung im Einzelhandel lernst du den Markt von Grund auf kennen." },
] as const;

export default function KarrierePage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/karriere", label: "Karriere" }]}
        eyebrow="Karriere"
        title="Arbeiten im Supermarkt um die Ecke."
        lede="Kurze Wege, ein Markt mitten im Viertel und Arbeit, die man am Ende des Tages sieht. So kannst du bei uns einsteigen."
      />

      <section aria-labelledby="stellen-titel" className="wrap">
        <div className="grid gap-3 md:grid-cols-[1.1fr_1fr] md:gap-4">
          <div className="reveal on-dark rounded-[1.75rem] bg-night p-7 text-white md:p-10">
            <h2 id="stellen-titel" className="text-h3">
              Offene Stellen
            </h2>
            {jobs.length > 0 ? (
              <ul className="mt-6 grid gap-3">
                {jobs.map((j) => (
                  <li key={j.id} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/12">
                    <p className="text-[0.875rem] font-semibold text-red-bright">{j.employment}</p>
                    <h3 className="mt-1 text-[1.25rem] font-bold">{j.title}</h3>
                    <p className="mt-2 text-white/75">{j.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 max-w-[46ch] text-lede text-white/75">
                Aktuelle Stellen und Ausbildungsplätze von REWE in Rödelheim und Umgebung findest du in der REWE-Stellensuche.
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={markt.links.jobs} external variant="white" size="lg">
                Zur Stellensuche
              </ButtonLink>
              <ButtonLink href={markt.links.ausbildung} external variant="glass" size="lg">
                Ausbildung bei REWE
              </ButtonLink>
            </div>
          </div>
          <div className="reveal relative min-h-[18rem] overflow-hidden rounded-[1.75rem] bg-soft">
            <Image
              src={media["resilienzwoche-obst"].src}
              alt={media["resilienzwoche-obst"].alt}
              fill
              sizes="(min-width: 48rem) 45vw, 100vw"
              quality={70}
              className="object-cover"
              style={{ objectPosition: "75% 50%" }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="bereiche-titel" className="wrap pt-20 md:pt-28">
        <h2 id="bereiche-titel" className="text-h2">
          Bereiche im Markt.
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {AREAS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="reveal rounded-[1.75rem] bg-soft p-6 md:p-7">
              <span className="grid size-12 place-items-center rounded-2xl bg-white">
                <Icon className="size-6 text-red" strokeWidth={1.9} aria-hidden />
              </span>
              <h3 className="mt-6 text-h3">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="initiativ-titel" className="wrap py-20 md:py-28">
        <div className="reveal rounded-[2rem] bg-red-tint p-8 md:flex md:items-center md:justify-between md:gap-10 md:p-12">
          <div>
            <h2 id="initiativ-titel" className="text-h3">
              Lieber direkt fragen?
            </h2>
            <p className="mt-3 max-w-[52ch] text-ink-2">
              Ruf uns an oder sprich uns im Markt an – wir sagen dir gern, ob gerade jemand gesucht wird.
            </p>
          </div>
          <ButtonLink href={`tel:${markt.phone.e164}`} variant="red" size="lg" className="mt-6 md:mt-0">
            {markt.phone.display}
          </ButtonLink>
        </div>
      </section>

      {jobs.map((j) => (
        <script key={j.id} type="application/ld+json" dangerouslySetInnerHTML={ldScript(jobJsonLd(j))} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Karriere", path: "/karriere" }]))} />
    </>
  );
}
