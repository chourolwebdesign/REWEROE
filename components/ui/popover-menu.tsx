"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aufklappbares Menü (Disclosure): Esc und Klick außerhalb schließen, Fokus kehrt zum Knopf zurück. */
export function PopoverMenu({
  label,
  icon,
  className,
  buttonClassName,
  children,
  align = "start",
}: {
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  buttonClassName: string;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={buttonClassName}>
        {icon}
        {label}
      </button>
      <div
        id={id}
        hidden={!open}
        data-align={align}
        className={cn(
          "popover-panel absolute top-[calc(100%+0.5rem)] z-30 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-2 text-ink shadow-[0_20px_60px_rgb(0_0_0/.18),0_0_0_1px_rgb(0_0_0/.05)]",
          align === "end" ? "right-0" : "left-0",
        )}
      >
        {children(() => setOpen(false))}
      </div>
    </div>
  );
}

export const menuItemClass =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold transition-colors hover:bg-soft focus-visible:bg-soft";
