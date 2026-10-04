"use client";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, ChevronDown, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { tx } from "@/lib/l10n";
import { formatOpenState, openState, type Hours, type HoursStatus } from "@/lib/hours";
import { Logo } from "@/components/brand/logo";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { StoreChip } from "@/components/signature/store-chip";
import { SmartImage } from "@/components/ui/smart-image";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Category, Store } from "@/lib/content/types";

export interface NavCategory { slug: string; name: Category["name"]; teaser: Category["teaser"]; image: string; blur?: string }
/** Store facts the header needs for the live chip and the mobile sheet's address/hours line. */
export interface NavStore { slug: string; hours: Hours; hoursStatus: HoursStatus; address: Store["address"] }

interface Props { categories: NavCategory[]; merchant: string; logoSrc: string | null; store: NavStore }

/** Order per REGIONAL-BIO brief: Sortiment ▾ · Regional · Bio · Angebote · Rezepte · Unser Markt · Magazin · Mehr ▾ */
const primary = [
  { key: "categories", href: "/kategorien", mega: true },
  { key: "regional", href: "/regional" },
  { key: "bio", href: "/bio" },
  { key: "offers", href: "/angebote" },
  { key: "recipes", href: "/rezepte" },
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const UNDERLINE = "shadow-[inset_0_-2px_0_0_var(--red)]";
// Written out literally so Tailwind's scanner sees the hover variant.
const UNDERLINE_HOVER = "hover:shadow-[inset_0_-2px_0_0_var(--red)]";
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Active-route rule: exact match or a child route; product pages light up „Sortiment". */
function routeActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  return href === "/kategorien" && pathname.startsWith("/produkt");
}

