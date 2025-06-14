import React, { useState, useEffect, useCallback } from 'react';

// --- Dummy Data (Your provided data) ---
const rawScheduleData = {
    "status": "success",
    "data": [
        {
            "_id": "684c52bb5f7cee170a1f735f",
            "doses": [
                {
                    "doseNumber": 1,
                    "dateGiven": "2025-06-14T00:00:00.000Z",
                    "next_due_date": "2025-06-16T00:00:00.000Z", // Monday
                    "remarks": "Nochemical Reaction",
                    "administeredBy": "ELIZABETH PANTE",
                    "status": "On-Time",
                    "notified": false,
                    "_id": "684c52bb5f7cee170a1f7360",
                    "administeredById": "684c1713d9d48586f34fbf87",
                    "email": "nellisamaev@gmail.com",
                    "zone": "ZONE 9"
                },
                {
                    "doseNumber": 2,
                    "dateGiven": "2025-06-14T00:00:00.000Z",
                    "next_due_date": "2025-06-24T00:00:00.000Z", // Tuesday next week
                    "remarks": "No chemical Reaction",
                    "administeredBy": "ELIZABETH PANTE",
                    "status": "On-Time",
                    "notified": false,
                    "_id": "684c52dd5f7cee170a1f7377",
                    "administeredById": "684c1713d9d48586f34fbf87",
                    "email": "nellisamaev@gmail.com",
                    "zone": "ZONE 9"
                }
            ],
            "newbornName": "ALDIN RICHARD",
            "avatar": null,
            "gender": "Male",
            "vaccineName": "pfizer",
            "dosage": "1.0 mL",
            "description": "ewrwr",
            "motherName": "Renato PUSA",
            "FullAddress": "ZONE 9 Asug Caibiran Biliran",
            "newbornZone": "ZONE 9",
            "recordId": "684c52bb5f7cee170a1f735f",
            "dateOfBirth": "2025-05-14"
        },
        {
            "_id": "684c2755eea98210f703246c",
            "doses": [
                {
                    "doseNumber": 1,
                    "dateGiven": "2025-06-10T00:00:00.000Z",
                    "next_due_date": "2025-06-11T00:00:00.000Z", // Wednesday last week (will not show in current week)
                    "remarks": "jytjytj",
                    "administeredBy": "NELLItSA Vicedor",
                    "status": "On-Time",
                    "notified": false,
                    "_id": "684c2755eea98210f703246d",
                    "administeredById": "684be80064763a8fb86a76dd",
                    "email": "jeniel12300@gmail.com",
                    "zone": ""
                }
            ],
            "newbornName": "Aldous Aldous",
            "avatar": null,
            "gender": "Male",
            "vaccineName": "hepatitis b",
            "dosage": "0.5 mL",
            "description": "Prevents hepatitis B virus infection",
            "motherName": "Renato PUSA",
            "FullAddress": "ZONE 9 Asug Caibiran Biliran",
            "newbornZone": "ZONE 9",
            "recordId": "684c2755eea98210f703246c",
            "dateOfBirth": "2025-06-13"
        },
        {
            "_id": "684c2732eea98210f7032437",
            "doses": [
                {
                    "doseNumber": 1,
                    "dateGiven": "2025-06-13T00:00:00.000Z",
                    "next_due_date": "2025-06-18T00:00:00.000Z", // Wednesday
                    "remarks": "jyjtjtj",
                    "administeredBy": "NELLItSA Vicedor",
                    "status": "On-Time",
                    "notified": false,
                    "_id": "684c2732eea98210f7032438",
                    "administeredById": "684be80064763a8fb86a76dd",
                    "email": "jeniel12300@gmail.com",
                    "zone": ""
                }
            ],
            "newbornName": "Aldous Aldous",
            "avatar": null,
            "gender": "Male",
            "vaccineName": "pfizer",
            "dosage": "1.0 mL",
            "description": "ewrwr",
            "motherName": "Renato PUSA",
            "FullAddress": "ZONE 9 Asug Caibiran Biliran",
            "newbornZone": "ZONE 9",
            "recordId": "684c2732eea98210f7032437",
            "dateOfBirth": "2025-06-13"
        },
        {
            "_id": "684c529b5f7cee170a1f7349",
            "doses": [
                {
                    "doseNumber": 1,
                    "dateGiven": "2025-06-14T00:00:00.000Z",
                    "next_due_date": "2025-06-20T00:00:00.000Z", // Friday
                    "remarks": "No chemical Reaction",
                    "administeredBy": "ELIZABETH PANTE",
                    "status": "On-Time",
                    "notified": false,
                    "_id": "684c529b5f7cee170a1f734a",
                    "administeredById": "684c1713d9d48586f34fbf87",
                    "email": "nellisamaev@gmail.com",
                    "zone": "ZONE 9"
                }
            ],
            "newbornName": "ALDIN RICHARD",
            "avatar": null,
            "gender": "Male",
            "vaccineName": "bcg",
            "dosage": "0.5 mL",
            "description": "Bacillus Calmette–Guérin vaccine to prevent tuberculosis",
            "motherName": "Renato PUSA",
            "FullAddress": "ZONE 9 Asug Caibiran Biliran",
            "newbornZone": "ZONE 9",
            "recordId": "684c529b5f7cee170a1f7349",
            "dateOfBirth": "2025-05-14"
        }
    ]
};

