import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import OtpForm from "../../component/OTPform/OtpForm ";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const UserDisplayContext = createContext();
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
export const UserDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, zone, role } = useContext(AuthContext);
    const [users, setUsers] = useState([]); // Initialize equipment state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [error, setError] = useState(null); // Initialize error state
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    // Get token from localStorage
    const [usersPerPage, setusersPerPage] = useState(6);
    const [isTotal, setTotal] = useState("");
    const [isMale, setMale] = useState("");
    const [isFemale, setFemale] = useState("");
    const [isOTPModal, setOTPModal] = useState(false);
    const [userId, setUserId] = useState("");
    const [isParent, setParent] = useState("");

    useEffect(() => {
        if (!authToken) {
            setUsers([]);
            setLoading(false); // Stop loading when there is no token
            return;
        }

        fetchUserData();
    }, [authToken]); // Dependencies to trigger effect when page or items per page change
    //para mag refresh satwing maybagong data
    useEffect(() => {
        if (!users || users.length === 0) return;

        const male = users.filter((u) => u.gender === "Male").length;
        const female = users.filter((u) => u.gender === "Female").length;

        setMale(male);
        setFemale(female);
        setTotal(users.length);
    }, [users]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000); // auto-dismiss after 5s

            return () => clearTimeout(timer); // cleanup
        }
    }, [customError]);

    const fetchUserData = async () => {
        if (!authToken) return;
        setLoading(true); // Set loading to true before fetching data
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
                    address: `${user.zone} ${user.address}`,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                }));

            const selectedUsers = res.data.data.filter((user) => user.role === "Admin" || user.role === "BHW");
            setParent(guestUsers);
            setUsers(selectedUsers);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data. Please try again later.");
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const handleOTP = (userId) => {
        setOTPModal(true);
        setUserId(userId);
    };

    const AddUser = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    FirstName: values.FirstName,
                    LastName: values.LastName,
                    email: values.email,
                    password: values.password,
                    role: values.role,
                    zone: values.zone,
                    address: values.address,
                    phoneNumber: values.phoneNumber,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    Designatedzone: values.Designatedzone,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                const data = res.data.data;
                fetchUserData();
                if (["BHW", "Admin"].includes(values.role)) {
                    handleOTP(data._id);
                }
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };

    const DeleteUser = async (userId) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                fetchUserData();
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
        }
    };

    const UpdateUser = async (user, values) => {
        try {
            const dataToSend = {
                FirstName: values.FirstName || "",
                LastName: values.LastName || "",
                username: values.username || "",
                email: values.email || "",
                role: values.role || "",
                address: values.address || "",
                phoneNumber: values.phoneNumber || "",
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString().slice(0, 10) : "", // Fix flickering
                gender: values.gender || "",
                avatar: values.avatar || "",
                zone: values.zone || "",
            };

            if (values.password) {
                dataToSend.password = values.password;
            }

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${user}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (response.data && response.data.status === "success") {
                fetchUserData();
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                // The request was made but no response was received
                setCustomError("No response from the server.");
            } else {
                // Something happened in setting up the request
                setCustomError(error.message || "Unexpected error occurred.");
            }
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
            }}
        >
            {children}

            <OtpForm
                isOpen={isOTPModal}
                onClose={() => setOTPModal(false)}
                userId={userId}
            />
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </UserDisplayContext.Provider>
    );
};
