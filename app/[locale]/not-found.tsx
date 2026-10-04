import { getLocale, getTranslations } from "next-intl/server";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductCard } from "@/components/commerce/product-card";
import { Cta } from "@/components/brand/cta";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Breadcrumbs } from "@/components/brand/breadcrumbs";
import { getBlur } from "@/lib/blur";
import { getPopularProducts } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";
import { SearchTrigger } from "@/components/layout/search-trigger";

/** 404 — one of the three editorial heroes (§4.37): photo + ink scrim on an anthracite block, header stays opaque paper. */
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const popular = getPopularProducts(3).map((p) => toCardProduct(p, locale));
  const src = "/images/placeholders/404-regal.jpg";
  return (
    <>
      <section className="on-block relative isolate overflow-hidden">
        <SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="100vw" className="img-grade absolute inset-0 -z-10 object-cover" />
        <div className="scrim-editorial absolute inset-0 -z-10" aria-hidden />
        <div className="container-x flex min-h-[60svh] flex-col justify-end pb-14 pt-16">
          <Breadcrumbs inverse items={[{ label: tn("home"), href: "/" }, { label: t("eyebrow") }]} />
          <p className="eyebrow mt-8 text-block-muted">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-[14ch] text-block-ink">{t("title")}</h1>
          <p className="mt-6 max-w-2xl text-lg text-block-ink/90">{t("text")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <SearchTrigger label={t("search")} />
            <Cta href="/" variant="inverse">{tc("toHome")}</Cta>
          </div>
        </div>
      </section>
      <section className="container-x py-20">
        <Eyebrow rule className="mb-8">{t("popular")}</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
