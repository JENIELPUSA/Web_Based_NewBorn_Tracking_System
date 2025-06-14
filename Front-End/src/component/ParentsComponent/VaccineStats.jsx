import React, { useEffect, useState } from 'react';

function VaccineStatsCard({ data, newbornId }) {
  const [completionRate, setCompletionRate] = useState(0);
  const [dosesGivenCount, setDosesGivenCount] = useState(0);
  const [pendingVaccinationsCount, setPendingVaccinationsCount] = useState(0);

  useEffect(() => {
    if (data && data.length > 0 && newbornId) {
      let totalAssignedDoses = 0;
      let totalDosesGiven = 0;
      let totalPendingDoses = 0;

      // Filter data for the specific newborn
      const newbornVaccineRecords = data.filter(record => record.newborn === newbornId);

      newbornVaccineRecords.forEach(record => {
        totalAssignedDoses += record.totalDoses;
        totalDosesGiven += record.dosesGiven;

        // Count pending doses if status is not "Completed"
        // And if dosesGiven is less than totalDoses
        if (record.status !== "Completed" && record.dosesGiven < record.totalDoses) {
          totalPendingDoses += (record.totalDoses - record.dosesGiven);
        }
      });

      // Calculate Completion Rate
      let calculatedCompletionRate = 0;
      if (totalAssignedDoses > 0) {
        calculatedCompletionRate = (totalDosesGiven / totalAssignedDoses) * 100;
      }

      setCompletionRate(calculatedCompletionRate.toFixed(0)); // Round to whole number
      setDosesGivenCount(totalDosesGiven);
      setPendingVaccinationsCount(totalPendingDoses);

    } else {
      // Reset stats if no data or no newbornId
      setCompletionRate(0);
      setDosesGivenCount(0);
      setPendingVaccinationsCount(0);
    }
  }, [data, newbornId]); // Re-run effect when data or newbornId changes

  // Function to determine bar color based on value
  const getBarColor = (value, type) => {
    if (type === 'percentage') {
      if (value >= 80) return 'bg-green-500'; // Higher completion is good
      if (value >= 50) return 'bg-orange-500';
      return 'bg-red-500';
    } else if (type === 'dosesGiven') { // For Doses Given (Attendance-like)
      if (value > 5) return 'bg-blue-500'; // Arbitrary threshold, adjust as needed
      if (value > 0) return 'bg-blue-400';
      return 'bg-gray-400';
    } else if (type === 'pending') { // For Pending (Behavior-like, lower is better)
      if (value === 0) return 'bg-green-500';
      if (value <= 2) return 'bg-orange-500';
      return 'bg-red-500';
    }
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-0 md:mt-4">

      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        This Month's Vaccine Stats {/* Updated Title */}
      </h2>

      <div className="space-y-4">
        {/* Average (Vaccine Completion Rate) */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Average</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Vaccine Completion</p> {/* Updated Sub-label */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</span>
            <div className={`w-1 h-12 ${getBarColor(parseFloat(completionRate), 'percentage')} rounded`}></div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Attendance</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Doses Given</p> {/* Updated Sub-label */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dosesGivenCount}</span>
            <div className={`w-1 h-12 ${getBarColor(dosesGivenCount, 'dosesGiven')} rounded`}></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Behavior</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Pending Doses</p> {/* Updated Sub-label */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingVaccinationsCount}</span>
            <div className={`w-1 h-12 ${getBarColor(pendingVaccinationsCount, 'pending')} rounded`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VaccineStatsCard;