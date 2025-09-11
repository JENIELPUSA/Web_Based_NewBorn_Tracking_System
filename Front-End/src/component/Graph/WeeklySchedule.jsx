import React, { useContext } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LogContext } from "../../contexts/LogAndAuditContext/LogAuditContext";
import { CalendarDays, MapPin } from "lucide-react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
function WeeklySchedule() {
    const { theme } = useTheme();
    const { LogData } = useContext(LogContext);
    const { isGraphData } = useContext(NewBornDisplayContext);
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

    // Calculate current week's Monday and Sunday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Get the previous Monday
    monday.setHours(0, 0, 0, 0); // Normalize to 00:00:00

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Get the following Sunday
    sunday.setHours(23, 59, 59, 999); // Normalize to 23:59:59

    // Create a flattened array of doses with their parent record info
    const weeklyDoses = (vaccineRecord || []).flatMap((item) =>
        item.doses
            .filter((dose) => {
                if (!dose.next_due_date) return false;
                const scheduleDate = new Date(dose.next_due_date);
                if (isNaN(scheduleDate)) return false;
                scheduleDate.setHours(0, 0, 0, 0);
                return scheduleDate >= monday && scheduleDate <= sunday;
            })
            .map((dose) => ({
                ...dose,
                newbornName: item.newbornName,
                FullAddress: item.FullAddress,
                recordId: item._id || item.id,
            })),
    );

    const graphDataArray = Array.isArray(isGraphData) ? isGraphData : isGraphData ? [isGraphData] : [];

    const monthlyWeight = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
        const total = graphDataArray
            .filter((baby) => baby.birthMonth === month)
            .reduce((acc, baby) => acc + parseFloat(baby.totalWeight.replace(" kg", "")), 0); // Add weights

        return { name: month, total };
    });

    // Example: Resulting overviewData
    const overviewData = monthlyWeight;

    return (
        <div className="grid grid-cols-1 gap-4 xs:px-2 sm:px-0 md:grid-cols-2 lg:grid-cols-7 lg:px-0">
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
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
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
                                formatter={(value) => [
                                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>{value} kg</span>,
                                    <span style={{ color: "#3b82f6" }}>Total Weight</span>,
                                ]}
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
                                tickFormatter={(value) => `${value} kg`}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly Schedule Panel */}
            <div className="card col-span-1 rounded bg-white shadow dark:bg-slate-800 md:col-span-2 lg:col-span-3">
                <div className="card-header border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <p className="card-title text-lg font-semibold text-slate-800 dark:text-white">Weekly Incoming Schedule</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {monday.toLocaleDateString()} - {sunday.toLocaleDateString()}
                    </p>
                </div>

                <div className="card-body h-[300px] divide-y divide-slate-100 overflow-y-auto p-0 dark:divide-slate-700">
                    {weeklyDoses.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400">No scheduled visits this week.</div>
                    ) : (
                        weeklyDoses.map((dose) => {
                            const dateObj = new Date(dose.next_due_date);
                            const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
                            const time = dateObj.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            return (
                                <div
                                    key={`${dose.recordId}-${dose._id || dose.id}`}
                                    className="flex items-start gap-4 px-4 py-4"
                                >
                                    <div className="flex w-10 flex-col items-center justify-center text-red-500 dark:text-red-400">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-white">{dose.newbornName || "Unnamed"}</p>
                                        <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                            <CalendarDays className="h-4 w-4" /> {dayName}, {time}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                            <MapPin className="h-3 w-3" /> Zone: {dose.FullAddress || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default WeeklySchedule;
