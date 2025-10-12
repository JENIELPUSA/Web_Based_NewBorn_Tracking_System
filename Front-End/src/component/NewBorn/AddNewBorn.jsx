import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { ParentDisplayContext } from "../../contexts/ParentContext/ParentContext";

function AddNewBorn({ isOpen, onClose, born }) {
    const { isParent } = useContext(ParentDisplayContext);
    const { userId, DesignatedZone, role } = useContext(AuthContext);
    const { AddNewBorn: addNewBornApi, UpdateBorn, customError } = useContext(NewBornDisplayContext);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOpenGender, setDropdownOpenGender] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        extensionName: "",
        dateOfBirth: "",
        gender: "",
        birthWeight: "",
        motherName: "",
        birthHeight: "",
        babyCodeNumber: "", // 👈 Added Baby Code Number
    });

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            middleName: "",
            dateOfBirth: "",
            extensionName: "",
            gender: "",
            birthWeight: "",
            motherName: "",
            birthHeight: "",
            babyCodeNumber: "", 
        });
    };

    useEffect(() => {
        if (born) {
            setFormData({
                firstName: born.firstName || "",
                middleName: born.middleName || "",
                lastName: born.lastName || "",
                extensionName: born.extensionName || "",
                dateOfBirth: born.dateOfBirth ? new Date(born.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: born.gender || "",
                birthWeight: born.birthWeight || "",
                motherName: born.motherID || born.motherName || "",
                birthHeight: born.birthHeight || "",
                babyCodeNumber: born.babyCodeNumber || "", // 👈 Populate when editing
            });
        } else {
            resetForm(); // Use resetForm to ensure consistency
        }
    }, [born]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelect = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "motherName") setDropdownOpen(false);
        if (name === "gender") setDropdownOpenGender(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (born) {
            await UpdateBorn(born._id, formData);
        } else {
            await addNewBornApi(formData, userId);
        }
        setTimeout(() => {
            resetForm();
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    {born ? "Edit Newborn Info" : "Add Newborn"}
                </h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">
                        {customError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First & Middle Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Middle Name</label>
                            <input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Last Name & DOB */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Extension Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Extension Name</label>
                            <input
                                type="text"
                                name="extensionName"
                                value={formData.extensionName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* 👇 Baby Code Number - NEW FIELD */}
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">Baby Code Number</label>
                        <input
                            type="text"
                            name="babyCodeNumber"
                            value={formData.babyCodeNumber}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. BC-2025-001"
                        />
                    </div>

                    {/* Gender & Birth Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="mb-1 block text-sm text-gray-600">Gender</label>
                            <div
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                                onClick={() => setDropdownOpenGender(!dropdownOpenGender)}
                            >
                                <span>{formData.gender || "Select Gender"}</span>
                                <i className={`fas ${dropdownOpenGender ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                            </div>
                            {dropdownOpenGender && (
                                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onClick={() => handleSelect("gender", "")}
                                    >
                                        Select Gender
                                    </li>
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onClick={() => handleSelect("gender", "Male")}
                                    >
                                        Male
                                    </li>
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                        onClick={() => handleSelect("gender", "Female")}
                                    >
                                        Female
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">Birth Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="birthWeight"
                                value={formData.birthWeight}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Mother's Name Dropdown */}
                    <div className="relative">
                        <label className="mb-1 block text-sm text-gray-600">Mother's Name</label>
                        <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span>
                                {formData.motherName
                                    ? isParent.find((parent) => parent._id === formData.motherName)?.FirstName +
                                      " " +
                                      isParent.find((parent) => parent._id === formData.motherName)?.LastName
                                    : "Select Mother"}
                            </span>
                            <i className={`fas ${dropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                        </div>
                        {dropdownOpen && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                                <li
                                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                    onClick={() => handleSelect("motherName", "")}
                                >
                                    Select Mother
                                </li>
                                {isParent
                                    .filter((parent) => {
                                        // Note: 'zone' is not defined — assuming you meant DesignatedZone
                                        if (role === "HEALTH_WORKER") {
                                            return parent.address?.includes(DesignatedZone);
                                        }
                                        return true;
                                    })
                                    .map((parent) => (
                                        <li
                                            key={parent._id}
                                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                            onClick={() => handleSelect("motherName", parent._id)}
                                        >
                                            {parent.FirstName} {parent.LastName}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    {/* Birth Height */}
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">Birth Height (cm)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="birthHeight"
                            value={formData.birthHeight}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
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
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </div>
                            ) : born ? (
                                "Update Newborn Info"
                            ) : (
                                "Add Newborn"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddNewBorn;