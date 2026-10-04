import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { VorratRechner } from "@/components/tools/vorrat-rechner";
import { getPost } from "@/content/aktuelles";
import { VORRAT_QUELLE } from "@/content/vorrat";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { media } from "@/lib/media";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notvorrat-Rechner",
  description: "Wie viel Wasser und Lebensmittel braucht dein Haushalt für den Notfall? Richtwerte nach BBK – mit Checklisten zum Abhaken und Drucken.",
  alternates: { canonical: "/notvorrat" },
};

export default function NotvorratPage() {
  const post = getPost("resilienzwoche-2026");
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/notvorrat", label: "Notvorrat-Rechner" }]}
        eyebrow="Vorsorge"
        title="Notvorrat-Rechner."
        lede="Wie viel brauchst du für deinen Haushalt? Richtwerte nach dem Bundesamt für Bevölkerungsschutz – vieles davon findest du bei uns im Markt."
        className="print:hidden"
      />
      <section aria-label="Rechner" className="wrap pb-16">
        <VorratRechner pageUrl={absoluteUrl("/notvorrat")} />
        <p className="mt-6 text-[0.875rem] text-muted">
          Quelle:{" "}
          <a href={VORRAT_QUELLE.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-ink">
            {VORRAT_QUELLE.title}
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
          . Alle Angaben sind Richtwerte.
        </p>
      </section>

      {post && (
        <section aria-label="Passender Beitrag" className="wrap pb-24 md:pb-32 print:hidden">
          <Link href={`/aktuelles/${post.slug}`} className="group grid overflow-hidden rounded-[1.75rem] bg-soft md:grid-cols-[1fr_1.4fr]">
            <div className="relative aspect-[3/2] md:aspect-auto">
              <Image src={media[post.cover].src} alt="" fill sizes="(min-width: 48rem) 40vw, 100vw" quality={70} className="object-cover" />
            </div>
            <div className="p-6 md:p-10">
              <p className="text-[0.9375rem] font-semibold text-red">Bei uns im Markt</p>
              <p className="mt-2 font-display text-h3 font-extrabold">Resilienzwoche 2026: Der Innenminister hat bei uns seinen Notfallbeutel gepackt.</p>
              <p className="mt-4 inline-flex items-center gap-2 font-semibold">
                Zum Beitrag <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </p>
            </div>
          </Link>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Notvorrat-Rechner", path: "/notvorrat" }]))} />
    </>
  );
}
