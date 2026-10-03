import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { Cta } from "@/components/brand/cta";
import { Reveal } from "@/components/motion/reveal";
import { Markdown } from "@/lib/markdown";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import { getLegalPage, getLegalPages } from "@/lib/content";

/**
 * CONTENT-READY legal pages: /impressum, /datenschutz, /agb, /widerruf.
 * Driven entirely by content/legalPages.json — status "pending" shows the elegant placeholder,
 * "published" renders the body. No code change needed when the client delivers the texts.
 */
export function generateStaticParams() { return getLegalPages().map((l) => ({ legal: l.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; legal: string }> }): Promise<Metadata> {
  const { locale, legal } = await params;
  const page = getLegalPage(legal);
  return page ? { title: tx(page.title, locale), robots: { index: page.status === "published", follow: true } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; legal: string }> }) {
  const { locale, legal } = await params;
  setRequestLocale(locale);
  const page = getLegalPage(legal);
  if (!page) notFound();
  const t = await getTranslations("legal");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const title = tx(page.title, locale);

  return (
    <article className="pt-[72px]">
      <div className="container-x py-12 md:py-20">
        <Breadcrumbs items={[{ label: tn("home"), href: "/" }, { label: title }]} />
        <p className="eyebrow mt-10">{t("eyebrow")}</p>
        <h1 className="mt-4 max-w-3xl text-forest dark:text-cream">{title}</h1>
        {page.updatedAt && <p className="mono mt-4 text-[11px] uppercase tracking-wider text-ink-muted">{t("updated", { date: formatDate(page.updatedAt, locale) })}</p>}
      </div>

      {page.status === "published" && page.body ? (
        <div className="container-x pb-24"><Markdown source={tx(page.body, locale)} className="prose-editorial max-w-[72ch]" /></div>
      ) : (
        <div className="container-x pb-24">
          <Reveal className="relative overflow-hidden rounded-[18px] bg-forest px-8 py-20 text-center text-cream md:py-28">
            <div className="gold-glow absolute inset-x-0 top-0 h-48" aria-hidden />
            <p className="select-none font-sans text-[clamp(4rem,14vw,11rem)] font-black leading-none tracking-[-0.06em] text-rewe" aria-hidden>REWE</p>
            <p className="serif mt-6 text-[clamp(1.5rem,3vw,2.5rem)] leading-tight">{t("pendingTitle")}</p>
            <p className="mx-auto mt-4 max-w-md text-cream/70">{t("pendingText")}</p>
            <Cta href="/" variant="inverse" className="mt-10">{tc("toHome")}</Cta>
          </Reveal>
        </div>
      )}
    </article>
  );
}
