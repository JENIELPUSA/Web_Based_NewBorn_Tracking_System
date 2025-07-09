import React from 'react';

const VaccineRecordsTable = ({ doses, theme, formatDate, newbornName }) => {
  return (
    <>
      <h4 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
        Vaccine Records
      </h4>
      {doses.length > 0 ? (
        <div className={`overflow-x-auto rounded-lg shadow-sm border transition-colors duration-300
          ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'}`}>
          <table className="min-w-full divide-y divide-blue-200">
            <thead className={`${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-50'}`}>
              <tr>
                {['Vaccine Name', 'Dose', 'Date Given', 'Next Due Date', 'Remarks', 'Administered By', 'Status'].map((header, idx) => (
                  <th key={idx} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                    ${theme === 'dark' ? 'text-gray-200' : 'text-blue-500'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-700 divide-gray-600 text-gray-100' : 'bg-white divide-blue-200 text-gray-800'}`}>
              {doses.map((dose, index) => (
                <tr key={`${dose.recordId}-${index}`}>
                  <td className="px-6 py-4">{dose.vaccineName}</td>
                  <td className="px-6 py-4">{dose.doseNumber}</td>
                  <td className="px-6 py-4">{formatDate(dose.dateGiven)}</td>
                  <td className="px-6 py-4">{formatDate(dose.nextDueDate)}</td>
                  <td className="px-6 py-4">{dose.remarks || 'N/A'}</td>
                  <td className="px-6 py-4">{dose.administeredBy || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dose.status === 'On-Time' ? 'bg-green-100 text-green-800' :
                      dose.status === 'Delayed' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dose.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No vaccine records found for {newbornName}.</p>
      )}
    </>
  );
};

export default VaccineRecordsTable;
