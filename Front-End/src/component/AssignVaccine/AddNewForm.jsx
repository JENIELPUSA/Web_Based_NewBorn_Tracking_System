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
    const [isSubmitting, setIsSubmitting] = useState(false); // Ito na ang loading state

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
        setSelectedDosage("");
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
            clear();
        }
    }, [editData, newbordID, userId, idBorn]); // Idinagdag ang idBorn sa dependency array

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
        if (editDose) return;
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
        if (isSubmitting) return; // Pigilan ang multiple submit habang loading

        // Optional: Client-side validation bago mag-submit
        if (!formData.vaccine || !formData.totalDoses || formData.totalDoses <= 0) {
            // Maaari kang magpakita ng error message dito, halimbawa:
            // setCustomError("Please select a vaccine and enter a valid number of doses (at least 1).");
            return;
        }

        setIsSubmitting(true); // Simulan ang loading state
        let result;

        try {
            if (editData) {
                result = await UpdateAssign(editData, formData);
            } else {
                result = await AddAssignedVaccine(formData, idBorn);
            }

            if (result?.success === true) {
                clear();
                onClose();
            }
            // Kung may error sa customError mula sa context, mananatili itong display
            // at hindi magsasara ang form.
        } catch (error) {
            console.error("Submission error:", error);
            // Maaari kang mag-handle ng generic error dito kung kailangan.
        } finally {
            setIsSubmitting(false); // Tapusin ang loading state, kahit may error man o wala
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    {editData ? "Edit Vaccination Record" : "Add Vaccination Record"}
                </h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                        {customError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vaccine Dropdown */}
                    <div className="relative w-full">
                        <label className="mb-1 block text-sm text-slate-600">Vaccine</label>
                        {editDose ? (
                            <div className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                                {vaccine.find((v) => v._id === formData.vaccine)?.name || "Selected Vaccine"}
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400 ${editData ? "cursor-not-allowed opacity-70" : ""}`}
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
                                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg">
                                        <li
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100"
                                            onClick={() => handleVaccineSelect("")}
                                        >
                                            Select Vaccine
                                        </li>
                                        {vaccine.map((v) => (
                                            <li
                                                key={v._id}
                                                className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100"
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

                    {/* Dosage */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600">Dosage</label>
                        <input
                            type="text"
                            value={selectedDosage}
                            readOnly
                            className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                            placeholder="Dosage will appear here..."
                        />
                    </div>

                    {/* Total Doses */}
                    <div>
                        <label className="mb-1 block text-sm text-slate-600">Total Doses</label>
                        <input
                            type="number"
                            name="totalDoses"
                            value={formData.totalDoses || ""}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter total number of doses"
                            disabled={isSubmitting} // Disable input while submitting
                        />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400"
                            disabled={isSubmitting} // Disable cancel button while submitting
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting} // Disable submit button while submitting
                            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2 font-medium text-white transition duration-200 ${
                                isSubmitting
                                    ? "cursor-not-allowed bg-pink-400" // Grey out or change color
                                    : "bg-[#7B8D6A] hover:bg-[#7B8D6A]/60"
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
                            {isSubmitting ? (editData ? "Updating..." : "Adding...") : editData ? "Update Record" : "Add Record"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddNewForm;