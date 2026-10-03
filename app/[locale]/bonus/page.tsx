import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { PointsCalculator } from "@/components/signature/points-calculator";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Cta } from "@/components/brand/cta";
import { tx } from "@/lib/l10n";
import { getBonus, getSettings } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const b = getBonus();
  return { alternates: alternatesFor(locale, "/bonus"), title: tx(b.hero.title, locale), description: tx(b.hero.subtitle, locale) };
}

export default async function BonusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bonus");
  const b = getBonus();
  const s = getSettings();
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={tx(b.hero.title, locale)} text={tx(b.hero.subtitle, locale)} image={b.hero.image.src} imageAlt={tx(b.hero.image.alt, locale)}>
        <Cta href="/konto" variant="inverse" className="mt-10">{t("cta")}</Cta>
      </PageHero>

      {/* Interactive card */}
      <section className="container-x -mt-10 md:-mt-16">
        <Reveal className="mx-auto max-w-md">
          <div className="group relative aspect-[1.586] overflow-hidden rounded-[18px] bg-forest p-6 text-cream shadow-lift transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:[transform:perspective(1200px)_rotateX(6deg)_rotateY(-8deg)]">
            <div className="gold-glow absolute inset-0 opacity-90" aria-hidden />
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-rewe/20 blur-3xl" aria-hidden />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between"><span className="rounded-[4px] bg-price px-2 py-0.5 font-sans text-lg font-black tracking-tighter">REWE</span><span className="eyebrow">{t("cardLabel")}</span></div>
              <div>
                <p className="mono text-xs uppercase tracking-[0.2em] text-cream/60">{t("cardOwner")}</p>
                <p className="mono mt-1 text-2xl tracking-[0.18em]">•••• •••• •••• 0427</p>
                <p className="mono mt-3 text-sm text-rewe">{s.payback.welcomePoints} {t("cardPoints")}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("howEyebrow")} title={t("howTitle")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {b.steps.map((st) => (
            <StaggerItem key={st.n} className="rounded-[14px] border border-line bg-card p-8">
              <p className="serif text-5xl text-gold">{st.n}</p>
              <h3 className="mt-6 text-forest dark:text-cream">{tx(st.title, locale)}</h3>
              <p className="mt-2 text-ink-muted">{tx(st.text, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-surface-2/60 py-24 md:py-32">
        <div className="container-x">
          <SectionHeading eyebrow={t("calcEyebrow")} title={t("calcTitle")} />
          <Reveal className="mt-12"><PointsCalculator eurosPerPoint={s.payback.eurosPerPoint} centPerPoint={s.payback.centPerPoint} /></Reveal>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow={t("benefitsEyebrow")} title={t("benefitsTitle")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {b.benefits.map((bn, i) => (
            <StaggerItem key={i} className="border-t border-gold/60 pt-6">
              <h3 className="text-forest dark:text-cream">{tx(bn.title, locale)}</h3>
              <p className="mt-2 text-ink-muted">{tx(bn.text, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
