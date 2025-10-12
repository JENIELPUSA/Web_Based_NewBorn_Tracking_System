import React, { useContext, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { useTheme } from "@/hooks/use-theme";

function VaccineStockGraph() {
  const { vaccine } = useContext(VaccineDisplayContext);
  const { theme } = useTheme();

  const gradientColor = theme === "light" ? "#3B82F6" : "#60A5FA";
  const gradientColorEnd = theme === "light" ? "#93C5FD" : "#1E3A8A";

  const vaccineStockData = useMemo(() => {
    if (!Array.isArray(vaccine)) return [];
    return vaccine.map((v) => {
      const totalStock = v.batches?.reduce(
        (sum, batch) => sum + (batch.stock || 0),
        0
      );
      return { name: v.name || "Unknown", totalStock };
    });
  }, [vaccine]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`rounded-lg p-3 shadow-lg border ${
            theme === "dark"
              ? "bg-slate-800 text-white border-slate-700"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            Current Stock:{" "}
            <span className="font-bold">{data.totalStock} doses</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-lg ${
        theme === "light"
          ? "border border-slate-200 bg-white/70 shadow-lg"
          : "border border-slate-700 bg-slate-800/50 shadow-lg"
      }`}
    >
      <div className="mb-4">
        <p
          className={`text-xl font-semibold ${
            theme === "light" ? "text-slate-800" : "text-white"
          }`}
        >
          Vaccination Stock by Category
        </p>
      </div>

      <div className="h-[300px]">
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={vaccineStockData} margin={{ top: 10, right: 30, left: -20, bottom: 40 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={gradientColorEnd} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "light" ? "#e2e8f0" : "#334155"}
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{
                fill: theme === "light" ? "#475569" : "#cbd5e1",
                fontSize: 12,
              }}
              stroke={theme === "light" ? "#cbd5e1" : "#475569"}
            />
            <YAxis
              tick={{ fill: theme === "light" ? "#64748b" : "#94a3b8" }}
              tickFormatter={(value) => value}
              stroke={theme === "light" ? "#cbd5e1" : "#475569"}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: gradientColor, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="totalStock"
              stroke={gradientColor}
              strokeWidth={3}
              fill="url(#stockGradient)"
              animationDuration={1500}
              dot={{
                fill: gradientColor,
                strokeWidth: 2,
                r: 5,
                stroke: theme === "light" ? "#fff" : "#1e293b",
              }}
              activeDot={{
                r: 8,
                fill: gradientColor,
                stroke: theme === "light" ? "#fff" : "#1e293b",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default VaccineStockGraph;
