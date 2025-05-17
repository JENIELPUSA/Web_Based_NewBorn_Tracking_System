import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { overviewData } from "@/constants";
function graphandlogaction() {
    const { theme } = useTheme();
        const logData = [
        {
            id: 1,
            userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
            username: "Juan Dela Cruz",
            action: "Logged in",
            timestamp: "2025-05-10 14:22",
            ip: "192.168.254.254",
            isExternal: false,
        },
        {
            id: 2,
            userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
            username: "Maria Santos",
            action: "Updated profile",
            timestamp: "2025-05-10 13:40",
            ip: "203.160.10.88",
            isExternal: true,
        },
        {
            id: 3,
            userAvatar: "", // Missing avatar
            username: "", // Unknown person
            action: "Accessed system",
            timestamp: "2025-05-10 12:10",
            ip: "203.111.22.33",
            isExternal: true,
        },
        {
            id: 4,
            userAvatar: "https://randomuser.me/api/portraits/men/75.jpg",
            username: "Mark Reyes",
            action: "Deleted record",
            timestamp: "2025-05-10 11:20",
            ip: "10.0.0.45",
            isExternal: false,
        },
    ];
    const defaultAvatar = "https://ui-avatars.com/api/?name=Unknown&background=888&color=fff";
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                <div className="card-header">
                    <p className="card-title">Overview</p>
                </div>
                <div className="card-body p-0">
                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <AreaChart
                            data={overviewData}
                            margin={{
                                top: 0,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
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
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                cursor={false}
                                formatter={(value) => `$${value}`}
                            />
                            <XAxis
                                dataKey="name"
                                strokeWidth={0}
                                stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                tickMargin={6}
                            />
                            <YAxis
                                dataKey="total"
                                strokeWidth={0}
                                stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                tickFormatter={(value) => `$${value}`}
                                tickMargin={6}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card col-span-1 rounded bg-white shadow dark:bg-slate-800 md:col-span-2 lg:col-span-3">
                <div className="card-header border-b border-slate-200 px-4 py-2 dark:border-slate-700">
                    <p className="card-title text-lg font-semibold text-slate-800 dark:text-white">Log Actions Audit</p>
                </div>
                <div className="card-body h-[300px] divide-y divide-slate-100 overflow-auto p-0 dark:divide-slate-700">
                    {logData.map((log) => (
                        <div
                            key={log.id}
                            className={`flex items-center justify-between gap-x-4 px-4 py-3 ${
                                log.isExternal ? "bg-yellow-50 dark:bg-yellow-900" : "bg-transparent"
                            }`}
                        >
                            <div className="flex items-center gap-x-4">
                                <img
                                    src={log.userAvatar || defaultAvatar}
                                    alt={log.username || "Unknown"}
                                    className="size-10 rounded-full object-cover"
                                />
                                <div className="flex flex-col">
                                    <p className="font-medium text-slate-900 dark:text-white">{log.username || "Unknown User"}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{log.action}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{log.timestamp}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {log.ip}{" "}
                                    {log.isExternal && (
                                        <span className="ml-2 inline-block rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100">
                                            External
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default graphandlogaction;
