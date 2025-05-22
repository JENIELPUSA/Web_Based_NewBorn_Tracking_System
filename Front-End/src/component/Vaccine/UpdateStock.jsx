import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserFormModal from "../Vaccine/AddVacine";

function VaccineForm({ vaccine, isOpen, onClose, DataDelete }) {
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [selectedbacth, setSelectedBatch] = useState(null);
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        selectedBatch: "",
        expirationDate: "",
        stock: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dropdownOpenBatch, setDropdownOpenBatch] = useState(false);

    useEffect(() => {
        const firstBatch = vaccine?.details[0];
        const expirationDate = extractExpirationDate(firstBatch?.label);

        setFormData({
            selectedBatch: firstBatch?.batchID,
            expirationDate: expirationDate || "",
            stock: firstBatch?.stock || 0,
        });

        setError(null);
    }, [vaccine]);

    const extractExpirationDate = (label) => {
        if (!label) return "";
        const matches = label?.match(/\(([^)]+)\)/);
        return matches ? matches[1] : "";
    };

    const handleBatchSelect = (batchID) => {
        const selectedBatch = vaccine?.details.find((batch) => batch.batchID === batchID);
        const expirationDate = selectedBatch ? extractExpirationDate(selectedBatch.label) : "";
        const stock = selectedBatch?.stock || 0;

        setFormData((prev) => ({
            ...prev,
            selectedBatch: batchID,
            expirationDate,
            stock,
        }));
        setDropdownOpenBatch(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSelectedVaccine(vaccine);
        setAddFormOpen(true);
        setSelectedBatch(formData);
        console.log("Submitted Form Data:", formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">Update Vaccine Batch</h2>
                {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Custom Batch Dropdown */}
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
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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
                bybatch={selectedbacth}
                onClose={() => setAddFormOpen(false)}
            />
        </div>
    );
}

export default VaccineForm;