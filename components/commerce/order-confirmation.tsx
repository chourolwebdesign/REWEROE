"use client";
import { useStoredJson } from "@/lib/hooks";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { formatPrice } from "@/lib/format";

export function OrderConfirmation() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const order = useStoredJson<{ id: string; name: string; slot: string; total: number }>("session", "rewe-rh-order");
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-rewe text-forest"><Check className="h-9 w-9" /></motion.span>
      <p className="eyebrow mt-8">{t("confirmEyebrow")}</p>
      <h1 className="mt-4 text-forest dark:text-cream">{t("confirmTitle", { name: order?.name ?? "" })}</h1>
      <p className="mt-6 text-lg text-ink-muted">{t("confirmText", { id: order?.id ?? "—" })}</p>
      {order && <dl className="mono mt-8 inline-grid grid-cols-2 gap-x-10 gap-y-2 rounded-[12px] border border-line bg-card px-6 py-4 text-left text-sm"><dt className="text-ink-muted">{t("confirmSlot")}</dt><dd>{order.slot}</dd><dt className="text-ink-muted">Total</dt><dd className="text-price">{formatPrice(order.total, locale)}</dd></dl>}
      <div className="mt-10"><Cta href="/">{t("confirmBack")}</Cta></div>
    </div>
  );
}
