"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Store, Truck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cta } from "@/components/brand/cta";
import { formatPrice, formatWeight } from "@/lib/format";
import { cn } from "@/lib/utils";
import { boxInput, choiceCard, choiceCardOn, Field, FieldError, StepTrack } from "./form-primitives";

export interface Slot { id: string; day: "today" | "tomorrow"; from: string; to: string; price: number }
interface Props {
  slots: Slot[]; deliveryFee: number; freeFrom: number; pickup: boolean;
  /** Minimum order value for delivery (settings.delivery.minOrder); Click & Collect is not bound by it. */
  minOrder: number;
  /** True once /agb and /widerruf are both published — only then may the consent sentence reference them. */
  legalReady: boolean;
}
const payments = ["klarna", "paypal", "giropay", "card"] as const;
type Payment = (typeof payments)[number];
const payKey = (p: string) => `pay${p[0].toUpperCase()}${p.slice(1)}` as "payKlarna" | "payPaypal" | "payGiropay" | "payCard";
const makeOrderId = () => `RH-${Date.now().toString().slice(-6)}`;
/** Error keys whose control id differs from the key (address fields use their own id). */
const FOCUS_TARGET: Record<string, string> = { mode: "mode-delivery", minOrder: "min-order-note" };

/**
 * Checkout (§4.27): 12-column sheet — form 8 / sticky summary 4, hairline step track, 48 px inputs, radio cards with
 * the 3 px red left rule when selected, 240 ms step slide, one primary CTA („Weiter" / „Zahlungspflichtig bestellen").
 */
