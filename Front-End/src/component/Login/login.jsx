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
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-600 hover:bg-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <img
                        src={LoginImage}
                        alt="App Logo"
                        className="h-32 w-32 object-contain"
                    />
                </div>

                {/* Title */}
                <h2 className="mb-6 text-center text-2xl font-bold text-[#7B8D6A]">NeoCare System</h2>

                {/* Login Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-slate-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleInput}
                            disabled={isLoading}
                            className="w-full rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-slate-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleInput}
                            disabled={isLoading}
                            className="w-full rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`flex w-full items-center justify-center gap-2 ${
                            isLoading ? "cursor-not-allowed bg-[#7B8D6A]" : "bg-[#7B8D6A] hover:bg-[#7B8D6A]/60"
                        } rounded px-4 py-2 font-semibold text-white`}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingIntro /> : "Log In"}
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setForgotModal(true)}
                            className="text-sm text-[#7B8D6A] hover:underline"
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