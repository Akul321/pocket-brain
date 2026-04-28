"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, PieChart } from "lucide-react";
import toast from "react-hot-toast";
import { getBudgets, createBudget, deleteBudget } from "@/lib/api";
import type { Budget } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";

const statusLabel = { safe: "On Track", near: "Near Limit", over: "Over Budget" };

function BudgetBar({ pct, status }: { pct: number; status: string }) {
  const colors = { safe: "from-green-500 to-emerald-400", near: "from-amber-500 to-yellow-400", over: "from-red-500 to-rose-400" };
  return (
    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${colors[status as keyof typeof colors] || colors.safe}`}
      />
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "Food", monthly_limit: "" });
  const [delId, setDelId] = useState<number | null>(null);

  const fetchBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
    setLoading(false);
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = new Date().toISOString().slice(0, 7);
    try {
      await createBudget({ category: form.category, monthly_limit: parseFloat(form.monthly_limit), month });
      toast.success("Budget saved");
      setShowModal(false);
      fetchBudgets();
    } catch { toast.error("Failed to save budget"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Budget Planner</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary text-xs flex items-center gap-1.5">
          <Plus size={14} /> Set Budget
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <PieChart size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 text-sm">No budgets set yet.</p>
          <p className="text-slate-500 text-xs mt-1">Click "Set Budget" to start tracking spending limits.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{b.category}</h3>
                  <span className={cn("text-xs font-medium", getStatusColor(b.status))}>
                    {statusLabel[b.status as keyof typeof statusLabel]}
                  </span>
                </div>
                <button
                  onClick={() => setDelId(b.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <BudgetBar pct={b.percentage} status={b.status} />

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Spent: <span className="text-white font-medium">{formatCurrency(b.spent)}</span></span>
                <span className="text-slate-400">Limit: <span className="text-white font-medium">{formatCurrency(b.monthly_limit)}</span></span>
              </div>

              <div className={cn("text-xs font-medium", b.status === "over" ? "text-red-400" : "text-slate-400")}>
                {b.status === "over"
                  ? `₹${Math.abs(b.remaining).toLocaleString("en-IN")} over budget`
                  : `₹${b.remaining.toLocaleString("en-IN")} remaining`}
              </div>

              {b.percentage > 80 && (
                <div className={cn(
                  "text-xs px-3 py-1.5 rounded-lg",
                  b.status === "over" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  {b.status === "over"
                    ? `${b.category} is ₹${Math.abs(b.remaining).toLocaleString("en-IN")} over budget.`
                    : `You've used ${b.percentage.toFixed(0)}% of your ${b.category} budget.`}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Set Monthly Budget">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Category</label>
            <select className="input-dark" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== "Income").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Monthly Limit (₹)</label>
            <input type="number" className="input-dark" placeholder="5000" value={form.monthly_limit}
              onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })} required min="1" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Budget</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={delId !== null} onClose={() => setDelId(null)} title="Remove Budget">
        <p className="text-sm text-slate-400 mb-5">Remove this budget limit?</p>
        <div className="flex gap-3">
          <button onClick={() => setDelId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={async () => { if (delId) { await deleteBudget(delId); setDelId(null); fetchBudgets(); toast.success("Budget removed"); } }} className="btn-danger flex-1">Remove</button>
        </div>
      </Modal>
    </div>
  );
}
