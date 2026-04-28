"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain, TrendingUp, Target, ShieldCheck, Bot, FlaskConical,
  ArrowRight, Sparkles, PieChart, CheckCircle, Zap,
} from "lucide-react";

const FEATURES = [
  { icon: TrendingUp, title: "Expense Tracking", desc: "Log income and expenses in seconds. Filter, search, and export with ease." },
  { icon: PieChart, title: "Budget Planner", desc: "Set category budgets and get real-time progress with animated visuals." },
  { icon: Target, title: "Goal Tracker", desc: "Create savings goals with timelines and AI-powered acceleration suggestions." },
  { icon: Bot, title: "AI Money Coach", desc: "Ask questions about your finances and get answers from your own data." },
  { icon: FlaskConical, title: "What-If Simulator", desc: "Simulate purchases, income changes, or savings tweaks before committing." },
  { icon: ShieldCheck, title: "Risk Radar", desc: "Detect financial risks early with a real-time risk score and breakdown." },
];

const STEPS = [
  { step: "1", title: "Add your transactions", desc: "Enter manually or upload a CSV. The AI auto-categorizes everything." },
  { step: "2", title: "Get instant insights", desc: "See spending patterns, savings rate, and risk level in your dashboard." },
  { step: "3", title: "Simulate & plan", desc: "Use the What-If Simulator and Goal Tracker to make confident decisions." },
];

const WHY = [
  "No paid API required — runs 100% locally",
  "Your data never leaves your machine",
  "Indian currency support with ₹ by default",
  "AI insights without hallucinations — pure math",
  "Beautiful fintech-grade UI",
  "Open source and free forever",
];

function FloatingCard({ children, delay = 0, x = 0, y = 0 }: { children: React.ReactNode; delay?: number; x?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ x, y }}
      className="glass-card px-4 py-3 text-sm"
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#040d1a] text-slate-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center gap-4 px-6 h-16 border-b border-white/[0.06] bg-[#040d1a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-glow-green">
            <Brain size={15} className="text-black" />
          </div>
          <span className="font-bold text-white">Pocket Brain</span>
        </div>
        <div className="ml-auto flex gap-3">
          <Link href="/dashboard" className="btn-primary text-xs py-2">
            Launch Dashboard <ArrowRight size={12} className="inline ml-1" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/[0.06] text-xs text-green-400 mb-6"
          >
            <Sparkles size={12} />
            AI-Powered · Free · Open Source
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            Pocket Brain turns your{" "}
            <span className="gradient-text">money data</span>{" "}
            into clear decisions.
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Track spending, plan goals, simulate decisions, and get AI-powered insights —
            without connecting paid banking services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-sm px-8 py-3">
              Launch Dashboard <ArrowRight size={14} className="inline ml-1" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm px-8 py-3">
              View Demo Data
            </Link>
          </div>
        </motion.div>

        {/* Floating cards */}
        <div className="relative max-w-4xl mx-auto mt-16 h-48 hidden md:block">
          <div className="absolute left-4 top-4">
            <FloatingCard delay={0.4}>
              <p className="text-xs text-slate-400">Savings Rate</p>
              <p className="text-xl font-bold text-green-400">28.4%</p>
              <p className="text-xs text-green-400">↑ Healthy</p>
            </FloatingCard>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-4">
            <FloatingCard delay={0.5}>
              <p className="text-xs text-slate-400">Risk Score</p>
              <p className="text-xl font-bold text-emerald-400">82 / 100</p>
              <p className="text-xs text-emerald-400">Low Risk</p>
            </FloatingCard>
          </div>
          <div className="absolute right-4 top-4">
            <FloatingCard delay={0.6}>
              <p className="text-xs text-slate-400">Goal: Laptop</p>
              <p className="text-xl font-bold text-blue-400">68%</p>
              <p className="text-xs text-slate-400">3 months left</p>
            </FloatingCard>
          </div>
          <div className="absolute left-16 bottom-0">
            <FloatingCard delay={0.7}>
              <p className="text-xs text-amber-400">⚠ Food budget at 81%</p>
            </FloatingCard>
          </div>
          <div className="absolute right-16 bottom-0">
            <FloatingCard delay={0.8}>
              <p className="text-xs text-green-400">✓ Net savings: ₹14,300</p>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Features</p>
          <h2 className="text-3xl font-bold text-white">Everything you need to master your money</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass-card-hover p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-label mb-3">How It Works</p>
          <h2 className="text-3xl font-bold text-white mb-12">Get started in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold text-lg mx-auto mb-4 shadow-glow-green">
                  {step}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pocket Brain */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Why Pocket Brain</p>
          <h2 className="text-3xl font-bold text-white">Built different — for real people</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4">
          {WHY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 p-4 glass-card"
            >
              <CheckCircle size={15} className="text-green-400 shrink-0" />
              <span className="text-sm text-slate-300">{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-12">
            <Zap size={36} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Your AI money OS is ready.
            </h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              No accounts. No subscriptions. No credit card. Just open the dashboard and start.
            </p>
            <Link href="/dashboard" className="btn-primary px-10 py-3 text-sm">
              Launch Dashboard <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-xs text-slate-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={13} className="text-green-500" />
          <span className="text-slate-400 font-medium">Pocket Brain</span>
        </div>
        <p>Built by <span className="text-slate-400">Akul Ramesh</span> · Open source · MIT License</p>
        <p className="mt-1">Pocket Brain is not financial advice. All insights are educational simulations.</p>
      </footer>
    </div>
  );
}
