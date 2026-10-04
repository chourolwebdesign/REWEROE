import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { Eyebrow } from "./eyebrow";

interface Props {
  /** A string renders as `Eyebrow`; a node (e.g. a sub-brand `BrandLockup` row on /regional, /bio) renders as given. */
  eyebrow?: React.ReactNode;
  title: string;
  text?: string;
  /** Optional photograph — a framed plate under the head row, never a backdrop, never carrying text. */
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  /** Compact h1 scale (36 → 64 px) for Legal, Warenkorb, Checkout, Konto, Login, Kontakt. */
  compact?: boolean;
  className?: string;
  /** Rendered above the head row with a bottom hairline. */
  breadcrumbs?: { label: string; href?: string }[];
  /** Explicit eyebrow numeral; without it the eyebrow carries the 24×3 px REWE-Strich. */
  num?: string;
}

/** Light paper page header on the 12-column grid (§4.8). The site header is sticky, so there is no top offset. */
export function PageHero({ eyebrow, title, text, image, imageAlt = "", children, compact, className, breadcrumbs, num }: Props) {
  return (
    <section className={cn("container-x pt-10 md:pt-14", compact ? "pb-10" : "pb-12 md:pb-16", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="rule-b pb-4" />}
      <div className={cn("grid grid-cols-4 items-end gap-x-4 gap-y-6 md:grid-cols-12 md:gap-x-6", breadcrumbs && "pt-8")}>
        <div className="col-span-4 md:col-span-8">
          {eyebrow && (typeof eyebrow === "string" ? <Eyebrow num={num} rule={!num}>{eyebrow}</Eyebrow> : eyebrow)}
          <h1 className={cn("mt-4 text-ink", compact && "text-[clamp(2.25rem,1.6rem+2.7vw,4rem)] leading-none tracking-[-0.025em]")}>{title}</h1>
        </div>
        {text && <p className="col-span-4 max-w-[40ch] text-[17px] leading-relaxed text-ink-muted md:col-span-4 md:col-start-9">{text}</p>}
      </div>
      {image && (
        <figure className="mt-10">
          <div className="frame relative aspect-[4/3] overflow-hidden bg-surface md:aspect-[21/9]">
            <SmartImage src={image} alt={imageAlt} blur={getBlur(image)} fill priority sizes="100vw" className="img-grade object-cover" />
          </div>
          {imageAlt && <figcaption className="data mt-2 text-ink-muted">{imageAlt}</figcaption>}
        </figure>
      )}
      {children && <div className="rule mt-8 pt-4">{children}</div>}
    </section>
  );
}
