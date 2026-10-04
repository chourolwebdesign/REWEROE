"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/brand/cta";
import { Eyebrow } from "@/components/brand/eyebrow";

type Props = { error: Error & { digest?: string }; reset: () => void; retry?: () => void };

/**
 * Localized error boundary for every locale route (§4.8 compact head row; the header and footer stay in place).
 * Markup mirrors `PageHero compact` instead of importing it: error boundaries ship with every page's client bundle,
 * and PageHero pulls SmartImage + the 43 KB blur map along. `retry()` re-fetches and re-renders the segment (Next 16);
 * `reset` is the older name and the fallback.
 */
export default function LocaleError({ error, reset, retry }: Props) {
  const t = useTranslations("error");
  const tc = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-x pb-16 pt-10 md:pt-14" aria-labelledby="error-title">
      <div className="grid grid-cols-4 items-end gap-x-4 gap-y-6 md:grid-cols-12 md:gap-x-6">
        <div className="col-span-4 md:col-span-8">
          <Eyebrow rule>{t("eyebrow")}</Eyebrow>
          <h1 id="error-title" className="mt-4 text-[clamp(2.25rem,1.6rem+2.7vw,4rem)] leading-none tracking-[-0.025em] text-ink">{t("title")}</h1>
        </div>
        <p className="col-span-4 max-w-[40ch] text-[17px] leading-relaxed text-ink-muted md:col-span-4 md:col-start-9">{t("text")}</p>
      </div>
      <div className="rule mt-8 flex flex-wrap items-center gap-3 pt-6">
        <Cta type="button" onClick={() => (retry ?? reset)()} arrow={false}>{t("retry")}</Cta>
        <Cta href="/" variant="secondary" arrow={false}>{tc("toHome")}</Cta>
        {error.digest && <span className="data w-full text-ink-muted sm:ml-auto sm:w-auto">{t("code", { digest: error.digest })}</span>}
      </div>
    </section>
  );
}
