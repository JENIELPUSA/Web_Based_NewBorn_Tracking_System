import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- StatusBadge Component (No changes needed here) ---
const statusColors = {
    ontime: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        display: "On-Time",
    },
    delayed: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-800 dark:text-yellow-200",
        display: "Delayed",
    },
    missed: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
        display: "Missed",
    },
    default: {
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-800 dark:text-gray-200",
        display: "-",
    },
};

const StatusBadge = ({ status }) => {
    const normalized = status ? status.toLowerCase().replace(/[-\s]/g, "") : "default";
    const color = statusColors[normalized] || statusColors.default;
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text}`}>{color.display}</span>;
};

// --- VaccineRecordTable Component ---
function VaccineRecordTable({ dataToDisplay }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchTerm, setSearchTerm] = useState("");

    const usersPerPage = 5;
    const [startDate, endDate] = dateRange;

    const filteredRecord = Array.isArray(dataToDisplay)
        ? dataToDisplay.filter((user) => {
              const matchesSearch =
                  searchTerm === "" ||
                  user.newbornName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());

              const matchesDateRange =
                  !startDate ||
                  !endDate ||
                  (user.doses &&
                      user.doses.some((dose) => {
                          if (!dose.dateGiven) return false;
                          const doseDate = new Date(dose.dateGiven);
                          const adjustedEndDate = new Date(endDate);
                          adjustedEndDate.setHours(23, 59, 59, 999);
                          return doseDate >= startDate && doseDate <= adjustedEndDate;
                      }));

              return matchesSearch && matchesDateRange;
          })
        : [];

    const allDoses = filteredRecord.flatMap(user =>
        user.doses.map(dose => ({
            ...dose,
            newbornName: user.newbornName,
            motherName: user.motherName,
            vaccineName: user.vaccineName,
            dosage: user.dosage
        }))
    );

    const totalPages = Math.ceil(allDoses.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentDoses = allDoses.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="card">
            <div className="card-header flex flex-col gap-4 rounded-t-lg bg-gray-50 p-4 dark:bg-slate-700 xm:flex-row xm:items-center xm:justify-between">
                <p className="card-title text-xl font-semibold text-gray-900 dark:text-white">Vaccination Records</p>
                <div className="flex flex-col gap-2 xm:flex-row xm:items-center xm:gap-4">
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable
                            placeholderText="Filter by date"
                            className="input input-sm w-48 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-slate-800 dark:text-white"
                            dateFormat="MMM d, yyyy"
                            withPortal
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => setDateRange([null, null])}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                {/* --- Desktop Table View (visible on xm screens and up) --- */}
                {/* Changed `sm:block` to `xm:block` */}
                <div className="relative w-full overflow-x-auto hidden xm:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Newborn Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Schedule</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                            {currentDoses.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentDoses.map((dose, index) => (
                                    <tr
                                        key={dose._id ? `${dose._id}-${index}` : `${dose.vaccineName}-${dose.doseNumber}-${index}`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{indexOfFirstUser + index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate">{dose.newbornName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate">{dose.motherName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate">{dose.vaccineName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dose.doseNumber || "—"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dose.dosage}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={dose.status} /></td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white truncate">{dose.administeredBy || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Mobile Card View (visible on screens smaller than xm) --- */}
                {/* Changed `sm:hidden` to `xm:hidden` */}
                <div className="xm:hidden p-4"> {/* hidden on xm and up, shown on smaller */}
                    {currentDoses.length === 0 ? (
                        <div className="text-center text-sm text-gray-700 dark:text-gray-300 py-4">
                            No records found.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {currentDoses.map((dose, index) => (
                                <div
                                    key={dose._id ? `${dose._id}-${index}` : `${dose.vaccineName}-${dose.doseNumber}-${index}`}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{dose.newbornName}</h3>
                                        <StatusBadge status={dose.status} />
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">Mother:</span> {dose.motherName}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">Vaccine:</span> {dose.vaccineName} ({dose.doseNumber || "—"})
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">Dosage:</span> {dose.dosage}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">Date Given:</span> {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        <span className="font-medium">Next Schedule:</span> {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Administered By:</span> {dose.administeredBy || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="card-footer flex items-center justify-between rounded-b-lg bg-gray-50 p-4 dark:bg-slate-700">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-sm rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-sm rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default VaccineRecordTable;