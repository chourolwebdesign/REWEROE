import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { FeedbackCard } from "@/components/cockpit/feedback-card";
import { requireEditor } from "@/lib/cockpit/auth";
import { FEEDBACK_FIELDS, feedbackStats, inboxFilter, inboxHref, type FeedbackRow, type InboxFilter } from "@/lib/feedback/inbox";
import { allPages } from "@/lib/feedback/pages";
import { FEEDBACK_TEXTS } from "@/lib/feedback/texts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Feedback" };

const STATUS: { value: InboxFilter["status"]; label: string }[] = [
  { value: "neu", label: "Neu" },
  { value: "erledigt", label: "Erledigt" },
  { value: "alle", label: "Alle" },
];

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("inline-flex min-h-11 items-center rounded-full px-4 font-semibold", active ? "bg-ink text-white" : "bg-white text-ink hover:bg-soft-2")}>
      {children}
    </Link>
  );
}

export default async function FeedbackInboxPage({ searchParams }: PageProps<"/cockpit/feedback">) {
  const { supabase } = await requireEditor();
  const filter = inboxFilter(await searchParams);
  const now = new Date();
  let query = supabase.from("feedback").select(FEEDBACK_FIELDS).order("created_at", { ascending: false }).limit(200);
  if (filter.status !== "alle") query = query.eq("status", filter.status);
  if (filter.stars) query = query.eq("rating", filter.stars);
  const since = new Date(now.getTime() - 30 * 864e5).toISOString();
  const [{ data: rows }, recent] = await Promise.all([
    query,
    // alle Zeilen der 30 Tage, seitenweise (je Abfrage höchstens 1000)
    allPages<Pick<FeedbackRow, "created_at" | "rating" | "aspects">>((from, to) =>
      supabase.from("feedback").select("created_at,rating,aspects").gte("created_at", since).order("created_at", { ascending: false }).order("id").range(from, to),
    ),
  ]);
  const stats = feedbackStats(recent, now);
  const de = FEEDBACK_TEXTS.de;

  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Feedback</h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-5">
          <dt className="text-[0.875rem] text-muted">Durchschnitt (30 Tage)</dt>
          <dd className="mt-1 font-display text-[1.75rem] font-extrabold">{stats.average === null ? "–" : `${stats.average.toLocaleString("de-DE")} von 5`}</dd>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5">
          <dt className="text-[0.875rem] text-muted">Rückmeldungen (30 Tage)</dt>
          <dd className="mt-1 font-display text-[1.75rem] font-extrabold">{stats.count}</dd>
        </div>
        <div className="col-span-2 rounded-[1.5rem] bg-white p-5 sm:col-span-1">
          <dt className="text-[0.875rem] text-muted">Häufigste Bereiche</dt>
          <dd className="mt-1 font-semibold">{stats.top.length ? stats.top.map((t) => `${de.aspects[t.aspect]} (${t.count})`).join(", ") : "–"}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex flex-wrap gap-2">
          {STATUS.map((s) => (
            <Chip key={s.value} href={inboxHref({ ...filter, status: s.value })} active={filter.status === s.value}>
              {s.label}
            </Chip>
          ))}
          <Chip href={inboxHref({ ...filter, stars: null })} active={filter.stars === null}>
            Alle Sterne
          </Chip>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip key={n} href={inboxHref({ ...filter, stars: n })} active={filter.stars === n}>
              {n === 1 ? "1 Stern" : `${n} Sterne`}
            </Chip>
          ))}
        </nav>
        <a href="/cockpit/feedback/export" download className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold hover:bg-soft-2">
          <Download className="size-5" aria-hidden /> CSV exportieren
        </a>
      </div>

      {rows?.length ? (
        <ul className="mt-6 grid gap-3">
          {(rows as FeedbackRow[]).map((r) => (
            <li key={r.id}>
              <FeedbackCard row={r} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-[1.5rem] bg-white p-6 text-muted">Keine Rückmeldungen in dieser Ansicht.</p>
      )}
    </>
  );
}
