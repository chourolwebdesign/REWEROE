import type { Metadata } from "next";
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
  return { title: tx(a.hero.title, locale), description: tx(a.hero.subtitle, locale) };
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

      {/* Timeline */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("timelineEyebrow")} title={t("timelineTitle")} />
        <ol className="relative mt-16 border-l border-gold/50 pl-8 md:ml-6 md:pl-12">
          {a.timeline.map((e, i) => (
            <li key={i} className="relative pb-14 last:pb-0">
              <Reveal>
                <span className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-2 border-gold bg-surface md:-left-[57px]" aria-hidden />
                <p className="mono text-sm uppercase tracking-[0.2em] text-gold">{e.year}{e.status === "pending" ? ` · ${t("yearPending")}` : ""}</p>
                <h3 className="mt-2 text-forest dark:text-cream">{tx(e.title, locale)}</h3>
                <p className="mt-2 max-w-2xl text-ink-muted">{tx(e.text, locale)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Values */}
      <section className="bg-forest py-24 text-cream md:py-32">
        <div className="container-x">
          <SectionHeading eyebrow={t("valuesEyebrow")} title={t("valuesTitle")} dark />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {a.values.map((v) => {
              const Icon = icons[v.id as keyof typeof icons] ?? Leaf;
              return (
                <StaggerItem key={v.id} className="rounded-[14px] border border-cream/15 bg-cream/5 p-8 backdrop-blur">
                  <Icon className="h-6 w-6 text-rewe" aria-hidden />
                  <h3 className="mt-6 text-cream">{tx(v.title, locale)}</h3>
                  <p className="mt-2 text-cream/70">{tx(v.text, locale)}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Stagger className="mt-20 grid grid-cols-2 gap-8 border-t border-cream/15 pt-12 md:grid-cols-4">
            {s.stats.map((st) => (
              <StaggerItem key={st.id}>
                <p className="mono text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-rewe"><Counter value={st.value} suffix={st.suffix} locale={locale} /></p>
                <p className="mt-2 text-sm text-cream/70">{tx(st.label, locale)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Team */}
      <section className="container-x py-24 md:py-32">
        <SectionHeading eyebrow={t("teamEyebrow")} title={t("teamTitle")} text={t("teamPending")} />
        <Stagger className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {a.team.map((m, i) => (
            <StaggerItem key={i} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-surface-2">
                <SmartImage src={m.image.src} alt={tx(m.image.alt, locale)} blur={getBlur(m.image.src)} fill sizes="(max-width:768px) 50vw, 25vw" className="img-zoom object-cover" />
                {m.status === "pending" && <span className="mono absolute left-3 top-3 rounded-[3px] bg-cream/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-forest">{tc("contentSoon")}</span>}
              </div>
              <p className="mt-4 font-medium text-forest dark:text-cream">{m.name ?? "—"}</p>
              <p className="mono text-[11px] uppercase tracking-wider text-ink-muted">{tx(m.role, locale)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
