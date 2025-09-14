import React, { useState, useContext, useMemo, useEffect } from "react";
import { BrandDisplayContext } from "../../contexts/BrandContext/BrandContext"; // <- AYUSIN ITO KUNG MALI
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import BrandForm from "../Brand/BrandForm"; // <- AYUSIN ITO KUNG MALI
import StatusVerification from "../../ReusableFolder/StatusModal"; // <- AYUSIN ITO KUNG MALI

function BrandTable() {
    const { isBrand, DeleteBrand } = useContext(BrandDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // State for number of items per page
    const [dateFrom, setDateFrom] = useState(""); // State for 'created at' date filter start
    const [dateTo, setDateTo] = useState(""); // State for 'created at' date filter end

    const [isFormBrand, setFormBrand] = useState(false);
    const [ispassData, setPassdata] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setDeleteID] = useState(null);
    const filteredBrands = useMemo(() => {
        const data = Array.isArray(isBrand) ? isBrand : [];
        return data.filter((brand) => {
            const matchesSearchTerm = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesDateRange = true;
            if (brand.createdAt) {
                const brandCreatedAtDate = new Date(brand.createdAt);
                brandCreatedAtDate.setHours(0, 0, 0, 0);

                if (dateFrom) {
                    const fromDateObj = new Date(dateFrom);
                    fromDateObj.setHours(0, 0, 0, 0);
                    matchesDateRange = matchesDateRange && brandCreatedAtDate >= fromDateObj;
                }
                if (dateTo) {
                    const toDateObj = new Date(dateTo);
                    toDateObj.setHours(23, 59, 59, 999);
                    matchesDateRange = matchesDateRange && brandCreatedAtDate <= toDateObj;
                }
            } else if (dateFrom || dateTo) {
                matchesDateRange = false;
            }

            return matchesSearchTerm && matchesDateRange;
        });
    }, [isBrand, searchTerm, dateFrom, dateTo]);

    const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
    const indexOfLastBrand = currentPage * itemsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - itemsPerPage;
    const currentBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);

    useEffect(() => {
        const newTotalPages = Math.ceil(filteredBrands.length / itemsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (filteredBrands.length > 0 && currentBrands.length === 0 && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        } else if (filteredBrands.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filteredBrands.length, currentPage, itemsPerPage, currentBrands.length]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "B");

    const handleAddBrand = () => {
        setFormBrand(true);
        setPassdata("");
    };

    const onUserSelect = (data) => {
        setFormBrand(true);
        setPassdata(data);
    };

    const handleDeleteUser = (id) => {
        setDeleteID(id);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        if (isDeleteID) {
            await DeleteBrand(isDeleteID);
            setDeleteID(null);
            setVerification(false);
        }
    };

    const handleCloseModal = () => {
            setVerification(false);
            setFormBrand(false);
            setPassdata("");
            setDeleteID(null);
    };

    const handleItemsPerPageChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setItemsPerPage(isNaN(value) || value < 1 ? 5 : value);
        setCurrentPage(1);
    };

    return (
        <div className="rounded-lg bg-white shadow xs:p-2 sm:p-6">
            <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Brand List</h2>
                {/* Consolidated filter controls into one flex container for responsive layout */}
                <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search brands by name..."
                        className="input input-sm min-w-[180px] flex-grow rounded-md border border-gray-300 px-3 py-1 text-sm md:min-w-0"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {/* Date filter inputs */}
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
                            className="input input-xs w-32 text-gray-500 rounded-md border border-gray-300 px-2 py-1 text-sm md:w-auto"
                            title="Filter by 'Created At' date (From)"
                        />
                        <label
                            htmlFor="dateTo"
                            className="text-sm font-medium text-gray-700"
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
                            className="input input-xs w-32 text-gray-500 rounded-md border border-gray-300 px-2 py-1 text-sm md:w-auto"
                            title="Filter by 'Created At' date (To)"
                        />
                    </div>
                    {/* Page size selector */}
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
                            className="input input-xs w-16 rounded-md border border-gray-300 px-2 py-1 text-gray-500 text-center text-sm"
                            aria-label="Items per page"
                        />
                        <span className="text-sm text-gray-700">brands per page</span>
                    </div>
                </div>
            </div>

            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-gray-500">#</th>
                            <th className="p-3 text-left text-gray-500">Name</th>
                            <th className="p-3 text-left text-gray-500">Created At</th>
                            <th className="p-3 text-left text-gray-500">
                                <button
                                    onClick={handleAddBrand}
                                    className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                    title="Add Brand"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBrands.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="p-4 text-center text-gray-500"
                                >
                                    No brands found.
                                </td>
                            </tr>
                        ) : (
                            currentBrands.map((brand, index) => (
                                <motion.tr
                                    key={brand._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="p-3 align-top text-gray-500">{indexOfFirstBrand + index + 1}</td>
                                    <td className="p-3 align-top text-gray-500">{brand.name}</td>
                                    <td className="p-3 align-top text-gray-500">{formatDate(brand.createdAt)}</td>
                                    <td className="p-3 align-top">
                                        <div className="flex flex-wrap gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUserSelect(brand)}
                                                className="shrink-0 rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteUser(brand._id)}
                                                className="shrink-0 rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
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

            {/* Mobile view */}
            <div className="mt-4 space-y-4 sm:hidden">
                <button
                    onClick={handleAddBrand}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    <Plus className="h-5 w-5" />
                    Add Brand
                </button>

                {currentBrands.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No brands found.</div>
                ) : (
                    currentBrands.map((brand) => (
                        <div
                            key={brand._id}
                            className="rounded-lg border p-4 shadow-sm"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                                        {getInitial(brand.name)}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-800">{brand.name}</h4>
                                        <p className="text-sm text-gray-500">Created: {formatDate(brand.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onUserSelect(brand)}
                                        className="shrink-0 rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                        title="Edit"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDeleteUser(brand._id)}
                                        className="shrink-0 rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                        title="Delete"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                {totalPages > 0 && (
                    <div className="flex items-center gap-4">
                        <button
                            className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed text-gray-400"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages} • {filteredBrands.length} brands
                        </span>
                        <button
                            className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed text-gray-400"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <BrandForm
                isOpen={isFormBrand}
                onClose={handleCloseModal}
                BrandData={ispassData}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default BrandTable;