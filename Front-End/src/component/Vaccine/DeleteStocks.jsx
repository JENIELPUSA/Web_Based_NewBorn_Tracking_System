import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";

function DeleteForm({ vaccine, isOpen, onClose }) {
    const { DeleteData } = useContext(VaccineDisplayContext);

    const [formData, setFormData] = useState({
        selectedBatch: "",
        expirationDate: "",
        stock: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!vaccine || !vaccine.details || vaccine.details.length === 0) return;

        // Reset form with no selection
        setFormData({
            selectedBatch: "",
            expirationDate: "",
            stock: 0,
        });

        setLoading(false);
    }, [vaccine]);

    const extractExpirationDate = (label) => {
        if (!label) return "";
        const matches = label.match(/\(([^)]+)\)/);
        return matches ? matches[1] : "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "selectedBatch") {
            const selectedBatch = vaccine.details.find((batch) => batch.batchID === value);
            const expirationDate = selectedBatch ? extractExpirationDate(selectedBatch.label) : "";
            const stock = selectedBatch?.stock || 0;

            setFormData((prev) => ({
                ...prev,
                selectedBatch: value,
                expirationDate,
                stock,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.selectedBatch) {
            setError("Please select a batch to delete.");
            return;
        }

        try {
            await DeleteData(vaccine._id, formData.selectedBatch);
            console.log("Deleted batch:", formData.selectedBatch);
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
            setError("Failed to delete vaccine batch.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 relative"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">Delete Vaccine Batch</h2>

                {loading && <div className="text-center text-gray-600">Loading...</div>}
                {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="selectedBatch" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
                            <option value="" disabled hidden>
                                Select Batch
                            </option>
                            {vaccine?.details?.map((detail, index) => (
                                <option key={`${detail.batchID}-${index}`} value={detail.batchID}>
                                    {detail.label || `Batch ${detail.batchID}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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
                            className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
                        >
                            Delete
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
        </div>
    );
}

export default DeleteForm;
