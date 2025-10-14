import React, { useState, useMemo, useEffect, useContext, useCallback } from "react";
import { Plus, PencilIcon, TrashIcon, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VisitRecordContexts } from "../../contexts/VisitRecordContext/VisitRecordContext";
import CheckupRecordForm from "../../component/CheckUpRecordComponent/CheckupRecordForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function HealthRecordModal({ isOpen, onClose, newbornData }) {
    const { DeleteCheckup, setSpecificData, fetchSpecificData, isSpecificData, addVisitRecord, updateVisitRecord, deleteVisitRecord } =
        useContext(VisitRecordContexts);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [isCheckupFormOpen, setCheckupFormOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const healthRecords = isSpecificData;

    useEffect(() => {
        const loadData = async () => {
            if (newbornData?._id) {
                setIsLoading(true);
                await fetchSpecificData(newbornData._id);
                setIsLoading(false);
            }
        };
        loadData();
    }, [newbornData, fetchSpecificData]);

    console.log("Data", newbornData);

    const filteredRecords = useMemo(() => {
        const data = Array.isArray(healthRecords) ? healthRecords : [];
        return data.filter((record) => {
            const matchesSearchTerm = `${record.newbornName || ""} ${record.health_condition || ""} ${record.notes || ""} ${record.addedByName || ""}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            let matchesDateRange = true;
            if (record.visitDate) {
                const recordVisitDate = new Date(record.visitDate);
                recordVisitDate.setHours(0, 0, 0, 0);

                if (dateFrom) {
                    const fromDateObj = new Date(dateFrom);
                    fromDateObj.setHours(0, 0, 0, 0);
                    matchesDateRange = matchesDateRange && recordVisitDate >= fromDateObj;
                }
                if (dateTo) {
                    const toDateObj = new Date(dateTo);
                    toDateObj.setHours(23, 59, 59, 999);
                    matchesDateRange = matchesDateRange && recordVisitDate <= toDateObj;
                }
            } else if (dateFrom || dateTo) {
                matchesDateRange = false;
            }

            return matchesSearchTerm && matchesDateRange;
        });
    }, [healthRecords, searchTerm, dateFrom, dateTo]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setDeleteID] = useState(null);
    useEffect(() => {
        const newTotalPages = Math.ceil(filteredRecords.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (filteredRecords.length > 0 && currentRecords.length === 0 && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (filteredRecords.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filteredRecords.length, currentPage, itemsPerPage, currentRecords.length]);

    const handleItemsPerPageChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10);
        setItemsPerPage(isNaN(value) || value < 1 ? 5 : value);
        setCurrentPage(1);
    }, []);

    const handleClose = useCallback(() => {
        onClose();
        setSearchTerm("");
        setCurrentPage(1);
        setDateFrom("");
        setDateTo("");
        setRecordToEdit(null);
        setSpecificData([]);
        setIsLoading(true);
    }, [onClose, setSpecificData]);

    const handleAddRecord = useCallback(() => {
        setRecordToEdit(null);
        setCheckupFormOpen(true);
    }, []);

    const handleEditRecord = useCallback((record) => {
        setRecordToEdit(record);
        setCheckupFormOpen(true);
    }, []);

    const handleDeleteRecord = useCallback(
        (recordId) => {
            setDeleteID(recordId);
            setVerification(true);
        },
        [], // Empty dependency array means it will only be created once
    );

    const handleConfirmDelete = async () => {
        if (isDeleteID) {
            await DeleteCheckup(isDeleteID);
            setDeleteID(null);
            setVerification(false);
            // After successful deletion, re-fetch the data to update the table
            if (newbornData?._id) {
                setIsLoading(true);
                await fetchSpecificData(newbornData._id);
                setIsLoading(false);
            }
        }
    };

    const handleViewRecord = useCallback((record) => {
        alert(
            `Viewing details for: ${record.newbornName} on ${formatDate(
                record.visitDate,
            )}\nCondition: ${record.health_condition}\nNotes: ${record.notes}`,
        );
    }, []);

    const handleCloseCheckupForm = useCallback(() => {
        setCheckupFormOpen(false);
        setRecordToEdit(null);
        if (newbornData?._id) {
            setIsLoading(true);
            fetchSpecificData(newbornData._id).then(() => setIsLoading(false));
        }
    }, [newbornData, fetchSpecificData]);

    const handleCheckupFormSubmit = useCallback(
        async (formData) => {
            try {
                setIsLoading(true);
                if (recordToEdit) {
                    await updateVisitRecord(recordToEdit._id, formData);
                } else {
                    await addVisitRecord({ ...formData, newbornId: newbornData._id });
                }
                handleCloseCheckupForm();
            } catch (error) {
                console.error("Error submitting checkup form:", error);
                alert("Failed to save record. Please try again.");
                setIsLoading(false);
            }
        },
        [recordToEdit, addVisitRecord, updateVisitRecord, handleCloseCheckupForm, newbornData],
    );

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    >
                        <motion.div
                            className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b p-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Health Records for {newbornData?.newbornName || "Newborn"}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700"
                                    aria-label="Close modal"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                                <div className="card-header flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="card-title text-lg font-semibold text-gray-800">Health Records List</p>
                                    <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                                        <div className="flex flex-grow-0 flex-wrap items-center gap-2">
                                            <label
                                                htmlFor="dateFrom"
                                                className="text-sm font-medium text-gray-700"
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
                                                className="text-gray-500 input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm sm:w-auto"
                                                title="Filter by Visit Date (From)"
                                            />
                                            <label
                                                htmlFor="dateTo"
                                                className="text-sm font-medium text-gray-500"
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
                                                className="text-gray-500 input input-xs w-32 rounded-md border border-gray-300 px-2 py-1 text-sm sm:w-auto"
                                                title="Filter by Visit Date (To)"
                                            />
                                        </div>
                                        <div className="flex flex-grow-0 items-center gap-2">
                                            <label
                                                htmlFor="itemsPerPage"
                                                className="text-sm font-medium text-gray-700"
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
                                                className="text-gray-500 input input-xs w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-sm"
                                                aria-label="Items per page"
                                            />
                                            <span className="text-sm text-gray-700">records per page</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="block p-4 sm:hidden">
                                    <button
                                        onClick={handleAddRecord}
                                        className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-[#7B8D6A] px-4 py-2 text-white hover:bg-[#7B8D6A]/60"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Add New Record
                                    </button>

                                    {isLoading ? (
                                        <div className="flex h-48 items-center justify-center">
                                            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                            <p className="ml-4 text-gray-600">Loading records...</p>
                                        </div>
                                    ) : currentRecords.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No health records found.</div>
                                    ) : (
                                        currentRecords.map((record, index) => (
                                            <div
                                                key={record._id}
                                                className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-medium text-gray-800">{record.newbornName}</h3>
                                                                <p className="text-sm text-[#7B8D6A]/60">
                                                                    Visit: {formatDate(record.visitDate)}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                #{indexOfFirstRecord + index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Weight</p>
                                                                <p className="text-gray-800">{record.weight} kg</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Height</p>
                                                                <p className="text-800">{record.height} cm</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-xs text-gray-500">Condition</p>
                                                                <p className="text-gray-800">{record.health_condition}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-xs text-gray-500">Notes</p>
                                                                <p className="text-gray-800">{record.notes}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Added By</p>
                                                                <p className="text-gray-800">{record.addedByName || "N/A"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Recorded At</p>
                                                                <p className="text-gray-800">{formatDate(record.createdAt)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleViewRecord(record)}
                                                                className="rounded bg-orange-500 p-1.5 text-white hover:bg-orange-600"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditRecord(record)}
                                                                className="rounded bg-[#7B8D6A] p-1.5 text-white hover:bg-[#7B8D6A]/60"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRecord(record._id)}
                                                                className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="hidden sm:block">
                                    <div className="card-body p-0">
                                        <div className="relative h-[500px] w-full overflow-auto">
                                            <table className="table w-full text-sm">
                                                <thead className="sticky top-0 z-10 bg-gray-100 text-gray-800">
                                                    <tr>
                                                        <th className="p-3 text-left">#</th>
                                                        <th className="p-3 text-left">Visit Date</th>
                                                        <th className="p-3 text-left">Weight (kg)</th>
                                                        <th className="p-3 text-left">Height (cm)</th>
                                                        <th className="p-3 text-left">Health Condition</th>
                                                        <th className="p-3 text-left">Notes</th>
                                                        <th className="p-3 text-left">Added By</th>
                                                        <th className="p-3 text-left">Recorded At</th>
                                                        <th className="p-3 text-left">
                                                            <button
                                                                onClick={handleAddRecord}
                                                                className="group relative rounded bg-[#7B8D6A] px-2 py-1 text-white hover:bg-[#7B8D6A]/60"
                                                                title="Add New Record"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-90 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 group-hover:opacity-100">
                                                                    Add New Record
                                                                </span>
                                                            </button>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isLoading ? (
                                                        <tr>
                                                            <td
                                                                colSpan="10"
                                                                className="p-4 text-center text-gray-500"
                                                            >
                                                                <div className="flex h-48 items-center justify-center">
                                                                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                                                    <p className="ml-4 text-gray-600">Loading records...</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : currentRecords.length === 0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan="10"
                                                                className="p-4 text-center text-gray-500"
                                                            >
                                                                No health records found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentRecords.map((record, index) => (
                                                            <tr
                                                                key={record._id}
                                                                className="border-b border-gray-200"
                                                            >
                                                                <td className="p-3 align-top text-gray-800">
                                                                    {indexOfFirstRecord + index + 1}
                                                                </td>
                                                                <td className="p-3 align-top text-gray-800">
                                                                    {formatDate(record.visitDate)}
                                                                </td>
                                                                <td className="p-3 align-top text-gray-800">{record.weight} kg</td>
                                                                <td className="p-3 align-top text-gray-800">{record.height} cm</td>
                                                                <td className="p-3 align-top text-gray-800">
                                                                    {record.health_condition}
                                                                </td>
                                                                <td className="p-3 align-top text-gray-800">{record.notes}</td>
                                                                <td className="p-3 align-top capitalize text-gray-800">
                                                                    {record.addedByName || "N/A"}
                                                                </td>
                                                                <td className="p-3 align-top text-gray-800">
                                                                    {formatDate(record.createdAt)}
                                                                </td>
                                                                <td className="p-3 align-top">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEditRecord(record)}
                                                                            className="group relative rounded bg-[#7B8D6A] px-2 py-1 text-white hover:bg-[#7B8D6A]/60"
                                                                            title="Edit"
                                                                        >
                                                                            <PencilIcon className="h-4 w-4" />
                                                                
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteRecord(record._id)}
                                                                            className="group relative rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
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
                                    </div>
                                </div>
                            </div>

                            {totalPages > 0 && (
                                <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                                    <button
                                        className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                            currentPage === 1
                                                ? "cursor-not-allowed text-gray-400"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1 || isLoading}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages} • {filteredRecords.length} records
                                    </span>
                                    <button
                                        className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                            currentPage === totalPages
                                                ? "cursor-not-allowed text-gray-400"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || isLoading}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <CheckupRecordForm
                isOpen={isCheckupFormOpen}
                onClose={handleCloseCheckupForm}
                newbornData={newbornData}
                recordData={recordToEdit}
                onSubmit={handleCheckupFormSubmit}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={() => setVerification(false)} // Added a specific onClose for StatusVerification
            />
        </>
    );
}

export default HealthRecordModal;