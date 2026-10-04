import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL"> & {
  src: string;
  alt: string;
  blur?: string;
  /** One photographic grade (`img-grade`, §6). Default true; pass `false` for product cut-outs on white and for logos. */
  grade?: boolean;
};

/**
 * next/image with optional blur-up LQIP. Server components get `blur` from `getBlur(src)` (lib/blur.ts);
 * client components receive it through props. Replace a file in /public/images/placeholders and
 * re-run `node scripts/blur.mjs` to refresh the placeholders.
 */
export function SmartImage({ src, alt, blur, grade = true, className, ...rest }: Props) {
  return <Image src={src} alt={alt} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} className={cn(grade && "img-grade", className)} {...rest} />;
}
