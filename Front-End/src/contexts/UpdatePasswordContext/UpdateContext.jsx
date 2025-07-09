import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const UpdatePasswordDisplayContext = createContext();

export const UpdatePasswordDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const UpdatePasswordData = async (payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/updatePassword`,
                {
                    currentPassword: payload.currentPassword,
                    password: payload.newPassword,
                    confirmPassword: payload.confirmNewPassword,
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
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
        <UpdatePasswordDisplayContext.Provider
            value={{
                customError,
                setCustomError,
                UpdatePasswordData,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </UpdatePasswordDisplayContext.Provider>
    );
};
