"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "green" | "red" | "amber" | "blue" | "purple";
  delay?: number;
  decimals?: number;
}

const colorMap = {
  green: {
    icon: "text-green-400 bg-green-500/10",
    value: "text-green-400",
    glow: "hover:shadow-glow-green",
  },
  red: {
    icon: "text-red-400 bg-red-500/10",
    value: "text-red-400",
    glow: "hover:shadow-glow-red",
  },
  amber: {
    icon: "text-amber-400 bg-amber-500/10",
    value: "text-amber-400",
    glow: "hover:shadow-glow-amber",
  },
  blue: {
    icon: "text-blue-400 bg-blue-500/10",
    value: "text-blue-400",
    glow: "hover:shadow-glow-blue",
  },
  purple: {
    icon: "text-purple-400 bg-purple-500/10",
    value: "text-purple-400",
    glow: "",
  },
};

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    const formatted = v.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

export function MetricCard({
  label,
  value,
  prefix = "₹",
  suffix = "",
  icon: Icon,
  trend,
  trendUp,
  color = "green",
  delay = 0,
  decimals = 0,
}: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card p-5 flex flex-col gap-3 transition-all duration-300",
        colors.glow
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors.icon)}>
          <Icon size={17} />
        </div>
      </div>
      <div className={cn("text-2xl font-bold", colors.value)}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {trend && (
        <div className={cn("text-xs font-medium", trendUp ? "text-green-400" : "text-red-400")}>
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </motion.div>
  );
}
