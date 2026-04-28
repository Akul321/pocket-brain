"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ArrowRight, User, Database, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { initApp } from "@/lib/api";

type Step = "choose" | "setup-fresh" | "setup-demo" | "loading";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [income, setIncome] = useState("50000");

  const handleFresh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("loading");
    try {
      await initApp("fresh", name.trim(), currency, parseFloat(income) || 50000);
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStep("setup-fresh");
    }
  };

  const handleDemo = async () => {
    const demoName = name.trim() || "Demo User";
    setStep("loading");
    try {
      await initApp("demo", demoName, currency, parseFloat(income) || 50000);
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStep("choose");
    }
  };

  return (
    <div className="min-h-screen bg-[#040d1a] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-glow-green">
          <Brain size={18} className="text-black" />
        </div>
        <span className="text-xl font-bold text-white">Pocket Brain</span>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* CHOOSE MODE */}
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Pocket Brain</h1>
              <p className="text-slate-400 text-sm">How would you like to get started?</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Fresh start */}
              <motion.button
                whileHover={{ y: -3 }}
                onClick={() => setStep("setup-fresh")}
                className="glass-card p-6 text-left hover:border-green-500/30 hover:bg-white/[0.05] transition-all duration-200 group"
              >
                <div className="w-11 h-11 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <User size={20} className="text-green-400" />
                </div>
                <h2 className="text-base font-bold text-white mb-1">Start Fresh</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your own income, expenses, and goals. Your personal finance dashboard from day one.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  Get started <ArrowRight size={12} />
                </div>
              </motion.button>

              {/* Demo mode */}
              <motion.button
                whileHover={{ y: -3 }}
                onClick={() => setStep("setup-demo")}
                className="glass-card p-6 text-left hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-200 group"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Database size={20} className="text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-white mb-1">Try Demo</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explore with 3 months of realistic sample data — transactions, budgets, goals, and AI insights.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                  Load demo <Sparkles size={12} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* FRESH SETUP FORM */}
        {step === "setup-fresh" && (
          <motion.div
            key="setup-fresh"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Set up your profile</h1>
              <p className="text-slate-400 text-sm">Just a few details to personalise your dashboard.</p>
            </div>

            <form onSubmit={handleFresh} className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Your name</label>
                <input
                  className="input-dark"
                  placeholder="e.g. Priya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Currency</label>
                  <input
                    className="input-dark"
                    placeholder="₹"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Monthly income target</label>
                  <input
                    type="number"
                    className="input-dark"
                    placeholder="50000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="btn-secondary flex-1 text-sm"
                >
                  Back
                </button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  Launch Dashboard
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* DEMO SETUP FORM */}
        {step === "setup-demo" && (
          <motion.div
            key="setup-demo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Try the demo</h1>
              <p className="text-slate-400 text-sm">We'll load 3 months of realistic sample data for you.</p>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="space-y-2">
                {[
                  "44 real-looking transactions",
                  "Salary, food, transport, subscriptions",
                  "Budget limits and savings goals",
                  "AI insights and risk analysis",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Your name (optional)</label>
                <input
                  className="input-dark"
                  placeholder="Leave blank for 'Demo User'"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="btn-secondary flex-1 text-sm"
                >
                  Back
                </button>
                <button onClick={handleDemo} className="btn-primary flex-1 text-sm">
                  Load Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-green-500/20 border-t-green-400"
            />
            <p className="text-sm text-slate-400">Setting up your dashboard…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
