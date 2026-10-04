import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  red: "bg-red text-white hover:bg-red-hover",
  ink: "bg-ink text-white hover:bg-ink-2",
  soft: "bg-soft text-ink hover:bg-soft-2",
  white: "bg-white text-ink hover:bg-soft",
  glass: "bg-white/14 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/22",
  outline: "bg-transparent text-ink ring-1 ring-inset ring-ink/20 hover:ring-ink/50",
} as const;

const SIZES = {
  sm: "h-11 px-[1.125rem] text-[0.9375rem]",
  md: "h-13 px-6 text-base",
  lg: "h-14 px-7 text-[1.0625rem]",
} as const;

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Externe Links öffnen in neuem Tab und zeigen den Pfeil ↗ */
  external?: boolean;
  icon?: ReactNode;
};

export function buttonClasses(variant: keyof typeof VARIANTS = "red", size: keyof typeof SIZES = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap",
    // Drücken: sofortige, kurze Rückmeldung (150 ms, kräftiges ease-out)
    "transition-[background-color,color,box-shadow,transform] duration-150 ease-[var(--ease-out-expo)] active:scale-[0.97]",
    VARIANTS[variant],
    SIZES[size],
  );
}

export function ButtonLink({ href, variant = "red", size = "md", external, icon, className, children, ...rest }: Props) {
  const classes = cn(buttonClasses(variant, size), className);
  const content = (
    <>
      {icon}
      {children}
      {external && <ArrowUpRight aria-hidden className="size-[1.1em] shrink-0" strokeWidth={2.25} />}
    </>
  );
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    const newTab = external ?? /^https?:/.test(href);
    return (
      <a href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
        {content}
        {newTab && <span className="sr-only"> (öffnet in neuem Tab)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
