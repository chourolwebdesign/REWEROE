import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { SectionHeading } from "@/components/brand/section-heading";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { getAbout, getSettings } from "@/lib/content";
import { Leaf, MapPinned, Handshake } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const a = getAbout();
  return { alternates: alternatesFor(locale, "/ueber-uns"), title: tx(a.hero.title, locale), description: tx(a.hero.subtitle, locale) };
}

const icons = { frische: Leaf, region: MapPinned, fairness: Handshake } as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tc = await getTranslations("common");
  const a = getAbout();
  const s = getSettings();
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={tx(a.hero.title, locale)} text={tx(a.hero.subtitle, locale)} image={a.hero.image.src} imageAlt={tx(a.hero.image.alt, locale)} />

      {/* Timeline: one hairline, ink markers, red display years */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("timelineEyebrow")} title={t("timelineTitle")} />
        <ol className="relative mt-14 border-l border-line pl-8 md:ml-6 md:pl-12">
          {a.timeline.map((e, i) => (
            <li key={i} className="relative pb-14 last:pb-0">
              <Reveal>
                <span className="absolute -left-[37px] top-3 h-2 w-2 bg-ink md:-left-[53px]" aria-hidden />
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="display num text-[2rem] leading-none text-red-text">{e.year}</span>
                  {e.status === "pending" && <span className="text-[12px] font-medium text-ink-muted">{t("yearPending")}</span>}
                </p>
                <h3 className="mt-3 text-ink">{tx(e.title, locale)}</h3>
                <p className="mt-2 max-w-2xl text-ink-muted">{tx(e.text, locale)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Values + stats: the page's anthracite block */}
      <section className="on-block py-24 md:py-32">
        <div className="container-x">
          <SectionHeading eyebrow={t("valuesEyebrow")} title={t("valuesTitle")} tone="block" />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {a.values.map((v) => {
              const Icon = icons[v.id as keyof typeof icons] ?? Leaf;
              return (
                <StaggerItem key={v.id} className="border border-block-line p-8">
                  <Icon className="h-6 w-6 text-block-ink" aria-hidden />
                  <h3 className="mt-6 text-block-ink">{tx(v.title, locale)}</h3>
                  <p className="mt-2 text-block-muted">{tx(v.text, locale)}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Stagger className="mt-20 grid grid-cols-2 gap-8 border-t border-block-line pt-12 md:grid-cols-4">
            {s.stats.map((st) => (
              <StaggerItem key={st.id}>
                <p className="display num text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-block-ink">
                  <Counter value={st.value} locale={locale} />
                  {st.suffix && <span className="text-block-red">{st.suffix}</span>}
                </p>
                <p className="mt-2 text-sm text-block-muted">{tx(st.label, locale)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Team */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("teamEyebrow")} title={t("teamTitle")} text={t("teamPending")} />
        <Stagger className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {a.team.map((m, i) => (
            <StaggerItem key={i}>
              {/* No stock portraits for people who are not the team: pending members get the §6 placeholder frame until real portraits exist */}
              {m.status === "pending" ? (
                <div className="frame flex aspect-[4/5] items-center justify-center bg-surface">
                  <span className="data text-ink-muted">{tc("imagePending")}</span>
                </div>
              ) : (
                <div className="frame relative aspect-[4/5] overflow-hidden bg-surface">
                  <SmartImage src={m.image.src} alt={tx(m.image.alt, locale)} blur={getBlur(m.image.src)} fill sizes="(max-width:768px) 50vw, 25vw" className="img-grade object-cover" />
                </div>
              )}
              <p className="mt-4 font-medium text-ink">{m.name ?? "—"}</p>
              <p className="text-[13px] text-ink-muted">{tx(m.role, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
