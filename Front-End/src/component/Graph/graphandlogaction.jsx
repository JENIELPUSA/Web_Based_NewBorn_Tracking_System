import React, { useContext } from "react";
import { User } from "lucide-react";
import { LogContext } from "../../contexts/LogAndAuditContext/LogAuditContext";
import { useTheme } from "@/hooks/use-theme";

function LogActionsAudit() {
  const { LogData } = useContext(LogContext);
  const { theme } = useTheme();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthLogs = LogData
    ? LogData.filter((log) => {
        const logDate = new Date(log.timestamp);
        return (
          logDate.getMonth() === currentMonth &&
          logDate.getFullYear() === currentYear
        );
      })
    : [];

  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-lg ${
        theme === "light"
          ? "border border-slate-200 bg-white/70 shadow-lg"
          : "border border-slate-700 bg-slate-800/50 shadow-lg"
      }`}
    >
      <div className="mb-4 border-b border-slate-200/50 pb-4 dark:border-slate-700/50">
        <p
          className={`text-xl font-semibold ${
            theme === "light" ? "text-slate-800" : "text-white"
          }`}
        >
          Log Actions Audit
        </p>
        <p
          className={`mt-1 text-sm ${
            theme === "light" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Actions this Month
        </p>
      </div>

      <div className="h-[300px] overflow-y-auto">
        {!LogData ? (
          <div className="flex h-full items-center justify-center">
            <p
              className={`text-sm ${
                theme === "light" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Loading log data...
            </p>
          </div>
        ) : currentMonthLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p
              className={`text-sm ${
                theme === "light" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              No log entries found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMonthLogs.map((log) => (
              <div
                key={log._id}
                className={`rounded-xl p-4 transition-all ${
                  theme === "light"
                    ? "hover:bg-white/90"
                    : "hover:bg-slate-700/50"
                } ${
                  log.isExternal
                    ? theme === "light"
                      ? "bg-amber-100/50"
                      : "bg-amber-900/30"
                    : ""
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
                          theme === "light" ? "bg-[#93A87E]" : "bg-slate-700"
                        }`}
                      >
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`truncate font-medium ${
                          theme === "light" ? "text-slate-800" : "text-white"
                        }`}
                      >
                        {log?.user?.fullName || "Unknown User"}
                      </p>
                      {log.isExternal && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            theme === "light"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-amber-700/50 text-amber-200"
                          }`}
                        >
                          External
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "light"
                          ? "text-slate-600"
                          : "text-slate-300"
                      }`}
                    >
                      {log.action}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p
                        className={`text-xs ${
                          theme === "light"
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      <p
                        className={`font-mono text-xs ${
                          theme === "light"
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
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
  );
}

export default LogActionsAudit;
