import React, { useState, useContext, useMemo, useEffect } from "react";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext"; // <- AYUSIN ITO KUNG MALI
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import UserFormModal from "../Vaccine/AddVacine";
import UpdateFormModal from "../Vaccine/UpdateStock";
import DeleteForm from "../Vaccine/DeleteStocks";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function VaccineTable() {
    const { role } = useContext(AuthContext);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // State for items per page
    const [dateFrom, setDateFrom] = useState(""); // State for 'created at' date filter start
    const [dateTo, setDateTo] = useState(""); // State for 'created at' date filter end

    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isUpdateFormOpen, setUpdateFormOpen] = useState(false);
    const [isDeleteFormOpen, setDeleteFormOpen] = useState(false);

    const { vaccine } = useContext(VaccineDisplayContext);

    // Memoize grouped and filtered vaccines
    const groupedAndFilteredVaccines = useMemo(() => {
        const grouped = vaccine.reduce((acc, item) => {
            const { _id, name, brand, description, dosage, zone, batches, createdAt } = item; // Include createdAt here

            if (!acc[name]) {
                acc[name] = {
                    _id,
                    name,
                    totalStock: 0,
                    description,
                    dosage,
                    zone,
                    createdAt, // Add createdAt to the grouped item
                    details: [],
                };
            }

            batches.forEach((batch) => {
                acc[name].totalStock += batch.stock;
                acc[name].details.push({
                    label: `${brand?.name || "N/A"} (${new Date(batch.expirationDate).toISOString().split("T")[0]})`,
                    batchID: batch._id,
                    stock: batch.stock,
                });
            });

            return acc;
        }, {});

        const groupedVaccineArray = Object.values(grouped);

        // Apply search term and date filters
        return groupedVaccineArray.filter((item) => {
            const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesDateRange = true;
            if (item.createdAt) {
                // Filter by createdAt on the main vaccine item
                const itemCreatedAtDate = new Date(item.createdAt);
                itemCreatedAtDate.setHours(0, 0, 0, 0);

                if (dateFrom) {
                    const fromDateObj = new Date(dateFrom);
                    fromDateObj.setHours(0, 0, 0, 0);
                    matchesDateRange = matchesDateRange && itemCreatedAtDate >= fromDateObj;
                }
                if (dateTo) {
                    const toDateObj = new Date(dateTo);
                    toDateObj.setHours(23, 59, 59, 999);
                    matchesDateRange = matchesDateRange && itemCreatedAtDate <= toDateObj;
                }
            } else if (dateFrom || dateTo) {
                matchesDateRange = false;
            }

            return matchesSearchTerm && matchesDateRange;
        });
    }, [vaccine, searchTerm, dateFrom, dateTo]);

    // Calculate pagination details based on filtered vaccines and itemsPerPage
    const totalPages = Math.ceil(groupedAndFilteredVaccines.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentVaccines = groupedAndFilteredVaccines.slice(indexOfFirst, indexOfLast);

    // Effect hook to adjust the current page if needed after filtering, deletion, or changing itemsPerPage.
    useEffect(() => {
        const newTotalPages = Math.ceil(groupedAndFilteredVaccines.length / itemsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (groupedAndFilteredVaccines.length > 0 && currentVaccines.length === 0 && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (groupedAndFilteredVaccines.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [groupedAndFilteredVaccines.length, currentPage, itemsPerPage, currentVaccines.length]);

    const openAddModal = () => {
        setSelectedVaccine(null);
        setAddFormOpen(true);
    };

    const openUpdateModal = (vaccine) => {
        setSelectedVaccine(vaccine);
        setUpdateFormOpen(true);
    };

    const openDeleteModal = (vaccine) => {
        setSelectedVaccine(vaccine);
        setDeleteFormOpen(true);
    };

    const handleCloseAllModals = () => {
        setSelectedVaccine(null);
        setAddFormOpen(false);
        setUpdateFormOpen(false);
        setDeleteFormOpen(false);
    };

    // Handler for changing items per page (dropdown)
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="card m-4 rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            <div className="card-header mb-2 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="card-title text-center text-xl font-semibold dark:text-white sm:text-left">Vaccine List</p>
                {/* Consolidated filter controls into one flex container for responsive layout */}
                <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                    <div className="flex flex-grow-0 flex-wrap items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search vaccines..."
                            className="input input-sm w-64 rounded-md border px-3 py-1 text-sm font-light dark:bg-slate-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

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
                        {/* Page size selector - Kept "dikit" to "To" date picker by remaining in the same flex container */}
                        <label
                            htmlFor="itemsPerPage"
                            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Show:
                        </label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="input input-xs w-20 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            aria-label="Items per page"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>

                        <span className="text-sm text-gray-700 dark:text-gray-300">vaccines per page</span>
                    </div>
                </div>
            </div>

            {/* This Add button is only visible on small screens (hidden on sm and above) */}
            <div className="mb-4 flex w-full justify-center sm:hidden">
                <button
                    onClick={openAddModal}
                    className="flex w-full max-w-[200px] items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add Vaccine
                </button>
            </div>

            <div className="card-body p-0">
                <div className="relative w-full overflow-auto">
                    <div className="hidden sm:block">
                        <table className="table w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                                <tr>
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Description</th>
                                    <th className="p-3 text-left">Stock</th>
                                    <th className="p-3 text-left">Dosage</th>
                                    <th className="p-3 text-left">Brand/Expiration</th>
                                    <th className="p-3 text-left">Created At</th>
                                    <th className="p-3 text-left">
                                        <button
                                            onClick={openAddModal}
                                            className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                            title="Add Vaccine"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVaccines.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-4 text-center dark:text-gray-300"
                                        >
                                            No vaccines found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentVaccines.map((item, index) => (
                                        <tr
                                            key={item.name}
                                            className="border-b dark:border-gray-700 dark:text-white"
                                        >
                                            <td className="p-3 align-top">{indexOfFirst + index + 1}</td>
                                            <td className="p-3 align-top capitalize">{item.name}</td>
                                            <td className="p-3 align-top capitalize">{item.description}</td>
                                            <td className="p-3 align-top">{item.totalStock}</td>
                                            <td className="p-3 align-top">{item.dosage}</td>
                                            <td className="p-3 align-top">
                                                {item.details?.length > 0 ? (
                                                    item.details.map((detail, i) => <div key={i}>{detail.label}</div>)
                                                ) : (
                                                    <span>No Details</span>
                                                )}
                                            </td>
                                            <td className="p-3 align-top">{formatDate(item.createdAt)}</td>
                                            <td className="p-3 align-top">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openUpdateModal(item)}
                                                        className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                        title="Edit Stock"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    {role !== "BHW" && (
                                                        <button
                                                            onClick={() => openDeleteModal(item)}
                                                            className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                            title="Delete Stock"
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

                    {/* Card layout for mobile screens */}
                    <div className="grid grid-cols-1 gap-4 p-2 sm:hidden">
                        {currentVaccines.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No vaccines found.</div>
                        ) : (
                            currentVaccines.map((item) => (
                                <div
                                    key={item._id}
                                    className="rounded-md border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    <h3 className="text-lg font-semibold">{item.name}</h3>
                                    <p>{item.description}</p>
                                    <p>
                                        <strong>Stock:</strong> {item.totalStock}
                                    </p>
                                    <p>
                                        <strong>Dosage:</strong> {item.dosage}
                                    </p>
                                    <p>
                                        <strong>Created At:</strong> {formatDate(item.createdAt)}
                                    </p>
                                    <div className="mt-1 text-sm">
                                        {item.details?.map((detail, i) => (
                                            <p key={i}>
                                                <strong>Batch:</strong> {detail.label} (Stock: {detail.stock})
                                            </p>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => openUpdateModal(item)}
                                            className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        {role !== "BHW" && (
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                                                title="Delete Stock"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {totalPages > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm dark:border-gray-700 dark:text-gray-300 sm:flex-row">
                        <button
                            className={`rounded-md px-3 py-1.5 text-sm ${currentPage === 1 ? "text-gray-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages} • {groupedAndFilteredVaccines.length} vaccines
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
                    isAddStock={true}
                    vaccine={null}
                    onClose={handleCloseAllModals}
                />
                <UpdateFormModal
                    isOpen={isUpdateFormOpen}
                    vaccine={selectedVaccine}
                    onClose={handleCloseAllModals}
                />
                <DeleteForm
                    vaccine={selectedVaccine}
                    isOpen={isDeleteFormOpen}
                    onClose={handleCloseAllModals}
                />
            </div>
        </div>
    );
}

export default VaccineTable;
