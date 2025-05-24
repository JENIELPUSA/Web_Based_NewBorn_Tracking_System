import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { VaccineDisplayContext } from "../VaccineContext/VaccineContext";
export const VaccineRecordDisplayContext = createContext();

export const VaccineRecordDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const [vaccineRecord, setVaccineRecord] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken, userId, role, zone } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { fetchVaccineContext } = useContext(VaccineDisplayContext);
    const [calendardata, setCalendarData] = useState([]);

    const fetchVaccineRecordData = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const vaccineData = res?.data?.data || [];
            console.log("Full vaccine data from API:", vaccineData); // Debug log

            if (role === "Admin") {
                setVaccineRecord(vaccineData);
                setCalendarData(vaccineData);
            } else if (role === "BHW") {
                console.log("Current BHW userId:", userId); // Debug log

                // Process records to only include doses administered by this BHW
                const filteredRecords = vaccineData
                    .map((record) => {
                        // Filter doses for this specific BHW
                        const bhwsDoses = record.doses.filter((dose) => dose.administeredById === userId);

                        // Only include records that have doses administered by this BHW
                        return bhwsDoses.length > 0 ? { ...record, doses: bhwsDoses } : null;
                    })
                    .filter((record) => record !== null); // Remove null entries

                const filteredZoneRecords = vaccineData
                    .map((record) => {
                        // Filter doses that match the selected zone
                        const filteredDoses = record.doses.filter((dose) => dose.zone === zone);

                        // Return the full record only if it has matching doses
                        if (filteredDoses.length > 0) {
                            return {
                                ...record,
                                doses: filteredDoses, // only matching doses per record
                            };
                        }

                        // Skip if no matching doses
                        return null;
                    })
                    .filter(Boolean); // remove nulls (records with 0 matching doses)

                console.log("Filtered records for BHW:", filteredRecords); // Debug log
                setVaccineRecord(filteredRecords);
                setCalendarData(filteredZoneRecords);
                console.log("VaccineSpecific",filteredZoneRecords)
            }
        } catch (error) {
            console.error("Error fetching vaccine records:", error);
            toast.error("Failed to fetch vaccine records. Please try again later.");
            setError(error.response?.data?.message || "Failed to fetch data");
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
            if (res.data.status === "success") {
                fetchVaccineRecordData();
                fetchVaccineContext();
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
                calendardata,
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
