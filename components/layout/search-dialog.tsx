"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { tx } from "@/lib/l10n";
import type { L10n } from "@/lib/l10n";

export interface SearchEntry { type: "product" | "recipe" | "article"; slug: string; title: L10n; sub?: L10n; image: string; keywords?: string }

const TYPES = ["product", "recipe", "article"] as const;
const LABEL_KEY = { product: "products", recipe: "recipes", article: "articles" } as const;

/** Command-style search (§4.25): paper sheet with a hairline frame, results grouped by type with eyebrow headers. */
export function SearchDialog({ index }: { index: SearchEntry[] }) {
  const t = useTranslations("nav");
  const ts = useTranslations("search");
  const locale = useLocale();
  const { searchOpen, setSearchOpen } = useUi();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    return index
      .filter((e) => `${tx(e.title, locale)} ${tx(e.sub, locale)} ${e.keywords ?? ""}`.toLowerCase().includes(needle))
      .slice(0, 12);
  }, [q, index, locale]);

  const groups = useMemo(() => TYPES.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter((g) => g.items.length > 0), [results]);

  const hrefFor = (e: SearchEntry) => (e.type === "product" ? `/produkt/${e.slug}` : e.type === "recipe" ? `/rezepte/${e.slug}` : `/magazin/${e.slug}`);

  return (
    <Dialog open={searchOpen} onOpenChange={(v) => { setSearchOpen(v); if (!v) setQ(""); }}>
      <DialogContent showCloseButton={false} className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-none border border-line-strong bg-paper p-0 text-ink shadow-pop ring-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{ts("title")}</DialogTitle>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-14 w-full bg-transparent text-lg text-ink outline-none placeholder:text-ink-muted"
            aria-label={ts("title")}
          />
          <kbd className="data hidden shrink-0 border border-line px-1.5 py-0.5 text-ink-muted sm:block">ESC</kbd>
          <button type="button" onClick={() => setSearchOpen(false)} aria-label={t("close")} className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] text-ink transition-colors duration-[var(--dur-ui)] hover:bg-surface-2 sm:hidden">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              {ts("empty")}
              <br />
              <span className="num mt-1 inline-block text-[12px]">{t("searchHint")}</span>
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">{t("noResults")}</p>
          ) : (
            groups.map((g) => (
              <section key={g.type} aria-labelledby={`search-group-${g.type}`}>
                <h3 id={`search-group-${g.type}`} className="eyebrow border-b border-line px-5 pb-2 pt-4">
                  {ts(LABEL_KEY[g.type])} <span className="num">· {g.items.length}</span>
                </h3>
                <ul className="divide-y divide-line">
                  {g.items.map((e) => (
                    <li key={`${e.type}-${e.slug}`}>
                      <Link href={hrefFor(e)} onClick={() => setSearchOpen(false)} className="flex min-h-14 items-center gap-3 px-5 py-2 transition-colors duration-[var(--dur-ui)] hover:bg-surface-2">
                        <span className="frame relative h-12 w-12 shrink-0 overflow-hidden bg-surface">
                          <SmartImage src={e.image} alt="" fill sizes="48px" className={cn("object-cover", e.type !== "product" && "img-grade")} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{tx(e.title, locale)}</span>
                          {e.sub && <span className="block truncate text-xs text-ink-muted">{tx(e.sub, locale)}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
