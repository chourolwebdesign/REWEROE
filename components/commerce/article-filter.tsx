"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";

export interface ArticleLite { slug: string; category: string; featured?: boolean }

interface Props {
  /** Newest first. */
  articles: ArticleLite[];
  categories: string[];
  /** Server-rendered `<ArticleCard>` per slug (compact) and `<ArticleCard feature>` per slug. */
  cards: Record<string, React.ReactNode>;
  featureCards: Record<string, React.ReactNode>;
}

/**
 * Magazin landing layout (§4.19): category chips as `secondary sm` toggles → lead article (cols 1–8) + two stacked
 * compact cards (cols 9–12) → the rest in a 2/4-column grid with hairline rows. Cards stay server components (render-prop by slug).
 */
export function ArticleFilter({ articles, categories, cards, featureCards }: Props) {
  const t = useTranslations("magazine");
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? articles : articles.filter((a) => a.category === cat);
  const featureIdx = Math.max(0, list.findIndex((a) => a.featured));
  const feature = list[featureIdx];
  const rest = list.filter((_, i) => i !== featureIdx);
  const side = rest.slice(0, 2);
  const grid = rest.slice(2);
  const options: [string, string][] = [["all", t("allTopics")], ...categories.map((c): [string, string] => [c, t(`category.${c}`)])];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
        {options.map(([v, l]) => (
          <Cta key={v} variant="secondary" size="sm" arrow={false} type="button" aria-pressed={cat === v} onClick={() => setCat(v)} className={cn(cat === v && "border-ink bg-ink text-paper hover:bg-ink")}>
            {l}
          </Cta>
        ))}
      </div>

      {!feature ? (
        <p className="py-16 text-center text-ink-muted">{t("noMatch")}</p>
      ) : (
        <>
          <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-12">
            <div className={cn("md:col-span-12", side.length > 0 && "lg:col-span-8")}>{featureCards[feature.slug]}</div>
            {side.length > 0 && (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-12 lg:col-span-4 lg:grid-cols-1 lg:border-l lg:border-line lg:pl-6">
                {side.map((a) => <div key={a.slug}>{cards[a.slug]}</div>)}
              </div>
            )}
          </div>
          {grid.length > 0 && (
            <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
              {grid.map((a) => <div key={a.slug} className="rule pt-6">{cards[a.slug]}</div>)}
            </div>
          )}
        </>
      )}
    </>
  );
}
