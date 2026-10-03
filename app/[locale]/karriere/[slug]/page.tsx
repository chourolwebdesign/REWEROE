import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { JobApplicationForm } from "@/components/commerce/job-application-form";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/motion/reveal";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import { getJob, getJobs } from "@/lib/content";
import { jobLd } from "../page";

export function generateStaticParams() { return getJobs().map((j) => ({ slug: j.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const j = getJob(slug);
  return j ? { title: tx(j.title, locale), description: tx(j.teaser, locale) } : {};
}

export default async function JobPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const j = getJob(slug);
  if (!j) notFound();
  const t = await getTranslations("career");
  const tn = await getTranslations("nav");
  return (
    <>
      <JsonLd data={jobLd(j, locale)} />
      <PageHero eyebrow={`${tx(j.department, locale)} · ${t(`type.${j.type}`)} · ${j.location}`} title={tx(j.title, locale)} text={tx(j.teaser, locale)} image="/images/placeholders/hero-karriere.jpg" compact>
        <Breadcrumbs inverse className="mt-8" items={[{ label: tn("home"), href: "/" }, { label: tn("career"), href: "/karriere" }, { label: tx(j.title, locale) }]} />
      </PageHero>
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <p className="eyebrow mb-4">{t("openJobs")}</p>
          <p className="text-lg leading-relaxed">{tx(j.description, locale)}</p>
          <dl className="mono mt-8 grid grid-cols-2 gap-4 text-[11px] uppercase tracking-wider">
            <div><dt className="text-ink-muted">{t("position")}</dt><dd className="mt-1 text-sm normal-case tracking-normal">{t(`type.${j.type}`)}</dd></div>
            <div><dt className="text-ink-muted">Standort</dt><dd className="mt-1 text-sm normal-case tracking-normal">{j.location}</dd></div>
            <div><dt className="text-ink-muted">Online seit</dt><dd className="mt-1 text-sm normal-case tracking-normal">{formatDate(j.datePosted, locale)}</dd></div>
            <div><dt className="text-ink-muted">Gültig bis</dt><dd className="mt-1 text-sm normal-case tracking-normal">{formatDate(j.validThrough, locale)}</dd></div>
          </dl>
        </Reveal>
        <Reveal delay={0.1}><JobApplicationForm jobs={getJobs().map((x) => ({ slug: x.slug, title: tx(x.title, locale) }))} preselect={j.slug} /></Reveal>
      </section>
    </>
  );
}
