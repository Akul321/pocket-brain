import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "amber" | "blue" | "purple" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    green: "badge-green",
    red: "badge-red",
    amber: "badge-amber",
    blue: "badge-blue",
    purple: "badge-purple",
    default: "badge bg-white/10 text-slate-300 border border-white/10",
  };
  return <span className={cn(variants[variant], className)}>{children}</span>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    success: { label: "Good", variant: "green" },
    warning: { label: "Warning", variant: "amber" },
    danger: { label: "Alert", variant: "red" },
    info: { label: "Info", variant: "blue" },
  };
  const { label, variant } = map[severity] || { label: severity, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}
