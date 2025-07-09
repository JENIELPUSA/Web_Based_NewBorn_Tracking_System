import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserFormModal from "../Vaccine/AddVacine"; // Assuming this is your AddVacine component

function VaccineForm({ vaccine, isOpen, onClose, DataDelete }) {
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [selectedBatchData, setSelectedBatchData] = useState(null);
    const [isAddFormOpen, setAddFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        selectedBatch: "",
        expirationDate: "",
        stock: 0,
        brandId: "", // To store the actual brand ID
        brandName: "", // To store the brand name for display/lookup
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dropdownOpenBatch, setDropdownOpenBatch] = useState(false);

    // Helper function to parse the label and extract both brand name and expiration date
    const parseBatchLabel = (label) => {
        if (!label) return { brandName: "", expirationDate: "" };

        // Regex to extract brand name (text inside first parenthesis)
        const brandMatch = label.match(/\(([^)]+)\)/);
        const brandName = brandMatch ? brandMatch[1] : "";

        // Regex to extract expiration date (YYYY-MM-DD format)
        const dateMatch = label.match(/(\d{4}-\d{2}-\d{2})/);
        const expirationDate = dateMatch ? dateMatch[1] : ""; // This will be "YYYY-MM-DD"

        return { brandName, expirationDate };
    };

    useEffect(() => {
        if (vaccine && vaccine.details && vaccine.details.length > 0) {
            const firstBatch = vaccine.details[0];
            const { brandName, expirationDate } = parseBatchLabel(firstBatch?.label);

            setFormData({
                selectedBatch: firstBatch?.batchID || "",
                expirationDate: expirationDate || "",
                stock: firstBatch?.stock || 0,
                brandName: brandName || "",
                // IMPORTANT: We cannot get brandId here directly from label.
                // AddVacine will need to do the lookup using brandName.
                brandId: "", // Set this to empty or null for now
            });
            setError(null);
        } else {
            setFormData({
                selectedBatch: "",
                expirationDate: "",
                stock: 0,
                brandId: "",
                brandName: "",
            });
        }
    }, [vaccine]);

    const handleBatchSelect = (batchID) => {
        const selectedBatch = vaccine?.details.find((batch) => batch.batchID === batchID);
        if (selectedBatch) {
            const { brandName, expirationDate } = parseBatchLabel(selectedBatch.label);

            setFormData((prev) => ({
                ...prev,
                selectedBatch: batchID,
                expirationDate,
                stock: selectedBatch.stock || 0,
                brandName,
                // brandId remains empty here, AddVacine will lookup
            }));
        }
        setDropdownOpenBatch(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSelectedVaccine(vaccine); // Pass the main vaccine object

        // Construct the bybatch object correctly for AddVacine
        setSelectedBatchData({
            _id: formData.selectedBatch, // This is the actual batch ID
            expirationDate: formData.expirationDate, // Now a proper "YYYY-MM-DD" string
            stock: formData.stock,
            brandName: formData.brandName, // Pass the brand name, AddVacine will convert to ID
        });

        setAddFormOpen(true);
        console.log("VaccineForm - Data passed to AddVacine:", {
            _id: formData.selectedBatch,
            expirationDate: formData.expirationDate,
            stock: formData.stock,
            brandName: formData.brandName,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">Update Vaccine Batch</h2>
                {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Batch Selection Dropdown */}
                    <div className="relative w-full">
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Select Batch</label>
                        <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            onClick={() => setDropdownOpenBatch(!dropdownOpenBatch)}
                        >
                            <span>
                                {formData.selectedBatch
                                    ? vaccine?.details.find(b => b.batchID === formData.selectedBatch)?.label || `Batch ${formData.selectedBatch}`
                                    : "Select Batch"}
                            </span>
                            <i className={`fas ${dropdownOpenBatch ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                        </div>
                        {dropdownOpenBatch && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                {vaccine?.details?.map((detail, index) => (
                                    <li
                                        key={`${detail.batchID}-${index}`}
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                        onClick={() => handleBatchSelect(detail.batchID)}
                                    >
                                        {detail.label || `Batch ${detail.batchID}`}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Expiration Date Display (Read-only) */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Expiration Date</label>
                        <input
                            type="date"
                            name="expirationDate"
                            value={formData.expirationDate}
                            readOnly
                            className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        />
                    </div>

                    {/* Brand Name Display (Read-only) */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Brand Name</label>
                        <input
                            type="text"
                            name="brandName" // Use brandName here
                            value={formData.brandName}
                            readOnly
                            className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        />
                    </div>

                    {/* Stock Display (Read-only) */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            readOnly
                            className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-pink-700 dark:bg-red-700 dark:hover:bg-pink-800"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    &times;
                </button>
            </motion.div>

            <UserFormModal
                isOpen={isAddFormOpen}
                vaccine={selectedVaccine}
                bybatch={selectedBatchData}
                onClose={() => setAddFormOpen(false)}
            />
        </div>
    );
}

export default VaccineForm;