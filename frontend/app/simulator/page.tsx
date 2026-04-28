"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ArrowRight, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { simulate } from "@/lib/api";
import type { SimulateResult } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

const SCENARIOS = [
  { label: "Buy a ₹60,000 phone", values: { one_time_purchase: 60000 } },
  { label: "Reduce food by 30%", values: { category: "Food", category_reduction_pct: 30 } },
  { label: "Income +₹5,000", values: { income_change: 5000 } },
  { label: "Save ₹3,000 more/month", values: { goal_contribution_change: 3000 } },
];

function CompareCard({ label, current, simulated, currency = "₹", suffix = "" }: { label: string; current: number; simulated: number; currency?: string; suffix?: string }) {
  const improved = simulated >= current;
  const delta = simulated - current;
  return (
    <div className="glass-card p-4 space-y-2">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <div className="flex items-end gap-3">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-0.5">Current</p>
          <p className="text-lg font-bold text-slate-300">{currency}{current.toLocaleString("en-IN")}{suffix}</p>
        </div>
        <ArrowRight size={16} className="text-slate-600 mb-1" />
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-0.5">Simulated</p>
          <p className={`text-lg font-bold ${improved ? "text-green-400" : "text-red-400"}`}>
            {currency}{simulated.toLocaleString("en-IN")}{suffix}
          </p>
        </div>
      </div>
      <div className={`text-xs font-medium ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
        {delta >= 0 ? "+" : ""}{currency}{Math.abs(delta).toLocaleString("en-IN")}{suffix} {delta >= 0 ? "improvement" : "decrease"}
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [form, setForm] = useState({
    one_time_purchase: "", income_change: "", expense_change: "",
    category: "", category_reduction_pct: "", goal_contribution_change: "",
  });
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (overrides?: Record<string, number | string>) => {
    setLoading(true);
    try {
      const payload = {
        one_time_purchase: parseFloat(form.one_time_purchase) || 0,
        income_change: parseFloat(form.income_change) || 0,
        expense_change: parseFloat(form.expense_change) || 0,
        category: form.category || undefined,
        category_reduction_pct: parseFloat(form.category_reduction_pct) || 0,
        goal_contribution_change: parseFloat(form.goal_contribution_change) || 0,
        ...overrides,
      };
      const r = await simulate(payload);
      setResult(r);
    } catch { toast.error("Simulation failed"); }
    finally { setLoading(false); }
  };

  const chartData = result
    ? [
        { name: "Savings", current: result.current_savings, simulated: result.simulated_savings },
        { name: "Cash Left", current: result.current_cash_left, simulated: result.simulated_cash_left },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">What-If Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">Model financial decisions before you make them.</p>
      </div>

      {/* Quick scenarios */}
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            onClick={() => { setForm({ one_time_purchase: "", income_change: "", expense_change: "", category: "", category_reduction_pct: "", goal_contribution_change: "", ...Object.fromEntries(Object.entries(s.values).map(([k, v]) => [k, String(v)])) }); run(s.values as unknown as Record<string, number | string>); }}
            className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all"
          >
            <FlaskConical size={10} className="inline mr-1" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input form */}
        <Card>
          <CardHeader><h3 className="text-sm font-semibold text-white">Scenario Builder</h3></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">One-time Purchase (₹)</label>
              <input type="number" className="input-dark" placeholder="e.g. 60000" value={form.one_time_purchase}
                onChange={(e) => setForm({ ...form, one_time_purchase: e.target.value })} min="0" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Monthly Income Change (₹)</label>
              <input type="number" className="input-dark" placeholder="e.g. 5000 or -2000" value={form.income_change}
                onChange={(e) => setForm({ ...form, income_change: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Monthly Expense Change (₹)</label>
              <input type="number" className="input-dark" placeholder="e.g. 2000 or -1500" value={form.expense_change}
                onChange={(e) => setForm({ ...form, expense_change: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Reduce Category</label>
                <select className="input-dark" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select…</option>
                  {CATEGORIES.filter((c) => c !== "Income").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">By %</label>
                <input type="number" className="input-dark" placeholder="20" value={form.category_reduction_pct}
                  onChange={(e) => setForm({ ...form, category_reduction_pct: e.target.value })} min="0" max="100" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Extra Goal Contribution (₹)</label>
              <input type="number" className="input-dark" placeholder="e.g. 3000" value={form.goal_contribution_change}
                onChange={(e) => setForm({ ...form, goal_contribution_change: e.target.value })} min="0" />
            </div>
            <button onClick={() => run()} disabled={loading} className="btn-primary w-full">
              {loading ? "Running…" : "Run Simulation"}
            </button>
          </CardBody>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <CompareCard label="Net Savings" current={result.current_savings} simulated={result.simulated_savings} />
                  <CompareCard label="Savings Rate" current={result.current_savings_rate} simulated={result.simulated_savings_rate} currency="" suffix="%" />
                </div>

                <Card>
                  <CardBody className="pt-5">
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ background: "#0d1f38", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "12px" }} />
                        <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
                        <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="simulated" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Lightbulb size={13} className="text-amber-400" />
                    Risk Change
                  </div>
                  <p className="text-sm text-slate-300">{result.risk_change}</p>
                  <div className="mt-2 flex items-start gap-2 text-xs text-green-300 bg-green-500/[0.07] rounded-xl p-3 border border-green-500/15">
                    <TrendingUp size={13} className="shrink-0 mt-0.5" />
                    {result.recommendation}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-12 text-center text-slate-500">
              <FlaskConical size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Configure a scenario and click "Run Simulation" to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
