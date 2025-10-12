import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const VaccinePerContext = createContext();

export const VaccinePerProvider = ({ children }) => {
    const [isPerVaccine, setPerVaccine] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { authToken } = useContext(AuthContext);
    const [customError, setCustomError] = useState("");
    useEffect(() => {
        if (!authToken) {
            setPerVaccine({});
            return;
        }

        fetchPerVaccine();
    }, [authToken]);

        useEffect(() => {
            if (customError) {
                const timer = setTimeout(() => {
                    setCustomError(null);
                }, 5000); // auto-dismiss after 5s
    
                return () => clearTimeout(timer); // cleanup
            }
        }, [customError]);

    const fetchPerVaccine = async () => {
        if (!authToken) return;

        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignedPerBabyVaccine`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const vaccineDAta = res?.data.data;
            setPerVaccine(vaccineDAta);
        } catch (error) {
            setCustomError("Failed to fetch data");
        }
    };

    const AddAssignedVaccine = async (values, userId) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignedPerBabyVaccine`,
                {
                    newborn: userId,
                    vaccine: values.vaccine,
                    totalDoses: values.totalDoses,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                console.log("Successfully added vaccine:", res.data.data);
                setModalStatus("success");
                setShowModal(true);

                // Optional: Re-fetch the data para sigurado na updated ang list
                fetchPerVaccine();
                return { success: true };
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

    const removeAssignedVaccine = async (AssignedID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignedPerBabyVaccine/${AssignedID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                fetchPerVaccine();
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

    const UpdateAssign = async (aditdata, values) => {
        try {
            const dataToSend = {
                totalDoses: values.totalDoses || "",
            };

            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignedPerBabyVaccine/${aditdata.assignedVaccineId}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (response.data && response.data.status === "success") {
                fetchPerVaccine();

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
        <VaccinePerContext.Provider
            value={{
                customError,
                isPerVaccine,
                AddAssignedVaccine,
                removeAssignedVaccine,
                setPerVaccine,
                UpdateAssign,
                fetchPerVaccine
            }}
        >
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </VaccinePerContext.Provider>
    );
};
