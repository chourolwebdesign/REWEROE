import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "@/components/motion/reveal";

interface Props {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
  /** Legacy alias of `tone="block"` (one cycle). Colour comes from the tokens either way. */
  dark?: boolean;
  /** Informational: the parent `.on-block` flips the tokens, so this adds nothing. */
  tone?: "paper" | "block";
  /** Explicit eyebrow numeral ("03"). */
  num?: string;
  /** Auto numeral from a `.numbered` wrapper (home sections). */
  auto?: boolean;
  /** Regional square before the eyebrow. */
  regional?: boolean;
  /** Right-aligned action under the text (replaces `flex justify-between` wrappers). */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Section head row on the 12-column grid, opened by a 1 px rule:
 * eyebrow (cols 1–3) · heading (cols 4–9, or 4–11 without text) · text (cols 10–12) · aside under the text.
 */
export function SectionHeading({ eyebrow, title, text, align = "left", className, as: Tag = "h2", dark, tone, num, auto, regional, aside, children }: Props) {
  void dark; void tone;
  if (align === "center") {
    return (
      <Reveal className={cn("mx-auto max-w-3xl text-center", className)}>
        {eyebrow && <Eyebrow num={num} auto={auto} regional={regional} className="mb-4">{eyebrow}</Eyebrow>}
        <Tag className="text-ink">{title}</Tag>
        {text && <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{text}</p>}
        {aside && <div className="mt-6 flex justify-center">{aside}</div>}
        {children}
      </Reveal>
    );
  }
  return (
    <Reveal className={className}>
      <div className="rule grid grid-cols-4 items-end gap-x-4 gap-y-4 pt-6 md:grid-cols-12 md:gap-x-6">
        {eyebrow && <Eyebrow num={num} auto={auto} regional={regional} className="col-span-4 md:col-span-3 md:mb-1">{eyebrow}</Eyebrow>}
        <Tag className={cn("col-span-4 text-ink", text ? "md:col-span-6" : "md:col-span-8", !eyebrow && "md:col-start-1")}>{title}</Tag>
        {text && <p className="col-span-4 text-[15px] leading-relaxed text-ink-muted md:col-span-3 md:col-start-10">{text}</p>}
        {aside && <div className={cn("col-span-4 md:col-span-3 md:col-start-10 md:justify-self-end", text && "mt-2")}>{aside}</div>}
      </div>
      {children}
    </Reveal>
  );
}
