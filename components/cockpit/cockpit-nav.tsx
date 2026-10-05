"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { COCKPIT_NAV } from "./nav-items";

/** Mobil feste Leiste unten, ab 1024 px senkrecht im Seitenkopf. */
export function CockpitNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Cockpit" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:static lg:border-0 lg:pb-0">
      <ul className="grid grid-cols-2 lg:grid-cols-1 lg:gap-1">
        {COCKPIT_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/cockpit" ? pathname === "/cockpit" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.8125rem] font-semibold lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-full lg:px-3 lg:text-[0.9375rem]",
                  active ? "text-red lg:bg-red-tint" : "text-ink-2 hover:bg-soft",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
