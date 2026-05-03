"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Upload, Download, Pencil, Trash2,
  ArrowUpRight, ArrowDownLeft, ChevronUp, ChevronDown, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTransactions, createTransaction, updateTransaction,
  deleteTransaction, importCSV, exportCSV,
} from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/types";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { SkeletonRow } from "@/components/ui/SkeletonCard";

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  amount: "",
  type: "expense",
  category: "Food",
  notes: "",
  payment_method: "UPI",
  recurring: "no",
};

export default function TransactionsPage() {
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [delId, setDelId] = useState<number | null>(null);

  const fetchTransactions = useCallback(async () => {
    const params: Record<string, string> = { sort_by: sortBy, sort_dir: sortDir };
    if (search) params.search = search;
    if (filterCategory) params.category = filterCategory;
    if (filterType) params.type = filterType;
    const data = await getTransactions(params);
    setTransactions(data);
    setLoading(false);
  }, [search, filterCategory, filterType, sortBy, sortDir]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openAdd = () => { setEditTxn(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (t: Transaction) => {
    setEditTxn(t);
    setForm({
      date: t.date, description: t.description, amount: String(t.amount),
      type: t.type, category: t.category, notes: t.notes,
      payment_method: t.payment_method || "UPI", recurring: t.recurring || "no",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      type: form.type as "income" | "expense",
      recurring: form.recurring as "yes" | "no",
    };
    try {
      if (editTxn) {
        await updateTransaction(editTxn.id, payload);
        toast.success("Transaction updated");
      } else {
        await createTransaction(payload);
        toast.success("Transaction added");
      }
      setShowModal(false);
      fetchTransactions();
      triggerRefresh(); // update dashboard
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast.success("Deleted");
      setDelId(null);
      fetchTransactions();
      triggerRefresh();
    } catch { toast.error("Failed to delete"); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importCSV(file);
      if (result.imported === 0) {
        toast.error("No transactions imported — check that your CSV has a 'date' column and valid dates.");
      } else {
        toast.success(`Imported ${result.imported} transactions`);
        fetchTransactions();
        triggerRefresh(); // update dashboard
      }
    } catch { toast.error("Import failed — check CSV format"); }
    e.target.value = ""; // allow re-importing same file
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="page-title">Transactions</h1>
        <div className="flex gap-2 flex-wrap">
          <label className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
            <Upload size={14} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <a href={exportCSV()} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download size={14} /> Export
          </a>
          <button onClick={() => { fetchTransactions(); triggerRefresh(); }} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={openAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark pl-9 text-xs"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-dark text-xs w-auto" value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-dark text-xs w-auto" value={filterType}
          onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  { key: "date", label: "Date" },
                  { key: "description", label: "Description" },
                  { key: "category", label: "Category" },
                  { key: "amount", label: "Amount" },
                  { key: "payment_method", label: "Method" },
                  { key: "recurring", label: "Recurring" },
                  { key: "ai_note", label: "AI Note" },
                  { key: "actions", label: "" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => !["actions", "ai_note", "recurring", "payment_method"].includes(col.key) && toggleSort(col.key)}
                    className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-4 py-3 cursor-pointer select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key === sortBy && (sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={8}><SkeletonRow /></td></tr>
                  ))
                : transactions.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                      No transactions found. Add one or import a CSV to get started.
                    </td>
                  </tr>
                )
                : transactions.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium max-w-[180px] truncate">{t.description}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ color: getCategoryColor(t.category), background: getCategoryColor(t.category) + "20" }}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold flex items-center gap-1 ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                        {t.type === "income" ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                        {t.payment_method || "Other"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.recurring === "yes" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Recurring
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs italic max-w-[140px] truncate">{t.ai_note}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDelId(t.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editTxn ? "Edit Transaction" : "Add Transaction"} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Date</label>
              <input type="date" className="input-dark" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Type</label>
              <select className="input-dark" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description / Merchant</label>
            <input className="input-dark" placeholder="e.g. Swiggy, Salary Credit" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Amount (₹)</label>
              <input type="number" className="input-dark" placeholder="0" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="1" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Category</label>
              <select className="input-dark" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3 — new fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Payment Method</label>
              <select className="input-dark" value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Recurring?</label>
              <select className="input-dark" value={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.value })}>
                <option value="no">No</option>
                <option value="yes">Yes — monthly</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Notes (optional)</label>
            <input className="input-dark" placeholder="Any additional notes…" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editTxn ? "Update" : "Add"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={delId !== null} onClose={() => setDelId(null)} title="Delete Transaction">
        <p className="text-sm text-slate-400 mb-5">Delete this transaction? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDelId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => delId && handleDelete(delId)} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
