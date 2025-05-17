import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";

function AddNewBorn({ isOpen, onClose, born }) {
    const { users } = useContext(UserDisplayContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { userId } = useContext(AuthContext);
    const { AddNewBorn, UpdateBorn, customError } = useContext(NewBornDisplayContext);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        dateOfBirth: "",
        gender: "",
        birthWeight: "",
        motherName: "",
        birthHeight: "",
    });

    useEffect(() => {
        if (born) {
            setFormData({
                firstName: born.firstName || "",
                middleName: born.middleName || "",
                lastName: born.lastName || "",
                dateOfBirth: born.dateOfBirth ? new Date(born.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: born.gender || "",
                birthWeight: born.birthWeight || "",
                motherName: born.motherName?._id || born.motherName || "", // <-- ✅ Fix
                birthHeight: born.birthHeight || "",
            });
            console.log("MotherName on edit:", born.motherName);

        } else {
            setFormData({
                firstName: "",
                lastName: "",
                middleName: "",
                dateOfBirth: "",
                gender: "",
                birthWeight: "",
                motherName: "",
                birthHeight: "",
            });
        }

        
    }, [born]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (born) {
            await UpdateBorn(born._id, formData);
            setTimeout(() => {
                onClose();
            }, 1000);
        } else {
            await AddNewBorn(formData, userId);
            setTimeout(() => {
                onClose();
            }, 1000);
        }
    };

    console.log("Catch a born", born);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{born ? "Edit Newborn Info" : "Add Newborn"}</h2>

                {customError && <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">{customError}</div>}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Middle Name</label>
                            <input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Birth Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="birthWeight"
                                value={formData.birthWeight}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="relative w-full">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Mother's Name</label>
                        <div
                            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-400"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span>
                                {(() => {
                                    const selected = users.find((u) => u._id === formData.motherName);
                                    return selected ? `${selected.FirstName} ${selected.LastName}` : "Select Mother";
                                })()}
                            </span>
                            <i className={`fas ${dropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-slate-500`} />
                        </div>

                        {dropdownOpen && (
                            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white text-sm">
                                {users.map((user) => (
                                    <li
                                        key={user._id}
                                        className="cursor-pointer px-4 py-2 text-slate-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, motherName: user._id }));
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {user.FirstName} {user.LastName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Birth height (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="birthHeight"
                            value={formData.birthHeight}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

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
                            {born ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default AddNewBorn;
