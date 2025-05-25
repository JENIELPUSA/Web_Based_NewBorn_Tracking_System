import React, { useContext, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addDays,
    isAfter,
} from "date-fns";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { AuthContext } from "../../contexts/AuthContext";

const VaccinationCalendar = () => {
    const { role, zone } = useContext(AuthContext);
    const { vaccineRecord,calendardata } = useContext(VaccineRecordDisplayContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [clickedDate, setClickedDate] = useState(null);
    const [tooltipContent, setTooltipContent] = useState([]);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const latestDueMap = useMemo(() => {
        const map = {};
        calendardata?.forEach((entry) => {
            const key = `${entry.newbornName}_${entry.vaccineName}`;
            let latestDate = null;
            entry.doses?.forEach((dose) => {
                if (dose.next_due_date) {
                    const dueDate = parseISO(dose.next_due_date);
                    if (!latestDate || isAfter(dueDate, latestDate)) {
                        latestDate = dueDate;
                    }
                }
            });
            if (latestDate) {
                map[key] = format(latestDate, "yyyy-MM-dd");
            }
        });
        return map;
    }, [calendardata]);

    const getDosesByDate = useCallback(
        (date) => {
            if (!calendardata) return [];
            return calendardata.flatMap((entry) =>
                entry.doses
                    ?.filter(
                        (dose) =>
                            (dose.dateGiven && isSameDay(parseISO(dose.dateGiven), date)) ||
                            (dose.next_due_date && isSameDay(parseISO(dose.next_due_date), date))
                    )
                    .map((dose) => {
                        const dueDateStr = dose.next_due_date ? format(parseISO(dose.next_due_date), "yyyy-MM-dd") : "";
                        const key = `${entry.newbornName}_${entry.vaccineName}`;
                        const isLatestDue = dueDateStr && dueDateStr === latestDueMap[key];

                        return {
                            newbornName: entry.newbornName,
                            vaccineName: entry.vaccineName,
                            doseNumber: dose.doseNumber,
                            status: dose.status,
                            remarks: dose.remarks,
                            administeredBy: dose.administeredBy,
                            isDue: isLatestDue && isSameDay(parseISO(dose.next_due_date), date),
                        };
                    })
            );
        },
        [calendardata, latestDueMap]
    );

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const handleDateClick = (date, event) => {
        const doses = getDosesByDate(date);
        if (doses.length === 0) {
            setClickedDate(null);
            return;
        }
        if (clickedDate && isSameDay(clickedDate, date)) {
            setClickedDate(null);
            return;
        }
        setClickedDate(date);
        setTooltipContent(doses);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
    };

    const renderHeader = () => (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex space-x-2">
                <button
                    onClick={handlePrevMonth}
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                >
                    ‹
                </button>
                <button
                    onClick={handleToday}
                    className="rounded bg-gray-200 px-3 py-1 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    Today
                </button>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
                onClick={handleNextMonth}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
                    ›
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {format(addDays(startDate, i), "EEE")}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        const rows = [];
        let days = [];

        eachDayOfInterval({ start: startDate, end: endDate }).forEach((date, i) => {
            const doses = getDosesByDate(date);
            const isCurrentDay = isToday(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isClicked = clickedDate && isSameDay(clickedDate, date);

            days.push(
                <div
                    key={date}
                    onClick={(e) => handleDateClick(date, e)}
                    className={`relative min-h-[80px] rounded p-1 border cursor-pointer transition ${
                        !isCurrentMonth ? "opacity-40" : ""
                    } ${isCurrentDay ? "bg-blue-100 border-blue-400 dark:bg-blue-900/30" : ""} ${
                        doses.length > 0 ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${isClicked ? "ring-2 ring-blue-400" : ""}`}
                >
                    <div className="text-right text-xs">
                        <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full${
                                isCurrentDay ? "bg-blue-500 text-white" : "text-gray-700 dark:text-white"
                            }`}
                        >
                            {format(date, "d")}
                        </span>
                    </div>
                    {doses.length > 0 && (
                        <div className="mt-1 space-y-1 max-h-[60px] overflow-hidden">
                            {doses.slice(0, 2).map((dose, idx) => (
                                <div
                                    key={idx}
                                    className={`truncate rounded px-1 py-[1px] text-[10px] text-white ${
                                        dose.status === "On-Time"
                                            ? "bg-green-500"
                                            : dose.status === "Missed"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                    }`}
                                >
                                    {dose.vaccineName} (D{dose.doseNumber}) {dose.isDue ? "📌" : ""}
                                </div>
                            ))}
                            {doses.length > 2 && (
                                <div className="text-[10px] text-gray-500 dark:text-red-300">
                                    +{doses.length - 2} more...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(<div key={i} className="grid grid-cols-7 gap-1">{days}</div>);
                days = [];
            }
        });

        return <div className="space-y-1">{rows}</div>;
    };

    return (
<motion.div
  className="min-h-screen w-full max-w-[1400px] px-4 xs:px-2 sm:px-6 lg:px-8 mx-auto bg-gray-100 dark:bg-gray-900"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>




            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <AnimatePresence>
                {clickedDate && tooltipContent.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed z-50 rounded-md border border-gray-300 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        style={{
                            top: tooltipPosition.top + 10,
                            left: tooltipPosition.left,
                            maxWidth: "320px",
                        }}
                    >
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white xs:text-xs lg:text-sm sm:text-sm">
                                Doses on {format(clickedDate, "MMM d, yyyy")}
                            </span>
                            <button
                                onClick={() => setClickedDate(null)}
                                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {tooltipContent.map((item, i) => (
                                <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                                    <div className="font-medium text-blue-600 dark:text-blue-300 xs:text-xs lg:text-sm sm:text-sm">{item.newbornName}</div>
                                    <div className="xs:text-xs lg:text-sm sm:text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-medium">Vaccine:</span> {item.vaccineName}
                                    </div>
                                    <div className="xs:text-xs lg:text-sm sm:text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-medium">Dose:</span> {item.doseNumber}
                                    </div>
                                    <div className="xs:text-xs lg:text-sm sm:text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-medium">Status:</span>
                                        <span
                                            className={`ml-1 rounded px-1 py-0.5 xs:text-xs lg:text-sm sm:text-sm ${
                                                item.status === "On-Time"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : item.status === "Missed"
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="xs:text-xs lg:text-sm sm:text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">AssignedBy:</span> {item.administeredBy || "None"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VaccinationCalendar;
