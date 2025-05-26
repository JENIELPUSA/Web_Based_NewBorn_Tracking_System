import React, { useContext } from "react";
import { User } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { LogContext } from "../../contexts/LogAndAuditContext/LogAuditContext";
import { useTheme } from "@/hooks/use-theme";

import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";

function GraphAndLogAction() {
    const { LogData } = useContext(LogContext);
    const { theme } = useTheme();
    const {isGraphData}=useContext(NewBornDisplayContext)
    const defaultAvatar = "https://ui-avatars.com/api/?name=Unknown&background=888&color=fff";

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const graphDataArray = Array.isArray(isGraphData)
  ? isGraphData
  : isGraphData
    ? [isGraphData]
    : [];

    const monthlyWeight = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
        const total = graphDataArray
            .filter((baby) => baby.birthMonth === month)
            .reduce((acc, baby) => acc + parseFloat(baby.totalWeight.replace(" kg", "")), 0); // Add weights

        return { name: month, total };
    });

    // Example: Resulting overviewData
    const overviewData = monthlyWeight;

    // Filter logs for current month
    const currentMonthLogs = LogData
        ? LogData.filter((log) => {
              const logDate = new Date(log.timestamp);
              return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
          })
        : [];

    return (
        <div className="grid grid-cols-1 gap-6 xs:px-2 sm:px-0 md:grid-cols-2 lg:grid-cols-7 lg:px-0">
            {/* Overview Graph */}
            <div
                className={`col-span-1 rounded-2xl p-6 backdrop-blur-lg md:col-span-2 lg:col-span-4 ${
                    theme === "light" ? "border border-slate-200 bg-white/70 shadow-lg" : "border border-slate-700 bg-slate-800/50 shadow-lg"
                }`}
            >
                <div className="mb-4">
                    <p className={`text-xl font-semibold ${theme === "light" ? "text-slate-800" : "text-white"}`}>Overview</p>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={overviewData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                            <defs>
                                <linearGradient
                                    id="colorTotal"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{
                                    background: theme === "dark" ? "#1e293b" : "#ffffff",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    backdropFilter: "blur(12px)",
                                }}
                                formatter={(value) => [`${value} kg`, "Total Weight"]} // Adjusted to show kg
                            />
                            <XAxis
                                dataKey="name"
                                strokeWidth={0}
                                tick={{ fill: theme === "light" ? "#64748b" : "#94a3b8" }}
                            />
                            <YAxis
                                dataKey="total"
                                strokeWidth={0}
                                tick={{ fill: theme === "light" ? "#64748b" : "#94a3b8" }}
                                tickFormatter={(value) => `${value} kg`} // Adjusted to show kg
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Log Actions with "Actions this Month" */}
            <div
                className={`col-span-1 rounded-2xl p-6 backdrop-blur-lg md:col-span-2 lg:col-span-3 ${
                    theme === "light" ? "border border-slate-200 bg-white/70 shadow-lg" : "border border-slate-700 bg-slate-800/50 shadow-lg"
                }`}
            >
                <div className="mb-4 border-b border-slate-200/50 pb-4 dark:border-slate-700/50">
                    <p className={`text-xl font-semibold ${theme === "light" ? "text-slate-800" : "text-white"}`}>Log Actions Audit</p>
                    <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Actions this Month</p>
                </div>
                <div className="h-[300px] overflow-y-auto">
                    {!LogData ? (
                        <div className="flex h-full items-center justify-center">
                            <p className={`text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Loading log data...</p>
                        </div>
                    ) : currentMonthLogs.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className={`text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>No log entries found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentMonthLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className={`rounded-xl p-4 transition-all ${theme === "light" ? "hover:bg-white/90" : "hover:bg-slate-700/50"} ${
                                        log.isExternal ? (theme === "light" ? "bg-amber-100/50" : "bg-amber-900/30") : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="shrink-0">
                                            {log.userAvatar ? (
                                                <img
                                                    src={log.userAvatar}
                                                    alt={log?.user?.fullName || "Unknown"}
                                                    className="size-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className={`flex size-10 items-center justify-center rounded-full ${
                                                        theme === "light" ? "bg-slate-200" : "bg-slate-700"
                                                    }`}
                                                >
                                                    <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`truncate font-medium ${theme === "light" ? "text-slate-800" : "text-white"}`}>
                                                    {log?.user?.fullName || "Unknown User"}
                                                </p>
                                                {log.isExternal && (
                                                    <span
                                                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                            theme === "light" ? "bg-amber-200 text-amber-800" : "bg-amber-700/50 text-amber-200"
                                                        }`}
                                                    >
                                                        External
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{log.action}</p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <p className={`text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                                <p className={`font-mono text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                                    {log.ipAddress || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GraphAndLogAction;