export function CheckoutFlow({ slots, freeFrom, minOrder, pickup, legalReady }: Props) {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const tco = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const mounted = useMounted();
  const placed = useRef(false);
  const reduce = useReducedMotion();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ firstName: "", lastName: "", street: "", zip: "", city: "Frankfurt am Main", phone: "" });
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [slot, setSlot] = useState<string>(slots[0]?.id ?? "");
  const [pay, setPay] = useState<Payment>("klarna");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { subtotal, pfand, weightGrams } = cartTotals(lines);
  const chosen = slots.find((s) => s.id === slot);
  const shipping = mode === "pickup" ? 0 : subtotal >= freeFrom ? 0 : (chosen?.price ?? 0);
  const total = subtotal + pfand + shipping;
  const belowMin = subtotal < minOrder;
  const minFmt = formatPrice(minOrder, locale);
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const slotLabel = mode === "pickup" ? t("slotPickup") : chosen ? `${tco(chosen.day)} ${chosen.from}–${chosen.to}` : "—";
  const field = (k: keyof typeof addr) => ({ value: addr[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddr({ ...addr, [k]: e.target.value }), "aria-invalid": !!errors[k], className: boxInput });

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      (["firstName", "lastName", "street", "city"] as const).forEach((k) => { if (!addr[k].trim()) e[k] = t("errorRequired"); });
      if (!/^\d{5}$/.test(addr.zip)) e.zip = t("errorZip");
      // Without Click & Collect there is no way around the minimum — stop on the first step instead of at the slot.
      if (belowMin && !pickup) e.minOrder = t("errorMinOrderFill", { min: minFmt });
    }
    if (step === 1 && mode === "delivery" && belowMin) e.mode = t("errorMinOrder", { min: minFmt });
    setErrors(e);
    const first = Object.keys(e)[0];
    // Failed submit: move focus to the first invalid control so its `aria-describedby` error is read, not the submit button.
    if (first) requestAnimationFrame(() => document.getElementById(FOCUS_TARGET[first] ?? first)?.focus());
    return !first;
  };
  const chooseMode = (m: "delivery" | "pickup") => {
    setMode(m);
    setErrors(({ mode: _mode, ...rest }) => { void _mode; return rest; });
  };
  const next = () => {
    if (!validate()) return;
    if (step < 3) { setStep(step + 1); return; }
    const id = makeOrderId();
    try { sessionStorage.setItem("rewe-rh-order", JSON.stringify({ id, name: addr.firstName, slot: slotLabel, total })); } catch {}
    placed.current = true; // `clear()` empties the cart — the redirect below must not race the confirmation route
    clear();
    router.push("/checkout/bestaetigung");
  };

  // An empty cart has no checkout: back to the basket (which owns the empty state) instead of „Fast geschafft." above it.
  useEffect(() => {
    if (mounted && lines.length === 0 && !placed.current) router.replace("/warenkorb");
  }, [mounted, lines.length, router]);

  if (lines.length === 0) {
    return (
      <div className="border border-dashed border-line p-16 text-center">
        <p className="display text-3xl text-ink">{tc("empty")}</p>
        <Cta href="/kategorien" className="mt-8">{tc("emptyCta")}</Cta>
      </div>
    );
  }

  const slide = { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, transition: { duration: reduce ? 0 : 0.24, ease: [0.2, 0, 0, 1] as const } };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className="border border-line bg-card p-6 md:p-10 lg:col-span-8">
        <StepTrack steps={steps} current={step} label={tco("progress")} />

        <AnimatePresence mode="wait" initial={false}>
          <m.div key={step} {...slide} className="mt-10 space-y-5">
            {step === 0 && (
              <>
                <p className="display text-xl text-ink">{t("step1")}</p>
                {belowMin && (
                  <p id="min-order-note" tabIndex={-1} className="flex items-start gap-2 border border-line p-4 text-[13px] leading-relaxed text-ink">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
                    <span>{t(pickup ? "minOrderNote" : "minOrderNoteNoPickup", { min: minFmt, amount: formatPrice(minOrder - subtotal, locale) })}</span>
                  </p>
                )}
                {belowMin && !pickup && <FieldError id="minOrder-error" msg={errors.minOrder} className="-mt-3" />}
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id="firstName" label={t("firstName")} error={errors.firstName}><Input id="firstName" autoComplete="given-name" {...field("firstName")} /></Field>
                  <Field id="lastName" label={t("lastName")} error={errors.lastName}><Input id="lastName" autoComplete="family-name" {...field("lastName")} /></Field>
                  <Field id="street" label={t("street")} error={errors.street} className="md:col-span-2"><Input id="street" autoComplete="street-address" {...field("street")} /></Field>
                  <Field id="zip" label={t("zip")} error={errors.zip}><Input id="zip" inputMode="numeric" autoComplete="postal-code" {...field("zip")} /></Field>
                  <Field id="city" label={t("city")} error={errors.city}><Input id="city" autoComplete="address-level2" {...field("city")} /></Field>
                  <Field id="phone" label={`${t("phone")} (${tco("optional")})`} className="md:col-span-2"><Input id="phone" type="tel" autoComplete="tel" {...field("phone")} /></Field>
                </div>
              </>
            )}

            {step === 1 && (
              <div>
                <p className="display mb-5 text-xl text-ink">{t("slotTitle")}</p>
                <div className="mb-5 grid gap-2 sm:grid-cols-2">
                  <button id="mode-delivery" type="button" onClick={() => chooseMode("delivery")} aria-pressed={mode === "delivery"} aria-describedby={errors.mode ? "mode-error" : undefined} className={cn(choiceCard, mode === "delivery" && choiceCardOn)}>
                    <Truck className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden /> {tc("modeDelivery")}
                  </button>
                  {pickup && (
                    <button type="button" onClick={() => chooseMode("pickup")} aria-pressed={mode === "pickup"} className={cn(choiceCard, mode === "pickup" && choiceCardOn)}>
                      <Store className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden /> {tc("modePickup")}
                    </button>
                  )}
                </div>
                <FieldError id="mode-error" msg={errors.mode} className="-mt-4 mb-3" />
                {mode === "delivery" ? (
                  <RadioGroup value={slot} onValueChange={setSlot} className="grid gap-2 sm:grid-cols-2">
                    {slots.map((s) => (
                      <label key={s.id} htmlFor={s.id} className={cn(choiceCard, slot === s.id && choiceCardOn)}>
                        <RadioGroupItem id={s.id} value={s.id} />
                        <span className="flex-1">
                          <span className="num block text-sm text-ink">{tco(s.day)} · {s.from}–{s.to}</span>
                          <span className="num text-[12px] text-ink-muted">{subtotal >= freeFrom ? tc("deliveryFree") : formatPrice(s.price, locale)}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="border border-line p-4 text-sm text-ink">{t("slotPickup")} — {tco("tomorrow")} 10:00–20:00</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="display mb-5 text-xl text-ink">{t("payment")}</p>
                <RadioGroup value={pay} onValueChange={(v) => setPay(v as Payment)} className="grid gap-2 sm:grid-cols-2" aria-label={t("payment")}>
                  {payments.map((p) => (
                    <label key={p} htmlFor={`pay-${p}`} className={cn(choiceCard, pay === p && choiceCardOn)}>
                      <RadioGroupItem id={`pay-${p}`} value={p} />
                      <span className="text-sm font-semibold text-ink">{t(payKey(p))}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 text-sm text-ink">
                <p className="display text-xl text-ink">{t("summary")}</p>
                <dl className="grid gap-5 sm:grid-cols-3">
                  <div><dt className="eyebrow">{t("step1")}</dt><dd className="mt-2 leading-relaxed">{addr.firstName} {addr.lastName}<br />{addr.street}<br />{addr.zip} {addr.city}</dd></div>
                  <div><dt className="eyebrow">{t("step2")}</dt><dd className="num mt-2">{slotLabel}</dd></div>
                  <div><dt className="eyebrow">{t("step3")}</dt><dd className="mt-2">{t(payKey(pay))}</dd></div>
                </dl>
                <p className="rule pt-4 text-[12px] leading-relaxed text-ink-muted">{legalReady ? `${t("legalHint")} · ` : ""}{t("demoNote")}</p>
              </div>
            )}
          </m.div>
        </AnimatePresence>

        <div className="rule mt-10 flex items-center justify-between gap-4 pt-6">
          <Cta type="button" variant="ghost" arrow={false} size="sm" onClick={() => setStep(Math.max(0, step - 1))} className={cn(step === 0 && "invisible")}>{t("prev")}</Cta>
          {step < 3 ? <Cta type="submit">{t("next")}</Cta> : <Cta type="submit" size="lg">{t("placeOrder")}</Cta>}
        </div>
      </form>

      <aside className="h-fit border border-line bg-card p-6 lg:sticky lg:top-24 lg:col-span-4">
        <p className="eyebrow">{t("summary")}</p>
        <ul className="num mt-4 max-h-64 space-y-2 overflow-y-auto text-sm text-ink">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-3"><span className="truncate">{l.qty}× {l.name}</span><span className="shrink-0">{formatPrice(l.qty * l.price, locale)}</span></li>
          ))}
        </ul>
        <dl className="num rule mt-4 space-y-2 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("subtotal")}</dt><dd className="text-ink">{formatPrice(subtotal, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("pfandLine")}</dt><dd className="text-ink-muted">{formatPrice(pfand, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{tc("weightLine")}</dt><dd className="text-ink">{formatWeight(weightGrams, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-muted">{mode === "pickup" ? tc("pickup") : tc("delivery")}</dt><dd className="text-ink">{shipping === 0 ? tc("deliveryFree") : formatPrice(shipping, locale)}</dd></div>
          <div className="mt-3 flex items-baseline justify-between border-t-2 border-line-strong pt-3 text-[20px] font-bold text-ink"><dt>{tc("total")}</dt><dd>{formatPrice(total, locale)}</dd></div>
        </dl>
        <p className="mt-3 text-[12px] text-ink-muted">{tc("vat")}{legalReady ? ` · ${t("legalHint")}` : ""}</p>
      </aside>
    </div>
  );
}
