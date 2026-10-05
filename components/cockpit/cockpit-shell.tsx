import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/cockpit/anmelden/actions";
import { LogoMark } from "@/components/brand/logo";
import { CockpitNav } from "./cockpit-nav";

/** Rahmen des Cockpits: Kopf mit Name und Abmelden, Navigation unten (Handy) bzw. links (Desktop). */
export function CockpitShell({ editorName, children }: { editorName: string; children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-[100dvh] lg:grid-cols-[15rem_1fr]">
      <header className="flex items-center justify-between gap-4 bg-white px-4 py-3 shadow-[0_1px_0_var(--color-line)] lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:p-6 lg:shadow-[1px_0_0_var(--color-line)]">
        <Link href="/cockpit" className="flex min-h-11 items-center gap-3 font-display text-[1.125rem] font-bold">
          <LogoMark height={24} />
          Cockpit
        </Link>
        <CockpitNav />
        <div className="flex items-center gap-2 lg:mt-auto lg:flex-col lg:items-stretch">
          <p className="hidden text-[0.875rem] text-muted lg:block">Angemeldet als {editorName}</p>
          <a href="/" target="_blank" rel="noopener" className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-[0.9375rem] font-semibold hover:bg-soft lg:inline-flex">
            <ExternalLink className="size-4" aria-hidden /> Zur Website<span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
          <form action={signOut}>
            <button type="submit" data-action="logout" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9375rem] font-semibold hover:bg-soft">
              <LogOut className="size-4" aria-hidden /> Abmelden
            </button>
          </form>
        </div>
      </header>
      <main id="inhalt" className="mx-auto w-full max-w-4xl px-4 pt-6 pb-28 lg:px-10 lg:pt-10 lg:pb-16">
        {children}
      </main>
    </div>
  );
}
