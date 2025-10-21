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
import { useIsMobile } from "./useIsMobile";

const VaccinationCalendar = () => {
    const { role, zone } = useContext(AuthContext);
    const { vaccineRecord, calendardata } = useContext(VaccineRecordDisplayContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [clickedDate, setClickedDate] = useState(null);
    const [tooltipContent, setTooltipContent] = useState([]);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const isMobile = useIsMobile();

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
                        const isNextDueDateEntry = dose.next_due_date && isSameDay(parseISO(dose.next_due_date), date);

                        return {
                            newbornName: entry.newbornName,
                            vaccineName: entry.vaccineName,
                            doseNumber: dose.doseNumber,
                            status: dose.status,
                            remarks: dose.remarks,
                            administeredBy: dose.administeredBy,
                            isDue: isLatestDue && isNextDueDateEntry,
                            isDateGiven: dose.dateGiven && isSameDay(parseISO(dose.dateGiven), date),
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

    if (!isMobile) {
        const rect = event.currentTarget.getBoundingClientRect();
        const tooltipHeight = 250; // conservative max height
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Only show above if there's NOT enough space below
        const shouldShowAbove = spaceBelow < tooltipHeight;

        setTooltipPosition({
            top: shouldShowAbove
                ? rect.top + window.scrollY - tooltipHeight - 10
                : rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX,
            showAbove: shouldShowAbove
        });
    }
};

    const renderHeader = () => (
        <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <button
                onClick={handlePrevMonth}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B8D6A] to-[#6a7a5a] text-white hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7B8D6A] to-[#5a6a4a] bg-clip-text text-transparent">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                    onClick={handleToday}
                    className="mt-2 px-4 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                    Today
                </button>
            </div>

            <button
                onClick={handleNextMonth}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#7B8D6A] to-[#6a7a5a] text-white hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center py-3 text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {format(addDays(startDate, i), "EEE")}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2 bg-white rounded-lg shadow-sm border border-gray-200">{days}</div>;
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
                <motion.div
                    key={date}
                    onClick={(e) => handleDateClick(date, e)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative min-h-[100px] rounded-lg p-2 border-2 cursor-pointer transition-all duration-200 ${
                        !isCurrentMonth ? "opacity-40 bg-gray-50" : "bg-white"
                    } ${isCurrentDay ? "border-[#7B8D6A] shadow-md" : "border-gray-200"} ${
                        doses.length > 0 ? "hover:shadow-lg hover:border-[#7B8D6A]/50" : "hover:shadow-md hover:border-gray-300"
                    } ${isClicked ? "ring-4 ring-[#7B8D6A]/30 shadow-lg" : ""}`}
                >
                    <div className="text-right mb-2">
                        <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-semibold text-sm transition-colors ${
                                isCurrentDay 
                                    ? "bg-gradient-to-br from-[#7B8D6A] to-[#6a7a5a] text-white shadow-md" 
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {format(date, "d")}
                        </span>
                    </div>
                    {doses.length > 0 && (
                        <div className="space-y-1.5">
                            {doses.slice(0, 2).map((dose, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`truncate rounded-md px-2 py-1 text-[11px] font-medium text-white shadow-sm ${
                                        dose.status === "On-Time"
                                            ? "bg-gradient-to-r from-green-500 to-green-600"
                                            : dose.status === "Missed"
                                            ? "bg-gradient-to-r from-red-500 to-red-600"
                                            : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="truncate">{dose.vaccineName}</span>
                                        {dose.isDue ? (
                                            <span className="text-sm">📌</span>
                                        ) : (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">D{dose.doseNumber}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {doses.length > 2 && (
                                <div className="text-[10px] text-gray-500 font-medium text-center py-1 bg-gray-100 rounded-md">
                                    +{doses.length - 2} more
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(<div key={i} className="grid grid-cols-7 gap-2">{days}</div>);
                days = [];
            }
        });

        return <div className="space-y-2 bg-white rounded-xl shadow-sm p-4 border border-gray-200">{rows}</div>;
    };

    const MobileModal = ({ date, content, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-8 relative"
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-gray-900">
                        {format(date, "MMM d, yyyy")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {content.map((item, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                            <div className="font-bold text-lg text-[#7B8D6A] mb-2">{item.newbornName}</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Vaccine:</span>
                                    <span className="text-sm font-medium text-gray-800">{item.vaccineName}</span>
                                </div>
                                {!item.isDue && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Dose:</span>
                                            <span className="text-sm font-medium text-gray-800">{item.doseNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                                    item.status === "On-Time"
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : item.status === "Missed"
                                                        ? "bg-red-100 text-red-800 border border-red-200"
                                                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Assigned By:</span>
                                            <span className="text-sm font-medium text-gray-800">{item.administeredBy || "None"}</span>
                                        </div>
                                    </>
                                )}
                                {item.isDue && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                        <span className="text-2xl">📌</span>
                                        <span className="text-sm text-red-600 font-bold">Next Due Date!</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <motion.div
            className="min-h-screen w-full max-w-[1400px] px-4 xs:px-2 sm:px-6 lg:px-8 mx-auto py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #e8f0e8 100%)"
            }}
        >
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <AnimatePresence>
                {clickedDate && tooltipContent.length > 0 && (
                    isMobile ? (
                        <MobileModal
                            date={clickedDate}
                            content={tooltipContent}
                            onClose={() => setClickedDate(null)}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: tooltipPosition.showAbove ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed z-50 rounded-xl border-2 border-gray-200 bg-white shadow-2xl overflow-hidden"
                            style={{
                                top: tooltipPosition.top,
                                left: tooltipPosition.left,
                                maxWidth: "380px",
                            }}
                        >
                            {tooltipPosition.showAbove && (
                                <div className="absolute bottom-[-8px] left-4 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 transform rotate-45"></div>
                            )}
                            {!tooltipPosition.showAbove && (
                                <div className="absolute top-[-8px] left-4 w-4 h-4 bg-[#7B8D6A] transform rotate-45"></div>
                            )}
                            <div className="bg-gradient-to-r from-[#7B8D6A] to-[#6a7a5a] p-4 flex justify-between items-center">
                                <span className="font-bold text-white">
                                    {format(clickedDate, "MMM d, yyyy")}
                                </span>
                                <button
                                    onClick={() => setClickedDate(null)}
                                    className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                                {tooltipContent.map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-gray-200 pb-3 last:border-0"
                                    >
                                        <div className="font-bold text-[#7B8D6A] mb-1">{item.newbornName}</div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-700">
                                                <span className="font-semibold">Vaccine:</span> {item.vaccineName}
                                            </div>
                                            {!item.isDue && (
                                                <>
                                                    <div className="text-sm text-gray-700">
                                                        <span className="font-semibold">Dose:</span> {item.doseNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-700 flex items-center gap-2">
                                                        <span className="font-semibold">Status:</span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                                item.status === "On-Time"
                                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                                    : item.status === "Missed"
                                                                    ? "bg-red-100 text-red-800 border border-red-200"
                                                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        <span className="font-semibold">Assigned By:</span> {item.administeredBy || "None"}
                                                    </div>
                                                </>
                                            )}
                                            {item.isDue && (
                                                <div className="flex items-center gap-1 text-sm bg-red-50 border border-red-200 rounded-md p-2">
                                                    <span>📌</span>
                                                    <span className="text-red-600 font-bold">Next Due Date!</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VaccinationCalendar;