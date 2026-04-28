import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "₹"): string {
  return `${currency}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case "success":
      return "text-green-400";
    case "danger":
      return "text-red-400";
    case "warning":
      return "text-amber-400";
    default:
      return "text-blue-400";
  }
}

export function getSeverityBg(severity: string) {
  switch (severity) {
    case "success":
      return "bg-green-500/10 border-green-500/20";
    case "danger":
      return "bg-red-500/10 border-red-500/20";
    case "warning":
      return "bg-amber-500/10 border-amber-500/20";
    default:
      return "bg-blue-500/10 border-blue-500/20";
  }
}

export function getRiskColor(level: string) {
  switch (level) {
    case "Low":
      return "text-green-400";
    case "Medium":
      return "text-amber-400";
    case "High":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: "#f97316",
    Transport: "#3b82f6",
    Shopping: "#8b5cf6",
    Rent: "#ec4899",
    Subscriptions: "#06b6d4",
    Education: "#22c55e",
    Entertainment: "#eab308",
    Health: "#ef4444",
    Investments: "#10b981",
    Income: "#22c55e",
    Miscellaneous: "#6b7280",
  };
  return colors[category] || "#6b7280";
}

export function getStatusColor(status: string) {
  switch (status) {
    case "safe":
      return "text-green-400";
    case "near":
      return "text-amber-400";
    case "over":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}
