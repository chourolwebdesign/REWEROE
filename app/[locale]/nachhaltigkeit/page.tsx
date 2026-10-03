import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
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
        <blockquote className="serif mt-10 max-w-3xl text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight text-cream/90">„{tx(s.hero.quote, locale)}“</blockquote>
      </PageHero>

      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("goalsEyebrow")} title={t("goalsTitle")} text={t("goalsText")} />
        <Stagger className="mt-12 grid gap-8 md:grid-cols-2">
          {s.goals.map((g) => (
            <StaggerItem key={g.id} className="rounded-[14px] border border-line bg-card p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">{tx(g.label, locale)}</p>
                <p className="mono text-xs uppercase tracking-wider text-ink-muted">{t("target", { target: g.target })}</p>
              </div>
              <ProgressBar value={g.progress} className="mt-4" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-surface-2/60 py-24 md:py-32">
        <div className="container-x grid gap-10 md:grid-cols-2">
          {s.sections.map((sec) => (
            <Reveal key={sec.id} className="border-t border-gold/60 pt-6">
              <p className="eyebrow">— {sec.eyebrow}</p>
              <h3 className="mt-3 text-forest dark:text-cream">{tx(sec.title, locale)}</h3>
              <p className="mt-3 text-ink-muted">{tx(sec.text, locale)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow={t("certEyebrow")} title={t("certTitle")} text={t("certNote")} />
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-6">
          {s.certificates.map((c) => (
            <StaggerItem key={c.id} className="mono flex aspect-square items-center justify-center rounded-[12px] border border-dashed border-line text-center text-[11px] uppercase tracking-wider text-ink-muted">{c.label}</StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
