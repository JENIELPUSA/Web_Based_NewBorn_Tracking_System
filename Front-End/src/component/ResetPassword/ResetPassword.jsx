import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../contexts/AuthContext';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Initial check for token existence on component mount
  useEffect(() => {
    if (!token) {
      toast.error("Invalid password reset link. Please request a new one.");
      // Redirect to forgot password page if no token is found in the URL
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000); // Give user time to read the message
    }
  }, [token, navigate]); // Dependencies for useEffect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/resetPassword/${token}`,
        { password, confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Server Response:", res.data);

      if (res.data.status === "Success") {
        toast.success("Password updated successfully!");
        logout(); // Assuming logout clears token and user data
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Fallback for cases where status is not "Success" but no specific error message from backend
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error response:', error.response?.data || error.message);

      // Extract specific error message from backend if available
      const errorMessage = error.response?.data?.message || 'There was an error resetting the password. Please try again.';
      toast.error(errorMessage);

      // Specific handling for "Token is Invalid or Expired"
      if (error.response?.status === 400 && error.response?.data?.message === "Token is Invalid or Expired") {
        setTimeout(() => {
          navigate('/forgot-password'); // Redirect user to request a new token
        }, 3000); // Give them time to read the toast message
      }
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg dark:bg-gray-800">
        <h2 className="xs:text-lg text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6 dark:text-white">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2 dark:text-gray-300"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter New Password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-semibold mb-2 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm New Password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : "Reset Password"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default ResetPassword;