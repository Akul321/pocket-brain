"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  glow?: "green" | "red" | "amber" | "blue" | "none";
}

export function Card({ children, className, hover = false, delay = 0, glow = "none" }: CardProps) {
  const glowClasses = {
    green: "shadow-glow-green",
    red: "shadow-glow-red",
    amber: "shadow-glow-amber",
    blue: "shadow-glow-blue",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        hover ? "glass-card-hover cursor-pointer" : "glass-card",
        glowClasses[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 pt-5 pb-3", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}
