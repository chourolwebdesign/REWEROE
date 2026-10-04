import { cn } from "@/lib/utils";

export interface SealColumn { id: string; label: string; note: string; reweBio?: boolean }
export interface SealRow { id: string; criterion: string; values: string[] }

interface Props {
  columns: SealColumn[];
  rows: SealRow[];
  labels: { criterion: string; reweBio: string; legend: string };
  className?: string;
}

/**
 * „Siegel verstehen" (/bio): EU-Bio · Naturland · Bioland · Demeter against five criteria, `divide-y divide-line`.
 * The seals REWE Bio products carry get a small green square — the only accent, fenced to the Bio context.
 */
export function SealsTable({ columns, rows, labels, className }: Props) {
  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left text-[14px] leading-snug">
          <thead>
            <tr className="rule-strong align-bottom">
              <th scope="col" className="eyebrow sticky left-0 z-10 w-[18%] bg-paper py-5 pr-6 align-bottom">{labels.criterion}</th>
              {columns.map((c) => (
                <th key={c.id} scope="col" className="py-5 pr-6 align-bottom font-normal">
                  <span className="display block text-xl leading-none text-ink">{c.label}</span>
                  <span className="mt-2 block text-[12px] font-medium text-ink-muted">{c.note}</span>
                  {c.reweBio && (
                    <span className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-bio-text">
                      <span className="inline-block h-2 w-2 bg-bio" aria-hidden />
                      {labels.reweBio}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <th scope="row" className="sticky left-0 z-10 bg-paper py-4 pr-6 text-[15px] font-semibold text-ink">{r.criterion}</th>
                {r.values.map((v, i) => (
                  <td key={columns[i]?.id ?? i} className={cn("py-4 pr-6 text-ink-2", columns[i]?.reweBio && "font-medium text-ink")}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-[70ch] text-[12px] leading-relaxed text-ink-muted">{labels.legend}</p>
    </div>
  );
}
