import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { AuthContext } from "../../contexts/AuthContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { VaccinePerContext } from "../../contexts/PerBabyVacine/PerBabyVacineContext";

function AddNewForm({ isOpen, onClose, onSubmit, record, newbordID, editDose, editData, idBorn }) {
    const { userId } = useContext(AuthContext);
    const { vaccine } = useContext(VaccineDisplayContext);
    const { AssignVaccine, UpdateContext } = useContext(VaccineRecordDisplayContext);
    const { AddAssignedVaccine, UpdateAssign, customError } = useContext(VaccinePerContext);
    const [selectedDosage, setSelectedDosage] = useState("");
    const [dropdownOpenVaccine, setDropdownOpenVaccine] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        userId: userId,
        newborn: idBorn || "",
        vaccine: "",
        totalDoses: "",
    });

    const clear = () => {
        setFormData({
            newborn: "",
            vaccine: "",
            totalDoses: "",
        });
    };

    useEffect(() => {
        if (editData) {
            setFormData({
                newborn: idBorn || "",
                vaccine: editData.vaccine || "",
                totalDoses: editData.totalDoses || 0,
            });
            setSelectedDosage(editData.dosage || "");
        } else {
            setFormData({
                newborn: idBorn || "",
                vaccine: "",
                totalDoses: "",
            });
            setSelectedDosage("");
        }
    }, [editData, newbordID, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === "vaccine") {
            const selectedVaccine = vaccine.find((v) => v._id === value);
            setSelectedDosage(selectedVaccine?.dosage || "");
        }
    };

    const handleVaccineSelect = (vaccineId) => {
        if (editDose) return; // Prevent selection during edit mode
        setFormData((prev) => ({
            ...prev,
            vaccine: vaccineId,
        }));
        const selectedVaccine = vaccine.find((v) => v._id === vaccineId);
        setSelectedDosage(selectedVaccine?.dosage || "");
        setDropdownOpenVaccine(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editData) {
            const result = await UpdateAssign(editData, formData);
            if (result?.success === true) {
                clear();
                onClose();
            }
        } else {
            const result = await AddAssignedVaccine(formData, idBorn);
            if (result?.success === true) {
                clear();
                onClose();
            }
        }

        setIsSubmitting(false);
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
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
                    {editData ? "Edit Vaccination Record" : "Add Vaccination Record"}
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
                    {/* Custom Vaccine Dropdown */}
                    <div className="relative w-full">
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Vaccine</label>
                        {editDose ? (
                            <div className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {vaccine.find((v) => v._id === formData.vaccine)?.name || "Selected Vaccine"}
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 ${editData ? "cursor-not-allowed" : ""}`}
                                    onClick={() => !editData && setDropdownOpenVaccine(!dropdownOpenVaccine)}
                                >
                                    <span>
                                        {formData.vaccine
                                            ? vaccine.find((v) => v._id === formData.vaccine)?.name || "Select Vaccine"
                                            : "Select Vaccine"}
                                    </span>
                                    <i className={`fas ${dropdownOpenVaccine ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                                </div>
                                {dropdownOpenVaccine && (
                                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                        <li
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-slate-600"
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
                                                className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
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

                    {/* Dosage Field (read-only) */}
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

                    {/* Total Doses Field */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Total Doses</label>
                        <input
                            type="number"
                            name="totalDoses"
                            value={formData.totalDoses || ""}
                            onChange={handleChange}
                            required
                            min="1"
                            className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 ${editData ? "cursor-not-allowed" : ""}`}
                            placeholder="Enter total number of doses"
                        />
                    </div>
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
                            {isSubmitting ? (editData ? "Updating..." : "Submitting...") : editData ? "Update Record" : "Add Record"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddNewForm;
