import { Clock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import type { Recipe } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export async function RecipeCard({ r, locale, className, large }: { r: Recipe; locale: string; className?: string; large?: boolean }) {
  const t = await getTranslations("common");
  return (
    <Link href={`/rezepte/${r.slug}`} className={cn("group flex flex-col overflow-hidden rounded-[12px] bg-card card-hover", className)}>
      <div className={cn("relative overflow-hidden bg-cream-2", large ? "aspect-[16/10]" : "aspect-[4/5]")}>
        <SmartImage src={r.image.src} alt={tx(r.image.alt, locale)} blur={getBlur(r.image.src)} fill sizes={large ? "(max-width:1024px) 100vw, 60vw" : "(max-width: 640px) 100vw, 33vw"} className="img-zoom object-cover" />
        <span className="mono absolute left-3 top-3 rounded-[3px] bg-cream/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-forest backdrop-blur">{t(`season.${r.season}`)}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-forest dark:text-cream">{tx(r.title, locale)}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{tx(r.teaser, locale)}</p>
        <div className="mono mt-auto flex items-center gap-4 pt-4 text-[11px] uppercase tracking-wider text-ink-muted">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("minutes", { n: r.time })}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.servings}</span>
          <span className="ml-auto text-gold">★ {r.rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
