"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useCart, type CartLine } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export type CartItemInput = Omit<CartLine, "qty">;

interface Props { item: CartItemInput; qty?: number; variant?: "icon" | "full" | "pill"; className?: string; label?: string }

export function AddToCart({ item, qty = 1, variant = "full", className, label }: Props) {
  const t = useTranslations("common");
  const locale = useLocale();
  const add = useCart((s) => s.add);
  const [done, setDone] = useState(false);
  void locale;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item, qty);
    setDone(true);
    toast.success(t("added"), { description: item.name });
    setTimeout(() => setDone(false), 1400);
  };

  if (variant === "icon") {
    return (
      <button type="button" onClick={onClick} aria-label={t("addToCart")} className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full bg-rewe text-forest shadow-card transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-rewe-deep active:scale-95", className)}>
        {done ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    );
  }
  if (variant === "pill") {
    return (
      <button type="button" onClick={onClick} className={cn("mono inline-flex items-center gap-1 rounded-full border border-forest/30 px-3 py-1 text-[11px] uppercase tracking-wider text-forest transition-colors hover:bg-forest hover:text-cream dark:border-cream/30 dark:text-cream dark:hover:bg-cream dark:hover:text-forest", className)}>
        {done ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {label ?? t("add")}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn("group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-rewe px-5 py-3.5 text-[15px] font-medium text-forest transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-rewe-deep active:scale-[0.98]", className)}>
      {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4 transition-transform group-hover:-rotate-6" />}
      {done ? t("added") : (label ?? t("addToCart"))}
    </button>
  );
}
