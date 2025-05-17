import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserFormModal from "../Vaccine/AddVacine";

function VaccineForm({ vaccine, isOpen, onClose,DataDelete }) {
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "selectedBatch") {
            const selectedBatch = vaccine?.details.find((batch) => batch.batchID === value);
            const expirationDate = selectedBatch ? extractExpirationDate(selectedBatch.label) : "";
            const stock = selectedBatch?.stock || 0;

            setFormData((prev) => ({
                ...prev,
                selectedBatch: value,
                expirationDate,
                stock,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

    
    };

        console.log("DELETE",DataDelete?._id)

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

                {loading && <div className="flex h-20 items-center justify-center text-gray-600">Loading vaccine data...</div>}
                {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="selectedBatch"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Select Batch
                        </label>
                        <select
                            id="selectedBatch"
                            name="selectedBatch"
                            value={formData.selectedBatch}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                            {vaccine?.details?.map((detail, index) => (
                                <option
                                    key={`${detail.batchID}-${index}`}
                                    value={detail.batchID}
                                >
                                    {detail.label || `Batch ${detail.batchID}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="expirationDate"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Expiration Date
                        </label>
                        <input
                            type="date"
                            id="expirationDate"
                            name="expirationDate"
                            value={formData.expirationDate}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="stock"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Stock
                        </label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 text-2xl text-gray-500 hover:text-gray-700"
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
