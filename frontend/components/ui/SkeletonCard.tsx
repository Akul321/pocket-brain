"use client";
import { motion } from "framer-motion";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`glass-card p-5 ${className}`}
    >
      <div className="h-3 bg-white/10 rounded-full w-1/3 mb-3" />
      <div className="h-7 bg-white/10 rounded-full w-1/2 mb-2" />
      <div className="h-2.5 bg-white/[0.06] rounded-full w-2/3" />
    </motion.div>
  );
}

export function SkeletonRow() {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center gap-4 p-4 border-b border-white/[0.05]"
    >
      <div className="h-9 w-9 rounded-full bg-white/10" />
      <div className="flex-1">
        <div className="h-3 bg-white/10 rounded-full w-1/3 mb-2" />
        <div className="h-2.5 bg-white/[0.06] rounded-full w-1/5" />
      </div>
      <div className="h-4 bg-white/10 rounded-full w-16" />
    </motion.div>
  );
}
