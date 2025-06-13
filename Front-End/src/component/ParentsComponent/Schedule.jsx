import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- StatusBadge Component (No changes needed here) ---
const statusColors = {
    ontime: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        display: "On-Time",
    },
    delayed: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-800 dark:text-yellow-200",
        display: "Delayed",
    },
    missed: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
        display: "Missed",
    },
    default: {
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-800 dark:text-gray-200",
        display: "-",
    },
};

const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase().replace(/[-\s]/g, "") || "default";
    const color = statusColors[normalizedStatus] || statusColors.default;

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text}`}>
            {color.display}
        </span>
    );
};

function VaccinationTimelineWithArrowDates({ scheduleData }) {
    const [timelineEntries, setTimelineEntries] = useState(() => {
        const entries = [];
        const processedDates = new Set();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };

        if (scheduleData && Array.isArray(scheduleData)) {
            scheduleData.forEach(record => {
                record.doses.forEach(dose => {
                    if (dose.next_due_date) {
                        const nextDueDate = new Date(dose.next_due_date);
                        const formattedDate = nextDueDate.toLocaleDateString('en-US', options).toUpperCase();
                        const dateIdentifier = formattedDate;

                        if (!processedDates.has(dateIdentifier)) {
                            processedDates.add(dateIdentifier);
                            const vaccinesForThisDate = [];

                            scheduleData.forEach(r => {
                                r.doses.forEach(d => {
                                    if (d.next_due_date) {
                                        const dDate = new Date(d.next_due_date);
                                        if (dDate.toLocaleDateString('en-US', options).toUpperCase() === formattedDate) {
                                            vaccinesForThisDate.push(
                                                `<b>${r.vaccineName}</b> - Dose ${d.doseNumber || 'N/A'} for ${r.newbornName} (${r.motherName})`
                                            );
                                        }
                                    }
                                });
                            });

                            entries.push({
                                calendarDate: formattedDate,
                                subText: `Scheduled for this date`,
                                title: "Scheduled Immunization",
                                vaccines: [...new Set(vaccinesForThisDate)],
                            });
                        }
                    }
                });
            });
        }
        return entries.sort((a, b) => new Date(a.calendarDate) - new Date(b.calendarDate));
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);
    const [todayFormatted, setTodayFormatted] = useState('');

    useEffect(() => {
        const today = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        setTodayFormatted(today.toLocaleDateString('en-US', options).toUpperCase());
    }, []);

    const totalPages = Math.ceil(timelineEntries.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = timelineEntries.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 p-2">
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 text-center shadow-lg">
                    <h1 className="text-2xl xs:text-3xl font-bold mb-1 tracking-wide">Child Immunization Schedule</h1>
                    <p className="text-sm xs:text-base opacity-90">Stay informed about upcoming vaccination dates for your child.</p>
                </div>

                <div className="p-6 space-y-6 relative">
                    {/* Timeline Line: hidden on smaller screens, block on 'xs' and up */}
                    <div className="absolute left-1/4 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-red-300 dark:bg-red-600 hidden xs:block"></div>

                    {currentItems.length === 0 ? (
                        <div className="text-center text-gray-700 dark:text-gray-300 py-10">
                            No upcoming vaccination schedules found.
                        </div>
                    ) : (
                        currentItems.map((entry, index) => {
                            const globalIndex = indexOfFirstItem + index;
                            const isToday = entry.calendarDate === todayFormatted;

                            const dateBoxBgClass = isToday
                                ? 'bg-red-700 text-white'
                                : 'bg-red-500 text-white';

                            const contentBoxBgClass = isToday
                                ? 'bg-red-100 dark:bg-red-800'
                                : 'bg-red-50 dark:bg-red-700';

                            return (
                                <div
                                    key={entry.calendarDate + globalIndex}
                                    // Use 'xs:flex-row' to make it horizontal from 'xs' breakpoint
                                    className="flex flex-col xs:flex-row items-stretch xs:items-center relative group"
                                >
                                    {/* Date Box */}
                                    {/* w-full on small, xs:w-1/4 on xs and up */}
                                    <div className="w-full xs:w-1/4 pr-4 xs:text-right">
                                        <div className={`inline-block p-3 rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 ${dateBoxBgClass}`}>
                                            <p className="text-lg xs:text-xl font-bold">{entry.calendarDate}</p>
                                            <p className="text-xs xs:text-sm opacity-80">{entry.subText}</p>
                                        </div>
                                        {/* Arrow for desktop-like view: hidden on smaller screens, block on 'xs' and up */}
                                        <div
                                            className="hidden xs:block absolute right-0 top-1/2 -mt-2 w-4 h-4 bg-inherit transform rotate-45 translate-x-1/2 -z-10"
                                            style={{ backgroundColor: isToday ? '#b91c1c' : '#dc2626' }}
                                        ></div>
                                    </div>
                                    {/* Content Box */}
                                    {/* w-full on small, xs:w-3/4 on xs and up. No left padding on small, xs:pl-8 on xs and up */}
                                    <div className="w-full xs:w-3/4 pl-0 xs:pl-8 mt-2 xs:mt-0 relative">
                                        {/* Arrow for mobile view: hidden on 'xs' and up, block on smaller */}
                                        <div className={`xs:hidden absolute left-1/2 -top-2 transform -translate-x-1/2 w-4 h-4 rounded-sm rotate-45 ${contentBoxBgClass}`}></div>
                                        <div className={`p-4 rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl ${contentBoxBgClass}`}>
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{entry.title}</h3>
                                            <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
                                                {entry.vaccines.map((vaccine, vacIndex) => (
                                                    <li key={vacIndex} dangerouslySetInnerHTML={{ __html: vaccine }}></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-6">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${currentPage === i + 1 ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'} hover:bg-red-500 dark:hover:bg-red-700 transition-all`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VaccinationTimelineWithArrowDates;