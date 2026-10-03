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
  dark?: boolean;
  children?: React.ReactNode;
}

export function SectionHeading({ eyebrow, title, text, align = "left", className, as: Tag = "h2", dark, children }: Props) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <Tag className={cn(dark ? "text-cream" : "text-forest dark:text-cream")}>{title}</Tag>
      {text && <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", align === "center" && "mx-auto", dark ? "text-cream/75" : "text-ink-muted")}>{text}</p>}
      {children}
    </Reveal>
  );
}
