"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Transaction {
  date: string;
  amount: number;
}

interface MonthlyBarChartProps {
  transactions: Transaction[];
}

interface MonthData {
  month: string;
  label: string;
  expenses: number;
  income: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="doppelrand">
      <div className="doppelrand-inner px-4 py-3">
        <p className="text-xs text-white/30 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: p.fill || p.color }}
            />
            <span className="text-xs text-white/40 capitalize">{p.dataKey}</span>
            <span className="text-xs font-bold text-white ml-auto">
              Rs. {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyBarChart({ transactions }: MonthlyBarChartProps) {
  const monthMap: Record<string, MonthData> = {};

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        month: key,
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        expenses: 0,
        income: 0,
      };
    }
    if (tx.amount >= 0) {
      monthMap[key].income += tx.amount;
    } else {
      monthMap[key].expenses += Math.abs(tx.amount);
    }
  }

  const chartData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
        <Bar dataKey="income" radius={[4, 4, 0, 0]} animationDuration={800}>
          {chartData.map((_, i) => (
            <Cell key={`income-${i}`} fill="#00FFFF" fillOpacity={0.5} />
          ))}
        </Bar>
        <Bar dataKey="expenses" radius={[4, 4, 0, 0]} animationDuration={800}>
          {chartData.map((_, i) => (
            <Cell key={`expense-${i}`} fill="#F472B6" fillOpacity={0.4} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
