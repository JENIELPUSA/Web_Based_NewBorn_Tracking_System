import React, { useEffect, useState, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";

const UserFormModal = ({ isOpen, onClose, user }) => {
    const { AddUser, UpdateUser, customError } = useContext(UserDisplayContext);

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
    });

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
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user) {
            await UpdateUser(user._id, formData);
            setTimeout(() => {
                onClose();
            }, 1000); // auto-dismiss after 5s
        } else {
            await AddUser(formData);
            setTimeout(() => {
                onClose();
            }, 1000); // auto-dismiss after 5s
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
                                name="FirstName"
                                value={formData.FirstName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                            <input
                                type="text"
                                name="LastName"
                                value={formData.LastName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select Role</option>
                                <option value="Admin">Admin</option>
                                <option value="BHW">BHW</option>
                                <option value="Guest">Guest</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Zone</label>
                            <input
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Avatar URL</label>
                        <input
                            type="text"
                            name="avatar"
                            value={formData.avatar}
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
                            {user ? "Update User" : "Add User"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UserFormModal;
