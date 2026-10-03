import { SmartImage } from "@/components/ui/smart-image";
import { getBlur } from "@/lib/blur";
import { cn } from "@/lib/utils";

interface Props { eyebrow?: string; title: string; text?: string; image?: string; imageAlt?: string; children?: React.ReactNode; compact?: boolean; className?: string }

/** Dark cinematic page header shared by inner pages. Sets data-header-theme so the navbar inverts. */
export function PageHero({ eyebrow, title, text, image, imageAlt = "", children, compact, className }: Props) {
  return (
    <section data-header-theme="dark" className={cn("relative isolate overflow-hidden bg-forest text-cream", className)}>
      {image && (
        <div className="absolute inset-0 -z-10">
          <SmartImage src={image} alt={imageAlt} blur={getBlur(image)} fill priority sizes="100vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-forest/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/80 to-transparent" />
        </div>
      )}
      <div className={cn("container-x pt-[calc(72px+4rem)]", compact ? "pb-14" : "pb-20 md:pb-28", !image && "pt-[calc(72px+3rem)]")}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className={cn("max-w-4xl text-cream", compact && "text-[clamp(2.25rem,4.5vw,4rem)]")}>{title}</h1>
        {text && <p className="mt-6 max-w-2xl text-lg text-cream/75">{text}</p>}
        {children}
      </div>
    </section>
  );
}
