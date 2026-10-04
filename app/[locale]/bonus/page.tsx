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

/** REWE Bonus (successor of the former points programme since 29 Dec 2024). Petrol + pale yellow live only on this page and the Bonus badge (§4.30). */
export default async function BonusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bonus");
  const b = getBonus();
  const s = getSettings();
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={tx(b.hero.title, locale)} text={tx(b.hero.subtitle, locale)} image={b.hero.image.src} imageAlt={tx(b.hero.image.alt, locale)}>
        <Cta href="/konto?tab=bonus">{t("cta")}</Cta>
      </PageHero>

      {/* The Bonus card — petrol field, display title, yellow numerals */}
      <section className="container-x pb-8">
        <Reveal className="mx-auto max-w-md">
          <p className="eyebrow text-petrol-text">{t("cardLabel")}</p>
          <div className="mt-4 flex aspect-[1.586] flex-col justify-between bg-petrol p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <p className="display text-2xl leading-none text-white">REWE Bonus</p>
              <span className="data text-bonus-yellow/80">{t("cardNumber")}</span>
            </div>
            <div>
              <p className="data text-bonus-yellow/80">{t("cardOwner")}</p>
              <p className="data-lg mt-1 text-lg text-white">•••• •••• •••• 0427</p>
              <p className="mt-3 flex items-baseline gap-2"><span className="display num text-2xl leading-none text-bonus-yellow">{s.bonus.welcomePoints}</span><span className="text-sm text-white">{t("cardPoints")}</span></p>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink-muted">{t("cardHint")}</p>
        </Reveal>
      </section>

      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("howEyebrow")} title={t("howTitle")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {b.steps.map((st) => (
            <StaggerItem key={st.n} className="border border-line bg-card p-8">
              <p className="display num text-5xl leading-none text-red-text">{st.n}</p>
              <h3 className="mt-6 text-ink">{tx(st.title, locale)}</h3>
              <p className="mt-2 text-ink-muted">{tx(st.text, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-surface py-24 md:py-32">
        <div className="container-x">
          <SectionHeading eyebrow={t("calcEyebrow")} title={t("calcTitle")} />
          <Reveal className="mt-12"><PointsCalculator eurosPerPoint={s.bonus.eurosPerPoint} centPerPoint={s.bonus.centPerPoint} /></Reveal>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow={t("benefitsEyebrow")} title={t("benefitsTitle")} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {b.benefits.map((bn, i) => (
            <StaggerItem key={i} className="rule pt-6">
              <h3 className="text-ink">{tx(bn.title, locale)}</h3>
              <p className="mt-2 text-ink-muted">{tx(bn.text, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
