import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SideLayout(data) {
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

    const vaccinationNotices = [
        {
            id: 1,
            title: "Upcoming Community Vaccination Drive",
            location: "Barangay Hall Covered Court",
            date: "Every last Saturday of the month",
            time: "9:00 AM - 3:00 PM",
            instruction: "Please bring your child's vaccination card and a valid ID.",
        },
        {
            id: 2,
            title: "Free Flu Vaccine for Children",
            location: "Health Center - Monday to Friday",
            date: "June 24, 2025 - July 5, 2025",
            time: "8:00 AM - 12:00 PM",
            instruction: "Slots are limited. Call the health center to schedule an appointment.",
        },
        {
            id: 3,
            title: "Information Session: New Vaccine Guidelines",
            location: "Online via Zoom (Link on Barangay FB Page)",
            date: "July 10, 2025",
            time: "2:00 PM - 3:30 PM",
            instruction: "Learn the latest vaccination information. All are welcome!",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNoticeIndex(prevIndex =>
                (prevIndex + 1) % vaccinationNotices.length
            );
        }, 180000);

        return () => clearInterval(interval);
    }, [vaccinationNotices.length]);

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getEndOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? 0 : 7);
        const endOfWeek = new Date(d.setDate(diff));
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = getStartOfWeek(today);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = getEndOfWeek(today);

    const upcomingVaccinations = [];

    data.data.forEach(record => {
        if (record.doses && Array.isArray(record.doses)) {
            record.doses.forEach(dose => {
                if (dose.next_due_date) {
                    const nextDueDate = new Date(dose.next_due_date);
                    nextDueDate.setHours(0, 0, 0, 0);

                    if (nextDueDate >= startOfWeek && nextDueDate <= endOfWeek && nextDueDate >= today) {
                        upcomingVaccinations.push({
                            vaccineName: record.vaccineName,
                            doseNumber: dose.doseNumber,
                            nextDueDate: dose.next_due_date,
                            newbornName: record.newbornName,
                            motherName: record.motherName,
                            status: dose.status
                        });
                    }
                }
            });
        }
    });

    upcomingVaccinations.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

    const getVaccineColor = (vaccineName) => {
        const colors = ['bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
        const darkColors = ['dark:bg-yellow-900 dark:text-yellow-200', 'dark:bg-red-900 dark:text-red-200', 'dark:bg-blue-900 dark:text-blue-200', 'dark:bg-green-900 dark:text-green-200', 'dark:bg-purple-900 dark:text-purple-200'];
        let hash = 0;
        for (let i = 0; i < vaccineName.length; i++) {
            hash = vaccineName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return `${colors[index]} ${darkColors[index]}`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, rotateX: -90, y: 20 },
        visible: {
            opacity: 1,
            rotateX: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };
    const noticeFlipVariants = {
        enter: { rotateY: -180, opacity: 0 },
        center: { rotateY: 0, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
        exit: { rotateY: 180, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }
    };

    return (
        <div className="overflow-y-auto bg-white rounded-lg shadow-md p-4 space-y-6 dark:bg-gray-800">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Vaccinations (This Week)</h2>

                {upcomingVaccinations.length === 0 ? (
                    <p className="text-gray-500 text-sm italic dark:text-gray-400">No upcoming vaccinations this week.</p>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {upcomingVaccinations.map((vaccination, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm dark:bg-gray-700"
                            >
                                <div className={`flex-shrink-0 text-sm font-bold p-2 rounded-md mr-3 ${getVaccineColor(vaccination.vaccineName)}`}>
                                    Dose {vaccination.doseNumber}
                                </div>
                                <div>
                                    <p className="text-gray-800 font-medium dark:text-gray-100">
                                        {vaccination.vaccineName} - {new Date(vaccination.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500 text-sm dark:text-gray-400">
                                        <span className="break-words">{vaccination.newbornName}</span> (<span className="break-words">{vaccination.motherName}</span>)
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Vaccination Notice</h2>
                <AnimatePresence mode="wait">
                    {vaccinationNotices[currentNoticeIndex] && (
                        <motion.div
                            key={vaccinationNotices[currentNoticeIndex].id}
                            variants={noticeFlipVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="bg-blue-50 rounded-lg p-4 shadow-sm dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800"
                        >
                            <h3 className="text-lg font-bold text-blue-800 mb-2 dark:text-blue-200">
                                {vaccinationNotices[currentNoticeIndex].title}
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                <span className="font-semibold">Location:</span> <span className="break-words">{vaccinationNotices[currentNoticeIndex].location}</span>
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                <span className="font-semibold">Date:</span> {vaccinationNotices[currentNoticeIndex].date}
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-semibold">Time:</span> {vaccinationNotices[currentNoticeIndex].time}
                            </p>
                            <p className="text-xs text-blue-600 italic mt-3 dark:text-blue-400">
                                {vaccinationNotices[currentNoticeIndex].instruction}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default SideLayout;