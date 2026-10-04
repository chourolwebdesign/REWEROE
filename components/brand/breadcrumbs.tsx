import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("common");
  const locale = useLocale();
  // `localePrefix: "as-needed"` — only the non-default locale carries a prefix in public URLs (`/en`, `/en/rezepte`, never `/en/`).
  const prefix = locale === "en" ? "/en" : "";
  const abs = (href: string) => `${getSettings().brand.siteUrl}${prefix}${prefix && href === "/" ? "" : href}`;
  const ld = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: abs(it.href) } : {}) })),
  };
  return (
    <nav aria-label={t("breadcrumb")} className={cn("num text-[12px] font-medium", inverse ? "text-ink/70" : "text-ink-muted", className)}>
      <JsonLd data={ld} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className="inline-flex items-center gap-x-2">
            {it.href ? (
              <Link href={it.href} className="-my-2.5 inline-flex min-h-11 items-center underline-offset-4 hover:underline">{it.label}</Link>
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
