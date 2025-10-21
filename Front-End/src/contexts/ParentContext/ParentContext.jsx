import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const ParentDisplayContext = createContext();

export const ParentDisplayProvider = ({ children }) => {
    const [isParent, setParent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken, Designatedzone, role } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    useEffect(() => {
        fetchParent();
    }, [authToken]);
    const AddParent = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Parent`,
                {
                    FirstName: values.FirstName,
                    Middle: values.Middle,
                    email: values.email,
                    LastName: values.LastName,
                    extensionName: values.extensionName,
                    role: values.role,
                    address: values.address,
                    phoneNumber: values.phoneNumber,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    zone: values.zone,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                setParent((prevUsers) => [...prevUsers, res.data.data]);
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
    const fetchParent = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Parent`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            let parents = res.data.data;

            const normalize = (str) => str?.toLowerCase().replace(/\s+/g, " ").trim();
            if (role === "BHW") {
                parents = parents.filter((parent) => normalize(parent.zone) === normalize(Designatedzone));
            }

            setParent(parents);
        } catch (error) {
            console.error("Error fetching parents:", error);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    const UpdateParent = async (ID, values) => {
        try {
            const dataToSend = {
                name: values.name || "",
                FirstName: values.FirstName || "",
                Middle: values.Middle || "",
                LastName: values.LastName || "",
                extensionName: values.extensionName || "",
                email: values.email || "",
                role: values.role || "",
                address: values.address || "",
                phoneNumber: values.phoneNumber || "",
                dateOfBirth: values.dateOfBirth || "",
                gender: values.gender || "",
                zone: values.zone || "",
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Parent/${ID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setParent((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
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

    const DeleteParent = async (ParentId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Parent/${ParentId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setParent((prevUsers) => prevUsers.filter((user) => user._id !== ParentId));
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

    return (
        <ParentDisplayContext.Provider value={{ DeleteParent, isParent, AddParent, fetchParent, UpdateParent }}>
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </ParentDisplayContext.Provider>
    );
};
