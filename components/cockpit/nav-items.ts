import { LayoutDashboard, Newspaper } from "lucide-react";

/** Navigation des Cockpits; spätere Stufen ergänzen Feedback und Inhalte. */
export const COCKPIT_NAV = [
  { href: "/cockpit", label: "Übersicht", icon: LayoutDashboard },
  { href: "/cockpit/prospekt", label: "Prospekt", icon: Newspaper },
] as const;
