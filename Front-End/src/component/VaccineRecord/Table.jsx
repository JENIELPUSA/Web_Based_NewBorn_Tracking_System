import React, { useState, useContext, useMemo, useEffect } from "react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { PencilIcon, TrashIcon, BabyIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import AddNewBornForm from "../VaccineRecord/AddForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";
// Status badge color mapping
const statusColors = {
    ontime: {
        bg: "bg-green-100",
        text: "text-green-800",
        display: "On-Time",
    },
    delayed: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        display: "Delayed",
    },
    missed: {
        bg: "bg-red-100",
        text: "text-red-800",
        display: "Missed",
    },
    default: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        display: "-",
    },
};

const StatusBadge = ({ status }) => {
    const normalized = status ? status.toLowerCase().replace(/[-\s]/g, "") : "default";
    const color = statusColors[normalized] || statusColors.default;
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text}`}>{color.display}</span>;
};

// Inilabas ang formatDate function sa labas ng component para masiguro ang availability nito.
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function VaccineRecordTable() {
    const { role } = useContext(AuthContext);
    const { vaccineRecord, DeleteContext } = useContext(VaccineRecordDisplayContext);
    const [isVerification, setVerification] = useState(false);
    const [isAssignFormOpen, setAssignFormOpen] = useState(false);
    const [assignData, setAssignData] = useState(null);
    const [dose, setDose] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // State for items per page
    const [dateFrom, setDateFrom] = useState(""); // State for 'created at' date filter start (string format for input)
    const [dateTo, setDateTo] = useState(""); // State for 'created at' date filter end (string format for input)

    const [doseId, setDoseID] = useState("");
    const [dataID, setDataId] = useState("");

    // Memoize filtered records
    const filteredRecord = useMemo(() => {
        const data = Array.isArray(vaccineRecord) ? vaccineRecord : [];
        return data.filter((user) => {
            const matchesSearch =
                `${user.firstName || ""} ${user.lastName || ""} ${user.username || ""} ${user.email || ""} ${user.newbornName || ""} ${user.motherName || ""}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            let matchesDateRange = true;
            if (dateFrom && dateTo) {
                // Check if both date filters are set
                const fromDateObj = new Date(dateFrom);
                fromDateObj.setHours(0, 0, 0, 0); // Normalize to start of the day
                const toDateObj = new Date(dateTo);
                toDateObj.setHours(23, 59, 59, 999); // Normalize to end of the day

                matchesDateRange = user.doses.some((dose) => {
                    const doseDate = new Date(dose.dateGiven);
                    return dose.dateGiven && doseDate >= fromDateObj && doseDate <= toDateObj;
                });
            }

            return matchesSearch && matchesDateRange;
        });
    }, [vaccineRecord, searchTerm, dateFrom, dateTo]);

    // Calculate pagination details
    const totalPages = Math.ceil(filteredRecord.length / itemsPerPage);
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredRecord.slice(indexOfFirstUser, indexOfLastUser);

    // Effect hook to adjust the current page if needed after filtering or changing itemsPerPage.
    useEffect(() => {
        const newTotalPages = Math.ceil(filteredRecord.length / itemsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (filteredRecord.length > 0 && currentUsers.length === 0 && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (filteredRecord.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filteredRecord.length, currentPage, itemsPerPage, currentUsers.length]);

    const handleAddClick = () => {
        setAssignFormOpen(true);
        setAssignData(null); // Clear any previous data for add operation
        setDose(null); // Clear any previous dose for add operation
    };

    const handleEdit = (dose, userData) => {
        setAssignFormOpen(true);
        setAssignData(userData); // Pass the entire user data
        setDose(dose); // Pass the specific dose object
    };

    const handleDeleteAssign = (doseId, userId) => {
        setVerification(true);
        setDoseID(doseId);
        setDataId(userId);
    };

    const handleCloseModal = () => {
        setAssignFormOpen(false);
        setVerification(false);
        setAssignData(null);
        setDose(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await DeleteContext(dataID, doseId);
            handleCloseModal();
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    };

    const getInitials = (name) => {
        if (!name) return "NB";
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    // Handler for changing items per page (dropdown)
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Function to clear both start and end dates
    const clearDateRange = () => {
        setDateFrom(""); // Clear to empty string for datetime-local
        setDateTo(""); // Clear to empty string for datetime-local
        setCurrentPage(1); // Reset page on clear
    };

    return (
        <div className="card rounded-lg bg-white shadow xs:p-2 sm:p-6">
            {/* Card Header */}
            <div className="card-header flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
                <p className="card-title text-lg font-semibold text-gray-900">Vaccination Records</p>

                <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="text-gray-500 input input-sm min-w-[180px] flex-grow rounded-md border border-gray-300 px-3 py-1 text-sm md:min-w-0"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {/* Date filter inputs - Now uses flex-wrap to stack on small screens */}
                    <div className="flex flex-grow-0 flex-wrap items-center gap-2">
                        <label
                            htmlFor="dateFrom"
                            className="text-sm font-medium text-gray-700"
                        >
                            From:
                        </label>
                        <input
                            type="date"
                            id="dateFrom"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-gray-500 input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm md:w-auto"
                            title="Filter by 'Created At' date (From)"
                        />
                        <label
                            htmlFor="dateTo"
                            className="text-sm font-medium text-gray-700"
                        >
                            To:
                        </label>
                        <input
                            type="date"
                            id="dateTo"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-gray-500 input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm md:w-auto"
                            title="Filter by 'Created At' date (To)"
                        />
                    </div>
                    {/* Page size selector */}
                    <div className="flex flex-grow-0 items-center gap-2">
                        <label
                            htmlFor="itemsPerPage"
                            className="text-sm font-medium text-gray-700"
                        >
                            Show:
                        </label>
                        <input
                            type="number"
                            id="itemsPerPage"
                            min="1"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            onBlur={handleItemsPerPageChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleItemsPerPageChange(e);
                                }
                            }}
                            className="text-gray-500 input input-xs w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
                            aria-label="Items per page"
                        />
                        <span className="text-sm text-gray-700">users per page</span>
                    </div>
                </div>
            </div>
            {/* Card Body with Table/Card Views */}
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    {/* Mobile View (Cards) */}
                    <div className="block p-2 sm:hidden">
                        {currentUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-900">No records found.</div>
                        ) : (
                            currentUsers.map((user, index) =>
                                user.doses.map((dose, doseIndex) => (
                                    <div
                                        key={`${user._id}-${doseIndex}`}
                                        className="card mb-4 bg-white p-4 shadow-lg"
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.newbornName}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                                                        <BabyIcon className="h-6 w-6 text-pink-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{user.newbornName}</h4>
                                                    <p className="text-sm text-gray-700">{user.FullAddress}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-900">Mother: {user.motherName}</p>
                                            <p className="text-gray-900">Vaccine: {user.vaccineName}</p>
                                            <p className="text-gray-900">Description: {user.description}</p>
                                            <p className="capitalize text-gray-900">Dose: {dose.doseNumber || "—"}</p>
                                            <p className="text-gray-900">Remarks: {dose.remarks || "—"}</p>
                                            <p className="text-gray-900">Administered By: {dose.administeredBy || "—"}</p>

                                            <div className="mt-2 flex gap-2">
                                                <StatusBadge status={dose.status} />
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(dose, user)}
                                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                {role !== "BHW" && (
                                                    <button
                                                        onClick={() => handleDeleteAssign(dose._id, user._id)}
                                                        className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )),
                            )
                        )}
                    </div>

                    {/* Desktop View (Table) */}
                    <table className="hidden w-full min-w-[1200px] table-auto text-sm sm:table">
                        <thead className="sticky top-0 bg-gray-100 shadow-sm">
                            <tr>
                                <th className="px-2 py-2 text-left text-gray-900">#</th>
                                <th className="px-2 py-2 text-left text-gray-900">Avatar</th>
                                <th className="px-2 py-2 text-left text-gray-900">Baby's Name</th>
                                <th className="px-2 py-2 text-left text-gray-900">Address</th>
                                <th className="px-2 py-2 text-left text-gray-900">Mother</th>
                                <th className="px-2 py-2 text-left text-gray-900">Vaccine</th>
                                <th className="px-2 py-2 text-left text-gray-900">Description</th>
                                <th className="px-2 py-2 text-left text-gray-900">Given Dose</th>
                                <th className="px-2 py-2 text-left text-gray-900">Dosage</th>
                                <th className="px-2 py-2 text-left text-gray-900">Status</th>
                                <th className="px-2 py-2 text-left text-gray-900">Remarks</th>
                                <th className="px-2 py-2 text-left text-gray-900">Administered By</th>
                                <th className="px-2 py-2 text-left text-gray-900">Dose Info</th>
                                <th className="px-2 py-2 text-left text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="15"
                                        className="p-4 text-center text-gray-900"
                                    >
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) =>
                                    user.doses.map((dose, doseIndex) => (
                                        <tr
                                            key={`${user._id}-${doseIndex}`}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="px-2 py-2 text-gray-900">
                                                {doseIndex === 0 ? indexOfFirstUser + index + 1 : ""}
                                            </td>
                                            <td className="px-2 py-2">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.newbornName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                                                        <BabyIcon className="h-6 w-6 text-pink-500" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-gray-900">{user.newbornName}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900">{user.FullAddress}</td>
                                            <td className="px-2 py-2 text-gray-900">{user.motherName}</td>
                                            <td className="px-2 py-2 text-gray-900">{user.vaccineName}</td>
                                            <td className="px-2 py-2 text-gray-900">{user.description}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900">{dose.doseNumber || "—"}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900">{user.dosage}</td>
                                            <td className="px-2 py-2">
                                                <StatusBadge status={dose.status} />
                                            </td>
                                            <td className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-gray-900">
                                                {dose.remarks || "—"}
                                            </td>
                                            <td className="px-2 py-2 capitalize text-gray-900">{dose.administeredBy || "—"}</td>
                                            <td className="px-2 py-2">
                                                <div className="space-y-1 text-sm text-gray-900">
                                                    <div>
                                                        <span className="font-medium">Given:</span>{" "}
                                                        {dose.dateGiven ? formatDate(dose.dateGiven) : "—"}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Next Due:</span>{" "}
                                                        {dose.next_due_date ? formatDate(dose.next_due_date) : "—"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(dose, user)}
                                                        className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    {role !== "BHW" && (
                                                        <button
                                                            onClick={() => handleDeleteAssign(dose._id, user._id)}
                                                            className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )),
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                        <button
                            className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed text-gray-400"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} • {filteredRecord.length} new borns
                        </span>
                        <button
                            className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed text-gray-400"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddNewBornForm
                isOpen={isAssignFormOpen}
                onClose={handleCloseModal}
                editDose={dose}
                dataAssign={assignData}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default VaccineRecordTable;