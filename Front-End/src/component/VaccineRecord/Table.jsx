import React, { useState, useContext } from "react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { PencilIcon, TrashIcon, Plus } from "lucide-react"; // Lucide icons for clean UI
import { motion } from "framer-motion"; // Ensure motion is imported
import UserFormModal from "../User/AddUser";

function UserTable() {
    const { vaccineRecord } = useContext(VaccineRecordDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const filteredRecord = vaccineRecord.filter((user) =>
        `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredRecord.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredRecord.slice(indexOfFirstUser, indexOfLastUser);

    console.log("PArrara", vaccineRecord);

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <p className="card-title">User List</p>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="input input-sm w-56 rounded-md border px-3 py-1 text-sm dark:bg-slate-800"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    <table className="table w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Avatar</th>
                                <th className="p-3 text-left">Name of Baby's</th>
                                <th className="p-3 text-left">Full Address</th>
                                <th className="p-3 text-left">Mother Name</th>
                                <th className="p-3 text-left">Vaccine Name</th>
                                <th className="p-3 text-left">Vaccine Description</th>
                                <th className="p-3 text-left">Dosage</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Remarks</th>
                                <th className="p-3 text-left">Assigned By</th>
                                <th>
                                    <button
                                        className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-red-600"
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
                                        colSpan="10"
                                        className="p-4 text-center"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <tr
                                        key={user._id}
                                        className="border-b dark:border-gray-700"
                                    >
                                        <td className="p-3 align-top">{indexOfFirstUser + index + 1}</td>
                                        <td className="p-3 align-top">
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </td>
                                        <td className="p-3 align-top">{user.newbornName}</td>
                                        <td className="p-3 align-top capitalize">{user.FullAddress}</td>
                                        <td className="p-3 align-top">{user.motherName}</td>
                                        <td className="p-3 align-top">{user.vaccineName}</td>
                                        <td className="p-3 align-top">{user.description}</td>
                                        <td className="p-3 align-top capitalize">{user.dosage}</td>

                                        <td className="p-3 align-top capitalize">{user.status}</td>
                                        <td className="p-3 align-top">{user.remarks}</td>
                                        <td className="p-3 align-top capitalize">{user.administeredBy}</td>
                                        <td className="p-3 align-top">
                                            <div className="flex gap-2">
                                                <button
                                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            className="px-3 py-1 text-sm disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-3 py-1 text-sm disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserTable;
