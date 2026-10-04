"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMounted, useTick } from "@/lib/hooks";
import { openState, storeChipParts, type Hours, type HoursStatus } from "@/lib/hours";
import { cn } from "@/lib/utils";

interface Props {
  hours: Hours;
  hoursStatus: HoursStatus;
  /** `sm` → 36 px, 12 px text (store teaser caption). Default 44 px, 13 px (header). */
  size?: "md" | "sm";
  className?: string;
  /** Store page the chip links to (`/filialen/<slug>`). */
  storeSlug?: string;
}

/**
 * Live store chip (§4.2 / §4.34): dot (bio = open · ink-muted = closed · none while pending) + state word + data-chip time.
 * Hydration-safe: the time-dependent text renders after mount; the pending state is static. Re-evaluates every 30 s.
 */
export function StoreChip({ hours, hoursStatus, size = "md", className, storeSlug = "roedelheim" }: Props) {
  const t = useTranslations("common");
  const mounted = useMounted();
  useTick(30_000);
  const state = hoursStatus === "pending" ? openState(hours, "pending") : mounted ? openState(hours, hoursStatus) : null;
  const parts = state ? storeChipParts(state, t) : null;
  const tone = parts?.tone ?? "pending";
  const dot = tone === "open" ? "bg-bio-text" : "bg-ink-muted";
  return (
    <Link
      href={`/filialen/${storeSlug}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-[2px] border border-line px-3 text-ink transition-colors duration-[var(--dur-ui)] hover:border-line-strong",
        size === "sm" ? "min-h-9 text-[12px]" : "min-h-11 text-[13px]",
        className,
      )}
    >
      {tone !== "pending" && (
        <span className="relative inline-flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className={cn("live-pulse absolute inset-0 rounded-full motion-reduce:animate-none", dot)} />
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot)} />
        </span>
      )}
      <span className="font-medium">{parts ? parts.state : " "}</span>
      {parts?.detail && <span className="data-lg text-ink-muted">{parts.detail}</span>}
    </Link>
  );
}
