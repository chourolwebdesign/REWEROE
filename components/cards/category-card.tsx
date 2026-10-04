import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import type { Category } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** Open card (§4.17): 4:5 photograph in a hairline frame, red data numeral + display title, teaser always visible. */
export function CategoryCard({ c, locale, index, className }: { c: Category; locale: string; index: number; className?: string }) {
  return (
    <Link href={`/kategorien/${c.slug}`} className={cn("group block", className)}>
      <div className="frame relative aspect-[4/5] overflow-hidden bg-surface">
        <SmartImage src={c.image.src} alt={tx(c.image.alt, locale)} blur={getBlur(c.image.src)} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="img-zoom img-grade object-cover" />
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="data text-red-text">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="display text-[20px] text-ink decoration-red decoration-2 underline-offset-[6px] group-hover:underline">{tx(c.name, locale)}</h3>
        <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 self-center text-ink transition-transform duration-[var(--dur-ui)] ease-[var(--ease-ui)] group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{tx(c.teaser, locale)}</p>
    </Link>
  );
}
