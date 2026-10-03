"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useUi } from "@/lib/store/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { tx } from "@/lib/l10n";
import type { L10n } from "@/lib/l10n";

export interface SearchEntry { type: "product" | "recipe" | "article"; slug: string; title: L10n; sub?: L10n; image: string; keywords?: string }

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

  const hrefFor = (e: SearchEntry) => (e.type === "product" ? `/produkt/${e.slug}` : e.type === "recipe" ? `/rezepte/${e.slug}` : `/magazin/${e.slug}`);

  return (
    <Dialog open={searchOpen} onOpenChange={(v) => { setSearchOpen(v); if (!v) setQ(""); }}>
      <DialogContent className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{ts("title")}</DialogTitle>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="h-5 w-5 text-ink-muted" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-14 w-full bg-transparent text-lg outline-none placeholder:text-ink-muted"
            aria-label={ts("title")}
          />
          <kbd className="mono hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-ink-muted sm:block">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">{ts("empty")}<br /><span className="mono text-[11px]">{t("searchHint")}</span></p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">{t("noResults")}</p>
          ) : (
            <ul>
              {results.map((e) => (
                <li key={`${e.type}-${e.slug}`}>
                  <Link href={hrefFor(e)} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition-colors hover:bg-forest/5">
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[6px] bg-surface-2"><SmartImage src={e.image} alt="" fill sizes="40px" className="object-cover" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{tx(e.title, locale)}</span>
                      {e.sub && <span className="block truncate text-xs text-ink-muted">{tx(e.sub, locale)}</span>}
                    </span>
                    <span className="eyebrow text-[10px]">{ts(e.type === "product" ? "products" : e.type === "recipe" ? "recipes" : "articles")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
