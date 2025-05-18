import React, { useState, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../User/AddUser";
import StatusVerification from "../../ReusableFolder/StatusModal";

function UserTable() {
    const [selectedUser, setSelectedUser] = useState(null);
    const { users, DeleteUser, setUsers } = useContext(UserDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");

    const filteredUsers = users.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handleAddClick = () => {
        setAddFormOpen(true);
    };

    const onUserSelect = (user) => {
        setAddFormOpen(true);
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
         setVerification(false);
        setAddFormOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async (userId) => {
        setVerification(true);
        setIsDeleteId(userId);
    };

    const handleConfirmDelete = async () => {
        await DeleteUser(isDeleteID);
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== isDeleteID));

        // Call your delete API or context method here
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

    return (
        <div className="card rounded-lg bg-white shadow dark:bg-gray-900">
            <div className="card-header flex flex-col gap-4 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <h2 className="card-title text-lg font-semibold text-gray-800 dark:text-white">User List</h2>
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

            <div className="card-body p-0">
                {/* Mobile View - Cards */}
                <div className="block space-y-4 p-4 md:hidden">
                    <button
                        onClick={handleAddClick}
                        className="mb-4 flex w-full items-center justify-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Add User
                    </button>

                    {currentUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No users found.</div>
                    ) : (
                        currentUsers.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-lg border p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{`${user.FirstName} ${user.LastName}`}</h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">{user.email}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                                <p>{user.phoneNumber || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                                <p className="capitalize">{user.gender || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">DOB</p>
                                                <p>{formatDate(user.dateOfBirth)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Zone</p>
                                                <p>{user.zone || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                            <p className="text-sm">{user.address || "N/A"}</p>
                                        </div>

                                        <div className="mt-3 flex justify-end space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onUserSelect(user)}
                                                className="rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                    <div className="relative w-full overflow-auto">
                        <table className="table w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Avatar</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Role</th>
                                    <th className="p-3 text-left">Full Name</th>
                                    <th className="p-3 text-left">Address</th>
                                    <th className="p-3 text-left">Zone</th>
                                    <th className="p-3 text-left">Phone</th>
                                    <th className="p-3 text-left">DOB</th>
                                    <th className="p-3 text-left">Gender</th>
                                    <th className="p-3 text-left">
                                        <button
                                            onClick={handleAddClick}
                                            className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                            title="Add"
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
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            </td>
                                            <td className="p-3 align-top">{user.email}</td>
                                            <td className="p-3 align-top capitalize">{user.role}</td>
                                            <td className="p-3 align-top">{`${user.FirstName} ${user.LastName}`}</td>
                                            <td className="max-w-xs truncate p-3 align-top">{user.address || "N/A"}</td>
                                            <td className="p-3 align-top">{user.zone || "N/A"}</td>
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
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                        title="Delete"
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
                </div>

                {/* Pagination - Works for both views */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                        <button
                            className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm ${
                                currentPage === 1
                                    ? "cursor-not-allowed text-gray-400 dark:text-gray-500"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <span>Previous</span>
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page {currentPage} of {totalPages} • {filteredUsers.length} users found
                        </span>
                        <button
                            className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed text-gray-400 dark:text-gray-500"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <span>Next</span>
                        </button>
                    </div>
                )}

                <UserFormModal
                    isOpen={isAddFormOpen}
                    user={selectedUser}
                    onClose={handleCloseModal}
                />
                <StatusVerification
                    isOpen={isVerification}
                    onConfirmDelete={handleConfirmDelete}
                    onClose={handleCloseModal}
                />
            </div>
        </div>
    );
}

export default UserTable;
