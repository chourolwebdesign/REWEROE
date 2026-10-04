import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Deposit chip (§4.12): hairline, ink-muted, sentence case — never green. On blocks the tokens flip. */
export function PfandChip({ amount, className }: { amount: number; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  return (
    <span className={cn("num inline-flex h-6 shrink-0 items-center gap-1 rounded-[2px] border border-line px-1.5 text-[12px] font-medium text-ink-muted whitespace-nowrap", className)} title={t("pfand")}>
      <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden className="fill-current"><path d="M3.5 0h3v2.2c1.3.6 2 1.8 2 3.2V11a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V5.4c0-1.4.7-2.6 2-3.2V0z" /></svg>
      {t("pfand")} {formatPrice(amount, locale)}
    </span>
  );
}
