import React, { useState, useEffect, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useLocation } from "react-router-dom";
import VaccineRecordTable from "./VaccineRecordTable";
import SideLayout from "./SideLayout";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function ParentLayoutFinals() {
  const { vaccineRecord } = useContext(VaccineRecordDisplayContext);
  const location = useLocation();

  const newbornData = location.state?.formData;

  console.log("Vaccine Record",vaccineRecord)

  useEffect(() => {
    console.log("Incoming Newborn Data:", newbornData);
  }, [newbornData]);

  const filteredData = useMemo(() => {
    if (!newbornData || !vaccineRecord) return [];

    return vaccineRecord.filter((item) => {
      const fullName = `${newbornData.firstName} ${newbornData.lastName}`.toUpperCase().trim();
      const matchedName = item.newbornName?.toUpperCase().trim() === fullName;

      const matchedZone =
        item.newbornZone?.toUpperCase().trim() === newbornData.zone?.toUpperCase().trim();

      const matchedMother =
        item.motherName?.toUpperCase().trim() === newbornData.mothersName?.toUpperCase().trim();

      const matchedGender =
        item.gender?.toUpperCase().trim() === newbornData.gender?.toUpperCase().trim();

      const matchedAddress =
        item.FullAddress?.toUpperCase().includes(newbornData.address?.toUpperCase() || "");

      const matchedDOB =
        new Date(item.dateOfBirth).toISOString().slice(0, 10) ===
        new Date(newbornData.dateOfBirth).toISOString().slice(0, 10);

      console.log("🔍 Checking item:", item);
      console.log("🟢 Matched Name:", matchedName);
      console.log("🟢 Matched Zone:", matchedZone);
      console.log("🟢 Matched Mother:", matchedMother);
      console.log("🟢 Matched Gender:", matchedGender);
      console.log("🟢 Matched Address:", matchedAddress);
      console.log("🟢 Matched DOB:", matchedDOB);

      return (
        matchedName &&
        matchedZone &&
        matchedMother &&
        matchedGender &&
        matchedAddress &&
        matchedDOB
      );
    });
  }, [vaccineRecord, newbornData]);

  console.log("✅ Filtered Data:", filteredData);

  if (!newbornData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          No newborn data found. Please go back and select a profile.
        </p>
      </div>
    );
  }

  const NewbornProfileCard = () => (
    <motion.div
      className="flex items-center space-x-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
    >
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700">
        <User className="h-14 w-14 text-blue-600 dark:text-blue-200" />
      </div>

      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {newbornData.firstName} {newbornData.lastName}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Gender:</span> {newbornData.gender}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Address:</span> {newbornData.address}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Date of Birth:</span> {newbornData.dateOfBirth}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900 md:flex-row md:overflow-hidden">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Mobile View Profile Card */}
        <div className="mx-2 mb-4 mt-4 flex-shrink-0 sm:mx-4 md:hidden">
          <NewbornProfileCard />
        </div>

        {/* Sidebar */}
        <aside className="w-full flex-shrink-0 overflow-y-auto bg-white p-4 shadow-md dark:bg-gray-800 md:w-64 lg:w-72">
          <SideLayout data={filteredData} />
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Desktop Profile Card */}
          <div className="hidden md:block">
            <NewbornProfileCard />
          </div>

          {/* Vaccine Record Table */}
          <div className="flex min-h-0 flex-1 flex-col gap-0 md:flex-row md:gap-4">
            <motion.div
              className="overflow-y-auto rounded-lg bg-white p-4 shadow dark:bg-gray-800 md:flex-[1.6]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
            >
              <VaccineRecordTable data={filteredData} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ParentLayoutFinals;