// --- Helper Functions ---

const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const newDate = new Date(date);
    newDate.setDate(diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

const formatDateHeader = (date) => {
    const options = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options).toUpperCase().replace('.', '');
};

const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
};

// --- Category colors mapping (Tailwind classes) ---
const categoryColors = {
    "on-time": 'bg-emerald-500/80 text-white border-l-4 border-emerald-300 shadow-md',
    "delayed": 'bg-amber-500/80 text-white border-l-4 border-amber-300 shadow-md',
    "missed": 'bg-rose-500/80 text-white border-l-4 border-rose-300 shadow-md',
    "pfizer": 'bg-blue-500/80 text-white border-l-4 border-blue-300 shadow-md',
    "hepatitis b": 'bg-purple-500/80 text-white border-l-4 border-purple-300 shadow-md',
    "bcg": 'bg-indigo-500/80 text-white border-l-4 border-indigo-300 shadow-md',
    "default": 'bg-gray-500/80 text-white border-l-4 border-gray-300 shadow-md',
};

const WeeklyCalendar = (data) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [daysInWeek, setDaysInWeek] = useState([]);
    const [eventsByDate, setEventsByDate] = useState({});

    const processScheduleData = useCallback((data, startOfWeek, endOfWeek) => {
        const processedEvents = {};
        data.forEach(record => {
            record.doses.forEach(dose => {
                const nextDueDate = dose.next_due_date ? new Date(dose.next_due_date) : null;

                if (nextDueDate) {
                    const normalizedNextDueDate = new Date(nextDueDate);
                    normalizedNextDueDate.setHours(0, 0, 0, 0);

                    if (normalizedNextDueDate >= startOfWeek && normalizedNextDueDate <= endOfWeek) {
                        const dateKey = formatDateKey(normalizedNextDueDate);
                        if (!processedEvents[dateKey]) {
                            processedEvents[dateKey] = [];
                        }
                        processedEvents[dateKey].push({
                            id: `${record._id}-${dose._id}`,
                            title: `${record.newbornName} - ${record.vaccineName}`,
                            description: `Dose ${dose.doseNumber} - Mother: ${record.motherName}`,
                            time: 'All day',
                            category: (dose.status || record.vaccineName || 'default').toLowerCase(),
                            rawDose: dose,
                        });
                    }
                }
            });
        });
        return processedEvents;
    }, []);

    useEffect(() => {
        const days = [];
        let currentDay = new Date(currentWeekStart);
        const endOfWeek = new Date(currentWeekStart);
        endOfWeek.setDate(endOfWeek.getDate() + 4);
        endOfWeek.setHours(23, 59, 59, 999);

        for (let i = 0; i < 5; i++) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        setDaysInWeek(days);

        const events = processScheduleData(rawScheduleData.data, currentWeekStart, endOfWeek);
        setEventsByDate(events);
    }, [currentWeekStart, processScheduleData]);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const goToCurrentWeek = () => {
        setCurrentWeekStart(getStartOfWeek(new Date()));
    };

    const renderTimeSlots = () => {
        const timeSlots = [];
        for (let i = 8; i <= 17; i++) {
            const hour = i > 12 ? i - 12 : i;
            const ampm = i >= 12 ? 'PM' : 'AM';
            timeSlots.push(
                <div key={i} className="h-10 sm:h-12 border-b border-gray-200 dark:border-gray-700 flex items-end text-xs text-gray-500 dark:text-gray-400 pr-1 pb-0.5 justify-end">
                    {hour}{ampm}
                </div>
            );
        }
        return timeSlots;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-950 dark:to-black text-gray-900 dark:text-white ">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 bg-opacity-90 dark:bg-opacity-90">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white mb-2 sm:mb-0 tracking-tight">Upcoming Schedules</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPreviousWeek}
                            className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Previous week"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button
                            onClick={goToNextWeek}
                            className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Next week"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                        <button
                            onClick={goToCurrentWeek}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm font-semibold transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Current Week
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-6 divide-x divide-gray-200 dark:divide-gray-700">
                    {/* Time Column Header (Adjusted width here) */}
                    <div className="col-span-1 border-b border-gray-200 dark:border-gray-700 py-3 text-xs text-gray-500 dark:text-gray-400 pl-2 flex items-end">
                        {/* Empty cell for top-left corner */}
                    </div>

                    {/* Day Headers */}
                    {daysInWeek.map((day, index) => (
                        <div
                            key={index}
                            className={`col-span-1 text-center py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 ${
                                isToday(day)
                                    ? 'bg-gradient-to-t from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-400 font-bold'
                                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <div className="text-sm font-medium tracking-wide">{formatDateHeader(day).split(' ')[0]}</div>
                            <div className={`text-2xl sm:text-3xl font-extrabold ${isToday(day) ? 'text-blue-700 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'}`}>{formatDateHeader(day).split(' ')[1]}</div>
                        </div>
                    ))}

                    {/* Calendar Body */}
                    <div className="col-span-1 min-h-[25rem] sm:min-h-[30rem] overflow-hidden bg-gray-50 dark:bg-gray-700/50 pt-2 pb-2">
                        {renderTimeSlots()}
                    </div>
                    {daysInWeek.map((day, dayIndex) => {
                        const formattedDateKey = formatDateKey(day);
                        const dailyEvents = eventsByDate[formattedDateKey] || [];
                        const todayBgClass = isToday(day) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800/50';

                        return (
                            <div key={dayIndex} className={`col-span-1 relative min-h-[25rem] sm:min-h-[30rem] ${todayBgClass} group`}>
                                {/* Subtle grid lines for time slots */}
                                {Array.from({ length: 10 }).map((_, timeIndex) => (
                                    <div key={timeIndex} className="h-10 sm:h-12 border-b border-gray-100/70 dark:border-gray-700/70 last:border-b-0"></div>
                                ))}

                                {/* Events Overlay */}
                                <div className="absolute inset-0 pt-1 px-0.5 sm:pt-2 sm:px-1">
                                    {dailyEvents.map((event, eventIdx) => (
                                        <div
                                            key={event.id}
                                            className={`relative rounded-md p-1.5 mb-1 text-xs sm:text-sm cursor-pointer overflow-hidden
                                                       transition-all duration-300 ease-out transform hover:scale-[1.03] hover:shadow-xl
                                                       flex flex-col justify-between
                                                       ${categoryColors[event.category] || categoryColors.default}`}
                                        >
                                            <div className="font-semibold text-sm whitespace-normal">{event.title}</div>
                                            <div className="text-[0.6rem] sm:text-xs opacity-90 whitespace-normal">{event.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;