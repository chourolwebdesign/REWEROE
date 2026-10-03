import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, as: Tag = "p" }: { children: React.ReactNode; className?: string; as?: "p" | "span" | "div" }) {
  return <Tag className={cn("eyebrow", className)}>{children}</Tag>;
}
