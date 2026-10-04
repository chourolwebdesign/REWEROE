import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Überschrift einer Sektion: optionale Dachzeile, H2, Einleitung und rechts eine Aktion. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  id,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className="text-eyebrow mb-4 text-red">{eyebrow}</p>}
        <Tag id={id} className={Tag === "h1" ? "text-h1" : "text-h2"}>
          {title}
        </Tag>
        {lede && <p className="mt-4 max-w-[52ch] text-lede text-muted">{lede}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}