"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface SeasonRow { id: string; item: string; months: number[] }

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Saisonkalender Hessen (/regional): `num` heatmap table — produce rows × 12 months, in-season cells `bg-bio-tint`,
 * the current month column opened by a 3 px red rule. Horizontal scroll on narrow screens, first column sticky.
 * The current month is resolved after mount so the static page never bakes a build-time month in.
 */
export function SeasonCalendar({ rows, className }: { rows: SeasonRow[]; className?: string }) {
  const t = useTranslations("regional");
  const locale = useLocale();
  const mounted = useMounted();
  const current = mounted ? new Date().getMonth() + 1 : null;
  const labels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", { month: "short" });
    return MONTHS.map((m) => fmt.format(new Date(2026, m - 1, 1)).replace(".", ""));
  }, [locale]);

  return (
    <div className={className}>
      <div className="overflow-x-auto" role="region" aria-label={t("seasonAria")} tabIndex={0}>
        <table className="num w-full min-w-[760px] border-collapse text-[13px]">
          <caption className="sr-only">{t("seasonAria")}</caption>
          <thead>
            <tr className="rule-strong">
              <th scope="col" className="eyebrow sticky left-0 z-10 bg-paper py-3 pr-6 text-left">{t("seasonProduce")}</th>
              {MONTHS.map((m, i) => (
                <th key={m} scope="col" className={cn("border-l border-line py-3 text-center text-[12px] font-semibold text-ink-muted", m === current && "border-l-[3px] border-l-red text-ink")}>
                  {labels[i]}
                  {m === current && <span className="sr-only"> ({t("seasonCurrent")})</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-paper py-0 pr-6 text-left text-[14px] font-medium text-ink">{r.item}</th>
                {MONTHS.map((m) => {
                  const on = r.months.includes(m);
                  return (
                    <td key={m} className={cn("h-11 border-l border-line p-0 text-center", on && "bg-bio-tint", m === current && "border-l-[3px] border-l-red")}>
                      <span className="sr-only">{on ? t("seasonInSeason") : t("seasonOff")}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="data mt-4 flex flex-wrap gap-x-6 gap-y-2 text-ink-muted" aria-hidden>
        <li className="flex items-center gap-2"><span className="inline-block h-3 w-3 border border-line bg-bio-tint" />{t("seasonInSeason")}</li>
        <li className="flex items-center gap-2"><span className="inline-block h-[3px] w-3 bg-red" />{t("seasonCurrent")}</li>
      </ul>
    </div>
  );
}
