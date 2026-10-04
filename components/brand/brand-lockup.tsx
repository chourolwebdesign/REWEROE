import settings from "@/content/settings.json";
import { satisfy, sacramento } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { LogoMark, REWE_PATH } from "./logo";

const HEIGHTS = { sm: 24, md: 36, lg: 48, xl: 64 } as const;
type Size = keyof typeof HEIGHTS;
const LABELS = { bio: "REWE Bio", regional: "REWE Regional" } as const;

type SubLogos = { bio?: string | null; regional?: string | null; regionSign?: string | null };
const subLogos: SubLogos = ((settings as { brand: { subLogos?: SubLogos } }).brand.subLogos) ?? {};

interface Props {
  sub: "bio" | "regional";
  /** sm 24 · md 36 · lg 48 · xl 64 px box height. */
  size?: Size;
  /** `inline` (default): one row. `stacked` (Regional only): REWE block above the script word, as on the packaging label. */
  variant?: "inline" | "stacked";
  className?: string;
}

/**
 * Sub-brand lockups, reproduced from REWE's own marks (client reference, 2026-10):
 * – REWE Bio: ONE deep-green rounded field carrying white „REWE" (bold) + „Bio" (script). Never a red block.
 * – REWE Regional: the red REWE block + handwritten „Regional" in ink with a small dashed heart, on a white label.
 * Both are brand marks: colours are static in dark mode. When the client supplies the official files, set
 * settings.brand.subLogos.{bio,regional} and the <img> replaces the reproduction at the same height.
 */
export function BrandLockup({ sub, size = "md", variant = "inline", className }: Props) {
  const h = HEIGHTS[size];
  const label = LABELS[sub];
  const official = subLogos[sub];
  if (official) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={official} alt={label} style={{ height: h }} className={cn("inline-block w-auto", className)} />;
  }
  if (sub === "bio") {
    // Green field 2.9 : 1; wordmark ≈ 40 % of height; „Bio" script ≈ 72 % of height.
    const pad = h * 0.28;
    return (
      <span role="img" aria-label={label} className={cn("inline-flex items-center bg-bio text-white", className)} style={{ height: h, paddingInline: pad, borderRadius: h * 0.16, gap: h * 0.16 }}>
        <svg aria-hidden viewBox="0 0 24 6.41" width={h * 0.4 * 3.744} height={h * 0.4} className="block shrink-0">
          <g transform="translate(0 -8.797)"><path d={REWE_PATH} fill="#FFFFFF" /></g>
        </svg>
        <span aria-hidden className={cn(satisfy.className, "leading-none")} style={{ fontSize: h * 0.72, transform: `translateY(${-h * 0.04}px)` }}>Bio</span>
      </span>
    );
  }
  // REWE Regional
  const stacked = variant === "stacked";
  const block = stacked ? h * 0.42 : h * 0.62;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center bg-white text-[#141414]", stacked ? "flex-col items-start" : "flex-row", className)}
      style={{ height: stacked ? "auto" : h, paddingInline: h * 0.22, paddingBlock: stacked ? h * 0.2 : 0, gap: stacked ? h * 0.08 : h * 0.18, border: `${Math.max(1, Math.round(h / 24))}px dashed #141414`, borderRadius: h * 0.08 }}
    >
      <LogoMark height={block} />
      <span aria-hidden className="inline-flex items-end" style={{ gap: h * 0.12 }}>
        <span className={cn(sacramento.className, "leading-none")} style={{ fontSize: stacked ? h * 0.78 : h * 0.66, WebkitTextStroke: `${h / 60}px #141414` }}>Regional</span>
        <svg aria-hidden viewBox="0 0 24 22" width={h * 0.26} height={h * 0.24} className="mb-[0.08em] shrink-0">
          <path d="M12 20.5 3.3 12A5.2 5.2 0 0 1 12 5.1a5.2 5.2 0 0 1 8.7 6.9Z" fill="none" stroke="#141414" strokeWidth="1.8" strokeDasharray="2.6 1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

/**
 * „Aus deiner Region" — REWE's yellow shelf sign with the black tractor (the mark shoppers know from the store).
 * Height-driven (default 48 px → ≈ 2.1 : 1). Static colours (ink on #FFCC00 = 12.18:1). Replaceable via settings.brand.subLogos.regionSign.
 */
export function RegionSign({ height = 48, className, lines = ["Aus deiner", "Region"] }: { height?: number; className?: string; lines?: [string, string] }) {
  const label = lines.join(" ");
  if (subLogos.regionSign) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={subLogos.regionSign} alt={label} style={{ height }} className={cn("inline-block w-auto", className)} />;
  }
  const h = height;
  return (
    <span role="img" aria-label={label} className={cn("relative inline-flex items-center bg-regional text-[#141414]", className)} style={{ height: h, paddingLeft: h * 0.26, paddingRight: h * 0.95, borderRadius: h * 0.14 }}>
      <span aria-hidden className="font-sans font-semibold" style={{ fontSize: h * 0.3, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
        {lines[0]}<br />{lines[1]}
      </span>
      {/* Hand-drawn tractor silhouette with speed strokes, bottom-right like the original sign */}
      <svg aria-hidden viewBox="0 0 100 60" width={h * 0.78} height={h * 0.47} className="absolute" style={{ right: h * 0.14, bottom: h * 0.1 }}>
        <g fill="#141414" stroke="#141414" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 52l4-10M11 54l3-8M19 55l2-5M27 55l1-3" fill="none" strokeWidth="3.2" />
          <path d="M44 38V24h20l5 12h8v6H44z" strokeWidth="2" />
          <path d="M54 25v-9h3v9z" strokeWidth="1" />
          <path d="M70 36v-5l6-9 6 9v7" fill="none" strokeWidth="3" />
          <circle cx="62" cy="14" r="4.5" />
          <path d="M57.5 12h9l1 2.6h-11z" />
          <path d="M60 18h5l3 9h-11z" />
          <circle cx="48" cy="44" r="12.5" fill="none" strokeWidth="6" />
          <circle cx="86" cy="49" r="7" fill="none" strokeWidth="4.5" />
        </g>
      </svg>
    </span>
  );
}
