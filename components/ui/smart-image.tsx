import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL"> & { src: string; alt: string; blur?: string };

/**
 * next/image with optional blur-up LQIP. Server components get `blur` from `getBlur(src)` (lib/blur.ts);
 * client components receive it through props. Replace a file in /public/images/placeholders and
 * re-run `node scripts/blur.mjs` to refresh the placeholders.
 */
export function SmartImage({ src, alt, blur, ...rest }: Props) {
  return <Image src={src} alt={alt} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} {...rest} />;
}
