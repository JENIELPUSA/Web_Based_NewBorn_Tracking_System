import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
//import OtpForm from "../../component/OTPform/OtpForm ";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const UserDisplayContext = createContext();

export const UserDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [usersPerPage, setusersPerPage] = useState(6);
    const [isTotal, setTotal] = useState("");
    const [isMale, setMale] = useState("");
    const [isFemale, setFemale] = useState("");
    const [isOTPModal, setOTPModal] = useState(false);
    const [userId, setUserId] = useState("");
    const [isParent, setParent] = useState("");
    const [isProfile, setProfile] = useState("");

    useEffect(() => {
        if (user && user._id) {
            setUserId(user._id);
        } else {
            const storedId = localStorage.getItem("userId");
            if (storedId) setUserId(storedId);
        }
    }, [user]);
    useEffect(() => {
        if (!authToken) {
            setUsers([]);
            setLoading(false);
            return;
        }

        fetchUserData();

        if (userId) {
            fetchProfileData(userId);
        }
    }, [authToken, userId]);

    useEffect(() => {
        if (!users || users.length === 0) return;

        const male = users.filter((u) => u.gender === "Male").length;
        const female = users.filter((u) => u.gender === "Female").length;

        setMale(male);
        setFemale(female);
        setTotal(users.length);
    }, [users]);

    // Custom error timeout
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => setCustomError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchUserData = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            setUsers(res.data.data);

            const guestUsers = res.data.data
                .filter((user) => user.role === "Guest")
                .map((user) => ({
                    _id: user._id,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    email: user.email,
                    address: `${user.address}`,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    zone: `${user.zone}`,
                }));

            const selectedUsers = res.data.data.filter((user) => user.role === "Admin" || user.role === "BHW");

            setParent(guestUsers);
            setUsers(selectedUsers);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const fetchProfileData = useCallback(
        async (id) => {
            if (!authToken || !id) return;
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/Profile/${id}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setProfile(res.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Failed to fetch profile data");
            } finally {
                setLoading(false);
            }
        },
        [authToken], // dependencies — only recreate if authToken changes
    );

    const handleOTP = (userId) => {
        setOTPModal(true);
        setUserId(userId);
    };

    const AddUser = async (values) => {
        console.log("values",values)
        try {
            const res = await axiosInstance.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`, values, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.status === "Success") {
                fetchUserData();
                setModalStatus("success");
                setShowModal(true);
                //if (["BHW", "Admin"].includes(values.role)) {
                //handleOTP(res.data.data._id);
                //}
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";
            setCustomError(msg);
        }
    };

    const DeleteUser = async (id) => {
        try {
            const res = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.status === "success") {
                fetchUserData();
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete user.");
        }
    };

    const UpdateUser = async (id, values) => {
        try {
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString().slice(0, 10) : "",
            };

            const res = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${id}`, payload, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data?.status === "success") {
                setProfile((prev) => {
                    const updated = [...prev];
                    updated[0] = { ...updated[0], ...res.data.data };
                    return updated;
                });

                setUsers((prevUsers) => prevUsers.map((u) => (u._id === res.data.data._id ? { ...u, ...res.data.data } : u)));

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";
            setCustomError(msg);
        }
    };

    const UpdateUserProfile = async (id, values) => {
        try {
            const formData = new FormData();

            // Only append avatar if it's a new File
            if (values.avatar instanceof File) {
                formData.append("avatar", values.avatar);
            }

            // Send PATCH request
            const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/ProfilePicture/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data?.status === "success") {
                const updatedAvatar = res.data.data.avatar; // should be { public_id, url }

                setProfile((prev) => {
                    const updated = [...prev];
                    updated[0] = { ...updated[0], avatar: updatedAvatar };
                    return updated;
                });

                setModalStatus("success");
                setShowModal(true);
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";
            setCustomError(msg);
            return { success: false, error: msg };
        }
    };

    return (
        <UserDisplayContext.Provider
            value={{
                isFemale,
                isMale,
                isTotal,
                customError,
                users,
                setUsers,
                AddUser,
                DeleteUser,
                UpdateUser,
                isParent,
                fetchProfileData,
                isProfile,
                UpdateUserProfile,
            }}
        >
            {children}

            {/*
<OtpForm
  isOpen={isOTPModal}
  onClose={() => setOTPModal(false)}
  userId={userId}
/>
*/}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </UserDisplayContext.Provider>
    );
};
