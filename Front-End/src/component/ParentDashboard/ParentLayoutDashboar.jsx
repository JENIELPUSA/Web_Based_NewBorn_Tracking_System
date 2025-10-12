import React, { useState, useEffect, useContext } from "react";
import ParentDashboard from "./ParentDashboard";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import GrowthTracker from "./GrowthTracker";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Card = ({ title, children }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">{title}</h2>
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
            <h3 className="mb-3 text-lg font-medium text-gray-700">Contact List</h3>
            <ul className="space-y-3">
                {contacts.map((contact, index) => (
                    <li
                        key={index}
                        className="flex items-center rounded-lg bg-red-50 p-4 shadow-sm"
                    >
                        <svg
                            className="mr-3 h-6 w-6 flex-shrink-0 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.774a11.037 11.037 0 006.103 6.103l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                        <div>
                            <p className="font-semibold text-gray-800">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.info}</p>
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
                        message: `${vaccineRecord.newbornName} - ${vaccineRecord.vaccineName.toUpperCase()} - Vaccine due on ${formatDate(
                            dose.next_due_date,
                        )}.`,
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
                                notif.priority === "critical" ? "border border-red-300 bg-red-100" : "border border-yellow-200 bg-yellow-50"
                            }`}
                        >
                            <p className="mb-1 text-xs text-gray-500">{notif.date}</p>
                            <p className={`font-semibold ${notif.priority === "critical" ? "text-red-700" : "text-yellow-800"}`}>{notif.type}</p>
                            <p className="text-sm text-gray-700">{notif.message}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No new notifications.</p>
            )}
        </Card>
    );
};

const ParentLayoutDashboard = () => {
    const navigate = useNavigate();
    const [isClearDataTrack, setClearDataTrack] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-inter min-h-screen bg-gray-100 p-4 text-gray-900 transition-colors duration-300 sm:p-6 lg:p-8"
        >
            {/* Floating Back Button */}
            <motion.button
                onClick={() => navigate("/login")}
                className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-gray-300 bg-white p-3 text-gray-700 shadow-lg hover:bg-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden md:inline">Back</span>
            </motion.button>

            {/* Main Content (Dashboard) */}
            <header className="mb-8 flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <h1 className="text-2xl font-bold text-red-600 sm:text-3xl">Newborn Tracking Dashboard</h1>
            </header>

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Left & Center Section: GrowthTracker and ParentDashboard */}
                <div className="space-y-6 md:col-span-2 lg:col-span-2">
                    <GrowthTracker isClearDataTrack={isClearDataTrack} />
                    <ParentDashboard setClearDataTrack={setClearDataTrack} />
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
