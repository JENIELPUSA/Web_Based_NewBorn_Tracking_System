import React, { useState, useRef, useContext } from 'react';
import { UpdatePasswordDisplayContext } from "../../contexts/UpdatePasswordContext/UpdateContext";

const PasswordUpdateModalContent = ({ onClose, onPasswordUpdateSuccess }) => {
  const { UpdatePasswordData } = useContext(UpdatePasswordDisplayContext);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [message, setMessage] = useState('');

  // Handle changes to any password input
  const handleChange = (e) => {
    const { id, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    console.log('Current Password:', passwords.currentPassword);
    console.log('New Password:', passwords.newPassword);
    console.log('Confirm New Password:', passwords.confirmNewPassword);

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      return;
    }

    const passwordData = {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    };

    try {
      setMessage('Updating password...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      await UpdatePasswordData(passwords);

      setMessage('Password updated successfully!');
      onPasswordUpdateSuccess();
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('Password update error:', error);
      setMessage(`Error updating password: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300"
          htmlFor="currentPassword"
        >
          Current Password:
        </label>
        <input
          type="password"
          id="currentPassword"
          // ADDED: bg-white for light mode, dark:bg-gray-700 for dark mode
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark"
          value={passwords.currentPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300"
          htmlFor="newPassword"
        >
          New Password:
        </label>
        <input
          type="password"
          id="newPassword"
          // ADDED: bg-white for light mode, dark:bg-gray-700 for dark mode
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark"
          value={passwords.newPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300"
          htmlFor="confirmNewPassword"
        >
          Confirm New Password:
        </label>
        <input
          type="password"
          id="confirmNewPassword"
          // ADDED: bg-white for light mode, dark:bg-gray-700 for dark mode
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark"
          value={passwords.confirmNewPassword}
          onChange={handleChange}
          required
        />
      </div>
      {message && (
        <p
          className={`text-sm mt-2 ${
            message.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message}
        </p>
      )}
      <div className="mt-6 flex justify-end w-full space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200
                     dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200
                     dark:bg-purple-700 dark:hover:bg-purple-600"
        >
          Update Password
        </button>
      </div>
    </form>
  );
};

export default PasswordUpdateModalContent;