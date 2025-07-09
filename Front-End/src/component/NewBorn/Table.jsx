import React, { useState, useContext, useMemo, useEffect } from "react";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext"; // <- AYUSIN ITO KUNG MALI
import { PencilIcon, TrashIcon, Plus, MoreHorizontal, Eye } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../NewBorn/AddNewBorn"; // <- AYUSIN ITO KUNG MALI (check if this is correct modal for NewBorn)
import StatusVerification from "../../ReusableFolder/StatusModal"; // <- AYUSIN ITO KUNG MALI
import ProfileModal from "./ProfileModal";
import { AuthContext } from "../../contexts/AuthContext";
// Inilabas ang formatDate function sa labas ng component para masiguro ang availability nito.
// Ito ay isang karaniwang paraan upang ayusin ang "function not defined" na error para sa mga utility function.
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function NewBorn() {
    const { role } = useContext(AuthContext);
    const [isSendData, setSendData] = useState("");
    const [selectedBorn, setSelectedBorn] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // State for items per page
    const [dateFrom, setDateFrom] = useState(""); // State for 'created at' date filter start
    const [dateTo, setDateTo] = useState(""); // State for 'created at' date filter end
    const [isProfileModal, setProfileModal] = useState(false);
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isAsignFormOpen, setAssignFormOpen] = useState(false);
    const { newBorn, DeleteNewBorn } = useContext(NewBornDisplayContext);
    const [IDNewborn, setIDNewborn] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [deleteId, setDeleteID] = useState("");
    const [isDisplayVaccine, setDisplayVaccine] = useState("");
    const [isNewBordId, setNewBornId] = useState("");

    // Memoize filtered New Borns based on search term and date range
    const filteredUsers = useMemo(() => {
        const data = Array.isArray(newBorn) ? newBorn : [];
        return data.filter((user) => {
            // Text search filter
            const matchesSearchTerm = `${user.firstName} ${user.lastName} ${user.username || ""} ${user.email || ""}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            // Date filter (assuming user.createdAt is a valid date string or Date object)
            let matchesDateRange = true;
            if (user.createdAt) {
                const userCreatedAtDate = new Date(user.createdAt);
                userCreatedAtDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                if (dateFrom) {
                    const fromDateObj = new Date(dateFrom);
                    fromDateObj.setHours(0, 0, 0, 0); // Normalize to start of the day
                    matchesDateRange = matchesDateRange && userCreatedAtDate >= fromDateObj;
                }
                if (dateTo) {
                    const toDateObj = new Date(dateTo);
                    toDateObj.setHours(23, 59, 59, 999); // Normalize to end of the day
                    matchesDateRange = matchesDateRange && userCreatedAtDate <= toDateObj;
                }
            } else if (dateFrom || dateTo) {
                // If there's a date filter but no createdAt date for the user, it doesn't match
                matchesDateRange = false;
            }

            return matchesSearchTerm && matchesDateRange;
        });
    }, [newBorn, searchTerm, dateFrom, dateTo]);

    // Calculate pagination details based on filtered users and itemsPerPage
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Effect hook to adjust the current page if needed after filtering, deletion, or changing itemsPerPage.
    useEffect(() => {
        const newTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

        // Adjust current page if it's out of bounds after filtering/deletion/itemsPerPage change
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (filteredUsers.length > 0 && currentUsers.length === 0 && currentPage > 1) {
            // If current page is empty but there are other filtered users, go to previous page
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (filteredUsers.length === 0 && currentPage !== 1) {
            // If no filtered users at all, reset to page 1
            setCurrentPage(1);
        }
    }, [filteredUsers.length, currentPage, itemsPerPage, currentUsers.length]);

    const handleAddClick = () => {
        setAddFormOpen(true);
        setSelectedBorn(null);
    };

    const handleCloseModal = () => {
        setVerification(false);
        setAddFormOpen(false);
        setAssignFormOpen(false);
        setSelectedBorn(null);
        setDisplayVaccine(false);
        setProfileModal(false);
    };

    const handleDeleteNewBorn = async (newbordID) => {
        setVerification(true);
        setDeleteID(newbordID);
    };

    const handleConfirmDelete = async () => {
        await DeleteNewBorn(deleteId);
        handleCloseModal();
    };

    const onBornSelect = (user) => {
        setAddFormOpen(true);
        setSelectedBorn(user);
    };

    const handleAsign = (Data) => {
        setIDNewborn(Data);
        setAssignFormOpen(true);
    };

    const handleDisplayVaccine = (data) => {
        setDisplayVaccine(true);
        setNewBornId(data);
    };

    const handleview = (data) => {
        setProfileModal(true);
        setSendData(data);
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

    // Handler for changing items per page (input box)
    const handleItemsPerPageChange = (e) => {
        const value = parseInt(e.target.value, 10);
        // Ensure the value is a positive number, default to 5 if invalid or less than 1
        setItemsPerPage(isNaN(value) || value < 1 ? 5 : value);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            <div className="card-header flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title text-lg font-semibold text-gray-800 dark:text-white">New Born List</p>
                {/* Consolidated filter controls into one flex container for responsive layout */}
                <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search New Borns..."
                        className="input input-sm min-w-[180px] flex-grow rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800 dark:bg-slate-800 dark:text-gray-200 md:min-w-0"
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
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                            className="input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
                            title="Filter by 'Created At' date (From)"
                        />
                        <label
                            htmlFor="dateTo"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                            className="input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
                            title="Filter by 'Created At' date (To)"
                        />
                    </div>
                    {/* Page size selector */}
                    <div className="flex flex-grow-0 items-center gap-2">
                        <label
                            htmlFor="itemsPerPage"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                            className="input input-xs w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            aria-label="Items per page"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">new borns per page</span>
                    </div>
                </div>
            </div>

            <div className="block p-4 sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Born
                </button>

                {currentUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No records found.</div>
                ) : (
                    currentUsers.map((newBorn, index) => (
                        <div
                            key={newBorn._id}
                            className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex items-start gap-4">
                                {newBorn.avatar ? (
                                    <img
                                        src={newBorn.avatar}
                                        alt={newBorn.fullName || "Newborn"}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                                        {newBorn.fullName ? getInitials(newBorn.fullName) : "NB"}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-gray-200">{newBorn.fullName}</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">{newBorn.motherName}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">#{indexOfFirstUser + index + 1}</span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                            <p className="text-gray-800 dark:text-gray-200">{newBorn.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">DOB</p>
                                            <p className="text-gray-800 dark:text-gray-200">{formatDate(newBorn.dateOfBirth)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                            <p className="text-gray-800 dark:text-gray-200">{newBorn.birthWeight}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                            <p className="text-gray-800 dark:text-gray-200">{newBorn.birthHeight}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                                            <p className="text-gray-800 dark:text-gray-200">{formatDate(newBorn.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleview(newBorn)}
                                            className="group relative rounded bg-orange-500 px-2 py-1 text-white hover:bg-orange-600"
                                            title="Assign Vaccine"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                        {role !== "BHW" && (
                                            <button
                                                onClick={() => handleDeleteNewBorn(newBorn._id)}
                                                className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full overflow-auto">
                        <table className="table w-full text-sm">
                            <thead className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                <tr>
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Avatar</th>
                                    <th className="p-3 text-left">FullName</th>
                                    <th className="p-3 text-left">Birth Weight</th>
                                    <th className="p-3 text-left">Birth Height</th>
                                    <th className="p-3 text-left">MotherName</th>
                                    <th className="p-3 text-left">AssignedBy</th>
                                    <th className="p-3 text-left">Created At</th>
                                    <th className="p-3 text-left">
                                        <button
                                            onClick={handleAddClick}
                                            className="group relative rounded bg-blue-500 px-2 py-1 text-white hover:bg-red-600"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                Add New Born
                                            </span>
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="13"
                                            className="p-4 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((newBorn, index) => (
                                        <tr
                                            key={newBorn._id}
                                            className="border-b border-gray-200 dark:border-gray-700"
                                        >
                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">{indexOfFirstUser + index + 1}</td>
                                            <td className="p-3 align-top">
                                                {newBorn.avatar ? (
                                                    <img
                                                        src={newBorn.avatar}
                                                        alt={newBorn.fullName || "Newborn"}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                                        {newBorn.fullName ? getInitials(newBorn.fullName) : "NB"}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">
                                                {newBorn.fullName}
                                                {newBorn.extensionName ? ` ${newBorn.extensionName}` : ""}
                                            </td>

                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.birthWeight}</td>
                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.birthHeight}</td>
                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">{newBorn.motherName}</td>
                                            <td className="p-3 align-top capitalize text-gray-800 dark:text-gray-200">{newBorn.addedByName}</td>
                                            <td className="p-3 align-top text-gray-800 dark:text-gray-200">{formatDate(newBorn.createdAt)}</td>
                                            <td className="p-3 align-top">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleview(newBorn)}
                                                        className="group relative rounded bg-orange-500 px-2 py-1 text-white hover:bg-orange-600"
                                                        title="Assign Vaccine"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                    {role !== "BHW" && (
                                                        <button
                                                            onClick={() => handleDeleteNewBorn(newBorn._id)}
                                                            className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 dark:border-gray-700 sm:flex-row">
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                            currentPage === totalPages
                                ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Page {currentPage} of {totalPages} • {filteredUsers.length} new borns
                    </span>
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                            currentPage === totalPages
                                ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <UserFormModal
                isOpen={isAddFormOpen}
                onClose={handleCloseModal}
                born={selectedBorn}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
            <ProfileModal
                isOpen={isProfileModal}
                onClose={handleCloseModal}
                data={isSendData}
            />
        </div>
    );
}

export default NewBorn;
