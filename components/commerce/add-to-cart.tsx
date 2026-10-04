"use client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, ShoppingBag } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useCart, type CartLine } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";

export type CartItemInput = Omit<CartLine, "qty">;

type Variant = "icon" | "full" | "pill" | "primary";

interface Props {
  item: CartItemInput;
  qty?: number;
  /** `icon` 44 px ink square (cards) · `full` ink bar · `pill` hairline chip (lists) · `primary` red bar (PDP buy box only). */
  variant?: Variant;
  className?: string;
  label?: string;
  /** After adding, the control becomes a QuantityStepper bound to the cart line while qty > 0. Default: every variant but `primary`. */
  morph?: boolean;
}

const base = "relative inline-flex items-center justify-center rounded-[2px] transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)] active:translate-y-px disabled:pointer-events-none";
const bar = "h-12 w-full gap-2 px-5 text-[15px] font-semibold";
const styles: Record<Variant, string> = {
  icon: "h-11 w-11 bg-ink text-paper hover:bg-ink/90",
  full: `${bar} bg-ink text-paper hover:bg-ink/90`,
  primary: `${bar} btn-primary bg-red text-white hover:bg-red-hover active:bg-red-deep`,
  pill: "h-9 gap-1 border border-line-strong px-3 text-[12px] font-semibold text-ink hover:bg-ink hover:text-paper pointer-coarse:before:absolute pointer-coarse:before:-inset-1.5 pointer-coarse:before:content-['']",
};

const ICON_W = 44;
const STEPPER_W = 132;

/**
 * Add-to-cart (§4.16 / §4.23). Ink by default so the page CTA stays the only red. On click the item is added and the
 * control morphs into a `QuantityStepper` bound to the cart line (persists while qty > 0; „−" at 1 removes the line).
 * The toast carries „Rückgängig", which restores the previous quantity.
 */
export function AddToCart({ item, qty = 1, variant = "full", className, label, morph }: Props) {
  const t = useTranslations("common");
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const lineQty = useCart((s) => s.lines.find((l) => l.slug === item.slug)?.qty ?? 0);
  const inCart = mounted ? lineQty : 0; // persisted store hydrates on the client only
  const morphs = morph ?? variant !== "primary";
  const open = morphs && inCart > 0;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prev = lineQty;
    add(item, qty);
    toast(t("added"), {
      description: item.name,
      duration: 6000,
      action: { label: t("undo"), onClick: () => (prev > 0 ? setQty(item.slug, prev) : remove(item.slug)) },
    });
  };

  const stepper = <QuantityStepper value={inCart} onChange={(n) => setQty(item.slug, n)} min={0} className={cn(variant === "full" && "h-12")} />;
  const t24 = { duration: reduce ? 0 : 0.24, ease: [0.2, 0, 0, 1] as const };

  if (variant === "icon") {
    return (
      <m.div
        initial={false}
        animate={{ width: open ? STEPPER_W : ICON_W }}
        transition={t24}
        className={cn("inline-flex h-11 shrink-0 justify-end overflow-hidden", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {open ? stepper : (
          <button type="button" onClick={onClick} aria-label={t("addToCart")} className={cn(base, styles.icon)}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
        )}
      </m.div>
    );
  }

  if (open) {
    return (
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t24} className={cn("inline-flex items-center gap-3", variant === "full" && "h-12 w-full", className)} onClick={(e) => e.stopPropagation()}>
        {stepper}
        {variant === "full" ? <span className="text-[15px] font-semibold text-ink">{t("inCart")}</span> : null}
      </m.div>
    );
  }

  if (variant === "pill") {
    return (
      <button type="button" onClick={onClick} className={cn(base, styles.pill, className)}>
        <Plus className="h-3 w-3" strokeWidth={2.5} aria-hidden /> {label ?? t("add")}
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(base, styles[variant], className)}>
      <ShoppingBag className="h-4 w-4" strokeWidth={2} aria-hidden />
      {label ?? t("addToCart")}
    </button>
  );
}
