"use client";
import { Search } from "lucide-react";
import { useUi } from "@/lib/store/ui";
import { Cta } from "@/components/brand/cta";

export function SearchTrigger({ label }: { label: string }) {
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  return <Cta onClick={() => setSearchOpen(true)} arrow={false}><Search className="h-4 w-4" /> {label}</Cta>;
}
