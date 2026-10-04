"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface SeasonRow { id: string; item: string; months: number[] }

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Saisonkalender Hessen (/regional): `num` heatmap table — produce rows × 12 months. In-season cells are `bg-bio-tint`
 * plus an 8 px `bio-text` square (the tint alone is 1.10:1 against paper); the current month column is opened by a 3 px
 * red rule. Fixed table layout: row header 7.5 rem below md, month cells 44 px → 648 px, so the table scrolls
 * horizontally on narrow screens with the first column sticky. On mount the wrapper scrolls the current month into the
 * visible pane; while months remain hidden to the right a paper fade + arrow marks the edge.
 * The scroll wrapper is `relative`: the absolutely positioned `sr-only` cell texts would otherwise escape its clip and
 * widen the page (document.scrollWidth > viewport at 390 px).
 * The current month is resolved after mount so the static page never bakes a build-time month in.
 */
export function SeasonCalendar({ rows, className }: { rows: SeasonRow[]; className?: string }) {
  const t = useTranslations("regional");
  const locale = useLocale();
  const mounted = useMounted();
  const current = mounted ? new Date().getMonth() + 1 : null;
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const labels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", { month: "short" });
    return MONTHS.map((m) => fmt.format(new Date(2026, m - 1, 1)).replace(".", ""));
  }, [locale]);

  // Centre the current month in the pane right of the sticky column (instant — this is layout, not motion), then keep
  // the right-edge affordance in sync with scroll position and size.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
    if (current) {
      const th = el.querySelector<HTMLElement>("[data-current]");
      const head = el.querySelector<HTMLElement>("[data-head]");
      if (th) {
        const headW = head?.offsetWidth ?? 0;
        const pane = el.clientWidth - headW;
        el.scrollLeft = Math.max(0, th.offsetLeft - headW - (pane - th.offsetWidth) / 2);
      }
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", update); };
  }, [current]);

  return (
    <div className={cn("min-w-0 max-w-full", className)}>
      <div className="relative">
        <div ref={scroller} className="relative max-w-full overflow-x-auto" role="region" aria-label={t("seasonAria")} tabIndex={0}>
          <table className="num w-full table-fixed border-collapse text-[13px]">
            <caption className="sr-only">{t("seasonAria")}</caption>
            <thead>
              <tr className="rule-strong">
                <th scope="col" data-head="" className="eyebrow sticky left-0 z-10 w-[7.5rem] bg-paper py-3 pr-4 text-left md:w-auto md:pr-6">{t("seasonProduce")}</th>
                {MONTHS.map((m, i) => (
                  <th
                    key={m}
                    scope="col"
                    data-current={m === current ? "" : undefined}
                    className={cn("w-11 border-l border-line py-3 text-center text-[12px] font-semibold text-ink-muted", m === current && "border-l-[3px] border-l-red text-ink")}
                  >
                    {labels[i]}
                    {m === current && <span className="sr-only"> ({t("seasonCurrent")})</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="sticky left-0 z-10 bg-paper py-2 pr-4 text-left text-[14px] font-medium leading-tight text-ink md:whitespace-nowrap md:py-0 md:pr-6">{r.item}</th>
                  {MONTHS.map((m) => {
                    const on = r.months.includes(m);
                    return (
                      <td key={m} className={cn("h-11 border-l border-line p-0 text-center", on && "bg-bio-tint", m === current && "border-l-[3px] border-l-red")}>
                        {on && <span className="mx-auto block h-2 w-2 bg-bio-text" aria-hidden />}
                        <span className="sr-only">{on ? t("seasonInSeason") : t("seasonOff")}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Right-edge affordance while months remain hidden (narrow screens): paper fade + arrow at header height */}
        <div
          className={cn("pointer-events-none absolute inset-y-0 right-0 flex w-10 items-start justify-end bg-linear-to-l from-paper to-transparent pt-3 transition-opacity duration-[var(--dur-ui)]", more ? "opacity-100" : "opacity-0")}
          aria-hidden
        >
          <ArrowRight className="h-4 w-4 text-ink-muted" />
        </div>
      </div>
      <ul className="data mt-4 flex flex-wrap gap-x-6 gap-y-2 text-ink-muted" aria-hidden>
        <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center border border-line bg-bio-tint"><span className="h-2 w-2 bg-bio-text" /></span>{t("seasonInSeason")}</li>
        <li className="flex items-center gap-2"><span className="inline-block h-[3px] w-3 bg-red" />{t("seasonCurrent")}</li>
      </ul>
    </div>
  );
}
