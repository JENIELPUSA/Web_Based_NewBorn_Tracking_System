import React, { useEffect, useState, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { motion } from "framer-motion";
import { ParentDisplayContext } from "../../contexts/ParentContext/ParentContext";

const UserFormModal = ({ isOpen, onClose, user, role }) => {
    const { AddParent, UpdateParent } = useContext(ParentDisplayContext);
    const { AddUser, UpdateUser, customError } = useContext(UserDisplayContext);
    const [dropdownOpenRole, setDropdownOpenRole] = useState(false);
    const [dropdownOpenGender, setDropdownOpenGender] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        FirstName: "",
        LastName: "",
        username: "",
        email: "",
        role: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        avatar: "",
        zone: "",
        password: "",
        Designatedzone: "",
        Middle: "",
        extensionName: "",
    });

    const resetForm = () => {
        setFormData({
            FirstName: "",
            LastName: "",
            username: "",
            email: "",
            role: "",
            address: "",
            phoneNumber: "",
            dateOfBirth: "",
            gender: "",
            avatar: "",
            zone: "",
            password: "",
            Designatedzone: "",
            Middle: "",
            extensionName: "",
        });
    };

    useEffect(() => {
        if (user) {
            setFormData({
                FirstName: user.FirstName || "",
                LastName: user.LastName || "",
                username: user.username || "",
                email: user.email || "",
                role: user.role || "",
                address: user.address || "",
                extensionName: user.extensionName || "",
                Middle: user.Middle || "",
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: user.gender || "",
                avatar: user.avatar || "",
                zone: user.zone || "",
                Designatedzone: user.Designatedzone || "",
            });
        } else {
            setFormData({
                Middle: "",
                extensionName: "",
                FirstName: "",
                LastName: "",
                username: "",
                email: "",
                role: "",
                address: "",
                phoneNumber: "",
                dateOfBirth: "",
                gender: "",
                avatar: "",
                zone: "",
                password: "",
                Designatedzone: "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelect = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "role") setDropdownOpenRole(false);
        if (name === "gender") setDropdownOpenGender(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (user) {
                const updatedData = { ...formData };
                delete updatedData.password;

                if (role === "Guest") {
                    updatedData.role = updatedData.role?.trim() === "" ? "Guest" : updatedData.role;
                    await UpdateParent(user._id, updatedData);
                } else {
                    await UpdateUser(user._id, updatedData);
                }
            } else {
                const newUserData = { ...formData };
                if (role === "Guest") {
                    newUserData.role = newUserData.role?.trim() === "" ? "Guest" : newUserData.role;
                    await AddParent(newUserData);
                } else {
                    await AddUser(newUserData);
                }
            }

            setTimeout(() => {
                resetForm();
                setIsSubmitting(false);
                onClose();
            }, 1000);
        } catch (err) {
            console.error("Submit error:", err);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    const isParentRole = role === "Guest";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
            >
                <h2 className="mb-4 text-center text-xl font-bold text-gray-800 sm:mb-5 sm:text-2xl">
                    {role === "Guest" ? (user ? "Edit Parents" : "Add New Parents") : user ? "Edit User" : "Add New User"}
                </h2>

                {customError && (
                    <div className="mb-3 rounded-md border border-red-400 bg-red-100 px-3 py-2 text-xs text-red-700 sm:text-sm">{customError}</div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* First, Middle, Last, and Extension Name */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">First Name</label>
                            <input
                                type="text"
                                name="FirstName"
                                value={formData.FirstName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Middle Name</label>
                            <input
                                type="text"
                                name="Middle"
                                value={formData.Middle || ""}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Last Name</label>
                            <input
                                type="text"
                                name="LastName"
                                value={formData.LastName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Suffix</label>
                            <select
                                name="extensionName"
                                value={formData.extensionName || ""}
                                onChange={handleChange}
                                className="w-full max-w-[70px] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            >
                                <option value="">--</option>
                                <option value="Jr">Jr</option>
                                <option value="Sr">Sr</option>
                            </select>
                        </div>
                    </div>

                    {/* Email and Gender - Always 2 columns */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>

                        <div className="relative">
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Gender</label>
                            <div
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 sm:px-3 sm:py-2 sm:text-sm"
                                onClick={() => setDropdownOpenGender(!dropdownOpenGender)}
                            >
                                <span>{formData.gender || "Select Gender"}</span>
                                <i className={`fas ${dropdownOpenGender ? "fa-chevron-up" : "fa-chevron-down"} text-xs text-gray-500`} />
                            </div>
                            {dropdownOpenGender && (
                                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-300 bg-white text-xs shadow-lg sm:text-sm">
                                    {["Select Gender", "Male", "Female"].map((option) => (
                                        <li
                                            key={option}
                                            className="cursor-pointer px-3 py-1.5 hover:bg-slate-100"
                                            onClick={() => handleSelect("gender", option === "Select Gender" ? "" : option)}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Role and Address - Dynamic columns */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {!isParentRole && (
                            <div className="relative">
                                <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Role</label>
                                <div
                                    className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 sm:px-3 sm:py-2 sm:text-sm"
                                    onClick={() => setDropdownOpenRole(!dropdownOpenRole)}
                                >
                                    <span>{formData.role || "Select Role"}</span>
                                    <i className={`fas ${dropdownOpenRole ? "fa-chevron-up" : "fa-chevron-down"} text-xs text-gray-500`} />
                                </div>
                                {dropdownOpenRole && (
                                    <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-300 bg-white text-xs shadow-lg sm:text-sm">
                                        {["Select Role", "Admin", "BHW"].map((option) => (
                                            <li
                                                key={option}
                                                className="cursor-pointer px-3 py-1.5 hover:bg-slate-100"
                                                onClick={() => handleSelect("role", option === "Select Role" ? "" : option)}
                                            >
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Address field - always takes the remaining space */}
                        <div className={isParentRole ? "sm:col-span-2" : ""}>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Address (include Zone, e.g., "Purok 3, Zone 5")</label>
                            <input
                                type="text"
                                value={
                                    formData.address || formData.zone
                                        ? `${formData.address}${formData.zone ? (formData.address ? ", " : "") + formData.zone : ""}`
                                        : ""
                                }
                                onChange={(e) => {
                                    const fullValue = e.target.value;
                                    // Match: ", Zone XYZ" at the end (case-insensitive)
                                    const zoneMatch = fullValue.match(/,\s*(Zone\s+\S+)$/i);
                                    if (zoneMatch) {
                                        const zone = zoneMatch[1]; // e.g., "Zone 5"
                                        const address = fullValue.slice(0, zoneMatch.index).trim();
                                        setFormData((prev) => ({ ...prev, address, zone }));
                                    } else {
                                        setFormData((prev) => ({ ...prev, address: fullValue, zone: "" }));
                                    }
                                }}
                                placeholder="e.g., Purok 3, San Isidro, Zone 5"
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Phone Number and Password - Dynamic columns */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className={isParentRole ? "sm:col-span-2" : ""}>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        handleChange(e);
                                    }
                                }}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                                placeholder="e.g., 09123456789"
                            />
                        </div>

                        {!isParentRole && (
                            <div>
                                <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Date of Birth and Designated Zone - Dynamic columns */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className={isParentRole ? "sm:col-span-2" : ""}>
                            <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
                            />
                        </div>

                        {!isParentRole && (
                            <div>
                                <label className="mb-1 block text-xs text-slate-600 sm:text-sm">Designated Zone</label>
                                <input
                                    type="text"
                                    name="Designatedzone"
                                    value={formData.Designatedzone || ""}
                                    onChange={handleChange}
                                    disabled={formData.role !== "BHW"}
                                    className={`w-full rounded-md border px-2.5 py-1.5 text-xs shadow-sm transition-all focus:outline-none focus:ring-2 sm:px-3 sm:py-2 sm:text-sm ${
                                        formData.role !== "BHW"
                                            ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"
                                            : "border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-400 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#7B8D6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7B8D6A]/80 disabled:opacity-70 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-1.5">
                                    <svg
                                        className="h-3 w-3 animate-spin text-white sm:h-4 sm:w-4"
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
                            ) : user ? (
                                "Update User Info"
                            ) : (
                                "Add User"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UserFormModal;
