import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Briefcase, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionHeading } from "@/components/brand/section-heading";
import { Cta } from "@/components/brand/cta";
import { JobApplicationForm } from "@/components/commerce/job-application-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatPrice } from "@/lib/format";
import { getJobs, getPrimaryStore, getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "career" });
  return { alternates: alternatesFor(locale, "/karriere"), title: t("title"), description: t("text") };
}

export function jobLd(job: ReturnType<typeof getJobs>[number], locale: string) {
  const s = getSettings(); const st = getPrimaryStore();
  return {
    "@context": "https://schema.org", "@type": "JobPosting", title: tx(job.title, locale), description: tx(job.description, locale), datePosted: job.datePosted, validThrough: job.validThrough,
    employmentType: ({ Vollzeit: "FULL_TIME", Teilzeit: "PART_TIME", Minijob: "PART_TIME", Ausbildung: "INTERN" } as Record<string, string>)[job.type],
    hiringOrganization: { "@type": "Organization", name: s.brand.merchantLegal },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: st.address.city, postalCode: st.address.zip, addressRegion: "Hessen", addressCountry: "DE" } },
  };
}

export default async function CareerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("career");
  const jobs = getJobs();
  const stories = ["/images/placeholders/karriere-story-1.jpg", "/images/placeholders/karriere-story-2.jpg"];
  return (
    <>
      <JsonLd data={jobs.map((j) => jobLd(j, locale))} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} image="/images/placeholders/hero-karriere.jpg" />

      {/* Open positions — hairline cards, edge sharpens on hover */}
      <section className="container-x py-20 md:py-28" id="stellen">
        <SectionHeading eyebrow={t("eyebrow")} title={t("openJobs")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {jobs.map((j) => (
            <StaggerItem key={j.slug}>
              <article className="card-hover flex h-full flex-col border border-line bg-card p-6">
                <Eyebrow>{tx(j.department, locale)}</Eyebrow>
                <h3 className="mt-3 text-ink"><Link href={`/karriere/${j.slug}`} className="underline-offset-4 hover:underline">{tx(j.title, locale)}</Link></h3>
                <p className="mt-2 text-ink-muted">{tx(j.teaser, locale)}</p>
                <div className="num mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-[12px] font-medium text-ink-muted">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden />{j.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" aria-hidden />{t(`type.${j.type}`)}</span>
                  {j.salary && <span>{formatPrice(j.salary.min, locale)} – {formatPrice(j.salary.max, locale)}</span>}
                  <Cta href={`/karriere/${j.slug}`} variant="link" size="sm" className="ml-auto">{t("details")}</Cta>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Why — the page's anthracite block */}
      <section className="on-block py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={t("whyEyebrow")} title={t("whyTitle")} tone="block" />
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <StaggerItem key={n} className="border-t border-block-line pt-6">
                <p className="display num text-4xl leading-none text-red-text">0{n}</p>
                <h3 className="mt-4 text-block-ink">{t(`why${n}Title`)}</h3>
                <p className="mt-2 text-block-muted">{t(`why${n}Text`)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Voices — framed stills, caption typeset under the frame (videos follow) */}
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("storiesEyebrow")} title={t("storiesTitle")} text={t("storiesPending")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {stories.map((src) => (
            <StaggerItem key={src}>
              <figure>
                <div className="frame relative aspect-video overflow-hidden bg-surface">
                  <SmartImage src={src} alt="" blur={getBlur(src)} fill sizes="(max-width:768px) 100vw, 50vw" className="img-grade object-cover" />
                </div>
                <figcaption className="data mt-2 flex items-center gap-2 text-ink-muted"><Play className="h-3 w-3" aria-hidden />{t("videoSoon")}</figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-x pb-24" id="bewerbung">
        <SectionHeading eyebrow={t("formEyebrow")} title={t("formTitle")} />
        <Reveal className="mt-12"><JobApplicationForm jobs={jobs.map((j) => ({ slug: j.slug, title: tx(j.title, locale) }))} /></Reveal>
      </section>
    </>
  );
}
