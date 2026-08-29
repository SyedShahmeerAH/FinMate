"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  date: string;
  amount: number;
}

interface SpendingAreaChartProps {
  transactions: Transaction[];
}

interface DayData {
  date: string;
  income: number;
  expenses: number;
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
              style={{ backgroundColor: p.color }}
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

export default function SpendingAreaChart({ transactions }: SpendingAreaChartProps) {
  const dayMap: Record<string, DayData> = {};

  for (const tx of transactions) {
    if (!dayMap[tx.date]) {
      dayMap[tx.date] = { date: tx.date, income: 0, expenses: 0 };
    }
    if (tx.amount >= 0) {
      dayMap[tx.date].income += tx.amount;
    } else {
      dayMap[tx.date].expenses += Math.abs(tx.amount);
    }
  }

  const chartData = Object.values(dayMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00FFFF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F472B6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#F472B6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#00FFFF"
          strokeWidth={1.5}
          fill="url(#incomeGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#00FFFF", stroke: "#050505", strokeWidth: 2 }}
          animationDuration={1000}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#F472B6"
          strokeWidth={1.5}
          fill="url(#expenseGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#F472B6", stroke: "#050505", strokeWidth: 2 }}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
