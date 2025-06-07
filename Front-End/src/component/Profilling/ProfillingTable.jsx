import React, { useState, useContext, useMemo } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext"; // Keep this if setUsers is still needed elsewhere, otherwise remove
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../Profilling/ProfillingAddForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { ProfillingContexts } from "../../contexts/ProfillingContext/ProfillingContext";

function Profille() {
    const [selectedUser, setSelectedUser] = useState(null);
    // const { setUsers } = useContext(UserDisplayContext); // If setUsers is not used for updating after deletion, you can remove this line
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [idToDelete, setIdToDelete] = useState(""); // Renamed from isDeleteID for clarity
    const { isProfilling, DeleteProfile, setProfilling } = useContext(ProfillingContexts); // Added setProfilling if your context provides it

    // Filter users based on search term
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(isProfilling)) return [];
        return isProfilling.filter((user) =>
            `${user.FirstName} ${user.LastName} ${user.username} ${user.email} ${user.newbornName}`.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [isProfilling, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString("en-PH") : "N/A";
    };

    const getInitials = (name) => {
        if (!name) return "US";
        const parts = name.split(" ");
        return parts[0][0].toUpperCase() + (parts[1] ? parts[1][0].toUpperCase() : "");
    };

    return (
        <div className="rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profilling</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-sm w-full rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white md:w-56"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Mobile Add Button */}
            <div className="mt-4 flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Born
                </button>
            </div>

            {/* Desktop Table (hidden on mobile) */}
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
                            <th className="p-2 text-left">Vacination Record</th>
                            <th className="p-2 text-left">
                                <button
                                    onClick={handleAddClick}
                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                    title="Add User"
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
                                    No users found.
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
                                    <td className="w-[200px] p-2">
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
                                                                    <li key={j}>
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
                                            "No records"
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onUserSelect(user)}
                                                className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
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

            {/* Mobile Card View (hidden on desktop) */}
            <div className="block grid grid-cols-1 gap-4 sm:hidden">
                {currentUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No users found.</div>
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
                                    <p className="text-gray-500 dark:text-gray-400">Zone</p>
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
                            </div>

                            {/* Vaccination Records - Collapsible */}
                            <details className="mt-3">
                                <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">Vaccination Records</summary>
                                <div className="mt-2 space-y-3 pl-2 text-sm">
                                    {user.vaccinationRecords?.length ? (
                                        user.vaccinationRecords.map((record, i) => (
                                            <div
                                                key={i}
                                                className="rounded border p-2 dark:border-gray-700"
                                            >
                                                <p className="font-medium dark:text-white">{record.vaccineName}</p>
                                                {Array.isArray(record.doses) && record.doses.length > 0 ? (
                                                    <ul className="mt-1 space-y-1">
                                                        {record.doses.map((dose, j) => (
                                                            <li
                                                                key={j}
                                                                className="text-xs"
                                                            >
                                                                <span className="font-medium dark:text-white">Dose {dose.doseNumber}:</span>{" "}
                                                                <span className="dark:text-white">{dose.dateGiven ? formatDate(dose.dateGiven) : "—"}</span>
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
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                    <button
                        className="btn btn-sm btn-ghost text-gray-900 dark:text-white"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-900 dark:text-white">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-ghost text-gray-900 dark:text-white"
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
