import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/brand/page-hero";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Cta } from "@/components/brand/cta";
import { Reveal } from "@/components/motion/reveal";
import { Markdown } from "@/lib/markdown";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import { getLegalPage, getLegalPages } from "@/lib/content";

/**
 * CONTENT-READY legal pages: /impressum, /datenschutz, /agb, /widerruf.
 * Driven entirely by content/legalPages.json — status "pending" shows the anthracite placeholder block,
 * "published" renders the body. No code change needed when the client delivers the texts.
 */
export function generateStaticParams() { return getLegalPages().map((l) => ({ legal: l.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; legal: string }> }): Promise<Metadata> {
  const { locale, legal } = await params;
  const page = getLegalPage(legal);
  return page ? { alternates: alternatesFor(locale, `/${legal}`), title: tx(page.title, locale), robots: { index: page.status === "published", follow: true } } : {};
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
    <article>
      <PageHero compact eyebrow={t("eyebrow")} title={title} breadcrumbs={[{ label: tn("home"), href: "/" }, { label: title }]}>
        {page.updatedAt ? <p className="num text-[12px] text-ink-muted">{t("updated", { date: formatDate(page.updatedAt, locale) })}</p> : null}
      </PageHero>

      {page.status === "published" && page.body ? (
        <div className="container-x pb-24"><Markdown source={tx(page.body, locale)} className="prose-editorial max-w-[72ch]" /></div>
      ) : (
        <div className="container-x pb-24">
          <Reveal className="on-block px-8 py-20 text-center md:py-28">
            <Eyebrow>{t("pendingEyebrow")}</Eyebrow>
            <p className="display mx-auto mt-4 max-w-2xl text-2xl leading-tight text-block-ink md:text-3xl">{t("pendingTitle")}</p>
            <p className="mx-auto mt-4 max-w-md text-block-muted">{t("pendingText")}</p>
            <Cta href="/" variant="inverse" className="mt-10">{tc("toHome")}</Cta>
          </Reveal>
        </div>
      )}
    </article>
  );
}
