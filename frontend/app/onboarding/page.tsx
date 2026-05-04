"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ArrowRight, User, Database, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { initApp } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("pb_token")) router.replace("/login");
  }, [router]);

  const handleChoice = async (mode: "fresh" | "demo") => {
    setLoading(true);
    try {
      await initApp(mode);
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040d1a] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-green-500/20 border-t-green-400"
        />
        <p className="text-sm text-slate-400">Setting up your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040d1a] flex flex-col items-center justify-center px-4">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">How would you like to start?</h1>
          <p className="text-slate-400 text-sm">You can always change this later in Settings.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ y: -3 }}
            onClick={() => handleChoice("fresh")}
            className="glass-card p-6 text-left hover:border-green-500/30 hover:bg-white/[0.05] transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <User size={20} className="text-green-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Start Fresh</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Begin with an empty dashboard. Add your own transactions, budgets, and goals.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400 font-medium">
              Get started <ArrowRight size={12} />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -3 }}
            onClick={() => handleChoice("demo")}
            className="glass-card p-6 text-left hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Database size={20} className="text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Try Demo</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore with 3 months of realistic sample data — transactions, budgets, goals, and AI insights.
            </p>
            <div className="mt-4 space-y-1">
              {["44 transactions", "9 budgets", "4 goals"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle size={11} className="text-blue-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
