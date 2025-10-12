import React, { useContext } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function WeeklySchedulePanel() {
  const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

  // Compute current week's Monday–Sunday
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Filter doses within this week
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
      }))
  );

  return (
    <div className="card col-span-1 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-md md:col-span-2 lg:col-span-3">
      <div className="card-header border-b border-slate-200 px-4 py-3">
        <p className="card-title text-lg font-semibold text-slate-800">Weekly Incoming Schedule</p>
        <p className="text-sm text-slate-500">
          {monday.toLocaleDateString()} - {sunday.toLocaleDateString()}
        </p>
      </div>

      <div className="card-body h-[300px] divide-y divide-slate-100 overflow-y-auto p-0">
        {weeklyDoses.length === 0 ? (
          <div className="p-4 text-center text-slate-500">No scheduled visits this week.</div>
        ) : (
          weeklyDoses.map((dose) => {
            const dateObj = new Date(dose.next_due_date);
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
            const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={`${dose.recordId}-${dose._id || dose.id}`}
                className="flex items-start gap-4 px-4 py-4"
              >
                <div className="flex w-10 flex-col items-center justify-center text-blue-500">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{dose.newbornName || "Unnamed"}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" /> {dayName}, {time}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" /> Zone: {dose.FullAddress || "N/A"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WeeklySchedulePanel;
