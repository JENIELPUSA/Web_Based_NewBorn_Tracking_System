import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, Search } from "lucide-react";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import { ProfillingContexts } from "../../contexts/ProfillingContext/ProfillingContext";

const NewbornFormModal = ({ onClose, selectedUser, isOpen }) => {
    const { newBorn } = useContext(NewBornDisplayContext);
    const { AddProf, UpdateProf, customError } = useContext(ProfillingContexts);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        newborn_id: "",
        newborn_name: "",
        blood_type: "",
        health_condition: "",
        notes: "",
    });

    const resetForm = () => {
        setFormData({
            newborn_id: "",
            newborn_name: "",
            blood_type: "",
            health_condition: "",
            notes: "",
        });
    };

    const [dropdownOpenNewborn, setDropdownOpenNewborn] = useState(false);
    const [searchNewborn, setSearchNewborn] = useState("");
    const [filteredNewborns, setFilteredNewborns] = useState([]);

    useEffect(() => {
        const filtered = newBorn.filter((nb) => {
            const fullName = `${nb.firstName} ${nb.middleName} ${nb.lastName}`.toLowerCase();
            return fullName.includes(searchNewborn.toLowerCase());
        });
        setFilteredNewborns(filtered);
    }, [searchNewborn, newBorn]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                _id: selectedUser._id || "",
                newborn_id: selectedUser.newborn_id || "",
                newborn_name: selectedUser.newborn_name || "",
                blood_type: selectedUser.blood_type || "",
                health_condition: selectedUser.latestHealthCondition || "",
                notes: selectedUser.latestNotes || "",
            });
        } else {
            resetForm();
            setSearchNewborn("");
        }
    }, [selectedUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectNewborn = (newborn) => {
        setFormData((prev) => ({
            ...prev,
            newborn_name: `${newborn.firstName} ${newborn.middleName} ${newborn.lastName}`,
            newborn_id: newborn._id,
        }));
        setDropdownOpenNewborn(false);
        setSearchNewborn(`${newborn.firstName} ${newborn.middleName} ${newborn.lastName}`);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                await UpdateProf(formData);
            } else {
                await AddProf(formData);
            }
            setTimeout(() => {
                resetForm();
                setIsSubmitting(false);
                onClose();
            }, 1000);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save data. Please try again.");
        }
    };

    if (!isOpen) return null;

    const isUpdateMode = !!selectedUser;

    return (
        <motion.div
            initial={{ opacity: 0, y: "-10%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-10%" }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            >
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isUpdateMode ? "Update Newborn Profile" : "Add Newborn Profile"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </div>

                <form className="grid grid-cols-1 gap-4">
                    {customError && (
                        <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                            {customError}
                        </div>
                    )}

                    {/* Newborn Dropdown */}
                    <div className="relative">
                        <label className="mb-1 block text-sm text-gray-600">Newborn Name</label>
                        <div
                            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${
                                isUpdateMode
                                    ? "cursor-not-allowed bg-gray-100"
                                    : "cursor-pointer bg-white"
                            } text-gray-700`}
                            onClick={() => {
                                if (!isUpdateMode) setDropdownOpenNewborn(!dropdownOpenNewborn);
                            }}
                        >
                            <span>{formData.newborn_name || "Select Newborn"}</span>
                            {!isUpdateMode && <ChevronDown className="h-4 w-4 text-gray-500" />}
                        </div>

                        {!isUpdateMode && dropdownOpenNewborn && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                                <div className="relative p-2">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search newborn..."
                                        value={searchNewborn}
                                        onChange={(e) => setSearchNewborn(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 bg-white py-1 pl-8 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                                <ul className="max-h-52 overflow-y-auto">
                                    {filteredNewborns.length > 0 ? (
                                        filteredNewborns.map((nb) => (
                                            <li
                                                key={nb._id}
                                                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                onClick={() => handleSelectNewborn(nb)}
                                            >
                                                <div className="text-sm font-medium">
                                                    {nb.firstName} {nb.middleName} {nb.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">Mother: {nb.motherName}</div>
                                                <div className="text-xs text-gray-500">Address: {nb.address}</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-sm text-gray-500">No newborns found.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">Blood Type</label>
                        <select
                            name="blood_type"
                            value={formData.blood_type}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Health Condition (only on add mode) */}
                    {!isUpdateMode && (
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Health Condition</label>
                            <input
                                type="text"
                                name="health_condition"
                                value={formData.health_condition}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Notes (only on add mode) */}
                    {!isUpdateMode && (
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Notes</label>
                            <textarea
                                rows={3}
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </form>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                Saving...
                            </div>
                        ) : isUpdateMode ? (
                            "Update Profile Info"
                        ) : (
                            "Save Profile"
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NewbornFormModal;