import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";

const HEIGHTS = { sm: 24, md: 36, lg: 48 } as const;
const LABELS = { bio: "Bio", regional: "Regional" } as const;

interface Props {
  sub: "bio" | "regional";
  /** sm 24 px (mega menu, badge legend) · md 36 px (home tiles, PageHero eyebrows) · lg 48 px (Regional/Bio heroes). */
  size?: keyof typeof HEIGHTS;
  className?: string;
}

/**
 * Sub-brand lockup (REGIONAL-BIO brief, §4.35): the REWE block followed (gap = 10 % of the height) by a second
 * block of the same height — white „Bio" on REWE Bio green, or „Regional" + tractor in ink on REWE yellow.
 * Both fields are brand marks: they do not change in dark mode (white/#0E6B34 6.62:1 · ink/#FFCC00 12.18:1).
 */
export function BrandLockup({ sub, size = "md", className }: Props) {
  const h = HEIGHTS[size];
  const label = LABELS[sub];
  return (
    <span role="img" aria-label={`REWE ${label}`} className={cn("inline-flex items-center", className)} style={{ gap: h * 0.1 }}>
      <LogoMark height={h} />
      <span
        aria-hidden
        className={cn("inline-flex items-center justify-center whitespace-nowrap leading-none", sub === "bio" ? "bg-bio text-white" : "bg-regional text-[#141414]")}
        style={{ height: h, paddingInline: h * 0.3, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: h * 0.5, letterSpacing: "-0.02em" }}
      >
        {sub === "regional" && <Tractor aria-hidden strokeWidth={2} style={{ height: h * 0.55, width: h * 0.55, marginRight: h * 0.15 }} />}
        {label}
      </span>
    </span>
  );
}
