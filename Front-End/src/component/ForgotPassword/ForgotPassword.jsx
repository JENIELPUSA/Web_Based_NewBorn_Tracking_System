import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../contexts/AuthContext";

// Assuming LoadingSpinner is defined elsewhere
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ForgotPassword = () => {
  const { authToken } = useContext(AuthContext);
  const [values, setValues] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authToken) {
      console.warn("No token found in localStorage");
      toast.error("Authentication token is missing. Please log in.");
    }
  }, [authToken]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/forgotPassword`,
        values
      );

      if (res.data.status === "Success") {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("Error sending password reset email.");
    } finally {
      setLoading(false);
      setValues({ email: "" });
    }
  };

  return (
    // Apply dark mode styles to the main container
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg dark:bg-gray-800">
        {/* Forgot Password Title */}
        <h2 className="xs:text-lg text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6 dark:text-white">
          Forgot Password
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              value={values.email}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:py-3 xs:py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : "Reset Password"}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;