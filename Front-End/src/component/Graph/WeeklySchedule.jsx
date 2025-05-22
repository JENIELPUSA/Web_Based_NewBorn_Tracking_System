import React, { useContext } from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { overviewData } from "@/constants";
import { CalendarDays, MapPin } from "lucide-react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function WeeklySchedule() {
  const { theme } = useTheme();
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
  const weeklyDoses = (vaccineRecord || [])
    .flatMap(item => 
      item.doses
        .filter(dose => {
          if (!dose.next_due_date) return false;
          const scheduleDate = new Date(dose.next_due_date);
          if (isNaN(scheduleDate)) return false;
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= monday && scheduleDate <= sunday;
        })
        .map(dose => ({ 
          ...dose, 
          newbornName: item.newbornName, 
          FullAddress: item.FullAddress,
          recordId: item._id || item.id
        }))
    );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Overview Chart */}
      <div className="card col-span-1 md:col-span-2 lg:col-span-4">
        <div className="card-header">
          <p className="card-title text-lg font-semibold text-slate-800 dark:text-white">
            Overview
          </p>
        </div>
        <div className="card-body p-0">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={overviewData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip cursor={false} formatter={(value) => `$${value}`} />
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

      {/* Weekly Schedule Panel */}
      <div className="card col-span-1 rounded bg-white shadow dark:bg-slate-800 md:col-span-2 lg:col-span-3">
        <div className="card-header border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="card-title text-lg font-semibold text-slate-800 dark:text-white">
            Weekly Incoming Schedule
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {monday.toLocaleDateString()} - {sunday.toLocaleDateString()}
          </p>
        </div>

        <div className="card-body h-[300px] overflow-y-auto p-0 divide-y divide-slate-100 dark:divide-slate-700">
          {weeklyDoses.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No scheduled visits this week.
            </div>
          ) : (
            weeklyDoses.map((dose) => {
              const dateObj = new Date(dose.next_due_date);
              const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
              const time = dateObj.toLocaleTimeString(undefined, { 
                hour: "2-digit", 
                minute: "2-digit" 
              });

              return (
                <div 
                  key={`${dose.recordId}-${dose._id || dose.id}`} 
                  className="flex items-start gap-4 px-4 py-4"
                >
                  <div className="flex flex-col justify-center items-center w-10 text-red-500 dark:text-red-400">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {dose.newbornName || "Unnamed"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" /> {dayName}, {time}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> Zone: {dose.FullAddress || "N/A"}
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