import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Newspaper card (§4.19): 3:2 photograph in a frame (`feature`: 16:9 beside the text, a vertical hairline between the
 * halves), text block opened by a 2 px column rule, eyebrow „Saison · 6 Min. Lesezeit", display title, excerpt, date.
 */
export async function ArticleCard({ a, locale, className, feature }: { a: Article; locale: string; className?: string; feature?: boolean }) {
  const t = await getTranslations("magazine");
  return (
    <Link href={`/magazin/${a.slug}`} className={cn("group flex h-full flex-col", feature && "md:grid md:grid-cols-[1.4fr_1fr]", className)}>
      <div className={cn("frame relative overflow-hidden bg-surface", feature ? "aspect-[16/9] md:aspect-auto md:min-h-[420px]" : "aspect-[3/2]")}>
        <SmartImage src={a.cover.src} alt={tx(a.cover.alt, locale)} blur={getBlur(a.cover.src)} fill sizes={feature ? "(max-width:768px) 100vw, 60vw" : "(max-width:768px) 100vw, 33vw"} className="img-zoom img-grade object-cover" />
      </div>
      <div className={cn("rule-strong mt-4 flex flex-1 flex-col pt-4", feature && "md:ml-6 md:mt-0 md:border-l md:border-l-line md:pl-6")}>
        <p className="eyebrow">{t(`category.${a.category}`)} · {t("readTime", { n: a.readMinutes })}</p>
        <h3 className={cn("display mt-3 text-ink decoration-red decoration-2 underline-offset-[6px] group-hover:underline", feature ? "text-[clamp(1.75rem,2.5vw,2.5rem)]" : "text-[22px]")}>{tx(a.title, locale)}</h3>
        <p className={cn("mt-3 text-ink-2", feature ? "line-clamp-4 text-[17px] leading-relaxed" : "line-clamp-3 text-[15px] leading-relaxed")}>{tx(a.excerpt, locale)}</p>
        <p className="num mt-auto pt-4 text-[12px] text-ink-muted">{formatDate(a.publishedAt, locale)}</p>
      </div>
    </Link>
  );
}
