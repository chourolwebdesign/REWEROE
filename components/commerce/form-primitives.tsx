import { cloneElement, isValidElement } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Box input (§4.28) layered over the stock shadcn `Input` / `Textarea` / `SelectTrigger` (which are NOT restyled):
 * 48 px, 2 px radius, `line-input` border (4.54:1), paper fill, inset 2 px focus ring, `aria-invalid` → error border.
 * `md:text-[15px]` neutralises shadcn's `md:text-sm`; the ring resets drop shadcn's 3 px halo.
 */
export const boxInput =
  "h-12 rounded-[2px] border-line-input bg-paper px-3 text-[15px] text-ink placeholder:text-ink-muted outline-none transition-colors duration-[var(--dur-ui)] md:text-[15px] focus-visible:border-ink focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[color:var(--focus)] aria-invalid:border-error aria-invalid:ring-0";

/** Textarea flavour of the box input. */
export const boxTextarea = cn(boxInput, "h-auto min-h-32 py-3");

/** shadcn `SelectTrigger` sizes itself via `data-[size=default]:h-8` — override at the same specificity. */
export const boxSelect = cn(boxInput, "w-full data-[size=default]:h-12 [&_svg]:text-ink-muted");

/** Figtree 600 13 px label. */
export function FieldLabel({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return <Label htmlFor={htmlFor} className={cn("mb-2 block text-[13px] font-semibold text-ink", className)}>{children}</Label>;
}

/** Error line: never colour alone — `AlertCircle` 14 px beside the message. Reserves its height so layouts do not jump. */
export function FieldError({ id, msg, className }: { id?: string; msg?: string; className?: string }) {
  return (
    <p id={id} className={cn("mt-1.5 flex min-h-5 items-center gap-1.5 text-[12px] font-medium text-error", className)} aria-live="polite">
      {msg ? (<><AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />{msg}</>) : null}
    </p>
  );
}

type ControlProps = { id?: string; "aria-describedby"?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"] };

/**
 * Label + control + error line. The error line carries `id="${id}-error"`; when the direct child is the control itself
 * (its `id` matches), `aria-describedby` / `aria-invalid` are injected so the message is announced with the field.
 */
export function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  const errorId = `${id}-error`;
  const control =
    isValidElement<ControlProps>(children) && children.props.id === id
      ? cloneElement(children, {
          "aria-describedby": error ? [errorId, children.props["aria-describedby"]].filter(Boolean).join(" ") : children.props["aria-describedby"],
          "aria-invalid": error ? true : children.props["aria-invalid"],
        })
      : children;
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {control}
      <FieldError id={errorId} msg={error} />
    </div>
  );
}

const stepNum = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Step indicator (§4.27): hairline cells, 2 px track with a red fill, `data` labels „01 Adresse". Below `sm` the cells
 * show the numerals only (names stay in the accessibility tree) and the current step's name sits beneath the track.
 */
export function StepTrack({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return (
    <div>
      <ol className="grid divide-x divide-line border-y border-line" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label={label}>
        {steps.map((s, i) => (
          <li key={s} className="px-3 py-3" aria-current={i === current ? "step" : undefined}>
            <div className="h-[2px] w-full bg-surface-2" aria-hidden>
              <div className="h-full bg-red transition-[width] duration-[var(--dur-move)] ease-[var(--ease-ui)]" style={{ width: i <= current ? "100%" : "0%" }} />
            </div>
            <p className={cn("data mt-2 truncate", i === current ? "text-ink" : "text-ink-muted")}>
              {stepNum(i)}<span className="max-sm:sr-only"> {s}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className="data mt-3 text-ink sm:hidden" aria-hidden>{stepNum(current)} {steps[current]}</p>
    </div>
  );
}

/** Radio / mode card (§4.27): hairline, hover surface; selected = strong border + 3 px red left rule + red tint. */
export const choiceCard = "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[2px] border border-line px-4 py-3 text-left text-sm text-ink transition-colors duration-[var(--dur-ui)] hover:bg-surface";
export const choiceCardOn = "border-line-strong border-l-[3px] border-l-red bg-red-tint hover:bg-red-tint";

/** Empty / done plates share one shell. */
export const plate = "border border-line bg-card p-6 md:p-10";
