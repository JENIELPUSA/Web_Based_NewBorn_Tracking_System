// VaccineScheduleModal.jsx
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Schedule from './Schedule';
import VaccineRecordTable from "../ParentsComponent/VaccineRecordTable";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function VaccineScheduleModal({ isOpen, onClose, passData }) {
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);

    if (!isOpen) return null;

    console.log("passData", passData);
    console.log("Vaccine Data from Context", vaccineRecord);

const filteredData = vaccineRecord.filter((item) => {
  const fullName = `${passData.firstName} ${passData.lastName}`.toUpperCase();
  const matchedName = item.newbornName?.toUpperCase() === fullName;
  const matchedZone = item.newbornZone?.toUpperCase() === passData.zone?.toUpperCase();
  const matchedMother = item.motherName?.toUpperCase() === passData.mothersName?.toUpperCase();
  const matchedGender = item.gender === passData.gender;
  const matchedAddress = item.FullAddress?.toUpperCase().includes(passData.address?.toUpperCase());
  const matchedDOB = item.dateOfBirth === passData.dateOfBirth;

  console.log("🔍 Checking item:", item);
  console.log("🟢 Matched Name:", matchedName);
  console.log("🟢 Matched Zone:", matchedZone);
  console.log("🟢 Matched Mother:", matchedMother);
  console.log("🟢 Matched Gender:", matchedGender);
  console.log("🟢 Matched Address:", matchedAddress);
  console.log("🟢 Matched DOB:", matchedDOB);

  const isMatch = matchedName &&
                  matchedZone &&
                  matchedMother &&
                  matchedGender &&
                  matchedAddress &&
                  matchedDOB;

  if (isMatch) {
    console.log("✅ Match found:", item);
  } else {
    console.log("❌ Not a full match for:", item.newbornName);
  }

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
                        className="w-full max-w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 relative
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

                        <div className="flex flex-col md:flex-row gap-6 w-full">
                            <div className="flex flex-col gap-6 w-full md:w-1/2">
                                <VaccineRecordTable dataToDisplay={filteredData} />
                            </div>

                            <div className="w-full md:w-1/2">
                                <Schedule scheduleData={filteredData} />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VaccineScheduleModal;