import React, { useState } from "react";
// Removed: import DatePicker from "react-datepicker";
// Removed: import "react-datepicker/dist/react-datepicker.css";

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

function VaccineRecordTable({ data }) {
    const [currentPage, setCurrentPage] = useState(1);
    // Removed: const [filterFromDate, setFilterFromDate] = useState(null);
    // Removed: const [filterToDate, setFilterToDate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const usersPerPage = 5;

    const filteredRecords = Array.isArray(data)
        ? data.filter((user) => {
              const matchesSearch =
                  searchTerm === "" ||
                  user.newbornName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());

              // Removed: matchesDateRange logic
              // const matchesDateRange = ...;

              // Only return based on search term
              return matchesSearch; // Changed from matchesSearch && matchesDateRange;
          })
        : [];

    const allDoses = filteredRecords.flatMap(user =>
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
        <div className="w-full">
            <div className="max-w-full mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Header Section: Title and Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-0 md:text-2xl lg:text-3xl">
                        Vaccination Records
                    </h2>
                    {/* Filters Container - Now only contains the Search Bar */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto md:justify-end">

                        {/* Search Bar */}
                        <div className="relative flex-grow-0 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or vaccine..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        </div>

                        {/* Removed: DatePickers container and its contents */}
                    </div>
                </div>

                {/* Table Section */}
                <div className="relative w-full overflow-x-auto">
                    <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 shadow-sm">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[50px]">#</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">Vaccine</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[70px]">Dose</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">Dosage</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">Date Given</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">Next Schedule</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">Status</th><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Administered By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentDoses.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentDoses.map((dose, index) => (
                                    <tr
                                        key={dose._id ? `${dose._id}-${index}` : `${dose.vaccineName}-${dose.doseNumber}-${index}`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{indexOfFirstUser + index + 1}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 truncate">{dose.vaccineName}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{dose.doseNumber || "—"}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{dose.dosage}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                            {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                            {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap"><StatusBadge status={dose.status} /></td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 truncate">{dose.administeredBy || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View - Cards */}
                <div className="md:hidden p-4">
                    {currentDoses.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                            No records found.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {currentDoses.map((dose, index) => (
                                <div
                                    key={dose._id ? `${dose._id}-${index}` : `${dose.vaccineName}-${dose.doseNumber}-${index}`}
                                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 transition-shadow hover:shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white break-words pr-2">{dose.newbornName} ({dose.motherName})</h3>
                                        <StatusBadge status={dose.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300">
                                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Vaccine:</span> {dose.vaccineName}</div>
                                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Dose:</span> {dose.doseNumber || "—"}</div>
                                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Dosage:</span> {dose.dosage}</div>
                                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Date Given:</span> {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</div>
                                        <div><span className="font-semibold text-gray-800 dark:text-gray-200">Next Schedule:</span> {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</div>
                                        <div className="col-span-2 break-words"><span className="font-semibold text-gray-800 dark:text-gray-200">Administered By:</span> {dose.administeredBy || "—"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm font-semibold transition-colors duration-200 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                            Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm font-semibold transition-colors duration-200 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VaccineRecordTable;