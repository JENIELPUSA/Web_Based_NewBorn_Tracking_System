import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const VaccineDisplayContext = createContext();
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
export const VaccineDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [vaccine, setVaccine] = useState([]); // Initialize equipment state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [error, setError] = useState(null); // Initialize error state
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    // Get token from localStorage
    const [usersPerPage, setusersPerPage] = useState(6);

    useEffect(() => {
        if (!authToken) {
            setVaccine([]);
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
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const vaccineDAta = res?.data.data;
            setVaccine(vaccineDAta);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data. Please try again later.");
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const VaccineAdd = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine`,
                {
                    name: values.name.trim().toLowerCase(),
                    description: values.description,
                    dosage: values.dosage,
                    brand: values.brand,
                    zone: values.zone,
                    stock: values.stock,
                    expirationDate: values.expirationDate,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                // Check if res.data.data is an array or a single object
                const newVaccines = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

                setVaccine((prev) => {
                    const newVaccine = res.data.data;

                    // If the vaccine exists, update it
                    const existingIndex = prev.findIndex((v) => v._id === newVaccine._id);

                    if (existingIndex !== -1) {
                        // Replace the existing vaccine with the updated one (with new batch)
                        const updated = [...prev];
                        updated[existingIndex] = newVaccine;
                        return updated;
                    } else {
                        // If it's a new vaccine, add it
                        return [...prev, newVaccine];
                    }
                });

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const message = error.response.data.message || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };

const DeleteData = async (vaccineId, batchId = null) => {
    try {
        const config = {
            headers: { Authorization: `Bearer ${authToken}` },
            data: batchId ? { batchId } : undefined, // Only send body if batchId exists
        };

        const response = await axios.delete(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine/${vaccineId}`,
            config
        );

        if (response.data.status === "success") {
            if (batchId) {
                // Batch deletion: update vaccine in state or remove if no batches remain
                const updated = response.data.data;
                if (updated) {
                    setVaccine((prev) =>
                        prev.map((v) => (v._id === updated._id ? updated : v))
                    );
                } else {
                    setVaccine((prev) => prev.filter((v) => v._id !== vaccineId));
                }
            } else {
                // Full vaccine deletion
                setVaccine((prev) => prev.filter((v) => v._id !== vaccineId));
            }

            setModalStatus("success");
            setShowModal(true);
        } else {
            setModalStatus("failed");
            setShowModal(true);
            toast.error("Unexpected response from server.");
        }
    } catch (error) {
        console.error("Error deleting vaccine:", error);
        toast.error(error.response?.data?.message || "Failed to delete vaccine.");
    }
};


const UpdateData = async (vaccineId, values) => {
    try {
        const dataToSend = {
            vaccineId: vaccineId,
            batchId: values.batchId,  // <-- include this to identify which batch to update
            name: values.name || "",
            description: values.description || "",
            dosage: values.dosage || "",
            brand: values.brand || "",
            zone: values.zone || "",
            stock: values.stock,  // optional but important for batch update
            expirationDate: values.expirationDate, // optional
        };

        const response = await axios.patch(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine/${vaccineId}`,
            dataToSend,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );

        if (response.data?.status === "success") {
            setVaccine((prevVaccines) =>
                prevVaccines.map((v) =>
                    v._id === response.data.data._id ? response.data.data : v
                )
            );
            setModalStatus("success");
            setShowModal(true);
        } else {
            setModalStatus("failed");
            setShowModal(true);
        }
    } catch (error) {
        if (error.response?.data) {
            const message =
                error.response.data.message ||
                error.response.data.error ||
                "Something went wrong.";
            setCustomError(message);
        } else if (error.request) {
            setCustomError("No response from the server.");
        } else {
            setCustomError(error.message || "Unexpected error occurred.");
        }
    }
};



    return (
        <VaccineDisplayContext.Provider
            value={{
                UpdateData,
                customError,
                vaccine,
                VaccineAdd,
                DeleteData,
            }}
        >
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </VaccineDisplayContext.Provider>
    );
};
