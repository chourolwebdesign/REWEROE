import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, Clock } from "lucide-react";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionHeading } from "@/components/brand/section-heading";
import { ContactForm } from "@/components/commerce/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { tx } from "@/lib/l10n";
import { getFaq, getPrimaryStore, getSettings } from "@/lib/content";
import type { Hours } from "@/lib/hours";
import type { Weekday } from "@/lib/content/types";

const DAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
/** Consecutive days with identical hours → [from, to, hours] (same grouping as the footer; its helper lives in a client module). */
function groupHours(hours: Hours) {
  const groups: { from: Weekday; to: Weekday; hours: [string, string] | null }[] = [];
  for (const d of DAY_ORDER) {
    const h = hours[d];
    const last = groups[groups.length - 1];
    if (last && JSON.stringify(last.hours) === JSON.stringify(h)) last.to = d;
    else groups.push({ from: d, to: d, hours: h });
  }
  return groups;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { alternates: alternatesFor(locale, "/kontakt"), title: t("title"), description: t("text") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tc = await getTranslations("common");
  const faq = getFaq();
  const s = getSettings();
  const store = getPrimaryStore();
  // Phone hours follow the store's hours and inherit its pending state — nothing unreleased is published here.
  const phoneHours = s.contact.status === "pending" || store.hoursStatus === "pending"
    ? null
    : groupHours(store.hours).filter((g) => g.hours).map((g) => `${g.from === g.to ? tc(`days.${g.from}`) : `${tc(`days.${g.from}`)}–${tc(`days.${g.to}`)}`} ${g.hours![0]}–${g.hours![1]}`);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: tx(f.q, locale), acceptedAnswer: { "@type": "Answer", text: tx(f.a, locale) } })) };
  return (
    <>
      <JsonLd data={ld} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-kontakt.jpg" compact />
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal><ContactForm /></Reveal>
        <Reveal delay={0.1}>
          {/* Service card — the page's one anthracite block */}
          <div className="on-block p-8">
            <Eyebrow>{t("serviceEyebrow")}</Eyebrow>
            <h3 className="mt-3 text-block-ink">{t("serviceTitle")}</h3>
            <ul className="mt-6 divide-y divide-block-line text-sm">
              <li className="flex items-center gap-3 py-3">
                <Phone className="h-4 w-4 shrink-0 text-block-ink" aria-hidden />
                {s.contact.phone ? <a href={`tel:${s.contact.phone.replace(/\s/g, "")}`} className="text-block-ink underline-offset-4 hover:underline">{s.contact.phone}</a> : <span className="text-block-muted">{t("servicePhonePending")}</span>}
              </li>
              <li className="flex items-center gap-3 py-3">
                <Mail className="h-4 w-4 shrink-0 text-block-ink" aria-hidden />
                {s.contact.email ? <a href={`mailto:${s.contact.email}`} className="text-block-ink underline-offset-4 hover:underline">{s.contact.email}</a> : <span className="text-block-muted">{t("serviceEmailPending")}</span>}
              </li>
              <li className="flex items-start gap-3 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-block-ink" aria-hidden />
                <div>
                  <span className="block text-[12px] font-medium text-block-muted">{t("serviceHoursLabel")}</span>
                  {phoneHours ? phoneHours.map((line) => <span key={line} className="num block text-block-ink">{line}</span>) : <span className="text-block-muted">{t("serviceHoursPending")}</span>}
                </div>
              </li>
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
                <AccordionTrigger className="display min-h-12 text-lg text-ink">{tx(f.q, locale)}</AccordionTrigger>
                <AccordionContent className="text-ink-muted">{tx(f.a, locale)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
    </>
  );
}
