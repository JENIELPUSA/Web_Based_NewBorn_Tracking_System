import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "@/assets/logo.png";
import LoadingIntro from "../../ReusableFolder/loadingIntro";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { ArrowLeft } from "lucide-react";

export default function Login() {
    const [isForgotModal, setForgotModal] = useState(false);
    const [values, setValues] = useState({
        email: "",
        password: "",
    });
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

        if (response.success) {
            toast.success("Successfully logged in!");
            navigate("/dashboard");
        } else {
            setIsLoading(false);
            toast.error(response.message || "Login failed");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900">
            <Link
                to="/parent-dashboard"
                className="group absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-slate-700 shadow-md transition-all duration-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Go to Parent Dashboard"
            >
                <ArrowLeft className="h-6 w-6 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">Go to Parent Dashboard</span>
            </Link>

            <div className="flex w-full max-w-lg items-center justify-center">
                <div
                    className="hidden flex-grow rounded-l-lg bg-cover bg-center md:block"
                    style={{ backgroundImage: "url(/your-image-path.jpg)" }}
                />

                <div className="w-full max-w-md rounded-r-lg bg-white p-8 shadow-md dark:bg-slate-800">
                    <div className="mb-6 flex justify-center">
                        <img
                            src={logo}
                            alt="App Logo"
                            className="h-32 w-32 object-contain"
                        />
                    </div>

                    <h2 className="mb-6 text-center text-3xl font-extrabold tracking-wide text-red-600 shadow-md dark:text-red-400">
                        NEWBORN TRACKING SYSTEM
                    </h2>

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label className="mb-1 block text-slate-700 dark:text-slate-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleInput}
                                disabled={isLoading}
                                className="w-full rounded border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-slate-700 dark:text-slate-300">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleInput}
                                disabled={isLoading}
                                className="w-full rounded border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            className={`flex w-full items-center justify-center gap-2 ${
                                isLoading ? "cursor-not-allowed bg-red-400" : "bg-red-500 hover:bg-red-600"
                            } rounded px-4 py-2 font-semibold text-white`}
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingIntro /> : "Log In"}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setForgotModal(true)}
                                className="text-sm text-red-600 hover:underline dark:text-red-400"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPassword
                show={isForgotModal}
                onClose={handleCloseModal}
            />
        </div>
    );
}
