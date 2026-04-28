"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { getRisk } from "@/lib/api";
import type { Risk } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";

function RiskMeter({ score, level }: { score: number; level: string }) {
  const r = 70;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = level === "Low" ? "#22c55e" : level === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background arc */}
        <path
          d={`M 20 100 A ${r} ${r} 0 0 1 160 100`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated score arc */}
        <motion.path
          d={`M 20 100 A ${r} ${r} 0 0 1 160 100`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x="90" y="88" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">
          {score}
        </text>
        <text x="90" y="106" textAnchor="middle" fill={color} fontSize="12" fontWeight="600">
          {level} Risk
        </text>
      </svg>
      <div className="flex gap-6 mt-1 text-xs text-slate-500">
        <span>0 — Danger</span>
        <span>100 — Safe</span>
      </div>
    </div>
  );
}

const severityMap = {
  danger: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: AlertTriangle },
  info: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CheckCircle },
};

export default function RiskPage() {
  const [risk, setRisk] = useState<Risk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRisk().then((d) => { setRisk(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (!risk) return null;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Risk Radar</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Meter */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-white">Financial Risk Score</h3>
          </CardHeader>
          <CardBody className="flex flex-col items-center gap-4">
            <RiskMeter score={risk.score} level={risk.level} />
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Score is based on savings rate, expense ratio, subscription burden, budget adherence, and goal progress.
            </p>
          </CardBody>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-400" />
              <h3 className="text-sm font-semibold text-white">Recommended Actions</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {risk.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <ArrowRight size={13} className="shrink-0 mt-1 text-green-400" />
                {rec}
              </motion.div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Risk breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Risk Breakdown</h3>
          </div>
        </CardHeader>
        <CardBody>
          {risk.risks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-500">
              <ShieldCheck size={36} className="mb-2 text-green-400" />
              <p className="text-sm">No risks detected. Excellent financial health!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risk.risks.map((r, i) => {
                const s = severityMap[r.severity as keyof typeof severityMap] || severityMap.info;
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn("flex gap-3 p-4 rounded-xl border", s.bg)}
                  >
                    <Icon size={16} className={cn("shrink-0 mt-0.5", s.color)} />
                    <div>
                      <p className={cn("text-sm font-semibold", s.color)}>{r.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
