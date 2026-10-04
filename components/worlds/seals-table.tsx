import { cn } from "@/lib/utils";

export interface SealColumn { id: string; label: string; note: string; reweBio?: boolean }
export interface SealRow { id: string; criterion: string; values: string[] }

interface Props {
  columns: SealColumn[];
  rows: SealRow[];
  labels: { criterion: string; reweBio: string; legend: string; table?: string; scrollHint?: string };
  className?: string;
}

/**
 * „Siegel verstehen" (/bio): EU-Bio · Naturland · Bioland · Demeter against five criteria, `divide-y divide-line`.
 * The seals REWE Bio products carry get a small green square — the only accent, fenced to the Bio context.
 * Below md the table scrolls sideways: narrow sticky criterion column, a `data` hint with an arrow, a right-edge fade,
 * and the scroll region is keyboard-focusable (`tabIndex=0`, `role="region"`).
 */
export function SealsTable({ columns, rows, labels, className }: Props) {
  return (
    <div className={className}>
      {labels.scrollHint && <p className="data mb-3 text-ink-muted md:hidden">{labels.scrollHint} →</p>}
      <div className="relative">
        <div tabIndex={0} role="region" aria-label={labels.table ?? labels.criterion} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--focus)]">
          <table className="w-full min-w-[840px] border-collapse text-left text-[14px] leading-snug">
            <thead>
              <tr className="rule-strong align-top">
                <th scope="col" className="eyebrow sticky left-0 z-10 w-[6.5rem] bg-paper py-5 pr-3 align-top md:w-[18%] md:pr-6">{labels.criterion}</th>
                {columns.map((c) => (
                  <th key={c.id} scope="col" className="py-5 pr-6 align-top font-normal">
                    <span className="display block text-xl leading-none text-ink">{c.label}</span>
                    <span className="mt-2 block text-[12px] font-medium text-ink-muted">{c.note}</span>
                    {/* The marker line is reserved on every column so the four headers share one rhythm; hidden where it does not apply */}
                    <span className={cn("mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-bio-text", !c.reweBio && "invisible")}>
                      <span className="inline-block h-2 w-2 bg-bio" aria-hidden />
                      {labels.reweBio}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <th scope="row" className="sticky left-0 z-10 w-[6.5rem] bg-paper py-4 pr-3 text-[13px] font-semibold text-ink md:w-[18%] md:pr-6 md:text-[15px]">{r.criterion}</th>
                  {r.values.map((v, i) => (
                    <td key={columns[i]?.id ?? i} className={cn("py-4 pr-6 text-ink-2", columns[i]?.reweBio && "font-medium text-ink")}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Right-edge fade: a visual "more to the right" cue on phones only */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-paper to-transparent md:hidden" aria-hidden />
      </div>
      <p className="mt-4 max-w-[70ch] text-[12px] leading-relaxed text-ink-muted">{labels.legend}</p>
    </div>
  );
}
