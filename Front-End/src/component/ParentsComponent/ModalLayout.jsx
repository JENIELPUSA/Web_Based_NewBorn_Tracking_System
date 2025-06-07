// VaccineScheduleModal.jsx
import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Schedule from "./Schedule";
import VaccineRecordTable from "../ParentsComponent/VaccineRecordTable";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function VaccineScheduleModal({ isOpen, onClose, passData }) {
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

    if (!isOpen) return null;

    console.log("passData", passData);
    console.log("Vaccine Data from Context", vaccineRecord);

    const normalize = (str) =>
        (str || "")
            .toLowerCase() // lowercase para hindi case-sensitive
            .replace(/\s+/g, "") // tanggal lahat ng spaces
            .replace(/[^a-z0-9]/gi, ""); // tanggal special characters

    const filteredData = vaccineRecord.filter((item) => {
        const fullName = normalize(`${passData.firstName} ${passData.lastName}`);
        const matchedName = normalize(item.newbornName) === fullName;

        const matchedZone = normalize(item.newbornZone) === normalize(passData.zone);
        const matchedMother = normalize(item.motherName) === normalize(passData.mothersName);
        const matchedGender = normalize(item.gender) === normalize(passData.gender);
        const matchedAddress = normalize(item.FullAddress).includes(normalize(passData.address));
        const matchedDOB = item.dateOfBirth === passData.dateOfBirth;

        const isMatch = matchedName && matchedZone && matchedMother && matchedGender && matchedAddress && matchedDOB;

        return isMatch;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative max-h-[95vh] w-full max-w-full overflow-y-auto rounded-2xl bg-white  shadow-2xl dark:bg-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 text-3xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>

                        <div className="flex w-full flex-col gap-6 md:flex-row">
                            <div className="flex w-full flex-col gap-6 md:w-1/2">
                                <VaccineRecordTable dataToDisplay={filteredData} />
                            </div>

                            <div className="w-full md:w-1/2">
                                <Schedule scheduleData={filteredData} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VaccineScheduleModal;
