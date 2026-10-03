"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, m } from "framer-motion";
import { Store, Truck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cta } from "@/components/brand/cta";
import { formatPrice, formatWeight } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface Slot { id: string; day: "today" | "tomorrow"; from: string; to: string; price: number }
interface Props { slots: Slot[]; deliveryFee: number; freeFrom: number; pickup: boolean }
const payments = ["klarna", "paypal", "giropay", "card"] as const;
const makeOrderId = () => `RH-${Date.now().toString().slice(-6)}`;

export function CheckoutFlow({ slots, freeFrom, pickup }: Props) {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const tco = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ firstName: "", lastName: "", street: "", zip: "", city: "Frankfurt am Main", phone: "" });
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [slot, setSlot] = useState<string>(slots[0]?.id ?? "");
  const [pay, setPay] = useState<string>("klarna");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { subtotal, pfand, weightGrams } = cartTotals(lines);
  const chosen = slots.find((s) => s.id === slot);
  const shipping = mode === "pickup" ? 0 : subtotal >= freeFrom ? 0 : (chosen?.price ?? 0);
  const total = subtotal + pfand + shipping;
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      (["firstName", "lastName", "street", "city"] as const).forEach((k) => { if (!addr[k].trim()) e[k] = t("errorRequired"); });
      if (!/^\d{5}$/.test(addr.zip)) e.zip = t("errorZip");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => { if (!validate()) return; if (step < 3) setStep(step + 1); else { const id = makeOrderId(); try { sessionStorage.setItem("rewe-rh-order", JSON.stringify({ id, name: addr.firstName, slot: mode === "pickup" ? t("slotPickup") : chosen ? `${tco(chosen.day)} ${chosen.from}–${chosen.to}` : "", total })); } catch {} clear(); router.push("/checkout/bestaetigung"); } };

  if (lines.length === 0) return <div className="rounded-[16px] border border-dashed border-line p-16 text-center"><p className="serif text-3xl">{tc("empty")}</p><Cta href="/kategorien" className="mt-8">{tc("emptyCta")}</Cta></div>;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className="rounded-[16px] border border-line bg-card p-6 md:p-10">
        <ol className="mb-10 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s}><div className="h-1 overflow-hidden rounded-full bg-forest/10 dark:bg-cream/10"><m.div className="h-full bg-rewe" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} /></div><p className={cn("mono mt-2 text-[10px] uppercase tracking-wider", i === step ? "text-forest dark:text-cream" : "text-ink-muted")}>{s}</p></li>
          ))}
        </ol>
        <AnimatePresence mode="wait">
          <m.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }} className="space-y-5">
            {step === 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                <F id="firstName" label={t("firstName")} err={errors.firstName}><Input id="firstName" autoComplete="given-name" value={addr.firstName} onChange={(e) => setAddr({ ...addr, firstName: e.target.value })} aria-invalid={!!errors.firstName} className="h-11" /></F>
                <F id="lastName" label={t("lastName")} err={errors.lastName}><Input id="lastName" autoComplete="family-name" value={addr.lastName} onChange={(e) => setAddr({ ...addr, lastName: e.target.value })} aria-invalid={!!errors.lastName} className="h-11" /></F>
                <F id="street" label={t("street")} err={errors.street} className="md:col-span-2"><Input id="street" autoComplete="street-address" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} aria-invalid={!!errors.street} className="h-11" /></F>
                <F id="zip" label={t("zip")} err={errors.zip}><Input id="zip" inputMode="numeric" autoComplete="postal-code" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} aria-invalid={!!errors.zip} className="h-11" /></F>
                <F id="city" label={t("city")} err={errors.city}><Input id="city" autoComplete="address-level2" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} aria-invalid={!!errors.city} className="h-11" /></F>
                <F id="phone" label={t("phone")} className="md:col-span-2"><Input id="phone" type="tel" autoComplete="tel" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} className="h-11" /></F>
              </div>
            )}
            {step === 1 && (
              <div>
                <p className="serif mb-5 text-xl">{t("slotTitle")}</p>
                <div className="mb-5 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setMode("delivery")} aria-pressed={mode === "delivery"} className={cn("flex items-center gap-2 rounded-[10px] border px-4 py-3 text-sm", mode === "delivery" ? "border-forest bg-forest text-cream" : "border-line")}><Truck className="h-4 w-4" /> {tc("modeDelivery")}</button>
                  {pickup && <button type="button" onClick={() => setMode("pickup")} aria-pressed={mode === "pickup"} className={cn("flex items-center gap-2 rounded-[10px] border px-4 py-3 text-sm", mode === "pickup" ? "border-forest bg-forest text-cream" : "border-line")}><Store className="h-4 w-4" /> {tc("modePickup")}</button>}
                </div>
                {mode === "delivery" ? (
                  <RadioGroup value={slot} onValueChange={setSlot} className="grid gap-2 sm:grid-cols-2">
                    {slots.map((s) => (
                      <label key={s.id} htmlFor={s.id} className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 transition-colors", slot === s.id ? "border-gold bg-gold/10" : "border-line hover:bg-forest/5")}>
                        <RadioGroupItem id={s.id} value={s.id} />
                        <span className="flex-1"><span className="mono block text-sm">{tco(s.day)} · {s.from}–{s.to}</span><span className="mono text-[11px] text-ink-muted">{subtotal >= freeFrom ? tc("deliveryFree") : formatPrice(s.price, locale)}</span></span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : <p className="rounded-[10px] border border-line p-4 text-sm">{t("slotPickup")} — {tco("tomorrow")} 10:00–20:00</p>}
              </div>
            )}
            {step === 2 && (
              <RadioGroup value={pay} onValueChange={setPay} className="grid gap-2 sm:grid-cols-2" aria-label={t("payment")}>
                {payments.map((p) => (
                  <label key={p} htmlFor={`pay-${p}`} className={cn("flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-4 transition-colors", pay === p ? "border-gold bg-gold/10" : "border-line hover:bg-forest/5")}>
                    <RadioGroupItem id={`pay-${p}`} value={p} /><span className="mono text-sm font-semibold">{t(`pay${p[0].toUpperCase()}${p.slice(1)}` as "payKlarna")}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
            {step === 3 && (
              <div className="space-y-4 text-sm">
                <p className="serif text-xl">{t("summary")}</p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div><dt className="eyebrow">{t("step1")}</dt><dd className="mt-1">{addr.firstName} {addr.lastName}<br />{addr.street}<br />{addr.zip} {addr.city}</dd></div>
                  <div><dt className="eyebrow">{t("step2")}</dt><dd className="mt-1">{mode === "pickup" ? t("slotPickup") : chosen ? `${tco(chosen.day)} ${chosen.from}–${chosen.to}` : "—"}</dd></div>
                  <div><dt className="eyebrow">{t("step3")}</dt><dd className="mt-1 capitalize">{pay}</dd></div>
                </dl>
                <p className="text-xs text-ink-muted">{t("legalHint")} · {t("demoNote")}</p>
              </div>
            )}
          </m.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-between">
          <Cta type="button" variant="ghost" arrow={false} onClick={() => setStep(Math.max(0, step - 1))} className={cn(step === 0 && "invisible")}>{t("prev")}</Cta>
          <Cta type="submit">{step < 3 ? t("next") : t("placeOrder")}</Cta>
        </div>
      </form>

      <aside className="h-fit rounded-[16px] border border-line bg-card p-6 lg:sticky lg:top-24">
        <p className="eyebrow mb-4">{t("summary")}</p>
        <ul className="mono max-h-64 space-y-2 overflow-y-auto text-sm">{lines.map((l) => <li key={l.slug} className="flex justify-between gap-3"><span className="truncate">{l.qty}× {l.name}</span><span>{formatPrice(l.qty * l.price, locale)}</span></li>)}</ul>
        <dl className="mono mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("subtotal")}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("pfandLine")}</dt><dd className="text-emerald">{formatPrice(pfand, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("weightLine")}</dt><dd>{formatWeight(weightGrams, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{mode === "pickup" ? tc("pickup") : tc("delivery")}</dt><dd>{shipping === 0 ? tc("deliveryFree") : formatPrice(shipping, locale)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>{tc("total")}</dt><dd className="text-price">{formatPrice(total, locale)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
function F({ id, label, err, className, children }: { id: string; label: string; err?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label htmlFor={id} className="mb-2 block text-sm">{label}</Label>{children}<p className="mono mt-1 min-h-4 text-[11px] text-price" aria-live="polite">{err}</p></div>;
}
