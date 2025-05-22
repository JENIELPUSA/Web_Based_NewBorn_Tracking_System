import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { AuthContext } from "../../contexts/AuthContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

function AddForm({ isOpen, onClose, onSubmit, record, newbordID, editDose, dataAssign }) {
    const { userId } = useContext(AuthContext);
    const { vaccine } = useContext(VaccineDisplayContext);
    const { AssignVaccine, UpdateContext } = useContext(VaccineRecordDisplayContext);

    const [customError, setCustomError] = useState("");
    const [selectedDosage, setSelectedDosage] = useState("");
    const [dropdownOpenVaccine, setDropdownOpenVaccine] = useState(false);
    const [dropdownOpenStatus, setDropdownOpenStatus] = useState(false);

    const [formData, setFormData] = useState({
        newborn: newbordID || "",
        vaccine: "",
        administeredBy: userId || "",
        dateGiven: "",
        next_due_date: "",
        numberOfDose: 1,
        status: "",
        remarks: "",
        doseId: "",
    });

    useEffect(() => {
        if (editDose) {
            setFormData({
                dateGiven: editDose.dateGiven ? new Date(editDose.dateGiven).toISOString().slice(0, 10) : "",
                next_due_date: editDose.next_due_date ? new Date(editDose.next_due_date).toISOString().slice(0, 10) : "",
                numberOfDose: editDose.numberOfDose || 1,
                status: editDose.status || "",
                remarks: editDose.remarks || "",
                doseId: editDose._id || "",
            });
            setSelectedDosage(editDose.dosage || "");
        } else {
            setFormData({
                newborn: newbordID || "",
                vaccine: "",
                administeredBy: userId || "",
                dateGiven: "",
                next_due_date: "",
                numberOfDose: 1,
                status: "",
                remarks: "",
                doseId: "",
            });
            setSelectedDosage("");
        }
    }, [editDose, newbordID, userId]);

    const handleVaccineSelect = (vaccineId) => {
        setFormData(prev => ({
            ...prev,
            vaccine: vaccineId
        }));
        const selectedVaccine = vaccine.find((v) => v._id === vaccineId);
        setSelectedDosage(selectedVaccine?.dosage || "");
        setDropdownOpenVaccine(false);
    };

    const handleStatusSelect = (status) => {
        setFormData(prev => ({
            ...prev,
            status: status
        }));
        setDropdownOpenStatus(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editDose) {
            console.log("Updating ID:", formData);
            await UpdateContext(formData, dataAssign._id, formData._id);
        } else {
            console.log("Form Data:", formData);
            await AssignVaccine(formData);
        }
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
                    {editDose ? "Edit Vaccination Record" : "Add Vaccination Record"}
                </h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                        {customError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Vaccine Field */}
                        <div className="relative">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Vaccine</label>
                            {editDose ? (
                                <input
                                    type="text"
                                    value={record?.vaccineName || vaccine.find((v) => v._id === formData.vaccine)?.name || ""}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                />
                            ) : (
                                <>
                                    <div
                                        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                        onClick={() => setDropdownOpenVaccine(!dropdownOpenVaccine)}
                                    >
                                        <span>
                                            {formData.vaccine
                                                ? vaccine.find(v => v._id === formData.vaccine)?.name || "Select Vaccine"
                                                : "Select Vaccine"}
                                        </span>
                                        <i className={`fas ${dropdownOpenVaccine ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                                    </div>
                                    {dropdownOpenVaccine && (
                                        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                            <li
                                                className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                                onClick={() => {
                                                    handleVaccineSelect("");
                                                    setDropdownOpenVaccine(false);
                                                }}
                                            >
                                                Select Vaccine
                                            </li>
                                            {vaccine.map((v) => (
                                                <li
                                                    key={v._id}
                                                    className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                                    onClick={() => handleVaccineSelect(v._id)}
                                                >
                                                    {v.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Dosage Field */}
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Dosage</label>
                            <input
                                type="text"
                                value={selectedDosage}
                                readOnly
                                className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                placeholder={editDose ? "Dosage cannot be changed" : "Dosage will appear here..."}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date Given */}
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Date Given</label>
                            <input
                                type="date"
                                name="dateGiven"
                                value={formData.dateGiven}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>

                        {/* Next Due Date */}
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Next Due Date</label>
                            <input
                                type="date"
                                name="next_due_date"
                                value={formData.next_due_date}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Status</label>
                        <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            onClick={() => setDropdownOpenStatus(!dropdownOpenStatus)}
                        >
                            <span>{formData.status || "Select Status"}</span>
                            <i className={`fas ${dropdownOpenStatus ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                        </div>
                        {dropdownOpenStatus && (
                            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                <li
                                    className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    onClick={() => handleStatusSelect("")}
                                >
                                    Select Status
                                </li>
                                <li
                                    className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    onClick={() => handleStatusSelect("On-Time")}
                                >
                                    On-Time
                                </li>
                                <li
                                    className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    onClick={() => handleStatusSelect("Delayed")}
                                >
                                    Delayed
                                </li>
                                <li
                                    className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                    onClick={() => handleStatusSelect("Missed")}
                                >
                                    Missed
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            {editDose ? "Update Record" : "Add Record"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddForm;