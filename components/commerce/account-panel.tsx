"use client";
import { useState } from "react";
import { useStoredJson } from "@/lib/hooks";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePrefs } from "@/lib/store/prefs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "./product-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Cta } from "@/components/brand/cta";
import { formatPrice } from "@/lib/format";
import type { CardProduct } from "@/lib/view-models";

export function AccountPanel({ products, welcomePoints }: { products: CardProduct[]; welcomePoints: number }) {
  const t = useTranslations("account");
  const locale = useLocale();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") ?? "overview");
  const favorites = usePrefs((s) => s.favorites);
  const list = usePrefs((s) => s.shoppingList);
  const addItem = usePrefs((s) => s.addListItem);
  const toggleItem = usePrefs((s) => s.toggleListItem);
  const removeItem = usePrefs((s) => s.removeListItem);
  const [text, setText] = useState("");
  const stored = useStoredJson<{ name: string }>("local", "rewe-rh-user");
  const [loggedOut, setLoggedOut] = useState(false);
  const user = loggedOut ? null : stored;
  const favProducts = products.filter((p) => favorites.includes(p.slug));
  const tabs = ["overview", "orders", "addresses", "list", "favorites", "bonus"] as const;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t("eyebrow")}</p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] text-forest dark:text-cream">{user ? t("titleNamed", { name: user.name }) : t("title")}</h1>
          <p className="mt-3 text-ink-muted">{t("intro")}</p>
        </div>
        {user ? <button type="button" onClick={() => { localStorage.removeItem("rewe-rh-user"); setLoggedOut(true); }} className="mono text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("logout")}</button> : <Cta href="/login" variant="secondary" size="sm">{t("login")}</Cta>}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-10">
        <TabsList className="hide-scrollbar flex w-full justify-start overflow-x-auto">{tabs.map((k) => <TabsTrigger key={k} value={k} className="shrink-0">{t(`tabs.${k}`)}</TabsTrigger>)}</TabsList>

        <TabsContent value="overview" className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label={t("tabs.favorites")} value={String(favorites.length)} icon={<Heart className="h-4 w-4" />} />
          <Stat label={t("tabs.list")} value={String(list.filter((i) => !i.done).length)} />
          <Stat label={t("bonusPoints")} value={String(welcomePoints)} />
        </TabsContent>
        <TabsContent value="orders" className="mt-8"><Empty text={t("noOrders")} /></TabsContent>
        <TabsContent value="addresses" className="mt-8"><Empty text={t("noAddresses")} /><Cta className="mt-4" variant="secondary" size="sm" href="/checkout">{t("addAddress")}</Cta></TabsContent>
        <TabsContent value="list" className="mt-8">
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addItem(text.trim()); setText(""); } }} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("listPlaceholder")} className="h-11 flex-1 rounded-[10px] border border-line bg-surface px-4 outline-none focus:border-gold" aria-label={t("tabs.list")} />
            <Cta type="submit" arrow={false} size="sm">{t("listAdd")}</Cta>
          </form>
          {list.length === 0 ? <Empty text={t("listEmpty")} className="mt-6" /> : (
            <ul className="mt-6 divide-y divide-line rounded-[12px] border border-line bg-card">
              {list.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <Checkbox id={`li-${i.id}`} checked={i.done} onCheckedChange={() => toggleItem(i.id)} />
                  <label htmlFor={`li-${i.id}`} className={i.done ? "flex-1 line-through opacity-50" : "flex-1"}>{i.text}</label>
                  <button type="button" onClick={() => removeItem(i.id)} aria-label="Entfernen" className="text-ink-muted hover:text-price"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="favorites" className="mt-8">
          {favProducts.length === 0 ? <Empty text={t("noFavorites")} /> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{favProducts.map((p) => <ProductCard key={p.slug} p={p} />)}</div>}
        </TabsContent>
        <TabsContent value="bonus" className="mt-8 grid gap-4 md:grid-cols-2">
          <Stat label={t("bonusPoints")} value={String(welcomePoints)} />
          <Stat label={t("bonusValue")} value={formatPrice(welcomePoints / 100, locale)} />
          <Link href="/bonus" className="mono text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">Bonus & PAYBACK →</Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-[12px] border border-line bg-card p-6"><p className="eyebrow flex items-center gap-2">{icon}{label}</p><p className="mono mt-3 text-4xl text-forest dark:text-cream">{value}</p></div>;
}
function Empty({ text, className }: { text: string; className?: string }) {
  return <p className={`rounded-[12px] border border-dashed border-line p-10 text-center text-ink-muted ${className ?? ""}`}>{text}</p>;
}
