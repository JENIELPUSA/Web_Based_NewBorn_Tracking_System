import React, { useContext, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import WeeklySchedulePanel from "./WeeklySchedulePanel";
import VaccineStockGraph from "./VaccineStockGraph";

function WeeklySchedule() {
    const { theme } = useTheme();
    const { isGraphData } = useContext(NewBornDisplayContext);
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

    // --- Compute weekly doses (for WeeklySchedulePanel) ---
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklyDoses = (vaccineRecord || []).flatMap((item) =>
        item.doses
            .filter((dose) => {
                if (!dose.next_due_date) return false;
                const scheduleDate = new Date(dose.next_due_date);
                return (
                    !isNaN(scheduleDate) &&
                    scheduleDate >= monday &&
                    scheduleDate <= sunday
                );
            })
            .map((dose) => ({
                ...dose,
                newbornName: item.newbornName,
                FullAddress: item.FullAddress,
                recordId: item._id || item.id,
            }))
    );

    // --- Prepare monthly weight data (for potential graph use) ---
    const graphDataArray = useMemo(() => {
        if (!isGraphData) return [];
        return Array.isArray(isGraphData) ? isGraphData : [isGraphData];
    }, [isGraphData]);

    const monthlyWeight = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map((month) => {
            const total = graphDataArray
                .filter((baby) => baby.birthMonth === month)
                .reduce((acc, baby) => {
                    if (!baby.totalWeight) return acc;
                    const weightStr = String(baby.totalWeight).replace(" kg", "").trim();
                    const weight = parseFloat(weightStr);
                    return acc + (isNaN(weight) ? 0 : weight);
                }, 0);
            return { name: month, total: parseFloat(total.toFixed(1)) };
        });
    }, [graphDataArray]);

    // (optional — you can pass monthlyWeight as props if needed later)

    return (
        <div className="grid grid-cols-1 gap-6 xs:px-2 sm:px-0 md:grid-cols-2 lg:grid-cols-7 lg:px-0">
            {/* Vaccine Stock Graph */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <VaccineStockGraph />
            </div>

            {/* Weekly Schedule Panel */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <WeeklySchedulePanel weeklyDoses={weeklyDoses} />
            </div>
        </div>
    );
}

export default WeeklySchedule;
