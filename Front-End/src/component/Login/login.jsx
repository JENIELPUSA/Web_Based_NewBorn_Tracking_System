import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "@/assets/logo.png";
import LoadingIntro from "../../ReusableFolder/loadingIntro";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import LoginImage from "../../assets/Login.png"
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function Login({ isOpen, onClose }) {
    const [isForgotModal, setForgotModal] = useState(false);
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInput = (event) => {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
    };

    const handleCloseModal = () => {
        setForgotModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!values.email) newErrors.email = "Email is required";
        if (!values.password) newErrors.password = "Password is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const response = await login(values.email, values.password);
        setIsLoading(false);

        if (response.success) {
            toast.success("Successfully logged in!");
            navigate("/dashboard");
            onClose(); // close modal after login
        } else {
            toast.error(response.message || "Login failed");
        }
    };

    if (!isOpen) return null; // hide modal when isOpen is false

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 backdrop-blur-md">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto w-full max-w-sm rounded-lg bg-white p-4 shadow-lg sm:max-w-md sm:p-6 md:p-8"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 rounded-full p-1 text-gray-600 hover:bg-gray-200 sm:right-3 sm:top-3 sm:p-2"
                >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Logo */}
                <div className="mb-4 flex justify-center sm:mb-6">
                    <img
                        src={LoginImage}
                        alt="App Logo"
                        className="h-24 w-24 object-contain sm:h-28 sm:w-28 md:h-32 md:w-32"
                    />
                </div>

                {/* Title */}
                <h2 className="mb-4 text-center text-xl font-bold text-[#7B8D6A] sm:mb-6 sm:text-2xl">NeoCare System</h2>

                {/* Login Form */}
                <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm text-slate-700 sm:text-base">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleInput}
                            disabled={isLoading}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500 sm:text-sm">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-700 sm:text-base">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleInput}
                            disabled={isLoading}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500 sm:text-sm">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`flex w-full items-center justify-center gap-2 ${
                            isLoading ? "cursor-not-allowed bg-[#7B8D6A]" : "bg-[#7B8D6A] hover:bg-[#7B8D6A]/60"
                        } rounded px-4 py-2 text-sm font-semibold text-white transition-colors sm:py-2 sm:text-base`}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingIntro /> : "Log In"}
                    </button>

                    <div className="mt-3 text-center sm:mt-4">
                        <button
                            type="button"
                            onClick={() => setForgotModal(true)}
                            className="text-xs text-[#7B8D6A] hover:underline sm:text-sm"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>

                {/* Forgot Password Modal */}
                <ForgotPassword show={isForgotModal} onClose={handleCloseModal} />
            </motion.div>
        </div>
    );
}