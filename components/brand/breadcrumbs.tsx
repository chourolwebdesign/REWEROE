import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items, className, inverse }: { items: { label: string; href?: string }[]; className?: string; inverse?: boolean }) {
  const base = getSettings().brand.siteUrl;
  const ld = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: `${base}${it.href}` } : {}) })),
  };
  return (
    <nav aria-label="Breadcrumb" className={cn("mono text-[11px] uppercase tracking-[0.16em]", inverse ? "text-cream/60" : "text-ink-muted", className)}>
      <JsonLd data={ld} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {it.href ? <Link href={it.href as any} className="hover:underline underline-offset-4">{it.label}</Link> : <span aria-current="page" className={inverse ? "text-cream" : "text-forest dark:text-cream"}>{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
