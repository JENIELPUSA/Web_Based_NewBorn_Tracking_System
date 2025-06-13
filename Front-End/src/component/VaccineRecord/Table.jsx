import React, { useState, useContext, useEffect } from "react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { PencilIcon, TrashIcon, BabyIcon, Plus } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddNewBornForm from "../VaccineRecord/AddForm";
import StatusVerification from "../../ReusableFolder/StatusModal";

// Status badge color mapping
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

function VaccineRecordTable() {
    const { vaccineRecord, DeleteContext } = useContext(VaccineRecordDisplayContext);
    const [isVerification, setVerification] = useState(false);
    const [isAssignFormOpen, setAssignFormOpen] = useState(false);
    const [assignData, setAssignData] = useState(null);
    const [dose, setDose] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState([null, null]);
    const [doseId, setDoseID] = useState("");
    const [dataID, setDataId] = useState("");

    const usersPerPage = 5;
    const [startDate, endDate] = dateRange;

    const handleAddClick = () => {
        setAssignFormOpen(true);
    };

    const handleEdit = (doseId, userData) => {
        setAssignFormOpen(true);
        setAssignData(userData);
        setDose(doseId);
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

    console.log("fwef", vaccineRecord);

    const filteredRecord = vaccineRecord.filter((user) => {
        const matchesSearch = `${user.firstName} ${user.lastName} ${user.username} ${user.email} ${user.newbornName} ${user.motherName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        if (startDate && endDate) {
            return (
                matchesSearch &&
                user.doses.some((dose) => {
                    const doseDate = new Date(dose.dateGiven);
                    return dose.dateGiven && doseDate >= startDate && doseDate <= endDate;
                })
            );
        }

        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredRecord.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredRecord.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div className="card">
            {/* Card Header */}
            <div className="card-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title text-gray-900 dark:text-white">Vaccination Records</p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable
                            placeholderText="Select date range"
                            className="input input-sm w-48 rounded-md border px-2 py-1 text-sm text-gray-900 dark:bg-slate-800 dark:text-white"
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

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="input input-sm w-56 rounded-md border px-3 py-1 text-sm text-gray-900 dark:bg-slate-800 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Add button on XS screens */}
            <div className=" flex justify-center sm:hidden">
                <button
                    onClick={handleAddClick}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-pink-600"
                >
                    <Plus className="h-5 w-5" />
                    Add New Born
                </button>
            </div>

            {/* Card Body */}
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    {/* Mobile View */}
                    <div className="block sm:hidden">
                        {currentUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-900 dark:text-white">No records found.</div>
                        ) : (
                            currentUsers.map((user, index) =>
                                user.doses.map((dose, doseIndex) => (
                                    <div
                                        key={`${user._id}-${doseIndex}`}
                                        className="card mb-4 bg-white p-4 shadow-lg dark:bg-gray-800"
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
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                                                        <BabyIcon className="h-6 w-6 text-pink-500 dark:text-pink-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{user.newbornName}</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{user.FullAddress}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 dark:text-white">{user.motherName}</p>
                                            <p className="text-gray-900 dark:text-white">{user.vaccineName}</p>
                                            <p className="text-gray-900 dark:text-white">{user.description}</p>
                                            <p className="capitalize text-gray-900 dark:text-white">{dose.doseNumber || "—"}</p>
                                            <p className="text-gray-900 dark:text-white">{dose.remarks || "—"}</p>
                                            <div className="flex gap-2">
                                                <StatusBadge status={dose.status} />
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(dose, user)}
                                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteAssign(dose._id, user._id)}
                                                    className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )),
                            )
                        )}
                    </div>

                    {/* Desktop View */}
                    <table className="hidden w-full min-w-[1200px] table-auto text-sm sm:table">
                        <thead className="sticky top-0 bg-gray-100 shadow-sm dark:bg-gray-800">
                            <tr>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">#</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Avatar</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Baby's Name</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Address</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Mother</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Vaccine</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Description</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Given Dose</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Dosage</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Status</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Remarks</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Administered By</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Dose Info</th>
                                <th className="px-2 py-2 text-left text-gray-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="14"
                                        className="p-4 text-center text-gray-900 dark:text-white"
                                    >
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
                                            <td className="px-2 py-2 text-gray-900 dark:text-white">
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
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                                                        <BabyIcon className="h-6 w-6 text-pink-500 dark:text-pink-300" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-gray-900 dark:text-white">{user.newbornName}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900 dark:text-white">{user.FullAddress}</td>
                                            <td className="px-2 py-2 text-gray-900 dark:text-white">{user.motherName}</td>
                                            <td className="px-2 py-2 text-gray-900 dark:text-white">{user.vaccineName}</td>
                                            <td className="px-2 py-2 text-gray-900 dark:text-white">{user.description}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900 dark:text-white">{dose.doseNumber || "—"}</td>
                                            <td className="px-2 py-2 capitalize text-gray-900 dark:text-white">{user.dosage}</td>
                                            <td className="px-2 py-2">
                                                <StatusBadge status={dose.status} />
                                            </td>
                                            <td className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-gray-900 dark:text-white">
                                                {dose.remarks || "—"}
                                            </td>
                                            <td className="px-2 py-2 capitalize text-gray-900 dark:text-white">{dose.administeredBy || "—"}</td>
                                            <td className="px-2 py-2">
                                                <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                                                    <div>
                                                        <span className="font-medium">Given:</span>{" "}
                                                        {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : "—"}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Next Due:</span>{" "}
                                                        {dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString() : "—"}
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
                                                    <button
                                                        onClick={() => handleDeleteAssign(dose._id, user._id)}
                                                        className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )),
                                )
                            )}
                        </tbody>
                    </table>
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
