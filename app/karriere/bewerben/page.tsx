import type { Metadata } from "next";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { ApplicationForm } from "@/components/career/application-form";
import { PageHeader } from "@/components/layout/page-header";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { applicationsReady } from "@/lib/mailer";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Bewerben in 60 Sekunden",
  description: "Ohne Anschreiben, Lebenslauf optional: Bewirb dich in wenigen Schritten bei REWE in Frankfurt-Rödelheim.",
  path: "/karriere/bewerben",
  card: "bewerben",
});

const FACTS = [
  { icon: Clock3, text: "Dauert etwa eine Minute" },
  { icon: FileCheck2, text: "Kein Anschreiben, Lebenslauf optional" },
  { icon: ShieldCheck, text: "Deine Daten nur für deine Bewerbung" },
] as const;

export default function BewerbenPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/karriere", label: "Karriere" },
          { href: "/karriere/bewerben", label: "Bewerben" },
        ]}
        eyebrow="Bewerben"
        title="Bewerben in 60 Sekunden."
        lede="Sag uns, was du machen möchtest und wann du kannst – wir melden uns bei dir."
      >
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
          {FACTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 font-semibold">
              <Icon className="size-5 text-red" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>
      <section aria-label="Bewerbungsformular" className="wrap max-w-[52rem] pb-24 md:pb-32">
        <ApplicationForm ready={applicationsReady()} phone={markt.phone.display} phoneHref={`tel:${markt.phone.e164}`} />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          breadcrumbJsonLd([
            { name: "Karriere", path: "/karriere" },
            { name: "Bewerben", path: "/karriere/bewerben" },
          ]),
        )}
      />
    </>
  );
}
