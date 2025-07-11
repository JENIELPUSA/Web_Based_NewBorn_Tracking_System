import React, { useState, useContext, useMemo } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { ParentDisplayContext } from "../../contexts/ParentContext/ParentContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../User/AddUser";
import StatusVerification from "../../ReusableFolder/StatusModal";

function ParentTable() {
    const {isParent,DeleteParent}=useContext(ParentDisplayContext)
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const filteredUsers = useMemo(() => {
        const data = Array.isArray(isParent) ? isParent : [];
        return data.filter((user) =>
            `${user.FirstName} ${user.LastName} ${user.username} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [isParent, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handleAddClick = () => setAddFormOpen(true);

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
        setIsDeleteId(userId);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await DeleteParent(isDeleteID);
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== isDeleteID));
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
        if (!name) return "US"; // Default to "US" for User if no name
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    return (
        <div className="rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            <div className="flex flex-col gap-4 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Parent List</h2>
                <div className="flex items-center gap-2">
                    {/* This search input is always visible */}
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

            {/* This Add button is only visible on small screens (hidden on sm and above) */}
            <div className="mt-4 flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Born
                </button>
            </div>

            {/* Table View */}
            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Avatar</th>
                            <th className="p-3 text-left">Full Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Address</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">DOB</th>
                            <th className="p-3 text-left">Gender</th>
                            <th className="p-3 text-left">
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
                                    colSpan="11"
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
                                    <td className="p-3 align-top">{indexOfFirstUser + index + 1}</td>
                                    <td className="p-3 align-top">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                                                {getInitials(`${user.FirstName} ${user.LastName}`)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 align-top">{`${user.FirstName} ${user.Middle} ${user.LastName} ${user.extensionName}`}</td>
                                    <td className="p-3 align-top">{user.email}</td>
                                    <td className="max-w-xs truncate p-3 align-top">
                                        {user.zone ? `${user.zone}, ${user.address}` : user.address || "N/A"}
                                    </td>

                                    <td className="p-3 align-top">{user.phoneNumber || "N/A"}</td>
                                    <td className="p-3 align-top">{formatDate(user.dateOfBirth)}</td>
                                    <td className="p-3 align-top capitalize">{user.gender || "N/A"}</td>
                                    <td className="p-3 align-top">
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUserSelect(user)}
                                                className="rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 space-y-4 sm:hidden">
                {currentUsers.map((user) => (
                    <div
                        key={user._id}
                        className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                                    {getInitials(`${user.FirstName} ${user.LastName}`)}
                                </div>
                            )}
                            <div>
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white">{`${user.FirstName} ${user.LastName}`}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>
                                <span className="font-semibold">Role:</span> {user.role}
                            </p>
                            <p>
                                <span className="font-semibold">Zone:</span> {user.zone || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold">Phone:</span> {user.phoneNumber || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold">DOB:</span> {formatDate(user.dateOfBirth)}
                            </p>
                            <p>
                                <span className="font-semibold">Gender:</span> {user.gender || "N/A"}
                            </p>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                onClick={() => onUserSelect(user)}
                                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === 1 ? "text-gray-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages} • {filteredUsers.length} users
                    </span>
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === totalPages ? "text-gray-400" : "hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"}`}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <UserFormModal
                isOpen={isAddFormOpen}
                user={selectedUser}
                role="Guest"
                onClose={handleCloseModal}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default ParentTable;
