"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Target, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { getGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api";
import type { Goal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";

const priorityColors = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const EMPTY_FORM = {
  name: "", target_amount: "", current_amount: "0",
  monthly_contribution: "0", deadline: "", priority: "medium",
};

function ProgressRing({ pct }: { pct: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <motion.circle
        cx="40" cy="40" r={r} fill="none" strokeWidth="6"
        stroke={pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#3b82f6"}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [delId, setDelId] = useState<number | null>(null);

  const fetchGoals = async () => { const d = await getGoals(); setGoals(d); setLoading(false); };
  useEffect(() => { fetchGoals(); }, []);

  const openAdd = () => { setEditGoal(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (g: Goal) => {
    setEditGoal(g);
    setForm({ name: g.name, target_amount: String(g.target_amount), current_amount: String(g.current_amount),
      monthly_contribution: String(g.monthly_contribution), deadline: g.deadline || "", priority: g.priority });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount),
      monthly_contribution: parseFloat(form.monthly_contribution),
      deadline: form.deadline || null,
      priority: form.priority as "low" | "medium" | "high",
    };
    try {
      if (editGoal) { await updateGoal(editGoal.id, payload); toast.success("Goal updated"); }
      else { await createGoal(payload); toast.success("Goal created"); }
      setShowModal(false);
      fetchGoals();
    } catch { toast.error("Failed to save goal"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Goals</h1>
        <button onClick={openAdd} className="btn-primary text-xs flex items-center gap-1.5">
          <Plus size={14} /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-48" />)}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 text-sm">No goals yet. Create your first financial goal!</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{g.name}</h3>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border mt-1 inline-block",
                    priorityColors[g.priority as keyof typeof priorityColors])}>
                    {g.priority} priority
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil size={13} /></button>
                  <button onClick={() => setDelId(g.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ProgressRing pct={g.progress_pct} />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Saved</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(g.current_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target</span>
                    <span className="text-white font-semibold">{formatCurrency(g.target_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Remaining</span>
                    <span className="text-slate-200">{formatCurrency(g.remaining_amount)}</span>
                  </div>
                </div>
              </div>

              {g.estimated_months !== null && (
                <div className="text-xs text-slate-400">
                  Est. completion: <span className="text-white font-medium">{g.estimated_months} months</span>
                </div>
              )}

              {g.ai_suggestion && (
                <div className="flex gap-2 p-2.5 bg-green-500/[0.07] rounded-xl border border-green-500/15 text-xs text-green-300">
                  <Sparkles size={12} className="shrink-0 mt-0.5" />
                  {g.ai_suggestion}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGoal ? "Edit Goal" : "New Goal"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Goal Name</label>
            <input className="input-dark" placeholder="e.g. Emergency Fund" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Target (₹)</label>
              <input type="number" className="input-dark" placeholder="100000" value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required min="1" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Already Saved (₹)</label>
              <input type="number" className="input-dark" placeholder="0" value={form.current_amount}
                onChange={(e) => setForm({ ...form, current_amount: e.target.value })} min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Monthly Contribution (₹)</label>
              <input type="number" className="input-dark" placeholder="5000" value={form.monthly_contribution}
                onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })} min="0" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
              <select className="input-dark" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Deadline (optional)</label>
            <input type="date" className="input-dark" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editGoal ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={delId !== null} onClose={() => setDelId(null)} title="Delete Goal">
        <p className="text-sm text-slate-400 mb-5">Delete this goal permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDelId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={async () => { if (delId) { await deleteGoal(delId); setDelId(null); fetchGoals(); toast.success("Goal deleted"); } }} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
