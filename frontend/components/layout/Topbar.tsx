"use client";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  PieChart,
  Bot,
  FlaskConical,
  ShieldAlert,
  Settings,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/budgets", icon: PieChart, label: "Budgets" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/coach", icon: Bot, label: "AI Coach" },
  { href: "/simulator", icon: FlaskConical, label: "Simulator" },
  { href: "/risk", icon: ShieldAlert, label: "Risk Radar" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budget Planner",
  "/goals": "Goals",
  "/coach": "AI Money Coach",
  "/simulator": "What-If Simulator",
  "/risk": "Risk Radar",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = PAGE_TITLES[pathname] || "Pocket Brain";

  return (
    <>
      <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-4 md:px-6 border-b border-white/[0.06] bg-[#040d1a]/80 backdrop-blur-md">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-sm font-semibold text-white flex-1">{title}</h1>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <Bell size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-black">
            A
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full w-64 bg-[#070f1f] border-r border-white/[0.06] z-50 md:hidden"
            >
              <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <Brain size={16} className="text-black" />
                </div>
                <span className="font-bold text-white">Pocket Brain</span>
              </div>
              <nav className="py-4 px-3 space-y-0.5">
                {NAV.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                          active
                            ? "bg-green-500/10 text-green-400"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                        )}
                      >
                        <Icon size={17} />
                        {label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
