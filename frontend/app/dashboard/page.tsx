"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, PiggyBank,
  Percent, Shield, Wallet, Lightbulb, RefreshCw,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InsightPanel } from "@/components/dashboard/InsightPanel";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { getSummary, getTransactions, getProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Summary, Transaction, UserProfile } from "@/lib/types";

function buildTrendData(transactions: Transaction[]) {
  const monthMap: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const m = t.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { income: 0, expenses: 0 };
    if (t.type === "income") monthMap[m].income += t.amount;
    else monthMap[m].expenses += t.amount;
  });
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      income: vals.income,
      expenses: vals.expenses,
      savings: vals.income - vals.expenses,
    }));
}

function buildCategoryData(transactions: Transaction[]) {
  const cat: Record<string, number> = {};
  const currMonth = new Date().toISOString().slice(0, 7);
  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currMonth))
    .forEach((t) => { cat[t.category] = (cat[t.category] || 0) + t.amount; });
  return Object.entries(cat)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const router = useRouter();
  const refreshKey = useAppStore((s) => s.refreshKey);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [s, t, p] = await Promise.all([getSummary(), getTransactions(), getProfile()]);
      if (!p) { router.replace("/onboarding"); return; }
      setSummary(s);
      setTransactions(t);
      setProfile(p);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch whenever a transaction is added/imported from any page
  useEffect(() => {
    fetchAll(refreshKey > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const trendData = useMemo(() => buildTrendData(transactions), [transactions]);
  const categoryData = useMemo(() => buildCategoryData(transactions), [transactions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  const riskColor =
    summary?.risk_level === "Low" ? "green"
    : summary?.risk_level === "Medium" ? "amber"
    : "red";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome back, <span className="gradient-text">{profile?.name ?? "..."}</span> 👋
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Here's your financial snapshot for this month.
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 btn-secondary py-1.5 px-3"
          title="Refresh dashboard"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Monthly Income" value={summary?.monthly_income ?? 0} icon={TrendingUp} color="green" delay={0.05} />
        <MetricCard label="Monthly Expenses" value={summary?.monthly_expenses ?? 0} icon={TrendingDown} color="red" delay={0.1} />
        <MetricCard
          label="Net Savings" value={summary?.net_savings ?? 0} icon={PiggyBank}
          color={summary?.net_savings && summary.net_savings >= 0 ? "blue" : "red"} delay={0.15}
        />
        <MetricCard
          label="Savings Rate" value={summary?.savings_rate ?? 0} prefix="" suffix="%" icon={Percent}
          color={
            summary?.savings_rate && summary.savings_rate >= 20 ? "green"
            : summary?.savings_rate && summary.savings_rate >= 10 ? "amber" : "red"
          }
          decimals={1} delay={0.2}
        />
        <MetricCard label="Risk Level" value={0} prefix={summary?.risk_level ?? ""} suffix="" icon={Shield} color={riskColor} delay={0.25} />
        <MetricCard label="Cash Left" value={summary?.cash_left ?? 0} icon={Wallet} color="blue" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card delay={0.35}>
          <CardHeader><h3 className="text-sm font-semibold text-slate-200">Income vs Expenses Trend</h3></CardHeader>
          <CardBody><TrendChart data={trendData} /></CardBody>
        </Card>
        <Card delay={0.4}>
          <CardHeader><h3 className="text-sm font-semibold text-slate-200">Spending by Category</h3></CardHeader>
          <CardBody><SpendingChart data={categoryData} /></CardBody>
        </Card>
      </div>

      {/* AI Insights */}
      <Card delay={0.45}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Lightbulb size={13} className="text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">AI Insights</h3>
            <span className="ml-auto text-xs text-slate-500">Based on your real data</span>
          </div>
        </CardHeader>
        <CardBody><InsightPanel insights={summary?.insights ?? []} /></CardBody>
      </Card>
    </div>
  );
}
