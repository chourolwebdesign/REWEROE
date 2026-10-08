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
  ledeClassName,
  crumbs = [],
  children,
  className,
  tone = "plain",
  mark,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** z. B. `max-md:hidden`, wenn auf dem Handy der Inhalt direkt folgen soll (Prospekt) */
  ledeClassName?: string;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
  className?: string;
  tone?: "plain" | "red";
  mark?: string;
}) {
  const red = tone === "red";
  // Tippfläche mindestens 24 px hoch (WCAG 2.5.8), die Zeile sieht gleich aus
  const link = cn("inline-flex min-h-6 items-center", red ? "underline-offset-4 hover:underline" : "hover:text-ink hover:underline");
  // Handy: knapper, damit der Inhalt früh im ersten Bildschirm beginnt
  const inner = (
    <div className={cn("wrap", red ? "relative pt-24 pb-8 md:pt-36 md:pb-20" : "pt-12 pb-14 md:pt-20 md:pb-20", className)}>
      {crumbs.length > 0 && (
        <nav aria-label="Brotkrumen" className={cn("mb-4 text-[0.875rem] md:mb-9", red ? "text-white" : "text-muted")}>
          {/* Handy: eine Zeile, der aktuelle Titel wird gekürzt */}
          <ol className="flex items-center gap-x-2 gap-y-1 md:flex-wrap">
            <li className="shrink-0">
              <Link href="/" className={link}>
                Start
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className={cn("flex items-center gap-2", i === crumbs.length - 1 ? "min-w-0" : "shrink-0")}>
                <span aria-hidden>/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className={cn("truncate md:whitespace-normal", red ? "font-semibold" : "text-ink")}>
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
        <p className={cn("text-eyebrow mb-3 flex items-center gap-2.5 md:mb-4", red ? "text-white" : "text-red")}>
          <span aria-hidden className={cn("h-px w-6 shrink-0", red ? "bg-white/60" : "bg-red/45")} />
          {eyebrow}
        </p>
      )}
      <h1 className="max-w-[18ch] text-h1">{title}</h1>
      {lede && <p className={cn("mt-3 max-w-[56ch] text-lede md:mt-5", red ? "text-white" : "text-muted", ledeClassName)}>{lede}</p>}
      {children}
    </div>
  );
  if (!red) return inner;
  return (
    <section data-hero className="on-dark relative isolate -mt-[4.5rem] mb-6 overflow-hidden bg-red text-white md:mb-20">
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
