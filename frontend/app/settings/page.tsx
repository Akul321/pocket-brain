"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Download, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getProfile, updateProfile, resetDemo, exportCSV } from "@/lib/api";
import type { UserProfile } from "@/lib/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", currency: "₹", monthly_income_target: "" });
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      if (!p) return;
      setProfile(p);
      setForm({ name: p.name, currency: p.currency, monthly_income_target: String(p.monthly_income_target) });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({
        name: form.name,
        currency: form.currency,
        monthly_income_target: parseFloat(form.monthly_income_target),
      });
      setProfile(updated);
      localStorage.setItem("pb_profile", JSON.stringify({
        name: updated.name,
        currency: updated.currency,
        monthly_income_target: updated.monthly_income_target,
      }));
      toast.success("Profile saved!");
    } catch { toast.error("Failed to save"); }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
      toast.success("Data reset successfully!");
      setShowReset(false);
      window.location.href = "/onboarding";
    } catch { toast.error("Reset failed"); }
    finally { setResetting(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="page-title">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Profile Settings</h3>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Display Name</label>
              <input className="input-dark" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Currency Symbol</label>
                <input className="input-dark" value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="₹" maxLength={3} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Monthly Income Target (₹)</label>
                <input type="number" className="input-dark" value={form.monthly_income_target}
                  onChange={(e) => setForm({ ...form, monthly_income_target: e.target.value })} placeholder="50000" min="0" />
              </div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={14} /> Save Changes
            </button>
          </form>
        </CardBody>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-white">Data Management</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-white">Export Transactions</p>
              <p className="text-xs text-slate-400 mt-0.5">Download all your transactions as a CSV file.</p>
            </div>
            <a href={exportCSV()} className="btn-secondary text-xs flex items-center gap-1.5">
              <Download size={13} /> Export CSV
            </a>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/[0.05] border border-red-500/10">
            <div>
              <p className="text-sm font-medium text-red-400">Reset Demo Data</p>
              <p className="text-xs text-slate-400 mt-0.5">Clear all data and reload the demo dataset.</p>
            </div>
            <button onClick={() => setShowReset(true)} className="btn-danger text-xs flex items-center gap-1.5">
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Info */}
      <Card className="p-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Disclaimer:</strong> Pocket Brain provides educational financial insights and planning simulations.
          It does not provide professional financial, investment, tax, or legal advice.
          All insights are based on your entered data and rule-based algorithms.
        </p>
      </Card>

      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset Demo Data">
        <p className="text-sm text-slate-400 mb-2">This will permanently delete all your current transactions, budgets, and goals, then reload the demo dataset.</p>
        <p className="text-xs text-red-400 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowReset(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleReset} disabled={resetting} className="btn-danger flex-1">
            {resetting ? "Resetting…" : "Reset Everything"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
