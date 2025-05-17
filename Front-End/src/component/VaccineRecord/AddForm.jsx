import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { AuthContext } from "../../contexts/AuthContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function AddForm({ isOpen, onClose, onSubmit, record, newbordID }) {
    const { userId } = useContext(AuthContext);
    const { vaccine } = useContext(VaccineDisplayContext);
    const { AssignVaccine } = useContext(VaccineRecordDisplayContext);

    const [formData, setFormData] = useState({
        newborn: newbordID || "",
        vaccine: "",
        administeredBy: userId || "",
        dateGiven: "",
        next_due_date: "",
        numberOfDose: 1,
        status: "",
        remarks: "",
    });

    const [customError, setCustomError] = useState("");
    const [selectedDosage, setSelectedDosage] = useState("");

    useEffect(() => {
        if (record) {
            setFormData({
                ...record,
                vaccine: record.vaccine || "",
                status: record.status || "",
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                newborn: newbordID || "",
                administeredBy: userId || "",
            }));
        }
    }, [record, newbordID, userId]);

    useEffect(() => {
        const selected = vaccine.find((v) => v._id === formData.vaccine);
        if (selected) {
            setSelectedDosage(selected.dosage || "");
        } else {
            setSelectedDosage("");
        }
    }, [formData.vaccine, vaccine]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        await AssignVaccine(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
                    {record ? "Edit Vaccination Record" : "Add Vaccination Record"}
                </h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                        {customError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vaccine Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Vaccine</label>
                        <select
                            name="vaccine"
                            value={formData.vaccine}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        >
                            <option value="">Select Vaccine</option>
                            {vaccine.map((v) => (
                                <option key={v._id} value={v._id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dosage (Readonly Textbox) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Dosage</label>
                        <input
                            type="text"
                            value={selectedDosage}
                            readOnly
                            className="mt-1 w-full rounded-lg border px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
                            placeholder="Dosage will appear here..."
                        />
                    </div>

                    {/* Date Given */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date Given</label>
                        <input
                            type="date"
                            name="dateGiven"
                            value={formData.dateGiven}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    {/* Next Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Next Due Date</label>
                        <input
                            type="date"
                            name="next_due_date"
                            value={formData.next_due_date}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        >
                            <option value="">Select Status</option>
                            <option value="On-Time">On-Time</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Missed">Missed</option>
                        </select>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            {record ? "Update Record" : "Add Record"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddForm;
