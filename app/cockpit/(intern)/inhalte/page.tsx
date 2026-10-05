import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CalendarClock, CalendarDays } from "lucide-react";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow } from "@/lib/hours";

export const metadata: Metadata = { title: "Inhalte" };

export default async function InhaltePage() {
  const { supabase } = await requireEditor();
  const today = berlinNow(new Date()).date;
  const counts = await Promise.all([
    supabase.from("special_days").select("date", { count: "exact", head: true }).gte("date", today),
    supabase.from("events").select("id", { count: "exact", head: true }).gte("date", today),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("active", true).or(`valid_through.is.null,valid_through.gte.${today}`),
  ]);
  if (counts.some((c) => c.error)) throw new Error("Inhalte konnten nicht geladen werden.");
  const [days, events, jobs] = counts.map((c) => c.count ?? 0);
  const areas = [
    { href: "/cockpit/inhalte/sondertage", icon: CalendarClock, title: "Sondertage", text: "Geänderte Öffnungszeiten – etwa an Heiligabend oder wegen Inventur.", count: `${days} geplant` },
    { href: "/cockpit/inhalte/termine", icon: CalendarDays, title: "Termine", text: "Verkostungen und Aktionstage – auf der Startseite und im Markt-Kalender.", count: `${events} kommend` },
    { href: "/cockpit/inhalte/stellen", icon: Briefcase, title: "Stellen", text: "Offene Stellen auf der Karriereseite.", count: `${jobs} online` },
  ];
  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Inhalte</h1>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {areas.map(({ href, icon: Icon, title, text, count }) => (
          <li key={href}>
            <Link href={href} className="flex h-full flex-col rounded-[1.75rem] bg-white p-6 transition-transform duration-150 active:scale-[0.98]">
              <Icon className="size-7 text-red" aria-hidden />
              <h2 className="mt-4 text-h3">{title}</h2>
              <span className="mt-2 text-muted">{text}</span>
              <span className="mt-4 font-semibold">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
