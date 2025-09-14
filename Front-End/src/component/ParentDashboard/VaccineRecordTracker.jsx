import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60000)
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  } catch {
    return dateString;
  }
};

const VaccinationScheduleTracker = ({ datos = [] }) => {
  const currentDateTime = new Date();

  const upcomingVaccines = [];
  const missedVaccines = [];
  const doseHistory = [];

  datos.forEach((vaccineRecord) => {
    vaccineRecord.doses.forEach((dose) => {
      if (dose.dateGiven) {
        doseHistory.push({
          vaccine: vaccineRecord.vaccineName,
          date: formatDate(dose.dateGiven),
          remarks: dose.remarks,
        });
      }

      if (dose.next_due_date) {
        const nextDueDate = new Date(dose.next_due_date);
        if (nextDueDate > currentDateTime) {
          upcomingVaccines.push({
            vaccine: vaccineRecord.vaccineName,
            date: formatDate(dose.next_due_date),
          });
        } else {
          if (dose.status !== 'Completed' && dose.status !== 'Given') {
            missedVaccines.push({
              vaccine: vaccineRecord.vaccineName,
              date: formatDate(dose.next_due_date),
            });
          }
        }
      }
    });
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Vaccination Schedule Tracker</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Upcoming Vaccines</h3>
          {upcomingVaccines.length > 0 ? (
            <ul className="space-y-2">
              {upcomingVaccines.map((item, index) => (
                <li key={index} className="flex items-center bg-blue-50 p-3 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{item.vaccine}</span>: <span className="text-gray-600 ml-1">{item.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming vaccines.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Missed/Overdue Vaccines</h3>
          {missedVaccines.length > 0 ? (
            <ul className="space-y-2">
              {missedVaccines.map((item, index) => (
                <li key={index} className="flex items-center bg-red-50 p-3 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{item.vaccine}</span>: <span className="text-gray-600 ml-1">{item.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No missed/overdue vaccines.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Dose History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left rounded-tl-lg">Vaccine</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left rounded-tr-lg">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {doseHistory.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{item.vaccine}</td>
                  <td className="py-3 px-6 text-left">{item.date}</td>
                  <td className="py-3 px-6 text-left">{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VaccinationScheduleTracker;