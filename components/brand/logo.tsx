import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Typographic REWE signature. When the client delivers the official logo,
 * set settings.brand.logo to its path under /public/brand and this component picks it up.
 */
export function Logo({ className, inverse, logoSrc, merchant }: { className?: string; inverse?: boolean; logoSrc?: string | null; merchant?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="REWE Rödelheim – Startseite">
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoSrc} alt="REWE" className="h-8 w-auto" />
      ) : (
        <span className={cn("inline-flex h-9 items-center rounded-[4px] px-2.5 font-sans text-[22px] font-black tracking-[-0.04em]", inverse ? "bg-cream text-[#d0021b]" : "bg-[#d0021b] text-white")}>
          REWE
        </span>
      )}
      {merchant && (
        <span className={cn("mono hidden text-[11px] uppercase leading-tight tracking-[0.16em] opacity-80 sm:block", inverse && "text-cream")}>
          {merchant}
        </span>
      )}
    </Link>
  );
}
