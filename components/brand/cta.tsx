import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type CtaVariant = "primary" | "secondary" | "ghost" | "inverse" | "link" | "danger";
export type CtaSize = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[2px] font-sans font-semibold leading-none whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--dur-ui)] ease-[var(--ease-ui)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--focus)] disabled:pointer-events-none active:translate-y-px";

/** Minimum height 44 px everywhere (sm = 44). */
const sizes: Record<CtaSize, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

const secondary =
  "border border-line-strong bg-transparent text-ink hover:bg-ink hover:text-paper active:bg-ink/90 disabled:border-line disabled:text-ink-muted";

const variants: Record<CtaVariant, string> = {
  /** ≤ 1 per viewport. Disabled is a grey fill (5.66:1), never opacity. Dark-mode hover ring comes from `.btn-primary:hover` in globals. */
  primary: "btn-primary bg-red text-white hover:bg-red-hover active:bg-red-deep disabled:bg-surface-2 disabled:text-ink-muted",
  /** On blocks the border/text flip to block-ink via tokens; hover becomes white on anthracite. */
  secondary,
  /** Text-only actions („Einstellungen", „Ändern"). */
  ghost: "text-ink underline-offset-[6px] hover:underline hover:decoration-red hover:decoration-2 disabled:text-ink-muted",
  /** Inside `.on-block` only — static classes because `--paper` is re-pointed there. */
  inverse: "bg-white text-[#141414] hover:bg-[#E6E6E6] active:bg-[#E6E6E6]",
  /** Inline links in copy. */
  link: "px-0 text-ink underline decoration-red decoration-2 underline-offset-[6px] hover:decoration-[3px]",
  /** Destructive confirmations. */
  danger: "border border-error/40 text-error hover:bg-error/8",
};

interface CommonProps { variant?: CtaVariant; className?: string; arrow?: boolean; children: React.ReactNode; size?: CtaSize }
type LinkProps = CommonProps & { href: string; onClick?: never; type?: never; disabled?: never };
type ButtonProps = CommonProps & { href?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Cta(props: LinkProps | ButtonProps) {
  const { variant = "primary", className, arrow = true, children, size = "md" } = props;
  const cls = cn(base, sizes[size], variants[variant], className);
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-[var(--dur-ui)] ease-[var(--ease-ui)] group-hover:translate-x-1" aria-hidden />}
    </>
  );
  if ("href" in props && props.href) {
    return <Link href={props.href} className={cls}>{inner}</Link>;
  }
  const { variant: _v, className: _c, arrow: _a, children: _ch, size: _s, ...rest } = props as ButtonProps;
  void _v; void _c; void _a; void _ch; void _s;
  return <button className={cls} {...rest}>{inner}</button>;
}
