import React, { useState, useContext, useMemo, useEffect } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../Profilling/ProfillingAddForm"; 
import StatusVerification from "../../ReusableFolder/StatusModal"; 
import { ProfillingContexts } from "../../contexts/ProfillingContext/ProfillingContext";

function Profille() {
    const [selectedUser, setSelectedUser] = useState(null);
    const { isProfilling, DeleteProfile, setProfilling } = useContext(ProfillingContexts);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState(""); 
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [idToDelete, setIdToDelete] = useState("");
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(isProfilling)) return [];
        return isProfilling.filter((user) => {
            const matchesSearch =
                `${user.FirstName || ""} ${user.LastName || ""} ${user.username || ""} ${user.email || ""} ${user.newbornName || ""}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            let matchesDateRange = true;
            if (user.createdAt && dateFrom && dateTo) {
                const userCreatedAtDate = new Date(user.createdAt);
                userCreatedAtDate.setHours(0, 0, 0, 0);

                const fromDateObj = new Date(dateFrom);
                fromDateObj.setHours(0, 0, 0, 0);
                const toDateObj = new Date(dateTo);
                toDateObj.setHours(23, 59, 59, 999);

                matchesDateRange = userCreatedAtDate >= fromDateObj && userCreatedAtDate <= toDateObj;
            } else if (dateFrom || dateTo) {
                matchesDateRange = false;
            }

            return matchesSearch && matchesDateRange;
        });
    }, [isProfilling, searchTerm, dateFrom, dateTo]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
        setIdToDelete(userId); 
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await DeleteProfile(idToDelete);
        setProfilling((prevUsers) => prevUsers.filter((user) => user._id !== idToDelete));
        handleCloseModal();
    };

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

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    const clearDateRange = () => {
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    return (
        <div className="rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            <div className="flex flex-col gap-4 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profilling</h2>
                <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
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

            <div className="mt-4 flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Profilling
                </button>
            </div>

            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">Avatar</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Gender</th>
                            <th className="p-2 text-left">DOB</th>
                            <th className="p-2 text-left">Address</th>
                            <th className="p-2 text-left">Blood Type</th>
                            <th className="p-2 text-left">Weight</th>
                            <th className="p-2 text-left">Height</th>
                            <th className="p-2 text-left">Condition</th>
                            <th className="p-2 text-left">Notes</th>
                            <th className="p-2 text-left">Mother Name</th>
                            <th className="p-2 text-left">Contact #</th>
                            <th className="p-2 text-left">Created At</th>
                            <th className="p-2 text-left">
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
                                    className="p-4 text-center text-gray-500 dark:text-gray-400"
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
                                    className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
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
                                    <td className="p-2">{user.newbornName}</td>
                                    <td className="p-2">{user.gender}</td>
                                    <td className="p-2">{formatDate(user.dateOfBirth)}</td>
                                    <td className="p-2">{user.motherAddressZone || "N/A"}</td>
                                    <td className="p-2">{user.blood_type || "N/A"}</td>
                                    <td className="p-2">{user.birthWeight || "N/A"}</td>
                                    <td className="p-2">{user.birthHeight || "N/A"}</td>
                                    <td className="p-2">{user.health_condition || "N/A"}</td>
                                    <td className="p-2">{user.notes || "N/A"}</td>
                                    <td className="p-2">{user.motherName || "N/A"}</td>
                                    <td className="p-2">{user.motherPhoneNumber || "N/A"}</td>
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
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="block grid grid-cols-1 gap-4 sm:hidden">
                {currentUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No profilling records found.</div>
                ) : (
                    currentUsers.map((user, index) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
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
                                        <h3 className="font-medium text-gray-800 dark:text-white">{user.newbornName}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                                        title="Delete"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="dark:text-white">{user.motherAddressZone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Blood Type</p>
                                    <p className="dark:text-white">{user.blood_type || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="dark:text-white">{user.birthWeight || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Height</p>
                                    <p className="dark:text-white">{user.birthHeight || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Condition</p>
                                    <p className="dark:text-white">{user.health_condition || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Mother</p>
                                    <p className="dark:text-white">{user.motherName || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Contact</p>
                                    <p className="dark:text-white">{user.motherPhoneNumber || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Created At</p>
                                    <p className="dark:text-white">{formatDate(user.createdAt)}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            {totalPages > 0 && (
                <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === 1 ? "text-gray-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages} • {filteredUsers.length} records
                    </span>
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === totalPages ? "text-gray-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
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
