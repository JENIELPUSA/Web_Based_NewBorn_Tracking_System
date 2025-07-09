import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { VisitRecordContexts } from "../../contexts/VisitRecordContext/VisitRecordContext";
import { AuthContext } from "../../contexts/AuthContext";
function CheckupRecordForm({ isOpen, onClose, recordData, newbornData }) {
    const { userId } = useContext(AuthContext);
    const { AddVisit, UpdateVisit } = useContext(VisitRecordContexts);
    const currentNewbornId = newbornData?._id || recordData?.newborn || "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        newborn: currentNewbornId,
        visitDate: new Date().toISOString().split("T")[0],
        weight: "",
        height: "",
        health_condition: "",
        notes: "",
        addedBy: "",
    });

    const [customError, setCustomError] = useState(null);

    useEffect(() => {
        if (recordData) {
            setFormData({
                newborn: recordData.newborn || currentNewbornId,
                visitDate: recordData.visitDate ? new Date(recordData.visitDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                weight: recordData.weight || "",
                height: recordData.height || "",
                health_condition: recordData.health_condition || "",
                notes: recordData.notes || "",
                addedBy: recordData.addedBy || "",
            });
        } else {
            setFormData({
                newborn: currentNewbornId,
                visitDate: new Date().toISOString().split("T")[0],
                weight: "",
                height: "",
                health_condition: "",
                notes: "",
                addedBy: userId,
            });
        }
        setCustomError(null);
    }, [recordData, newbornData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setCustomError(null);

        if (!formData.newborn) {
            setCustomError("Newborn ID is missing. Please ensure the form is linked correctly.");
            return;
        }
        if (!formData.visitDate) {
            setCustomError("Visit Date is required.");
            return;
        }
        if (!formData.weight && !formData.height && !formData.health_condition && !formData.notes) {
            setCustomError("Please fill in at least one checkup detail (Weight, Height, Health Condition, or Notes).");
            return;
        }

        setIsSubmitting(true);

        try {
            if (recordData) {
                // Call UpdateVisit with ID and formData
                await UpdateVisit(recordData._id, formData);
            } else {
                // Call AddVisit normally
                await AddVisit(formData);
            }
            // 👇 Call onClose after successful submission
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
            setCustomError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
                    {recordData ? "Edit Checkup Record" : "Add New Checkup Record"}
                </h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                        {customError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label
                            htmlFor="visitDate"
                            className="mb-1 block text-sm text-slate-600 dark:text-slate-200"
                        >
                            Visit Date
                        </label>
                        <input
                            type="date"
                            id="visitDate"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="weight"
                            className="mb-1 block text-sm text-slate-600 dark:text-slate-200"
                        >
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            placeholder="e.g., 3.5"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="height"
                            className="mb-1 block text-sm text-slate-600 dark:text-slate-200"
                        >
                            Height (cm)
                        </label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            placeholder="e.g., 50.2"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="health_condition"
                            className="mb-1 block text-sm text-slate-600 dark:text-slate-200"
                        >
                            Health Condition
                        </label>
                        <textarea
                            id="health_condition"
                            name="health_condition"
                            value={formData.health_condition}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            placeholder="Describe the newborn's health condition (e.g., 'Healthy', 'Mild cough', 'Follow-up needed')"
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div>
                        <label
                            htmlFor="notes"
                            className="mb-1 block text-sm text-slate-600 dark:text-slate-200"
                        >
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            placeholder="Any additional notes or observations"
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2 font-medium text-white transition duration-200 ${
                                isSubmitting
                                    ? "cursor-not-allowed bg-pink-400 dark:bg-red-500"
                                    : "bg-red-600 hover:bg-pink-700 dark:bg-red-700 dark:hover:bg-pink-800"
                            }`}
                        >
                            {isSubmitting && (
                                <svg
                                    className="h-4 w-4 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                    />
                                </svg>
                            )}
                            {isSubmitting ? (recordData ? "Updating..." : "Adding...") : recordData ? "Update Record" : "Add Record"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default CheckupRecordForm;