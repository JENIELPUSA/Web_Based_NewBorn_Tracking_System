import React, { useState, useEffect, useContext } from "react";
import PasswordUpdateModalContent from "./PasswordUpdateModalContent";
import PhotoUploadModalContent from "./PhotoUploadModalContent";
import ProfileUpdateModalContent from "./ProfileUpdateModalContent";
import { User } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";

function Profile() {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { isProfile, fetchProfileData } = useContext(UserDisplayContext);
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      fetchProfileData(userId);
    }
  }, [userId, fetchProfileData]);

  if (!isProfile || isProfile.length === 0) {
    return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
  }

  const {
    FirstName,
    LastName,
    Middle,
    extensionName,
    address,
    zone,
    avatar,
    role,
    gender,
    phoneNumber,
    email,
    isVerified,
    createdAt,
    dateOfBirth,
  } = isProfile[0]; 

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const Modal = ({ show, onClose, children, title }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 border-b pb-2 text-2xl font-bold text-gray-800 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-2xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-inter flex min-h-screen items-center justify-center">
      <div className="w-full max-w-5xl rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 shadow-inner dark:bg-gray-700 dark:border dark:border-gray-600">
            <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Profile Picture</h2>
            <div className="mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 border-blue-400 bg-blue-100 shadow-md dark:border-blue-600 dark:bg-blue-800">
              {avatar ? (
                <img
                  src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${avatar.replace(/\\/g, "/")}`}
                  alt={`${FirstName} ${LastName} Avatar`}
                  className="h-48 w-48 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <User className="h-12 w-12 text-blue-600 dark:text-blue-200" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="flex flex-col justify-center p-4 lg:col-span-2">
            <h1 className="mb-3 text-4xl font-extrabold text-gray-900 dark:text-white">
              {FirstName} {Middle && `${Middle}.`} {LastName} {extensionName && <span>{extensionName}</span>}
            </h1>
            <p className="mb-6 text-xl font-semibold text-blue-600 dark:text-blue-400">{role}</p>
            <div className="grid grid-cols-1 gap-3 text-lg md:grid-cols-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Gender:</strong> {gender}</p>
              <p><strong>Birthdate:</strong> {formatDate(dateOfBirth)}</p>
              <p><strong>Contact:</strong> {phoneNumber}</p>
              <p className="md:col-span-2"><strong>Address:</strong> {address}</p>
              <p><strong>Zone:</strong> {zone}</p>
              <p><strong>Date Created:</strong> {formatDate(createdAt)}</p>
              <p className="flex items-center md:col-span-2">
                <strong>Status:</strong>
                <span className={`ml-2 rounded-full px-3 py-1 text-sm font-bold ${
                  isVerified ? "bg-green-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {isVerified ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 border-t pt-8 dark:border-gray-700">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="rounded-full bg-yellow-500 px-6 py-2 font-bold text-white hover:bg-yellow-600"
          >
            Update Photo
          </button>
          <button
            onClick={() => setShowProfileModal(true)}
            className="rounded-full bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
          >
            Update Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-full bg-purple-600 px-6 py-2 font-bold text-white hover:bg-purple-700"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal show={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Update Photo">
        <PhotoUploadModalContent onClose={() => setShowPhotoModal(false)} userData={isProfile[0]} />
      </Modal>

      <Modal show={showProfileModal} onClose={() => setShowProfileModal(false)} title="Update Profile">
        <ProfileUpdateModalContent onClose={() => setShowProfileModal(false)} userData={isProfile[0]} />
      </Modal>

      <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Update Password">
        <PasswordUpdateModalContent onClose={() => setShowPasswordModal(false)} />
      </Modal>
    </div>
  );
}

export default Profile;
