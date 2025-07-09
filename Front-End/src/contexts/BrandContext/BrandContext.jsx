import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const BrandDisplayContext = createContext();

export const BrandDisplayProvider = ({ children }) => {
    const [isBrand, setBrand] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext); 
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    const fetchBrandData = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Brand`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setBrand(res.data.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when token is available
    useEffect(() => {
        fetchBrandData();
    }, [authToken]);

    const AddBrand = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Brand`,
                {
                    name: values.name,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                setBrand((prevUsers) => [...prevUsers, res.data.data]);
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

    const UpdateBrand = async (bornID, values) => {
        try {
            const dataToSend = {
                name: values.name || "",
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Brand/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setBrand((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
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

    const DeleteBrand = async (BrandId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Brand/${BrandId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setBrand((prevUsers) => prevUsers.filter((user) => user._id !== BrandId));
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
        <BrandDisplayContext.Provider
            value={{
                AddBrand,
                isBrand,
                fetchBrandData,
                loading,
                error,
                UpdateBrand,DeleteBrand
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </BrandDisplayContext.Provider>
    );
};
