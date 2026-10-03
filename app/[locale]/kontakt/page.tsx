import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, Clock } from "lucide-react";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { ContactForm } from "@/components/commerce/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { tx } from "@/lib/l10n";
import { getFaq, getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("text") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const faq = getFaq();
  const s = getSettings();
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: tx(f.q, locale), acceptedAnswer: { "@type": "Answer", text: tx(f.a, locale) } })) };
  return (
    <>
      <JsonLd data={ld} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-kontakt.jpg" compact />
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal><ContactForm /></Reveal>
        <Reveal delay={0.1} className="space-y-6">
          <div className="rounded-[14px] bg-forest p-8 text-cream">
            <p className="eyebrow">{t("serviceEyebrow")}</p>
            <h3 className="mt-3 text-cream">{t("serviceTitle")}</h3>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-rewe" /> {s.contact.phone || t("servicePhonePending")}</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-rewe" /> {s.contact.email || t("serviceEmailPending")}</li>
              <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-rewe" /> {t("serviceHours")}</li>
            </ul>
          </div>
        </Reveal>
      </section>
      <section className="container-x pb-24">
        <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
        <Reveal className="mt-10 max-w-3xl">
          <Accordion type="single" collapsible>
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="serif text-lg">{tx(f.q, locale)}</AccordionTrigger>
                <AccordionContent className="text-ink-muted">{tx(f.a, locale)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
    </>
  );
}
