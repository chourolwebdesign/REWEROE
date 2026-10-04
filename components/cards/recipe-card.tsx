import { Clock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatNumber } from "@/lib/format";
import type { Recipe } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** Open card (§4.18): the grid gutter is the edge. 4:5 photograph (`large`: 3:2) in a frame, season chip, display title, meta rule. */
export async function RecipeCard({ r, locale, className, large }: { r: Recipe; locale: string; className?: string; large?: boolean }) {
  const t = await getTranslations("common");
  return (
    <Link href={`/rezepte/${r.slug}`} className={cn("group flex h-full flex-col", className)}>
      <div className={cn("frame relative overflow-hidden bg-surface", large ? "aspect-[3/2]" : "aspect-[4/5]")}>
        <SmartImage src={r.image.src} alt={tx(r.image.alt, locale)} blur={getBlur(r.image.src)} fill sizes={large ? "(max-width:1024px) 100vw, 60vw" : "(max-width: 640px) 100vw, 33vw"} className="img-zoom img-grade object-cover" />
        <span className="on-paper absolute left-3 top-3 inline-flex h-6 items-center rounded-[2px] border border-line bg-paper/92 px-1.5 text-[12px] font-semibold text-ink backdrop-blur-[2px]">{t(`season.${r.season}`)}</span>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <h3 className="display text-[22px] text-ink decoration-red decoration-2 underline-offset-[6px] group-hover:underline">{tx(r.title, locale)}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{tx(r.teaser, locale)}</p>
        <div className="num rule mt-auto flex items-center gap-4 pt-3 text-[12px] font-medium text-ink-muted">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden /> {t("minutes", { n: r.time })}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden /> <span className="sr-only">{t("servings", { n: r.servings })}</span><span aria-hidden>{r.servings}</span></span>
          <span className="ml-auto text-ink" aria-label={t("rating", { rating: r.rating })}>★ {formatNumber(r.rating, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
      </div>
    </Link>
  );
}
