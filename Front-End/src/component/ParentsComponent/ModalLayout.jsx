import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Schedule from './Schedule';
import VaccineRecordTable from "../ParentsComponent/VaccineRecordTable";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function VaccineScheduleModal({ isOpen, onClose, passData }) {
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

    if (!isOpen) return null;

    const filteredData = vaccineRecord.filter((item) => {
        const fullName = `${passData.firstName || ''} ${passData.lastName || ''}`.toUpperCase();
        const itemFullName = `${item.newbornName || ''}`.toUpperCase();

        const matchedName = itemFullName === fullName;
        const matchedZone = (item.newbornZone || '').toUpperCase() === (passData.zone || '').toUpperCase();
        const matchedMother = (item.motherName || '').toUpperCase() === (passData.mothersName || '').toUpperCase();
        const matchedGender = item.gender === passData.gender;
        const matchedAddress = (item.FullAddress || '').toUpperCase().includes((passData.address || '').toUpperCase());
        const matchedDOB = item.dateOfBirth === passData.dateOfBirth;
        const matchextensionName = item.extensionName === passData.extensionName;

        return matchedName &&
            matchedZone &&
            matchedMother &&
            matchedGender &&
            matchedAddress &&
            matchextensionName &&
            matchedDOB;
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800 relative
                                   max-h-[95vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 text-3xl font-bold z-10"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>

                        <div className="flex flex-col xm:flex-row gap-6 p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col gap-6 w-full xm:w-1/2">
                                <VaccineRecordTable dataToDisplay={filteredData} />
                            </div>

                            <div className="w-full xm:w-1/2">
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