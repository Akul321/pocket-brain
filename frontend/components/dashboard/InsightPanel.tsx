"use client";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Insight } from "@/lib/types";
import { getSeverityBg, getSeverityColor } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: TrendingUp,
};

export function InsightPanel({ insights }: { insights: Insight[] }) {
  if (!insights?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
        <Lightbulb size={32} className="mb-2 opacity-40" />
        <p className="text-sm">Add transactions to get AI insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => {
        const Icon = icons[insight.severity as keyof typeof icons] || Info;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex gap-3 p-3.5 rounded-xl border text-sm ${getSeverityBg(insight.severity)}`}
          >
            <Icon size={15} className={`shrink-0 mt-0.5 ${getSeverityColor(insight.severity)}`} />
            <p className="text-slate-300 leading-relaxed">{insight.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
