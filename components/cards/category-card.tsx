import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { tx } from "@/lib/l10n";
import type { Category } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ c, locale, index, className }: { c: Category; locale: string; index: number; className?: string }) {
  return (
    <Link href={`/kategorien/${c.slug}`} className={cn("group relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-forest card-hover", className)}>
      <SmartImage src={c.image.src} alt={tx(c.image.alt, locale)} blur={getBlur(c.image.src)} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="img-zoom object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent transition-opacity duration-700 group-hover:from-forest/95" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
        <p className="eyebrow mb-2">— 0{index + 1}</p>
        <h3 className="text-cream">{tx(c.name, locale)}</h3>
        <p className="mt-1 max-h-0 overflow-hidden text-sm text-cream/75 opacity-0 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:max-h-16 group-hover:opacity-100">{tx(c.teaser, locale)}</p>
      </div>
      <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur transition-all duration-500 group-hover:bg-rewe group-hover:text-forest"><ArrowUpRight className="h-4 w-4" /></span>
    </Link>
  );
}
