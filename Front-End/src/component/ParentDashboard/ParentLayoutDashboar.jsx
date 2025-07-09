import React, { useState, useEffect, useContext } from "react";
import ParentDashboard from "./ParentDashboard";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import GrowthTracker from "./GrowthTracker";
import { motion } from "framer-motion";

const Card = ({ title, children }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
            {children}
        </div>
    );
};

const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
};

const EmergencyInfo = () => {
    const contacts = [
        { name: "Pediatrician", info: "Dr. Maria Santos (0917-123-4567)" },
        { name: "Hospital/Clinic", info: "St. Luke's Medical Center (02-8789-7700)" },
        { name: "Emergency Hotline", info: "911 / 112" },
    ];
    return (
        <Card title="Emergency Info">
            <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-200">Contact List</h3>
            <ul className="space-y-3">
                {contacts.map((contact, index) => (
                    <li
                        key={index}
                        className="flex items-center rounded-lg bg-red-50 p-4 shadow-sm dark:bg-red-900"
                    >
                        <svg
                            className="mr-3 h-6 w-6 flex-shrink-0 text-red-500 dark:text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.774a11.037 11.037 0 006.103 6.103l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{contact.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{contact.info}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const NotificationsCenter = () => {
    const { fetchVaccinationNewborn, records } = useContext(VaccineRecordDisplayContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchVaccinationNewborn();
    }, []);

    useEffect(() => {
        if (!records || !Array.isArray(records)) return;

        const generatedNotifications = [];
        const currentDateTime = new Date();

        records.forEach((vaccineRecord) => {
            vaccineRecord.doses.forEach((dose) => {
                if (dose.next_due_date) {
                    const nextDueDate = new Date(dose.next_due_date);
                    const isUpcoming = nextDueDate > currentDateTime;

                    generatedNotifications.push({
                        id: `${vaccineRecord._id}-${dose.doseNumber}-${isUpcoming ? "upcoming" : "overdue"}`,
                        type: isUpcoming ? "Upcoming Vaccine Reminder" : "Overdue Vaccine Alert",
                        message: `${vaccineRecord.newbornName} - ${vaccineRecord.vaccineName.toUpperCase()} - Vaccine due on ${formatDate(dose.next_due_date)}.`,
                        date: formatDate(currentDateTime.toISOString()),
                        priority: isUpcoming ? "high" : "critical",
                    });
                }
            });
        });

        setNotifications(generatedNotifications.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, [records]);

    return (
        <Card title="Notifications Center">
            {notifications.length > 0 ? (
                <ul className="space-y-3">
                    {notifications.map((notif) => (
                        <li
                            key={notif.id}
                            className={`rounded-lg p-4 shadow-sm ${
                                notif.priority === "critical"
                                    ? "border border-red-300 bg-red-100 dark:border-red-600 dark:bg-red-800"
                                    : "border border-yellow-200 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-800"
                            }`}
                        >
                            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{notif.date}</p>
                            <p
                                className={`font-semibold ${
                                    notif.priority === "critical" ? "text-red-700 dark:text-red-300" : "text-yellow-800 dark:text-yellow-300"
                                }`}
                            >
                                {notif.type}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{notif.message}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>
            )}
        </Card>
    );
};

const ParentLayoutDashboard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-inter min-h-screen bg-gray-100 p-4 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 sm:p-6 lg:p-8"
        >
            <header className="mb-8 flex flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
                <h1 className="mb-4 text-3xl font-bold text-red-600 dark:text-red-400 sm:mb-0">Newborn Tracking Dashboard</h1>
            </header>
            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Left & Center Section: GrowthTracker and ParentDashboard */}
                <div className="space-y-6 md:col-span-2 lg:col-span-2">
                    <GrowthTracker />
                    <ParentDashboard />
                </div>

                {/* Right Section: NotificationsCenter and EmergencyInfo */}
                <div className="space-y-6 md:col-span-2 lg:col-span-1">
                    <NotificationsCenter />
                    <EmergencyInfo />
                </div>
            </main>
        </motion.div>
    );
};

export default ParentLayoutDashboard;
