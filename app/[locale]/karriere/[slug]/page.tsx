import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
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
  return j ? { alternates: alternatesFor(locale, `/karriere/${slug}`), title: tx(j.title, locale), description: tx(j.teaser, locale) } : {};
}

export default async function JobPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const j = getJob(slug);
  if (!j) notFound();
  const t = await getTranslations("career");
  const tn = await getTranslations("nav");
  const facts = [
    { label: t("position"), value: t(`type.${j.type}`) },
    { label: t("location"), value: j.location },
    { label: t("postedAt"), value: formatDate(j.datePosted, locale) },
    { label: t("validThrough"), value: formatDate(j.validThrough, locale) },
  ];
  return (
    <>
      <JsonLd data={jobLd(j, locale)} />
      <PageHero
        eyebrow={`${tx(j.department, locale)} · ${t(`type.${j.type}`)} · ${j.location}`} title={tx(j.title, locale)} text={tx(j.teaser, locale)}
        image="/images/placeholders/hero-karriere.jpg" compact
        breadcrumbs={[{ label: tn("home"), href: "/" }, { label: tn("career"), href: "/karriere" }, { label: tx(j.title, locale) }]}
      />
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Eyebrow>{t("openJobs")}</Eyebrow>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">{tx(j.description, locale)}</p>
          <dl className="rule mt-8 grid grid-cols-2 gap-6 pt-6">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[12px] font-medium text-ink-muted">{f.label}</dt>
                <dd className="num mt-1 text-sm text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.1}><JobApplicationForm jobs={getJobs().map((x) => ({ slug: x.slug, title: tx(x.title, locale) }))} preselect={j.slug} /></Reveal>
      </section>
    </>
  );
}
