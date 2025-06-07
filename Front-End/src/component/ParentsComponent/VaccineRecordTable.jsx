import React, { useState } from "react";
import { BabyIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
                          return doseDate >= startDate && doseDate <= endDate;
                      }));

              return matchesSearch && matchesDateRange;
          })
        : [];

    const totalPages = Math.ceil(filteredRecord.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredRecord.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div className="card">
            <div className="card-header flex flex-col gap-4 rounded-t-lg bg-gray-50 p-4 dark:bg-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title text-xl font-semibold text-gray-900 dark:text-white">Vaccination Records</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="input input-sm w-48 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-slate-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        )}
                    </div>

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
                <div className="relative h-[500px] w-full overflow-auto">
                    <table className="table hidden w-full text-sm sm:table">
                        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th> 
                                <th className="px-4 py-3 text-left">Vaccine</th>
                                <th className="px-4 py-3 text-left">Dose</th>
                                <th className="px-4 py-3 text-left">Dosage</th>
                                <th className="px-4 py-3 text-left">Date Given</th>
                                <th className="px-4 py-3 text-left">Next Schedule</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Administered By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-4 text-center text-gray-700 dark:text-gray-300">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) =>
                                    user.doses.map((dose, doseIndex) => (
                                        <tr
                                            key={`${user._id}-${doseIndex}`}
                                            className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-4 py-3">
                                                {doseIndex === 0 ? indexOfFirstUser + index + 1 : ""}
                                            </td>
                                            <td className="px-4 py-3">{user.vaccineName}</td>
                                            <td className="px-4 py-3">{dose.doseNumber || "—"}</td>
                                            <td className="px-4 py-3">{user.dosage}</td>
                                            <td className="px-4 py-3">{dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}</td>
                                            <td className="px-4 py-3">{dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}</td>
                                            <td className="px-4 py-3"><StatusBadge status={dose.status} /></td>
                                            <td className="px-4 py-3">{dose.administeredBy || "—"}</td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default VaccineRecordTable;
