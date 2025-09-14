import React, { useState, useContext, useMemo, useEffect } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext"; // <- AYUSIN ITO KUNG MALI
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../Profilling/ProfillingAddForm"; // <- AYUSIN ITO KUNG MALI
import StatusVerification from "../../ReusableFolder/StatusModal"; // <- AYUSIN ITO KUNG MALI
import { ProfillingContexts } from "../../contexts/ProfillingContext/ProfillingContext"; // <- AYUSIN ITO KUNG MALI
import { AuthContext } from "../../contexts/AuthContext";
function Profille() {
    const { role } = useContext(AuthContext);
    const [selectedUser, setSelectedUser] = useState(null);
    const { isProfilling, DeleteProfile, setProfilling } = useContext(ProfillingContexts);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // State for items per page
    const [dateFrom, setDateFrom] = useState(""); // State for 'created at' date filter start (string format for input)
    const [dateTo, setDateTo] = useState(""); // State for 'created at' date filter end (string format for input)
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [idToDelete, setIdToDelete] = useState(""); // Renamed from isDeleteID for clarity

    // Filter users based on search term and date range
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(isProfilling)) return [];
        return isProfilling.filter((user) => {
            const matchesSearch =
                `${user.FirstName || ""} ${user.LastName || ""} ${user.username || ""} ${user.email || ""} ${user.newbornName || ""}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            let matchesDateRange = true;
            // Assuming `user.createdAt` exists and is a valid date string/object in your data
            if (user.createdAt && dateFrom && dateTo) {
                const userCreatedAtDate = new Date(user.createdAt);
                userCreatedAtDate.setHours(0, 0, 0, 0);

                const fromDateObj = new Date(dateFrom);
                fromDateObj.setHours(0, 0, 0, 0);
                const toDateObj = new Date(dateTo);
                toDateObj.setHours(23, 59, 59, 999);

                matchesDateRange = userCreatedAtDate >= fromDateObj && userCreatedAtDate <= toDateObj;
            } else if (dateFrom || dateTo) {
                // If filters are set but user.createdAt is missing or outside the range
                matchesDateRange = false;
            }

            return matchesSearch && matchesDateRange;
        });
    }, [isProfilling, searchTerm, dateFrom, dateTo]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Effect hook to adjust the current page if needed after filtering, deletion, or changing itemsPerPage.
    useEffect(() => {
        const newTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (filteredUsers.length > 0 && currentUsers.length === 0 && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (filteredUsers.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filteredUsers.length, currentPage, itemsPerPage, currentUsers.length]);

    // Modal and deletion handlers
    const handleAddClick = () => {
        setSelectedUser(null);
        setAddFormOpen(true);
    };

    const onUserSelect = (user) => {
        setSelectedUser(user);
        setAddFormOpen(true);
    };

    const handleCloseModal = () => {
        setVerification(false);
        setAddFormOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = (userId) => {
        console.log("ehjgergergje", userId);
        setIdToDelete(userId); // Set the ID to delete
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await DeleteProfile(idToDelete);
        setProfilling((prevUsers) => prevUsers.filter((user) => user._id !== idToDelete));
        handleCloseModal();
    };

    // Utility functions
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (name) => {
        if (!name) return "US";
        const parts = name.split(" ");
        return parts[0][0].toUpperCase() + (parts[1] ? parts[1][0].toUpperCase() : "");
    };

    // Handler for changing items per page (input box)
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Function to clear both start and end dates
    const clearDateRange = () => {
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    return (
        <div className="rounded-lg bg-white shadow">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Profilling</h2>
                {/* Filters container - Adjusted for stacking on mobile, inline on desktop */}
                {/* New structure to match the image: Search on its own line for better mobile visibility too */}
                <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-auto">
                    {/* Search input - Always takes full width in its container, centered on mobile */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-sm w-full flex-grow rounded-md border px-3 py-1 text-sm text-gray-800 sm:w-auto"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {/* Container for Date Filters and Show selector - now side-by-side on desktop, wraps on mobile */}
                    <div className="flex w-full flex-grow-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
                        {/* From Date Input */}
                        <div className="flex flex-grow flex-col items-start">
                            <label
                                htmlFor="dateFrom"
                                className="text-xs font-medium text-gray-700"
                            >
                                From:
                            </label>
                            <input
                                type="date"
                                id="dateFrom"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="input input-xs w-full rounded-md border px-2 py-1 text-sm text-gray-900"
                                title="Petsa ng simula"
                            />
                        </div>
                        {/* To Date Input */}
                        <div className="flex flex-grow flex-col items-start">
                            <label
                                htmlFor="dateTo"
                                className="text-xs font-medium text-gray-700"
                            >
                                To:
                            </label>
                            <input
                                type="date"
                                id="dateTo"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="input input-xs w-full rounded-md border px-2 py-1 text-sm text-gray-900"
                                title="Petsa ng pagtatapos"
                            />
                        </div>

                        {(dateFrom || dateTo) && (
                            <button
                                onClick={clearDateRange}
                                className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear
                            </button>
                        )}
                        {/* Show items per page */}
                        <label
                            htmlFor="itemsPerPage"
                            className="ml-2 text-sm font-medium text-gray-700"
                        >
                            Show:
                        </label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="text-gray-500 input input-xs rounded-md border border-gray-300 px-2 py-1 text-sm"
                            aria-label="Items per page"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-700">users per page</span>
                    </div>
                </div>
            </div>

            {/* Mobile Add Button */}
            <div className="mt-4 flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Profilling
                </button>
            </div>

            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left text-gray-500">#</th>
                            <th className="p-2 text-left text-gray-500">Avatar</th>
                            <th className="p-2 text-left text-gray-500">Name</th>
                            <th className="p-2 text-left text-gray-500">Gender</th>
                            <th className="p-2 text-left text-gray-500">DOB</th>
                            <th className="p-2 text-left text-gray-500">Address</th>
                            <th className="p-2 text-left text-gray-500">Blood Type</th>
                            <th className="p-2 text-left text-gray-500">Weight</th>
                            <th className="p-2 text-left text-gray-500">Height</th>
                            <th className="p-2 text-left text-gray-500">Condition</th>
                            <th className="p-2 text-left text-gray-500">Notes</th>
                            <th className="p-2 text-left text-gray-500">Mother Name</th>
                            <th className="p-2 text-left text-gray-500">Contact #</th>
                            <th className="p-2 text-left text-gray-500">Vacination Record</th>
                            <th className="p-2 text-left text-gray-500">Created At</th>
                            <th className="p-2 text-left text-gray-500">
                                <button
                                    onClick={handleAddClick}
                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                    title="Add Profilling"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="15"
                                    className="p-4 text-center text-gray-500"
                                >
                                    No profilling records found.
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user, index) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="p-2">{indexOfFirstUser + index + 1}</td>
                                    <td className="p-2">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Avatar"
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                                                {getInitials(user.newbornName)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 text-gray-500">{user.newbornName}</td>
                                    <td className="p-2 text-gray-500">{user.gender}</td>
                                    <td className="p-2 text-gray-500">{formatDate(user.dateOfBirth)}</td>
                                    <td className="p-2 text-gray-500">{user.motherAddressZone || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.blood_type || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.latestWeight || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.latestHeight || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.latestHealthCondition || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.latestNotes || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.motherName || "N/A"}</td>
                                    <td className="p-2 text-gray-500">{user.motherPhoneNumber || "N/A"}</td>
                                    {/* Vaccination Record Column - KEEP THIS */}
                                    <td className="p-2 text-gray-500">
                                        {user.vaccinationRecords?.length ? (
                                            <ul className="list-disc space-y-2 pl-4">
                                                {user.vaccinationRecords.map((record, i) => (
                                                    <li key={i}>
                                                        <div>
                                                            <b>Vaccine:</b> {record.vaccineName}
                                                        </div>
                                                        {Array.isArray(record.doses) && record.doses.length > 0 ? (
                                                            <ul className="ml-4 list-disc space-y-1">
                                                                {record.doses.map((dose, j) => (
                                                                    <li
                                                                        key={j}
                                                                        className="text-xs"
                                                                    >
                                                                        <div>
                                                                            <b>Dose: {dose.doseNumber}</b>
                                                                        </div>
                                                                        <div>
                                                                            <b>Date:</b> {formatDate(dose.dateGiven)}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="text-gray-500">No dose data</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">No vaccination records</p>
                                        )}
                                    </td>
                                    <td className="p-2">{formatDate(user.createdAt)}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onUserSelect(user)}
                                                className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>

                                            {role !== "BHW" && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (hidden on desktop) */}
            <div className="block grid grid-cols-1 gap-4 sm:hidden">
                {currentUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No profilling records found.</div>
                ) : (
                    currentUsers.map((user, index) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg border bg-white p-4 shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                            {getInitials(user.newbornName)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-800">{user.newbornName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {user.gender} • {formatDate(user.dateOfBirth)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onUserSelect(user)}
                                        className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>

                                    {role !== "BHW" && (
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500">Address</p>
                                    <p>{user.motherAddressZone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Blood Type</p>
                                    <p>{user.blood_type || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Weight</p>
                                    <p>{user.birthWeight || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Height</p>
                                    <p>{user.birthHeight || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">Condition</p>
                                    <p>{user.health_condition || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">Mother</p>
                                    <p>{user.motherName || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">Contact</p>
                                    <p>{user.motherPhoneNumber || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">Created At</p>
                                    <p>{formatDate(user.createdAt)}</p>
                                </div>
                                {/* Vaccination Records in Mobile Card View */}
                                <details className="col-span-2 mt-3">
                                    <summary className="cursor-pointer text-sm font-medium text-blue-600">
                                        Vaccination Records
                                    </summary>
                                    <div className="mt-2 space-y-3 pl-2 text-sm">
                                        {user.vaccinationRecords?.length ? (
                                            user.vaccinationRecords.map((record, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded border p-2"
                                                >
                                                    <p className="font-medium">Vaccine: {record.vaccineName}</p>
                                                    {Array.isArray(record.doses) && record.doses.length > 0 ? (
                                                        <ul className="mt-1 space-y-1">
                                                            {record.doses.map((dose, j) => (
                                                                <li
                                                                    key={j}
                                                                    className="text-xs"
                                                                >
                                                                    <span className="font-medium">Dose {dose.doseNumber}:</span>{" "}
                                                                    <span>
                                                                        {dose.dateGiven ? formatDate(dose.dateGiven) : "—"}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-gray-500">No dose data</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No vaccination records</p>
                                        )}
                                    </div>
                                </details>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === 1 ? "text-gray-400" : "hover:bg-gray-100"}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages} • {filteredUsers.length} records
                    </span>
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === totalPages ? "text-gray-400" : "hover:bg-gray-100"}`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <UserFormModal
                isOpen={isAddFormOpen}
                onClose={handleCloseModal}
                selectedUser={selectedUser}
            />
            <StatusVerification
                isOpen={isVerification}
                onClose={handleCloseModal}
                onConfirmDelete={handleConfirmDelete}
            />
        </div>
    );
}

export default Profille;