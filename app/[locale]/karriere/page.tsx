import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Briefcase, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { JobApplicationForm } from "@/components/commerce/job-application-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { getJobs, getPrimaryStore, getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "career" });
  return { title: t("title"), description: t("text") };
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

      <section className="container-x py-20 md:py-28" id="stellen">
        <SectionHeading eyebrow={t("eyebrow")} title={t("openJobs")} />
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <StaggerItem key={j.slug}>
              <article className="group flex h-full flex-col rounded-[14px] border border-line bg-card p-6 card-hover">
                <p className="eyebrow">{tx(j.department, locale)}</p>
                <h3 className="mt-3 text-forest dark:text-cream"><Link href={`/karriere/${j.slug}`} className="hover:underline underline-offset-4">{tx(j.title, locale)}</Link></h3>
                <p className="mt-2 text-ink-muted">{tx(j.teaser, locale)}</p>
                <div className="mono mt-auto flex flex-wrap items-center gap-4 pt-5 text-[11px] uppercase tracking-wider text-ink-muted">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {t(`type.${j.type}`)}</span>
                  <Link href={`/karriere/${j.slug}`} className="ml-auto rounded-full bg-rewe px-3 py-1.5 text-forest transition-colors group-hover:bg-rewe-deep">{t("apply")} →</Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-forest py-20 text-cream md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={t("whyEyebrow")} title={t("whyTitle")} dark />
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <StaggerItem key={n} className="border-t border-gold/60 pt-6">
                <p className="serif text-4xl text-gold">0{n}</p>
                <h3 className="mt-4 text-cream">{t(`why${n}Title`)}</h3>
                <p className="mt-2 text-cream/70">{t(`why${n}Text`)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow={t("storiesEyebrow")} title={t("storiesTitle")} text={t("storiesPending")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {stories.map((src) => (
            <StaggerItem key={src} className="group relative aspect-video overflow-hidden rounded-[14px] bg-forest">
              <SmartImage src={src} alt="" blur={getBlur(src)} fill sizes="(max-width:768px) 100vw, 50vw" className="img-zoom object-cover opacity-80" />
              <span className="absolute inset-0 flex items-center justify-center"><span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream/90 text-forest shadow-lift transition-transform group-hover:scale-110"><Play className="ml-1 h-6 w-6" /></span></span>
              <span className="mono absolute bottom-4 left-4 rounded-[3px] bg-forest/80 px-2 py-1 text-[10px] uppercase tracking-wider text-cream">Video · {t("storiesPending")}</span>
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