export function SiteHeader({ categories, merchant, logoSrc, store }: Props) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const tc = useTranslations("common");
  const tcart = useTranslations("cart");
  const locale = useLocale();
  const pathname = usePathname();
  // The open panel is keyed to the route it was opened on, so a navigation closes it without an effect.
  const [megaState, setMegaState] = useState<{ panel: "categories" | "more"; path: string } | null>(null);
  const mega = megaState && megaState.path === pathname ? megaState.panel : null;
  const setMega = (panel: null | "categories" | "more") => setMegaState(panel ? { panel, path: pathname } : null);
  const catTrigger = useRef<HTMLAnchorElement>(null);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const lines = useCart((s) => s.lines);
  const lastAdded = useCart((s) => s.lastAdded);
  const favorites = usePrefs((s) => s.favorites);
  const { setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useUi();
  const { count } = cartTotals(lines);

  const closeAll = () => { setMega(null); setMenuOpen(false); };
  const moreActive = more.some((item) => routeActive(pathname, item.href));

  const navItem = (active: boolean) =>
    cn(
      "inline-flex h-11 items-center gap-1 whitespace-nowrap px-2 text-sm font-medium text-ink transition-[box-shadow] duration-[var(--dur-ui)] ease-[var(--ease-ui)] xl:px-3 xl:text-[15px]",
      UNDERLINE_HOVER,
      active && UNDERLINE,
    );

  // Mobile sheet facts (client-only render, so no hydration concern)
  const addressLine = store.address.status === "published" && store.address.street
    ? `${store.address.street}, ${store.address.zip} ${store.address.city}`
    : tf("addressPending");
  const hoursLine = formatOpenState(openState(store.hours, store.hoursStatus), tc).text;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[2px] focus:bg-red focus:px-4 focus:py-2 focus:text-white">
        {t("skip")}
      </a>
      <header
        data-site-header
        data-mega={Boolean(mega)}
        className="site-header sticky top-0 z-50 border-b border-line bg-paper"
        onMouseLeave={() => setMega(null)}
        onKeyDown={(e) => {
          if (e.key !== "Escape" || !mega) return;
          (mega === "categories" ? catTrigger : moreTrigger).current?.focus();
          setMega(null);
        }}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setMega(null); }}
      >
        <div className="container-x grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 md:h-16 xl:gap-x-6">
          {/* Merchant line hides between lg and xl so logo + 8 nav items + icon cluster fit at 1024 px. */}
          <Logo merchant={merchant} logoSrc={logoSrc} className="lg:max-xl:[&>span]:hidden" />

          {/* Desktop nav. The panels live inside their trigger's wrapper (absolute to the sticky header) so they follow the trigger in tab order. */}
          <nav className="hidden min-w-0 items-center justify-center lg:flex" aria-label={t("menu")}>
            {primary.map((item) => {
              const active = routeActive(pathname, item.href);
              const isMega = "mega" in item;
              return (
                <div key={item.key} onMouseEnter={() => setMega(isMega ? "categories" : null)}>
                  <Link
                    ref={isMega ? catTrigger : undefined}
                    href={item.href}
                    onClick={closeAll}
                    className={navItem(active)}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={isMega ? mega === "categories" : undefined}
                    aria-controls={isMega ? "mega-categories" : undefined}
                    onKeyDown={isMega ? (e) => {
                      // Enter follows the link; Space toggles the panel; ArrowDown opens it and moves focus to the first tile.
                      if (e.key === " ") { e.preventDefault(); setMega(mega === "categories" ? null : "categories"); }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setMega("categories");
                        requestAnimationFrame(() => document.getElementById("mega-categories")?.querySelector<HTMLElement>("a")?.focus());
                      }
                    } : undefined}
                  >
                    {t(item.key)}
                    {isMega && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-[var(--dur-ui)]", mega === "categories" && "rotate-180")} strokeWidth={1.75} aria-hidden />}
                  </Link>
                  {isMega && (
                    <AnimatePresence>
                      {mega === "categories" && (
                        <m.div
                          key="mega-cat"
                          id="mega-categories"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } }}
                          exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE } }}
                          className="absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-pop lg:block"
                        >
                          <div className="container-x py-8">
                            <div className="grid grid-cols-12 gap-x-6">
                              {categories.slice(0, 6).map((c, i) => (
                                <Link key={c.slug} href={`/kategorien/${c.slug}`} onClick={closeAll} className="group col-span-2">
                                  <div className="frame relative aspect-[4/5] overflow-hidden bg-surface">
                                    <SmartImage src={c.image} alt={tx(c.name, locale)} blur={c.blur} fill sizes="200px" className="img-zoom img-grade object-cover" />
                                  </div>
                                  <p className="data mt-3 text-red-text" aria-hidden>{pad2(i + 1)}</p>
                                  <p className="mt-1 text-[15px] font-semibold text-ink decoration-red decoration-2 underline-offset-4 group-hover:underline">{tx(c.name, locale)}</p>
                                  <p className="mt-0.5 text-xs text-ink-muted">{tx(c.teaser, locale)}</p>
                                </Link>
                              ))}
                            </div>
                            <div className="rule mt-6 flex items-center justify-between gap-6 pt-4">
                              <div className="flex items-center gap-5">
                                <span className="eyebrow">{t("brandWorlds")}</span>
                                <Link href="/regional" onClick={closeAll} className="inline-flex min-h-11 items-center" aria-label={`REWE ${t("regional")}`}>
                                  <BrandLockup sub="regional" size="sm" />
                                </Link>
                                <Link href="/bio" onClick={closeAll} className="inline-flex min-h-11 items-center" aria-label={`REWE ${t("bio")}`}>
                                  <BrandLockup sub="bio" size="sm" />
                                </Link>
                              </div>
                              <Link href="/kategorien" onClick={closeAll} className="inline-flex min-h-11 items-center whitespace-nowrap text-[13px] font-semibold text-ink underline-offset-4 hover:underline">
                                {t("allCategories")} →
                              </Link>
                            </div>
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
            <div onMouseEnter={() => setMega("more")}>
              <button
                ref={moreTrigger}
                type="button"
                className={navItem(moreActive)}
                aria-expanded={mega === "more"}
                aria-controls="mega-more"
                onClick={() => setMega(mega === "more" ? null : "more")}
              >
                {t("more")} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-[var(--dur-ui)]", mega === "more" && "rotate-180")} strokeWidth={1.75} aria-hidden />
              </button>
              <AnimatePresence>
                {mega === "more" && (
                  <m.div
                    key="mega-more"
                    id="mega-more"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE } }}
                    className="absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-pop lg:block"
                  >
                    <div className="container-x py-6">
                      <ul className="grid grid-cols-5 divide-x divide-line">
                        {more.map((item) => {
                          const active = routeActive(pathname, item.href);
                          return (
                            <li key={item.key}>
                              <Link
                                href={item.href}
                                onClick={closeAll}
                                aria-current={active ? "page" : undefined}
                                className={cn("flex min-h-14 items-center px-6 py-4 text-[15px] font-medium text-ink transition-[box-shadow] duration-[var(--dur-ui)]", UNDERLINE_HOVER, active && UNDERLINE)}
                              >
                                {t(item.key)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center justify-end gap-1">
            <StoreChip hours={store.hours} hoursStatus={store.hoursStatus} storeSlug={store.slug} className="mr-2 hidden min-[1440px]:inline-flex" />
            <LangSwitch className="mr-1 hidden lg:inline-flex" />
            <IconButton label={t("search")} onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
            <Link
              href={{ pathname: "/konto", query: { tab: "favorites" } }}
              className={iconBtn}
              aria-label={favorites.length > 0 ? `${t("favorites")}, ${t("favoritesCount", { n: favorites.length })}` : t("favorites")}
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} />
              {favorites.length > 0 && <Dot n={favorites.length} />}
            </Link>
            <IconButton label={count > 0 ? `${t("openCart")}, ${tcart("items", { n: count })}` : t("openCart")} onClick={() => setCartOpen(true)}>
              <m.span key={lastAdded} animate={lastAdded ? { scale: [1, 1.12, 1] } : undefined} transition={{ duration: 0.3, ease: EASE }} className="inline-flex">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              </m.span>
              <AnimatePresence>{count > 0 && <Dot n={count} key="cart-dot" />}</AnimatePresence>
            </IconButton>
            <IconButton label={t("menu")} onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
      </header>

      {/* Mobile sheet (< lg): anthracite block, numbered display items, pinned claim + store line */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" showCloseButton={false} className="on-block w-full border-0 bg-block p-0 text-block-ink data-[side=right]:w-full data-[side=right]:sm:max-w-full">
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center justify-between px-5">
              <Logo size="sheet" merchant={merchant} logoSrc={logoSrc} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("close")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-block-line text-block-ink transition-colors duration-[var(--dur-ui)] hover:border-block-ink"
              >
                <X className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 pb-6 pt-2" aria-label={t("menu")}>
              <ol>
                {[...primary, ...more].map((item, i) => {
                  const active = routeActive(pathname, item.href);
                  return (
                    <m.li
                      key={item.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.035, duration: 0.4, ease: EASE }}
                      className="grid grid-cols-[2.5rem_1fr] items-baseline border-b border-block-line"
                    >
                      <span className="data text-block-red" aria-hidden>{pad2(i + 1)}</span>
                      <Link href={item.href} onClick={closeAll} aria-current={active ? "page" : undefined} className="display block break-words py-3 text-[clamp(1.75rem,8.5vw,2.25rem)] leading-none text-block-ink">
                        {t(item.key)}
                      </Link>
                    </m.li>
                  );
                })}
              </ol>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link href="/konto" onClick={closeAll} className={sheetBtn}>{t("account")}</Link>
                <Link href="/warenkorb" onClick={closeAll} className={sheetBtn}>{t("cart")}{count > 0 && ` (${count})`}</Link>
                <LangSwitch className="ml-auto" />
              </div>
            </nav>
            <div className="shrink-0 border-t border-block-line px-5 py-6">
              <p className="display text-2xl text-block-ink">{t("claim")}</p>
              <p className="mt-2 text-[12px] text-block-muted">{addressLine} · {hoursLine}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

const iconBtn = "relative inline-flex h-11 w-11 items-center justify-center rounded-[2px] text-ink transition-colors duration-[var(--dur-ui)] hover:bg-surface-2";
const sheetBtn = "inline-flex h-11 items-center rounded-[2px] border border-block-ink/40 px-4 text-sm text-block-ink transition-colors duration-[var(--dur-ui)] hover:border-block-ink";

function IconButton({ children, label, onClick, className }: { children: React.ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(iconBtn, className)}>
      {children}
    </button>
  );
}

/** Count dot: red fill, white numerals, no overshoot. */
function Dot({ n }: { n: number }) {
  return (
    <m.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="num absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[11px] font-bold leading-5 text-white"
    >
      {n}
    </m.span>
  );
}

/** Segmented DE / EN switch (the one allowed tracked-caps control). Tokens flip inside `.on-block`. */
function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <div className={cn("inline-flex items-stretch rounded-[2px] border border-line", className)} role="group" aria-label={t("language")}>
      {(["de", "en"] as const).map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          hrefLang={l}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[1px] px-2.5 text-[11px] font-semibold uppercase tracking-[.06em] transition-colors duration-[var(--dur-ui)]",
            locale === l ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
          )}
          aria-current={locale === l ? "true" : undefined}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
