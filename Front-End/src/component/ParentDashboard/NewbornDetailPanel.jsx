import React, { useEffect, useContext } from "react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import UpcomingVaccinationsCalendarMark from "./UpcomingVaccinationCalendarMark";
import VaccinationScheduleTracker from "./VaccineRecordTracker";
import { VisitRecordContexts } from "../../contexts/VisitRecordContext/VisitRecordContext";

const NewbornDetailPanel = ({ newborn, onClose, onDeleteNewborn, theme,setClearDataTrack }) => {
    const { fetchVaccinationNewborn, records, patientID, setRecords,setPatientID } = useContext(VaccineRecordDisplayContext);
    const { fetchLatestData, setLatestData, setCustomError } = useContext(VisitRecordContexts);

    useEffect(() => {
        if (newborn) {
            fetchVaccinationNewborn(newborn);
        }
    }, [newborn]);
    const handleDeleteNewborn = () => {
        if (window.confirm(`Are you sure you want to delete ${newborn.newbornName}?`)) {
            // Clear all context data
            setRecords([]);
            setPatientID("");
            setLatestData([]);
            onDeleteNewborn(newborn.id);

            // Close panel
            onClose();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const allVaccineDoses = (records || []).flatMap((record) =>
        (record.doses || []).map((dose) => ({
            vaccineName: record.vaccineName,
            doseNumber: dose.doseNumber,
            dateGiven: dose.dateGiven,
            nextDueDate: dose.next_due_date,
            remarks: dose.remarks,
            administeredBy: dose.administeredBy,
            status: dose.status,
            recordId: record.recordId,
        })),
    );

    return (
        <div className={`mt-8 rounded-xl p-6 shadow-inner transition-colors duration-300 ${theme === "dark" ? "bg-gray-800" : "bg-blue-50"}`}>
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <h3 className={`text-center text-3xl font-bold sm:text-left ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                    Full Details for {newborn.newbornName}
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={handleDeleteNewborn}
                        className="transform rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-red-600"
                    >
                        Delete {newborn.newbornName}
                    </button>
                    <button
                        onClick={onClose}
                        className="transform rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div
                className={`mb-8 flex flex-col items-center gap-6 rounded-lg border p-6 shadow-sm transition-colors duration-300 md:flex-row md:items-start ${
                    theme === "dark" ? "border-gray-600 bg-gray-700" : "border-blue-100 bg-white"
                }`}
            >
                <div className="flex-shrink-0">
                    <img
                        src="https://placehold.co/120x120/E0F2F7/000000?text=Baby"
                        alt="Baby Profile"
                        className="h-32 w-32 rounded-full border-4 border-blue-300 object-cover shadow-md"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/120x120/E0F2F7/000000?text=Baby";
                        }}
                    />
                </div>
                <div className="grid flex-grow grid-cols-1 gap-4 text-center md:grid-cols-2 md:text-left lg:grid-cols-3">
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">Name:</span> {newborn.newbornName}
                    </p>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">Date of Birth:</span> {formatDate(newborn.dateOfBirth)}
                    </p>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">Gender:</span> {newborn.gender}
                    </p>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">Mother's Name:</span> {newborn.motherName}
                    </p>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">Address:</span> {newborn.FullAddress}
                    </p>
                    <p className={`text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                        <span className="font-semibold">ID:</span>{" "}
                        <span className={`${theme === "dark" ? "bg-gray-600 text-gray-200" : "bg-gray-100"} rounded-md px-2 py-1 font-mono text-sm`}>
                            {newborn.id}
                        </span>
                    </p>
                </div>
            </div>

            <VaccinationScheduleTracker
                doses={allVaccineDoses}
                theme={theme}
                formatDate={formatDate}
                newbornName={newborn.newbornName}
                datos={records}
                setClearDataTrack={setClearDataTrack}
            />
        </div>
    );
};

export default NewbornDetailPanel;
