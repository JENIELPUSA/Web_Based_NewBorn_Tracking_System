import React, { useState, useContext, useMemo } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { ParentDisplayContext } from "../../contexts/ParentContext/ParentContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserFormModal from "../User/AddUser";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";

function ParentTable() {
    const { role } = useContext(AuthContext);
    const { isParent, DeleteParent } = useContext(ParentDisplayContext);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const { setUsers } = useContext(UserDisplayContext);

    // Enhanced search: includes zone, address, phone, and full name
    const filteredUsers = useMemo(() => {
        const data = Array.isArray(isParent) ? isParent : [];
        const term = searchTerm.toLowerCase().trim();

        if (!term) return data;

        return data.filter((user) => {
            const fullName = `${user.FirstName || ''} ${user.Middle || ''} ${user.LastName || ''} ${user.extensionName || ''}`.toLowerCase();
            const email = (user.email || '').toLowerCase();
            const zone = (user.zone || '').toLowerCase();
            const address = (user.address || '').toLowerCase();
            const phone = (user.phoneNumber || '').toLowerCase();

            return (
                fullName.includes(term) ||
                email.includes(term) ||
                zone.includes(term) ||
                address.includes(term) ||
                phone.includes(term)
            );
        });
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
        if (!name) return "US";
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    };

    return (
        <div className="rounded-lg bg-white shadow xs:p-2 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Parent List</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name, email, zone, address, or phone..."
                        className="input input-sm w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800 md:w-56"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="mt-4 flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-[#7B8D6A] px-4 py-2 text-white hover:bg-[#7B8D6A]/60"
                >
                    <Plus className="h-5 w-5" />
                    Add New Born
                </button>
            </div>

            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-gray-500">#</th>
                            <th className="p-3 text-left text-gray-500">Avatar</th>
                            <th className="p-3 text-left text-gray-500">Full Name</th>
                            <th className="p-3 text-left text-gray-500">Email</th>
                            <th className="p-3 text-left text-gray-500">Address</th>
                            <th className="p-3 text-left text-gray-500">Phone</th>
                            <th className="p-3 text-left text-gray-500">DOB</th>
                            <th className="p-3 text-left text-gray-500">Gender</th>
                            <th className="p-3 text-left">
                                <button
                                    onClick={handleAddClick}
                                    className="rounded bg-[#7B8D6A] px-2 py-1 text-white hover:bg-[#7B8D6A]/60"
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
                                    className="p-4 text-center text-gray-500"
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
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="p-3 align-top text-gray-800">{indexOfFirstUser + index + 1}</td>
                                    <td className="p-3 align-top">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B8D6A] text-white">
                                                {getInitials(`${user.FirstName} ${user.LastName}`)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 align-top text-gray-800">{`${user.FirstName || ''} ${user.Middle || ''} ${user.LastName || ''} ${user.extensionName || ''}`}</td>
                                    <td className="p-3 align-top text-gray-800">{user.email}</td>
                                    <td className="max-w-xs truncate p-3 align-top text-gray-800">
                                        {user.zone ? `${user.zone}, ${user.address}` : user.address || "N/A"}
                                    </td>
                                    <td className="p-3 align-top text-gray-800">{user.phoneNumber || "N/A"}</td>
                                    <td className="p-3 align-top text-gray-800">{formatDate(user.dateOfBirth)}</td>
                                    <td className="p-3 align-top capitalize text-gray-800">{user.gender || "N/A"}</td>
                                    <td className="p-3 align-top">
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUserSelect(user)}
                                                className="rounded bg-[#7B8D6A] p-1.5 text-white hover:bg-[#7B8D6A]/60"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </motion.button>
                                            {role === "Admin" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </motion.button>
                                            )}
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
                        className="rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7B8D6A] text-white">
                                    {getInitials(`${user.FirstName} ${user.LastName}`)}
                                </div>
                            )}
                            <div>
                                <h4 className="text-base font-semibold text-gray-800">{`${user.FirstName} ${user.LastName}`}</h4>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                            <p>
                                <span className="font-semibold text-gray-800">Role:</span> {user.role}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-800">Zone:</span> {user.zone || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-800">Phone:</span> {user.phoneNumber || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-800">DOB:</span> {formatDate(user.dateOfBirth)}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-800">Gender:</span> {user.gender || "N/A"}
                            </p>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                onClick={() => onUserSelect(user)}
                                className="rounded bg-[#7B8D6A] px-3 py-1 text-white hover:bg-[#7B8D6A]/60"
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

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === 1 ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"}`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages} • {filteredUsers.length} users
                    </span>
                    <button
                        className={`rounded-md px-3 py-1.5 text-sm ${currentPage === totalPages ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"}`}
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