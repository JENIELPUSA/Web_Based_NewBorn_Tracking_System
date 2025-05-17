import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const VaccineRecordDisplayContext = createContext();

export const VaccineRecordDisplayProvider = ({ children }) => {
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
                    remarks:values.remarks,
                    next_due_date: values.next_due_date,
                    NUmberOfDose: values.NUmberOfDose,
                    status: values.status,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                setUsers((prevUsers) => [...prevUsers, res.data.data]);
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

    // Auto-fetch on mount
    useEffect(() => {
        fetchVaccineRecordData();
    }, [authToken]);

    return (
        <VaccineRecordDisplayContext.Provider
            value={{
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
