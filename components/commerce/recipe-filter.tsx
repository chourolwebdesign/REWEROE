"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface RecipeLite { slug: string; time: number; difficulty: string; season: string; diet: string[] }

/** Client filter bar; renders children keyed by slug via render-prop to keep cards server-rendered. */
function Group({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: [string, string][]; allLabel?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="eyebrow mr-2">{label}</span>
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => set(v)} aria-pressed={value === v} className={cn("mono rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors", value === v ? "border-forest bg-forest text-cream dark:border-cream dark:bg-cream dark:text-forest" : "border-line hover:bg-forest/5")}>{l}</button>
      ))}
    </div>
  );
}

export function RecipeFilter({ recipes, cards }: { recipes: RecipeLite[]; cards: Record<string, React.ReactNode> }) {
  const t = useTranslations("recipes");
  const tc = useTranslations("common");
  const [time, setTime] = useState<"all" | "u30" | "30-60" | "o60">("all");
  const [diff, setDiff] = useState<string>("all");
  const [diet, setDiet] = useState<string>("all");
  const [season, setSeason] = useState<string>("all");

  const list = useMemo(() => recipes.filter((r) =>
    (time === "all" || (time === "u30" && r.time < 30) || (time === "30-60" && r.time >= 30 && r.time <= 60) || (time === "o60" && r.time > 60)) &&
    (diff === "all" || r.difficulty === diff) && (diet === "all" || r.diet.includes(diet)) && (season === "all" || r.season === season || r.season === "ganzjaehrig"),
  ), [recipes, time, diff, diet, season]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-line py-5">
        <Group label={t("filterTime")} value={time} set={(v) => setTime(v as typeof time)} allLabel={tc("all")} options={[["all", tc("all")], ["u30", t("timeUnder30")], ["30-60", t("time30to60")], ["o60", t("timeOver60")]]} />
        <Group label={t("filterDifficulty")} value={diff} set={setDiff} options={[["all", tc("all")], ["leicht", tc("difficulty.leicht")], ["mittel", tc("difficulty.mittel")], ["schwer", tc("difficulty.schwer")]]} />
        <Group label={t("filterDiet")} value={diet} set={setDiet} options={[["all", tc("all")], ["vegetarisch", "Vegetarisch"], ["vegan", tc("badges.vegan")], ["glutenfrei", tc("badges.glutenfrei")]]} />
        <Group label={t("filterSeason")} value={season} set={setSeason} options={[["all", tc("all")], ["fruehling", tc("season.fruehling")], ["sommer", tc("season.sommer")], ["herbst", tc("season.herbst")], ["winter", tc("season.winter")]]} />
      </div>
      {list.length === 0 ? <p className="py-16 text-center text-ink-muted">{t("noMatch")}</p> : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <div key={r.slug}>{cards[r.slug]}</div>)}</div>
      )}
    </div>
  );
}
