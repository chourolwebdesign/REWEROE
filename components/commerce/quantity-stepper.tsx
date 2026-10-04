"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
  /** `sm` narrows the value cell for cart rows; the ± cells stay 44 px on every pointer (rule 8). */
  size?: "sm" | "md";
  /** PDP: the value is an editable `<input inputmode="numeric">`. */
  input?: boolean;
  /** Accessible group name; defaults to common.qty („Menge"). */
  label?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Quantity stepper (§4.16): hairline box, 44 px cells on every pointer, `divide-x` between cells, Figtree 600 15 px
 * tabular value. No per-stepper live region — the add-to-cart toast announces the change once instead of bare numbers.
 */
export function QuantityStepper({ value, onChange, min = 0, max = 99, className, size = "md", input = false, label }: Props) {
  const t = useTranslations("common");
  const [draft, setDraft] = useState<string | null>(null);
  const sm = size === "sm";
  const cell = "inline-flex min-h-11 min-w-11 items-center justify-center text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)] hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent";
  const commit = () => {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) onChange(clamp(n, min, max));
    setDraft(null);
  };

  return (
    <div className={cn("stepper num inline-flex min-h-11 items-stretch divide-x divide-line-strong rounded-[2px] border border-line-strong bg-card", className)} role="group" aria-label={label ?? t("qty")}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className={cell} aria-label={t("decrease")} disabled={value <= min}>
        <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      {input ? (
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft ?? String(value)}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          aria-label={label ?? t("qty")}
          className="w-10 min-w-10 bg-transparent text-center text-[15px] font-semibold tabular-nums text-ink outline-none focus-visible:bg-surface-2 focus-visible:outline-none"
        />
      ) : (
        <span className={cn("inline-flex items-center justify-center text-center text-[15px] font-semibold tabular-nums text-ink", sm ? "min-w-9" : "min-w-10")}>{value}</span>
      )}
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className={cell} aria-label={t("increase")} disabled={value >= max}>
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
