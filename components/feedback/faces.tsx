"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { FACE_COLORS, FaceIcon } from "./face-icon";

/**
 * Fünf Gesichter als Radiogruppe (WAI-ARIA): Pfeiltasten wählen, ohne weiterzugehen – rechts/unten das nächste, links/oben das
 * vorige, in Arabisch links/rechts gespiegelt. Antippen, Enter oder Leertaste wählen und gehen weiter.
 */
export function Faces({
  value,
  labels,
  groupLabel,
  rtl,
  onSelect,
}: {
  value: number;
  labels: readonly string[];
  groupLabel: string;
  rtl: boolean;
  onSelect: (n: number, advance: boolean) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 };
    const target = e.key === "Home" ? 1 : e.key === "End" ? 5 : e.key in steps ? Math.min(5, Math.max(1, (value || 1) + steps[e.key])) : null;
    if (target === null) return;
    e.preventDefault();
    onSelect(target, false);
    refs.current[target - 1]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={groupLabel} onKeyDown={onKeyDown} className="grid grid-cols-5 gap-2 sm:gap-3">
      {labels.map((label, i) => {
        const n = i + 1;
        const checked = value === n;
        return (
          <button
            key={n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${n}/5 · ${label}`}
            tabIndex={checked || (!value && n === 1) ? 0 : -1}
            data-face={n}
            onClick={() => onSelect(n, true)}
            style={{ "--face": FACE_COLORS[i] } as React.CSSProperties}
            className={cn(
              "grid aspect-square place-items-center rounded-full p-1.5 text-[var(--face)] transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] active:scale-95",
              checked ? "scale-110 bg-white shadow-[var(--shadow-lift)] ring-2 ring-ink" : "hover:bg-white",
            )}
          >
            <FaceIcon n={n} className="size-full" />
          </button>
        );
      })}
    </div>
  );
}
