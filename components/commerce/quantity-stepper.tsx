"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({ value, onChange, min = 0, max = 99, className, size = "md" }: { value: number; onChange: (n: number) => void; min?: number; max?: number; className?: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-8" : "h-11";
  return (
    <div className={cn("mono inline-flex items-center rounded-[10px] border border-line bg-card", h, className)} role="group" aria-label="Menge">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-full w-9 items-center justify-center rounded-l-[10px] transition-colors hover:bg-forest/5 disabled:opacity-40" aria-label="−1" disabled={value <= min}><Minus className="h-3.5 w-3.5" /></button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-full w-9 items-center justify-center rounded-r-[10px] transition-colors hover:bg-forest/5 disabled:opacity-40" aria-label="+1" disabled={value >= max}><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
