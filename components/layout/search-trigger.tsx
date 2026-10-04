"use client";
import { Search } from "lucide-react";
import { useUi } from "@/lib/store/ui";
import { Cta } from "@/components/brand/cta";

/** Secondary (outline) trigger for the SearchDialog — inside `.on-block` the border and text flip to white via tokens. */
export function SearchTrigger({ label }: { label: string }) {
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  return (
    <Cta variant="secondary" onClick={() => setSearchOpen(true)} arrow={false}>
      <span className="inline-flex items-center gap-2"><Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />{label}</span>
    </Cta>
  );
}
