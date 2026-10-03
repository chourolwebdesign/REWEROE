import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export async function ArticleCard({ a, locale, className, feature }: { a: Article; locale: string; className?: string; feature?: boolean }) {
  const t = await getTranslations("magazine");
  return (
    <Link href={`/magazin/${a.slug}`} className={cn("group flex flex-col overflow-hidden rounded-[12px] bg-card card-hover", feature && "md:grid md:grid-cols-[1.4fr_1fr]", className)}>
      <div className={cn("relative overflow-hidden bg-surface-2", feature ? "aspect-[16/9] md:aspect-auto md:min-h-[420px]" : "aspect-[16/10]")}>
        <SmartImage src={a.cover.src} alt={tx(a.cover.alt, locale)} blur={getBlur(a.cover.src)} fill sizes={feature ? "(max-width:768px) 100vw, 60vw" : "(max-width:768px) 100vw, 33vw"} className="img-zoom object-cover" />
      </div>
      <div className={cn("flex flex-1 flex-col p-5", feature && "md:p-10")}>
        <p className="eyebrow mb-3">{t(`category.${a.category}`)} · {t("readTime", { n: a.readMinutes })}</p>
        <h3 className={cn("text-forest dark:text-cream", feature && "text-[clamp(1.75rem,2.5vw,2.5rem)]")}>{tx(a.title, locale)}</h3>
        <p className={cn("mt-3 text-sm text-ink-muted", feature ? "line-clamp-4 text-base" : "line-clamp-3")}>{tx(a.excerpt, locale)}</p>
        <p className="mono mt-auto pt-4 text-[11px] uppercase tracking-wider text-ink-muted">{formatDate(a.publishedAt, locale)}</p>
      </div>
    </Link>
  );
}
