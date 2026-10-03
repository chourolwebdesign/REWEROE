import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "inverse";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[15px] font-medium transition-[background-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold";

const variants: Record<Variant, string> = {
  primary: "bg-rewe text-forest hover:bg-rewe-deep shadow-[0_8px_24px_-12px_rgba(127,191,63,.8)]",
  secondary: "border border-forest/40 text-forest hover:bg-forest hover:text-cream dark:border-cream/40 dark:text-cream dark:hover:bg-cream dark:hover:text-forest",
  ghost: "text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-cream/10",
  gold: "border border-gold/70 text-forest hover:bg-gold hover:text-forest dark:text-cream",
  inverse: "bg-cream text-forest hover:bg-white",
};

interface CommonProps { variant?: Variant; className?: string; arrow?: boolean; children: React.ReactNode; size?: "sm" | "md" | "lg" }
type LinkProps = CommonProps & { href: string; onClick?: never; type?: never; disabled?: never };
type ButtonProps = CommonProps & { href?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>;

const sizes = { sm: "px-4 py-2 text-sm", md: "", lg: "px-7 py-4 text-base" };

export function Cta(props: LinkProps | ButtonProps) {
  const { variant = "primary", className, arrow = true, children, size = "md" } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2" aria-hidden />}
    </>
  );
  if ("href" in props && props.href) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Link href={props.href as any} className={cls}>{inner}</Link>;
  }
  const { variant: _v, className: _c, arrow: _a, children: _ch, size: _s, ...rest } = props as ButtonProps;
  void _v; void _c; void _a; void _ch; void _s;
  return <button className={cls} {...rest}>{inner}</button>;
}
