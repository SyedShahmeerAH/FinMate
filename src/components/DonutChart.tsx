"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "#00FFFF",
  SUBS: "#A78BFA",
  EDU: "#34D399",
  TRANSIT: "#FBBF24",
  ENTERTAIN: "#F472B6",
  UTILITIES: "#60A5FA",
  INCOME: "#00FFFF",
  SAVINGS: "#34D399",
  OTHER: "#9CA3AF",
};

interface DataPoint {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: Record<string, number>;
  total: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="doppelrand">
      <div className="doppelrand-inner px-4 py-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">{d.name}</p>
        <p className="text-sm font-bold text-white mt-1">
          Rs. {d.value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function DonutChart({ data, total }: DonutChartProps) {
  const chartData: DataPoint[] = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) return null;

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || "#9CA3AF"}
                  fillOpacity={0.8}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] uppercase tracking-wider text-white/25">Total</p>
          <p className="text-sm font-bold text-white/60 mt-0.5">
            Rs. {total.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {chartData.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[entry.name] || "#9CA3AF", opacity: 0.8 }}
              />
              <span className="text-xs text-white/35 uppercase tracking-wider w-16 shrink-0 truncate">
                {entry.name}
              </span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CATEGORY_COLORS[entry.name] || "#9CA3AF",
                    opacity: 0.5,
                  }}
                />
              </div>
              <span className="text-xs text-white/30 font-mono w-10 text-right shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
