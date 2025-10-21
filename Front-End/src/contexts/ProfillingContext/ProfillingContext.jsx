import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const ProfillingContexts = createContext();

export const ProfillingDisplayProvider = ({ children }) => {
    const [isProfilling, setProfilling] = useState([]); // Change this to an empty array
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { authToken, role, Designatedzone } = useContext(AuthContext);
    const [customError, setCustomError] = useState("");

    useEffect(() => {
        if (!authToken) {
            setProfilling([]); // Reset to an empty array if no authToken
            return;
        }

        fetchProfilling();
    }, [authToken]);
    const fetchProfilling = async () => {
        if (!authToken) return;

        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            let vaccineData = res?.data?.data;

            if (Array.isArray(vaccineData)) {
                if (role === "BHW") {
                    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, " ").trim();

                    vaccineData = vaccineData.filter((item) => normalize(item.zone) === normalize(Designatedzone));
                }

                // Optional: Normalize avatar to always be URL string
                vaccineData = vaccineData.map((item) => ({
                    ...item,
                    avatar: typeof item.avatar === "object" ? item.avatar.url : item.avatar,
                }));

                setProfilling(vaccineData);
            } else {
                console.error("Unexpected data format:", vaccineData);
                setProfilling([]);
            }
        } catch (error) {
            console.error("Error fetching profilling:", error);
            setCustomError("Failed to fetch data");
        }
    };

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000); // auto-dismiss after 5s

            return () => clearTimeout(timer); // cleanup
        }
    }, [customError]);

    const AddProf = async (values, userId) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling`,
                {
                    newborn_id: values.newborn_id,
                    blood_type: values.blood_type,
                    health_condition: values.health_condition,
                    notes: values.notes,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                fetchProfilling();
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

    const DeleteProfile = async (newbordID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling/${newbordID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setProfilling((prevUsers) => prevUsers.filter((user) => user._id !== newbordID));
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

    const UpdateProf = async (values) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling/${values._id}`,
                {
                    blood_type: values.blood_type,
                    latestHealthCondition: values.latestHealthCondition,
                    latestNotes: values.latestNotes,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (response.data && response.data.status === "success") {
                console.log("Updated newborn data:", response.data.updateBaby); // For debugging

                // Use the full response data to update the state
                setProfilling((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));

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
        <ProfillingContexts.Provider value={{ isProfilling, AddProf, DeleteProfile, setProfilling, UpdateProf, customError }}>
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </ProfillingContexts.Provider>
    );
};
