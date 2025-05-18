import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const VaccineRecordDisplayContext = createContext();

export const VaccineRecordDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const [vaccineRecord, setVaccineRecord] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const fetchVaccineRecordData = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const vaccineData = res?.data.data;
            setVaccineRecord(vaccineData);
            console.log("Data TRy", vaccineData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data. Please try again later.");
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const AssignVaccine = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord`,
                {
                    newborn: values.newborn,
                    vaccine: values.vaccine,
                    email: values.email,
                    administeredBy: values.administeredBy,
                    dateGiven: values.dateGiven,
                    remarks: values.remarks,
                    next_due_date: values.next_due_date,
                    NUmberOfDose: values.NUmberOfDose,
                    status: values.status,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            console.log("RESS", res);
            if (res.data.status === "success") {
                setVaccineRecord((prevUsers) => [...prevUsers, res.data.data]);
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

    const UpdateContext = async (values, recordId, doseId) => {
        try {
            setLoading(true);

            console.log("Values", values);
            console.log("Record", recordId);
            console.log("DOse", values.doseId);
            const requestData = {
                dateGiven: values.dateGiven,
                next_due_date: values.next_due_date,
                remarks: values.remarks,
                status: values.status,
            };

            const response = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord/${recordId}/doses/${values.doseId}`,
                requestData,
            );

            if (response.data.status === "success") {
                setVaccineRecord((prevRecords) =>
                    prevRecords.map((record) => {
                        if (record._id === response.data.data.recordId) {
                            return {
                                ...record,
                                doses: record.doses.map((dose) => (dose._id === values.doseId ? response.data.data.dose : dose)),
                            };
                        }
                        return record;
                    }),
                );

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (err) {
            setLoading(false);
            setError("An error occurred while updating the record");
            console.error("Error updating vaccination record:", err);
            return null;
        }
    };

    const DeleteContext = async (recordId, doseId) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord/${recordId}/doses/${doseId}`,
            );

            if (response.data.status === "success") {
                
                setModalStatus("success");
                setVaccineRecord((prevRecords) =>
                    prevRecords.map((record) => {
                        if (record._id === recordId) {
                            return {
                                ...record,
                                doses: record.doses.filter((dose) => dose._id !== doseId),
                            };
                        }
                        return record;
                    }),
                );

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (err) {
            setLoading(false);
            setError("An error occurred while deleting the dose");
            console.error("Error deleting dose:", err);
            return null;
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        fetchVaccineRecordData();
    }, [authToken]);

    return (
        <VaccineRecordDisplayContext.Provider
            value={{
                DeleteContext,
                UpdateContext,
                AssignVaccine,
                vaccineRecord,
                loading,
                error,
                refetch: fetchVaccineRecordData, // optional
            }}
        >
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </VaccineRecordDisplayContext.Provider>
    );
};
