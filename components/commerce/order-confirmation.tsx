"use client";
import { useStoredJson } from "@/lib/hooks";
import { useLocale, useTranslations } from "next-intl";
import { m, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { formatPrice } from "@/lib/format";

/** Confirmation (§4.27): 48 px green check (success is fenced green), compact h1, order id as `data-lg`, hairline totals. */
export function OrderConfirmation() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const order = useStoredJson<{ id: string; name: string; slot: string; total: number }>("session", "rewe-rh-order");
  return (
    <div className="mx-auto max-w-2xl text-center">
      <m.span
        initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-bio text-white"
      >
        <Check className="h-6 w-6" strokeWidth={2.25} aria-hidden />
      </m.span>
      <p className="eyebrow mt-8">{t("confirmEyebrow")}</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] text-ink">{t("confirmTitle", { name: order?.name ?? "" })}</h1>
      <p className="mt-6 text-lg text-ink-muted">{t("confirmText", { id: order?.id ?? "—" })}</p>
      {order && (
        <dl className="mx-auto mt-10 max-w-md divide-y divide-line border-y border-line text-left text-sm">
          <div className="flex items-baseline justify-between gap-6 py-3"><dt className="text-ink-muted">{t("orderId")}</dt><dd className="data-lg text-ink">{order.id}</dd></div>
          <div className="flex items-baseline justify-between gap-6 py-3"><dt className="text-ink-muted">{t("confirmSlot")}</dt><dd className="num text-ink">{order.slot}</dd></div>
          <div className="flex items-baseline justify-between gap-6 py-3"><dt className="text-ink-muted">{tc("total")}</dt><dd className="price price-sm text-ink">{formatPrice(order.total, locale)}</dd></div>
        </dl>
      )}
      <div className="mt-10"><Cta href="/">{t("confirmBack")}</Cta></div>
    </div>
  );
}
