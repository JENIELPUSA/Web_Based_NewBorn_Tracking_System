import React, { useState, useContext, useEffect } from "react";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { PencilIcon, TrashIcon, BabyIcon } from "lucide-react";
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

function UserTable() {
    const { vaccineRecord,DeleteContext } = useContext(VaccineRecordDisplayContext);
    const [isVerification, setVerification] = useState(false);
    const [isAsignFormOpen, setAssignFormOpen] = useState(false);
    const [assignData, setAssignData] = useState(null);
    const [Dose, setDose] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState([null, null]);
    const [doseId, setDoseID] = useState("");
    const [dataID, setDataId] = useState("");
    const [startDate, endDate] = dateRange;

    const usersPerPage = 5;

    const handleEdit = (doseId, userData) => {
        console.log(doseId);
        setAssignFormOpen(true);
        setAssignData(userData);
        setDose(doseId);
    };

    const handleDeleteAssign = (doseId, userId) => {
        setVerification(true);
        setDoseID(doseId);
        setDataId(userId);

        console.log("Delete clicked for dose:", doseId, "user:", userId);
    };

    const handleCloseModal = () => {
        setAssignFormOpen(false);

        setVerification(false);
        setAssignData(null);
        setDose(null);
    };

    const handleConfirmDelete =async() => {
        console.log("Deleting:", doseId, dataID);
        await DeleteContext(dataID,doseId)

        // Call your delete API or context method here
        handleCloseModal();
    };

    useEffect(() => {
        console.log("Vaccine Records:", vaccineRecord);
    }, [vaccineRecord]);

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
            <div className="card-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title">Vaccination Records</p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable
                            placeholderText="Select date range"
                            className="input input-sm w-48 rounded-md border px-2 py-1 text-sm dark:bg-slate-800"
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

                    <input
                        type="text"
                        placeholder="Search records..."
                        className="input input-sm w-56 rounded-md border px-3 py-1 text-sm dark:bg-slate-800"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
                    <table className="table w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th>#</th>
                                <th>Avatar</th>
                                <th>Baby's Name</th>
                                <th>Address</th>
                                <th>Mother</th>
                                <th>Vaccine</th>
                                <th>Description</th>
                                <th>Dosage</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Administered By</th>
                                <th>Dose Info</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="14"
                                        className="p-4 text-center"
                                    >
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) =>
                                    user.doses.map((dose, doseIndex) => (
                                        <tr
                                            key={`${user._id}-${doseIndex}`}
                                            className="border-b dark:border-gray-700"
                                        >
                                            <td>{doseIndex === 0 ? indexOfFirstUser + index + 1 : ""}</td>
                                            <td>
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
                                            <td>{user.newbornName}</td>
                                            <td className="capitalize">{user.FullAddress}</td>
                                            <td>{user.motherName}</td>
                                            <td>{user.vaccineName}</td>
                                            <td>{user.description}</td>
                                            <td className="capitalize">{user.dosage}</td>
                                            <td>
                                                <StatusBadge status={dose.status} />
                                            </td>
                                            <td>{dose.remarks || "—"}</td>
                                            <td className="capitalize">{dose.administeredBy || "—"}</td>
                                            <td>
                                                <div className="space-y-1 text-sm">
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
                                            <td>
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

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <AddNewBornForm
                isOpen={isAsignFormOpen}
                onClose={handleCloseModal}
                editDose={Dose}
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

export default UserTable;
