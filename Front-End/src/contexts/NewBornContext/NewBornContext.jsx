import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const NewBornDisplayContext = createContext();
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
export const NewBornDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [newBorn, setNewBorn] = useState([]); // Initialize equipment state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [error, setError] = useState(null); // Initialize error state
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    // Get token from localStorage
    const [usersPerPage, setusersPerPage] = useState(6);

    useEffect(() => {
        if (!authToken) {
            setNewBorn([]);
            setLoading(false); // Stop loading when there is no token
            return;
        }

        fetchUserData();
    }, [authToken]); // Dependencies to trigger effect when page or items per page change

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
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const NewBornData = res?.data.data;
            setNewBorn(NewBornData);
            console.log("NEW BORN", NewBornData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data. Please try again later.");
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const AddNewBorn = async (values, userId) => {
        console.log("fhjef", values);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn`,
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    middleName: values.middleName,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    birthWeight: values.birthWeight,
                    motherName: values.motherName,
                    address: values.address,
                    zone: values.zone,
                    addedBy: userId,
                    birthHeight: values.birthHeight,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                console.log("HUli pero di kuo", res.data.data);
                setNewBorn((prevUsers) => [...prevUsers, res.data.data]);
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
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };

    const DeleteNewBorn = async (newbordID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/${newbordID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setNewBorn((prevUsers) => prevUsers.filter((user) => user._id !== newbordID));
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

    const UpdateBorn = async (bornID, values) => {
        try {
            const dataToSend = {
                firstName: values.firstName || "",
                lastName: values.lastName || "",
                middleName: values.middleName || "",
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: values.gender || "",
                birthWeight: values.birthWeight || "",
                birthHeight: values.birthHeight || "",
                motherName: values.motherName || "",
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                console.log("Updated newborn data:", response.data.updateBaby); // For debugging

                // Use the full response data to update the state
                setNewBorn((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));

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
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };

    return (
        <NewBornDisplayContext.Provider
            value={{
                newBorn,
                customError,
                AddNewBorn,
                DeleteNewBorn,
                UpdateBorn,
            }}
        >
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </NewBornDisplayContext.Provider>
    );
};
