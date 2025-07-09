import React, { useState, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";

const ProfileUpdateModalContent = ({ onClose, userData }) => {
  const [firstName, setFirstName] = useState(userData.FirstName || "");
  const [lastName, setLastName] = useState(userData.LastName || "");
  const [email, setEmail] = useState(userData.email || "");
  const [gender, setGender] = useState(userData.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(userData.dateOfBirth ? userData.dateOfBirth.split("T")[0] : "");
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || "");
  const [address, setAddress] = useState(userData.address || "");
  const [zone, setZone] = useState(userData.zone || "");
  const [message, setMessage] = useState("");

  const { UpdateUser } = useContext(UserDisplayContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!firstName || !lastName || !email || !phoneNumber || !address) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const updatedFields = {};
    if (firstName) updatedFields.FirstName = firstName;
    if (lastName) updatedFields.LastName = lastName;
    if (email) updatedFields.email = email;
    if (gender) updatedFields.gender = gender;
    if (dateOfBirth) updatedFields.dateOfBirth = new Date(dateOfBirth).toISOString().split("T")[0];
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (address) updatedFields.address = address;
    if (zone) updatedFields.zone = zone;

    try {
      setMessage("Updating profile...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const userId = userData._id;
      await UpdateUser(userId, updatedFields);
      setMessage("Profile updated successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errList = Object.values(error.response.data.errors).map(e => e.message).join(", ");
        setMessage(errList);
      } else {
        setMessage("Error updating profile.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
            First Name:
          </label>
          <input
            type="text"
            id="firstName"
            className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                       bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
            Last Name:
          </label>
          <input
            type="text"
            id="lastName"
            className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                       bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="gender" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
            Gender:
          </label>
          <select
            id="gender"
            className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                       bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="" className="dark:bg-gray-700 dark:text-gray-200">Select Gender</option> {/* Dark mode for option */}
            <option value="Male" className="dark:bg-gray-700 dark:text-gray-200">Male</option> {/* Dark mode for option */}
            <option value="Female" className="dark:bg-gray-700 dark:text-gray-200">Female</option> {/* Dark mode for option */}
            <option value="Other" className="dark:bg-gray-700 dark:text-gray-200">Other</option> {/* Dark mode for option */}
          </select>
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
            Date of Birth:
          </label>
          <input
            type="date"
            id="dateOfBirth"
            className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                       bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
          Phone Number:
        </label>
        <input
          type="text"
          id="phoneNumber"
          className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
          Address:
        </label>
        <input
          type="text"
          id="address"
          className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="zone" className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"> {/* Dark mode for label */}
          Zone:
        </label>
        <input
          type="text"
          id="zone"
          className="w-full rounded border px-3 py-2 text-gray-700 shadow focus:outline-none focus:shadow-outline
                     bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:shadow-outline-dark" // Dark mode for input
          value={zone}
          onChange={(e) => setZone(e.target.value)}
        />
      </div>

      {message && (
        <p className={`mt-2 text-sm ${message.includes("successfully") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}> {/* Dark mode for message text */}
          {message}
        </p>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-gray-300 px-4 py-2 font-bold text-gray-800 transition duration-200 hover:bg-gray-400
                     dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" // Dark mode for Cancel button
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 font-bold text-white transition duration-200 hover:bg-blue-600
                     dark:bg-blue-700 dark:hover:bg-blue-600" // Dark mode for Update Profile button
        >
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileUpdateModalContent;