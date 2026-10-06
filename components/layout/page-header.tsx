import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kopf einer Unterseite: Brotkrumen, Dachzeile, H1, Einleitung, optional Inhalt darunter. `tone="red"` wie der Hero der
 * Startseite (weiße Schrift, großes blasses Wort `mark`); er liegt unter der transparenten Kopfleiste (`data-hero`, lib/site.ts → hasHero).
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs = [],
  children,
  className,
  tone = "plain",
  mark,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
  className?: string;
  tone?: "plain" | "red";
  mark?: string;
}) {
  const red = tone === "red";
  const link = red ? "underline-offset-4 hover:underline" : "hover:text-ink hover:underline";
  const inner = (
    <div className={cn("wrap", red ? "relative pt-28 pb-14 md:pt-36 md:pb-20" : "pt-12 pb-14 md:pt-20 md:pb-20", className)}>
      {crumbs.length > 0 && (
        <nav aria-label="Brotkrumen" className={cn("mb-9 text-[0.875rem]", red ? "text-white" : "text-muted")}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className={link}>
                Start
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className={red ? "font-semibold" : "text-ink"}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className={link}>
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && (
        <p className={cn("text-eyebrow mb-4 flex items-center gap-2.5", red ? "text-white" : "text-red")}>
          <span aria-hidden className={cn("h-px w-6 shrink-0", red ? "bg-white/60" : "bg-red/45")} />
          {eyebrow}
        </p>
      )}
      <h1 className="max-w-[18ch] text-h1">{title}</h1>
      {lede && <p className={cn("mt-5 max-w-[56ch] text-lede", red ? "text-white" : "text-muted")}>{lede}</p>}
      {children}
    </div>
  );
  if (!red) return inner;
  return (
    <section data-hero className="on-dark relative isolate -mt-[4.5rem] mb-12 overflow-hidden bg-red text-white md:mb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-48 size-[38rem] rounded-full bg-red-bright/35 blur-[120px]" />
        <div className="absolute -right-40 -bottom-56 size-[44rem] rounded-full bg-red-deep blur-[120px]" />
        {mark && (
          <p className="absolute inset-x-0 -bottom-[0.2em] font-display text-[26vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/[0.07] select-none lg:text-[16vw]">
            {mark}
          </p>
        )}
      </div>
      {inner}
    </section>
  );
}
