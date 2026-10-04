import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProgressBar } from "@/components/motion/progress-bar";
import { tx } from "@/lib/l10n";
import { getSustainability } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const s = getSustainability();
  return { alternates: alternatesFor(locale, "/nachhaltigkeit"), title: tx(s.hero.title, locale), description: tx(s.hero.quote, locale) };
}

export default async function SustainabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sustainability");
  const s = getSustainability();
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={tx(s.hero.title, locale)} image={s.hero.image.src} imageAlt={tx(s.hero.image.alt, locale)}>
        <blockquote className="display max-w-3xl text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight text-ink">„{tx(s.hero.quote, locale)}“</blockquote>
      </PageHero>

      {/* Goals — honest progress, red fill on a grey track */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("goalsEyebrow")} title={t("goalsTitle")} text={t("goalsText")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {s.goals.map((g) => (
            <StaggerItem key={g.id} className="border border-line bg-card p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium text-ink">{tx(g.label, locale)}</p>
                <p className="num shrink-0 text-[12px] text-ink-muted">{t("target", { target: g.target })}</p>
              </div>
              <ProgressBar value={g.progress} className="mt-4" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Four numbered fields on a surface band */}
      <section className="bg-surface py-24 md:py-32">
        <div className="container-x grid gap-10 md:grid-cols-2">
          {s.sections.map((sec) => (
            <Reveal key={sec.id} className="rule pt-6">
              <Eyebrow num={sec.eyebrow}>{t("eyebrow")}</Eyebrow>
              <h3 className="mt-3 text-ink">{tx(sec.title, locale)}</h3>
              <p className="mt-3 text-ink-muted">{tx(sec.text, locale)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Certificates as data chips (logos follow with approval) */}
      <section className="container-x py-24">
        <SectionHeading eyebrow={t("certEyebrow")} title={t("certTitle")} text={t("certNote")} />
        <Reveal className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {s.certificates.map((c) => (
              <li key={c.id} className="data inline-flex min-h-11 items-center rounded-[2px] border border-line px-4 text-ink-muted">{c.label}</li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
