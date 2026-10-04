"use client";

import { Printer } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function PrintButton({ label = "Drucken" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClasses("ink")}>
      <Printer className="size-[1.05em]" aria-hidden />
      {label}
    </button>
  );
}
