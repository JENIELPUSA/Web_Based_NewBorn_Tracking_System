import React, { useEffect, useState, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";

const UserFormModal = ({ isOpen, onClose, user, role }) => {
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
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: user.gender || "",
                avatar: user.avatar || "",
                zone: user.zone || "",
                password: "",
                Designatedzone: user.Designatedzone || "",
            });
        } else {
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

        if (user) {
            if (role == "Guest") {
                const updatedata = {
                    ...formData,
                    role: formData.role?.trim() === "" ? "Guest" : formData.role,
                };
                 console.log("IDD",user._id)
                await UpdateUser(user._id, updatedata);
               
            } else {
                await UpdateUser(user._id, formData);
            }

            setTimeout(() => {
                resetForm();
                setIsSubmitting(false);
                onClose();
            }, 1000);
        } else {
            if (role == "Guest") {
                const newUserData = {
                    ...formData,
                    role: formData.role?.trim() === "" ? "Guest" : formData.role,
                };
                await AddUser(newUserData);
                setTimeout(() => {
                    resetForm();
                    setIsSubmitting(false);
                    onClose();
                }, 1000);
            } else {
                await AddUser(formData);
                setTimeout(() => {
                    resetForm();
                    setIsSubmitting(false);
                    onClose();
                }, 1000);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{user ? "Edit User" : "Add New User"}</h2>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                        {customError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* First and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">First Name</label>
                            <input
                                type="text"
                                name="FirstName"
                                value={formData.FirstName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Last Name</label>
                            <input
                                type="text"
                                name="LastName"
                                value={formData.LastName}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Email and Role (conditionally rendered) */}
                    <div className={`grid gap-4 ${role ? "grid-cols-1" : "grid-cols-2"}`}>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>

                        {/* Custom Role Dropdown - Hidden for Guest role */}
                        {!role && (
                            <div className="relative">
                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Role</label>
                                <div
                                    className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                    onClick={() => setDropdownOpenRole(!dropdownOpenRole)}
                                >
                                    <span>{formData.role || "Select Role"}</span>
                                    <i className={`fas ${dropdownOpenRole ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                                </div>
                                {dropdownOpenRole && (
                                    <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                        <li
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                            onClick={() => handleSelect("role", "")}
                                        >
                                            Select Role
                                        </li>
                                        <li
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                            onClick={() => handleSelect("role", "Admin")}
                                        >
                                            Admin
                                        </li>
                                        <li
                                            className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600"
                                            onClick={() => handleSelect("role", "BHW")}
                                        >
                                            BHW
                                        </li>
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Address and Zone (conditionally rendered) */}
                    <div className={`grid gap-4 ${role ? "grid-cols-1" : "grid-cols-2"}`}>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>
                        {/* Conditionally render Zone */}
                    
                            <div>
                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Zone</label>
                                <input
                                    type="text"
                                    name="zone"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                />
                            </div>
                    </div>

                    {/* Phone Number and Password (conditionally rendered) */}
                    <div className={`grid gap-4 ${role ? "grid-cols-1" : "grid-cols-2"}`}>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>
                        {/* Conditionally render Password */}
                        {!role && (
                            <div>
                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Date of Birth, Gender, and Designated Zone (conditionally rendered) */}
                    <div className={`grid gap-4 ${role ? "grid-cols-1" : "grid-cols-2"}`}>
                        <div>
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                            />
                        </div>

                        <div className="relative">
                            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Gender</label>
                            <div
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                onClick={() => setDropdownOpenGender(!dropdownOpenGender)}
                            >
                                <span>{formData.gender || "Select Gender"}</span>
                                <i className={`fas ${dropdownOpenGender ? "fa-chevron-up" : "fa-chevron-down"} text-gray-500`} />
                            </div>
                            {dropdownOpenGender && (
                                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-600"
                                        onClick={() => handleSelect("gender", "")}
                                    >
                                        Select Gender
                                    </li>
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-600"
                                        onClick={() => handleSelect("gender", "Male")}
                                    >
                                        Male
                                    </li>
                                    <li
                                        className="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-600"
                                        onClick={() => handleSelect("gender", "Female")}
                                    >
                                        Female
                                    </li>
                                </ul>
                            )}
                        </div>
                        {/* Conditionally render Designated Zone */}
                        {!role && (
                            <div>
                                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-200">Designated Zone</label>
                                <input
                                    type="text"
                                    name="Designatedzone"
                                    value={formData.Designatedzone || ""}
                                    onChange={handleChange}
                                    disabled={formData.role !== "BHW"}
                                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
                                        formData.role !== "BHW"
                                            ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                                            : "border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                                    } `}
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
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
                            className={
                                "rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-red-600 dark:text-gray-200 dark:hover:bg-pink-500"
                            }
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
