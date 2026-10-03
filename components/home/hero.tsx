import { getTranslations } from "next-intl/server";
import { SmartImage } from "@/components/ui/smart-image";
import { CharReveal } from "@/components/motion/char-reveal";
import { FreshnessClock } from "@/components/signature/freshness-clock";
import { Cta } from "@/components/brand/cta";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import type { Settings } from "@/lib/content/types";

export async function Hero({ settings, locale }: { settings: Settings; locale: string }) {
  const t = await getTranslations("home");
  const src = "/images/placeholders/hero-tazelik.jpg";
  return (
    <section data-header-theme="dark" className="relative isolate min-h-[100svh] overflow-hidden bg-forest text-cream">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="kenburns absolute inset-0">
          <SmartImage src={src} alt="" blur={getBlur(src)} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/45 to-forest/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-forest/30" />
        <div className="gold-glow absolute inset-x-0 top-0 h-64 opacity-70" />
      </div>

      <div className="container-x flex min-h-[100svh] flex-col justify-end pb-24 pt-32 md:pb-28">
        <FreshnessClock slots={settings.freshnessClock} inverse className="mb-8 self-start" />
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <h1 className="max-w-5xl text-cream">
          <CharReveal text={tx(settings.brand.premiumClaim, locale)} />
        </h1>
        <p className="mt-7 max-w-xl text-lg text-cream/80 md:text-xl">{t("subtitle")}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Cta href="/kategorien" size="lg">{t("cta")}</Cta>
          <Cta href="/filialen" variant="inverse" size="lg" arrow={false} className="bg-cream/10 text-cream backdrop-blur hover:bg-cream/20">{t("ctaSecondary")}</Cta>
        </div>
        <p className="mono mt-14 hidden text-[10px] uppercase tracking-[0.3em] text-cream/50 md:block">{t("scroll")} ↓</p>
      </div>
    </section>
  );
}
