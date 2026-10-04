import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
  /** Explicit numeral, rendered red via `eyebrow-num` + `data-num` ("03"). */
  num?: string;
  /** Auto numeral from a `.numbered` ancestor + `[data-numbered]` sections (home). */
  auto?: boolean;
  /** 8×8 px Regional yellow square (REWE shelf sign quoted as a mark). */
  regional?: boolean;
  /** 24×3 px red REWE-Strich — section openers on inner pages without a numeral. */
  rule?: boolean;
}

/** Figtree 600, 12–13 px, sentence case; the numeral is the only red. */
export function Eyebrow({ children, className, as: Tag = "p", num, auto, regional, rule }: Props) {
  return (
    <Tag className={cn("eyebrow", num && "eyebrow-num", auto && "eyebrow-auto", regional && "eyebrow-regional", rule && "eyebrow-rule", className)} data-num={num}>
      {children}
    </Tag>
  );
}
