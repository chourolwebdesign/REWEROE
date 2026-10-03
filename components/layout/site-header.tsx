"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, ChevronDown, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { SmartImage } from "@/components/ui/smart-image";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { tx } from "@/lib/l10n";
import type { Category } from "@/lib/content/types";

export interface NavCategory { slug: string; name: Category["name"]; teaser: Category["teaser"]; image: string; blur?: string }

interface Props { categories: NavCategory[]; merchant: string; logoSrc: string | null }

const primary = [
  { key: "categories", href: "/kategorien", mega: true },
  { key: "recipes", href: "/rezepte" },
  { key: "offers", href: "/angebote" },
  { key: "stores", href: "/filialen" },
  { key: "magazine", href: "/magazin" },
] as const;

const more = [
  { key: "about", href: "/ueber-uns" },
  { key: "sustainability", href: "/nachhaltigkeit" },
  { key: "bonus", href: "/bonus" },
  { key: "career", href: "/karriere" },
  { key: "contact", href: "/kontakt" },
] as const;

export function SiteHeader({ categories, merchant, logoSrc }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<null | "categories" | "more">(null);
  const lines = useCart((s) => s.lines);
  const lastAdded = useCart((s) => s.lastAdded);
  const favorites = usePrefs((s) => s.favorites);
  const { setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useUi();
  const { count } = cartTotals(lines);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  void pathname;
  const closeAll = () => { setMega(null); setMenuOpen(false); };
  const inverse = false; // colour inversion over dark heroes is CSS-driven (see .site-header in globals.css)
  const textCls = "text-[color:var(--hdr-fg)]";

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-rewe focus:px-4 focus:py-2 focus:text-forest">
        {t("skip")}
      </a>
      <header
        data-site-header
        data-scrolled={scrolled}
        data-mega={Boolean(mega)}
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,color] duration-500",
          scrolled || mega ? "glass border-b border-gold/50 shadow-[0_1px_0_0_rgba(201,162,39,.15)]" : "border-b border-transparent",
        )}
        onMouseLeave={() => setMega(null)}
      >
        <div className={cn("container-x flex h-[72px] items-center justify-between gap-6", textCls)}>
          <Logo inverse={inverse} merchant={merchant} logoSrc={logoSrc} />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
            {primary.map((item) => (
              <div key={item.key} className="relative" onMouseEnter={() => setMega("mega" in item && item.mega ? "categories" : null)}>
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-medium transition-colors hover:bg-current/10")}
                  aria-haspopup={"mega" in item ? "true" : undefined}
                  aria-expanded={"mega" in item ? mega === "categories" : undefined}
                  onFocus={() => "mega" in item && setMega("categories")}
                >
                  {t(item.key)}
                  {"mega" in item && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mega === "categories" && "rotate-180")} aria-hidden />}
                </Link>
              </div>
            ))}
            <div className="relative" onMouseEnter={() => setMega("more")}>
              <button
                type="button"
                className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-medium transition-colors hover:bg-current/10")}
                aria-haspopup="true"
                aria-expanded={mega === "more"}
                onClick={() => setMega(mega === "more" ? null : "more")}
              >
                {t("about")} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mega === "more" && "rotate-180")} aria-hidden />
              </button>
            </div>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LangSwitch />
            <IconButton label={t("search")} onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </IconButton>
            <Link href={{ pathname: "/konto", query: { tab: "favorites" } }} className={iconBtn()} aria-label={t("favorites")}>
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && <Dot n={favorites.length} />}
            </Link>
            <IconButton label={t("openCart")} onClick={() => setCartOpen(true)}>
              <motion.span key={lastAdded} animate={lastAdded ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 6, 0] } : undefined} transition={{ type: "spring", stiffness: 500, damping: 18 }} className="inline-flex">
                <ShoppingBag className="h-5 w-5" />
              </motion.span>
              <AnimatePresence>{count > 0 && <Dot n={count} key="cart-dot" />}</AnimatePresence>
            </IconButton>
            <IconButton label={t("menu")} onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Mega panels */}
        <AnimatePresence>
          {mega === "categories" && (
            <motion.div
              key="mega-cat"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass hidden border-t border-line/60 lg:block"
            >
              <div className="container-x grid grid-cols-6 gap-4 py-6">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/kategorien/${c.slug}`} onClick={closeAll} className="group rounded-[12px] p-2 transition-colors hover:bg-current/10">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]">
                      <SmartImage src={c.image} alt={tx(c.name, locale)} blur={c.blur} fill sizes="200px" className="img-zoom object-cover" />
                    </div>
                    <p className="mt-3 font-medium">{tx(c.name, locale)}</p>
                    <p className="text-xs text-ink-muted">{tx(c.teaser, locale)}</p>
                  </Link>
                ))}
              </div>
              <div className="container-x flex items-center justify-between border-t border-line/60 py-3">
                <span className="eyebrow">{t("megaDiscover")}</span>
                <Link href="/kategorien" onClick={closeAll} className="mono text-xs uppercase tracking-widest underline-offset-4 hover:underline">{t("allCategories")} →</Link>
              </div>
            </motion.div>
          )}
          {mega === "more" && (
            <motion.div key="mega-more" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="glass hidden border-t border-line/60 lg:block">
              <div className="container-x grid grid-cols-5 gap-2 py-5">
                {more.map((m) => (
                  <Link key={m.key} href={m.href} onClick={closeAll} className="rounded-[10px] px-4 py-3 text-[15px] font-medium transition-colors hover:bg-current/10">
                    {t(m.key)}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile full-screen menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full border-0 bg-forest p-0 text-cream sm:max-w-full [&>button]:hidden">
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-[72px] items-center justify-between px-5">
              <Logo inverse merchant={merchant} logoSrc={logoSrc} />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={t("close")} className="rounded-full p-2 hover:bg-cream/10"><X className="h-6 w-6" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 pb-10 pt-4" aria-label="Mobile Navigation">
              <ul className="space-y-1">
                {[...primary, ...more].map((item, i) => (
                  <motion.li key={item.key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Link href={item.href} onClick={closeAll} className="serif block border-b border-cream/10 py-4 text-[2rem] leading-none tracking-tight hover:text-rewe">
                      {t(item.key)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/konto" onClick={closeAll} className="rounded-full border border-cream/30 px-4 py-2 text-sm hover:bg-cream/10">{t("account")}</Link>
                <Link href="/warenkorb" onClick={closeAll} className="rounded-full border border-cream/30 px-4 py-2 text-sm hover:bg-cream/10">{t("cart")} {count > 0 && `(${count})`}</Link>
                <LangSwitch className="ml-auto [--hdr-fg:var(--surface-cream)] [--hdr-bg:var(--brand-forest)]" />
              </div>
            </nav>
            <p className="eyebrow px-5 pb-6 text-cream/50">Wir lieben Lebensmittel.</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function iconBtn() {
  return cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-current/10");
}

function IconButton({ children, label, onClick, className }: { children: React.ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(iconBtn(), className)}>
      {children}
    </button>
  );
}

function Dot({ n }: { n: number }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      className="mono absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rewe px-1 text-[10px] font-semibold text-forest"
    >
      {n}
    </motion.span>
  );
}

function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <div className={cn("mono inline-flex items-center rounded-full border border-current/30 px-1 text-[11px] uppercase tracking-wider", className)} aria-label={t("language")}>
      {(["de", "en"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          hrefLang={l}
          className={cn("rounded-full px-2 py-1 transition-colors", locale === l ? "bg-[color:var(--hdr-fg)] text-[color:var(--hdr-bg)]" : "opacity-70 hover:opacity-100")}
          aria-current={locale === l ? "true" : undefined}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
