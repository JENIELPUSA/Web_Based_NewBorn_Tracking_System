import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
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
    const [totalVaccine, setTotalVaccine] = useState("");
    const [expired, setExpired] = useState("");
    const [NotExpired, setNotExpired] = useState("");
    const [stocks, setstocks] = useState("");
    // Get token from localStorage
    const [usersPerPage, setusersPerPage] = useState(6);

    useEffect(() => {
        if (!authToken) {
            setVaccine([]);
            setLoading(false); // Stop loading when there is no token
            return;
        }

        fetchVaccineContext();
    }, [authToken]); // Dependencies to trigger effect when page or items per page change

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000); // auto-dismiss after 5s

            return () => clearTimeout(timer); // cleanup
        }
    }, [customError]);

useEffect(() => {
  const now = new Date();

  let expired = 0;
  let notExpired = 0;
  let totalStocks = 0;

  vaccine.forEach((vax) => {
    vax.batches?.forEach((batch) => {
      const expDate = new Date(batch.expirationDate);
      const stock = Number(batch.stock || 0);

      if (expDate < now) {
        expired += stock;
      } else {
        notExpired += stock;
      }

      totalStocks += stock;
    });
  });

  setExpired(expired);
  setNotExpired(notExpired);
  setstocks(totalStocks);
  setTotalVaccine(vaccine.length); // optional
}, [vaccine]);



    const fetchVaccineContext = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const vaccineDAta = res?.data.data;
            const TotalVaccine = res?.data.totalVaccine;
            const TotalStocks = res?.data.totals.totalStock;
            const Expired = res?.data.totals.expired;
            const NotExpiries = res?.data.totals.notExpired;
            setNotExpired(NotExpiries);
            setExpired(Expired);
            setTotalVaccine(TotalVaccine);
            setVaccine(vaccineDAta);
            setstocks(TotalStocks);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const VaccineAdd = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine`,
                {
                    name: values.name.trim().toLowerCase(),
                    description: values.description,
                    dosage: values.dosage,
                    brand: values.brand,
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
                    const updated = [...prev];

                    newVaccines.forEach((newVaccine) => {
                        const existingIndex = updated.findIndex((v) => v._id === newVaccine._id);
                        if (existingIndex !== -1) {
                            updated[existingIndex] = newVaccine;
                        } else {
                            updated.push(newVaccine);
                        }
                    });

                    return updated;
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

            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine/${vaccineId}`, config);

            if (response.data.status === "success") {
                if (batchId) {
                    // Batch deletion: update vaccine in state or remove if no batches remain
                    const updated = response.data.data;
                    if (updated) {
                        setVaccine((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
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
                batchId: values.batchId, // <-- include this to identify which batch to update
                name: values.name || "",
                description: values.description || "",
                dosage: values.dosage || "",
                brand: values.brand || "",
                zone: values.zone || "",
                stock: values.stock, // optional but important for batch update
                expirationDate: values.expirationDate, // optional
            };

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine/${vaccineId}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data?.status === "success") {
                setVaccine((prevVaccines) => prevVaccines.map((v) => (v._id === response.data.data._id ? response.data.data : v)));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            if (error.response?.data) {
                const message = error.response.data.message || error.response.data.error || "Something went wrong.";
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
                stocks,
                NotExpired,
                expired,
                totalVaccine,
                UpdateData,
                customError,
                vaccine,
                VaccineAdd,
                DeleteData,
                fetchVaccineContext,
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
