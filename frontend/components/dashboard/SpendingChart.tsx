"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCategoryColor } from "@/lib/utils";

interface Props {
  data: { name: string; value: number }[];
  currency?: string;
}

const CustomTooltip = ({ active, payload, currency = "₹" }: any) => {
  if (active && payload?.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-300 font-medium">{name}</p>
        <p className="text-white font-bold">
          {currency}{value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export function SpendingChart({ data, currency = "₹" }: Props) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No spending data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-slate-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
