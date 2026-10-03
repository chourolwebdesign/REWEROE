import { getLocale, getTranslations } from "next-intl/server";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductCard } from "@/components/commerce/product-card";
import { Cta } from "@/components/brand/cta";
import { getBlur } from "@/lib/blur";
import { getPopularProducts } from "@/lib/content";
import { toCardProduct } from "@/lib/view-models";
import { SearchTrigger } from "@/components/layout/search-trigger";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  const popular = getPopularProducts(3).map((p) => toCardProduct(p, locale));
  const src = "/images/placeholders/404-regal.jpg";
  return (
    <section className="pt-[72px]">
      <div className="relative isolate overflow-hidden bg-forest text-cream" data-header-theme="dark">
        <div className="absolute inset-0 -z-10 opacity-50"><SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="100vw" className="object-cover" /></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/60 to-forest/20" />
        <div className="container-x py-28 md:py-40">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="max-w-3xl text-cream">{t("title")}</h1>
          <p className="mt-6 max-w-xl text-cream/80">{t("text")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <SearchTrigger label={t("search")} />
            <Cta href="/" variant="inverse">{t("eyebrow") && "Zur Startseite"}</Cta>
          </div>
        </div>
      </div>
      <div className="container-x py-20">
        <p className="eyebrow mb-8">{t("popular")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </div>
    </section>
  );
}
