import Link from "next/link";
import { cn } from "@/lib/utils";

/** Karte in der Übersicht: Titel, Statuszeilen, eine Aktion; `alert` hebt hervor, was zu tun ist. */
export function StatusCard({
  name,
  title,
  lines,
  action,
  alert = false,
}: {
  /** für Tests und Sprungziele: data-card */
  name?: string;
  title: string;
  lines: string[];
  action: { href: string; label: string };
  alert?: boolean;
}) {
  return (
    <section data-card={name} className={cn("rounded-[1.75rem] p-6 md:p-7", alert ? "bg-red text-white" : "bg-white")}>
      <h2 className="text-h3">{title}</h2>
      <ul className="mt-3 grid gap-1">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <Link href={action.href} className={cn("mt-5 inline-flex min-h-11 items-center rounded-full px-5 font-semibold", alert ? "bg-white text-ink" : "bg-ink text-white")}>
        {action.label}
      </Link>
    </section>
  );
}
