import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

const ForgotPassword = ({ show, onClose }) => {
    const [values, setValues] = useState({ email: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/forgotPassword`, values);
            if (res.data.status === "Success") {
                toast.success(res.data.message);
                onClose(); // Close modal after success
            }
        } catch (error) {
            toast.error("Error sending password reset email.");
        } finally {
            setLoading(false);
            setValues({ email: "" });
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Background blur */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal content */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div
                            className="relative w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-lg dark:bg-gray-800"
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            {/* Close button */}
                            <button
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">Forgot Password</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-300" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Enter Email"
                                            autoComplete="off"
                                            className="w-full rounded border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-blue-400"
                                            value={values.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-500 py-2 text-white transition-transform hover:scale-105 hover:shadow-lg disabled:opacity-60"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <svg
                                            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ForgotPassword;
