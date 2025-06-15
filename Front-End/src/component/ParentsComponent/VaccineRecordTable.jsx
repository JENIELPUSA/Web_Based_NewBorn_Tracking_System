import React, { useState } from "react";

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
    const [searchTerm, setSearchTerm] = useState("");

    const usersPerPage = 5;

    const filteredRecords = Array.isArray(data)
        ? data.filter((user) => {
              const matchesSearch =
                  searchTerm === "" ||
                  user.newbornName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesSearch;
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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-0 md:text-2xl lg:text-3xl">
                        Vaccination Records
                    </h2>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto md:justify-end">
                        <div className="relative flex-grow-0 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or vaccine..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden md:block relative w-full overflow-x-auto">
                    <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Vaccine</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Dose</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Dosage</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date Given</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Next Schedule</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Administered By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentDoses.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No records found.</td>
                                </tr>
                            ) : (
                                currentDoses.map((dose, index) => (
                                    <tr key={`${dose._id || index}`}>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{indexOfFirstUser + index + 1}</td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.vaccineName}</td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.doseNumber || "—"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.dosage}</td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}</td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}</td>
                                        <td className="px-6 py-3"><StatusBadge status={dose.status} /></td>
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200">{dose.administeredBy || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards - Hidden on desktop */}
                <div className="block md:hidden p-4">
                    {currentDoses.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                            No records found.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {currentDoses.map((dose, index) => (
                                <div key={`${dose._id || index}`} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dose.newbornName} ({dose.motherName})</h3>
                                        <StatusBadge status={dose.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 dark:text-gray-300">
                                        <div><strong className="text-gray-800 dark:text-gray-200">Vaccine:</strong> {dose.vaccineName}</div>
                                        <div><strong className="text-gray-800 dark:text-gray-200">Dose:</strong> {dose.doseNumber || "—"}</div>
                                        <div><strong className="text-gray-800 dark:text-gray-200">Dosage:</strong> {dose.dosage}</div>
                                        <div><strong className="text-gray-800 dark:text-gray-200">Date Given:</strong> {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}</div>
                                        <div><strong className="text-gray-800 dark:text-gray-200">Next Schedule:</strong> {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}</div>
                                        <div className="col-span-2"><strong className="text-gray-800 dark:text-gray-200">Administered By:</strong> {dose.administeredBy || "—"}</div>
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
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VaccineRecordTable;
