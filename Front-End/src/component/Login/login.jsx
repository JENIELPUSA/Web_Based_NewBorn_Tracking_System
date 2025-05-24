import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from '@/assets/logo.png';

export default function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Should be a valid context provider function

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const response = await login(values.email, values.password);

    if (response.success) {
      console.log("Successfully Login")
          setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard"); //  Redirect to dashboard
    }, 1000);
    } else {
      setIsLoading(false);
      toast.error(response.message);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
    <div className="flex justify-center items-center w-full max-w-lg">
      {/* Optional left image section (you can customize or remove) */}
      <div
        className="hidden md:block flex-grow bg-cover bg-center rounded-l-lg"
        style={{ backgroundImage: 'url(/your-image-path.jpg)' }}
      />

      {/* Login Form */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-r-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img
            src={logo} // Use the imported logo here
            alt="App Logo"
            className="h-32 w-32 object-contain"
          />
        </div>

        <h2 className="text-3xl font-extrabold text-center text-red-600 dark:text-red-400 mb-6 tracking-wide shadow-md">
          NEWBORN TRACKING SYSTEM
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleInput}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleInput}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "LogIn"}
          </button>
        </form>
      </div>
    </div>
  </div>
);

}
