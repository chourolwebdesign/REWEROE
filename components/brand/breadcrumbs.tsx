import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/lib/content";
import { cn } from "@/lib/utils";

interface Props {
  items: { label: string; href?: string }[];
  className?: string;
  /** For the three editorial heroes (Magazin article, Rezept detail, 404) that sit on a photo + scrim. */
  inverse?: boolean;
}

/** Figtree 500 12 px, tabular; `/` separators in `line-input` grey; current page in ink. Tokens flip inside `.on-block`. */
export function Breadcrumbs({ items, className, inverse }: Props) {
  const base = getSettings().brand.siteUrl;
  const ld = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: `${base}${it.href}` } : {}) })),
  };
  return (
    <nav aria-label="Breadcrumb" className={cn("num text-[12px] font-medium", inverse ? "text-ink/70" : "text-ink-muted", className)}>
      <JsonLd data={ld} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className="inline-flex items-center gap-x-2">
            {it.href ? (
              <Link href={it.href} className="inline-flex min-h-6 items-center underline-offset-4 hover:underline">{it.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{it.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden className="text-line-input">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
