import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Kopf einer Unterseite: Brotkrumen, Dachzeile, H1, Einleitung, optional Inhalt rechts/unten. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs = [],
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("wrap pt-10 pb-12 md:pt-16 md:pb-16", className)}>
      {crumbs.length > 0 && (
        <nav aria-label="Brotkrumen" className="mb-8 text-[0.875rem] text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Start
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-ink hover:underline">
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <p className="mb-4 text-[0.9375rem] font-semibold text-red">{eyebrow}</p>}
      <h1 className="max-w-[18ch] text-h1">{title}</h1>
      {lede && <p className="mt-5 max-w-[56ch] text-lede text-muted">{lede}</p>}
      {children}
    </div>
  );
}
