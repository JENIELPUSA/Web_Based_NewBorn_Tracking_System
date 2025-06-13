import React, { useState, useContext, useMemo } from "react";
import { PencilIcon, TrashIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { BrandDisplayContext } from "../../contexts/BrandContext/BrandContext";
import BrandForm from "../Brand/BrandForm";
import StatusVerification from "../../ReusableFolder/StatusModal";

function BrandTable() {
    const { isBrand, DeleteBrand } = useContext(BrandDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormBrand, setFormBrand] = useState(false);
    const [ispassData, setPassdata] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setDeleteID] = useState(null);

    const brandsPerPage = 5;

    const filteredBrands = useMemo(() => {
        return (isBrand || []).filter((brand) =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [isBrand, searchTerm]);

    const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
    const indexOfLastBrand = currentPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "B";

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

    return (
        <div className="rounded-lg bg-white shadow dark:bg-gray-900 xs:p-2 sm:p-6">
            {/* Header with title and button */}
            <div className="flex flex-col gap-4 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Brand List</h2>
                    <button
                        onClick={handleAddBrand}
                        className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                        title="Add Brand"
                    >
                        <Plus className="h-4 w-4" />
                        Add Brand
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search brands by name..."
                        className="input input-sm w-full rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white md:w-56"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
                <table className="table min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Created At</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBrands.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">
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
                                    className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    <td className="p-3 align-top">{indexOfFirstBrand + index + 1}</td>
                                    <td className="p-3 align-top">{brand.name}</td>
                                    <td className="p-3 align-top">{formatDate(brand.createdAt)}</td>
                                    <td className="p-3 align-top">
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUserSelect(brand)}
                                                className="rounded bg-blue-500 p-1.5 text-white hover:bg-blue-600"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDeleteUser(brand._id)}
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

            {/* Mobile view */}
            <div className="mt-4 space-y-4 sm:hidden">
                {currentBrands.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">No brands found.</div>
                ) : (
                    currentBrands.map((brand) => (
                        <div
                            key={brand._id}
                            className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                                    {getInitial(brand.name)}
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">{brand.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">ID: {brand._id}</p>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                <p><span className="font-semibold">Created:</span> {formatDate(brand.createdAt)}</p>
                                <p><span className="font-semibold">Last Updated:</span> {formatDate(brand.updatedAt)}</p>
                            </div>
                        </div>
                    ))
                )}

                {/* Mobile Add Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleAddBrand}
                        className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <Plus className="h-4 w-4" />
                        Add Brand
                    </button>
                </div>
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
                        Page {currentPage} of {totalPages} • {filteredBrands.length} brands
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
