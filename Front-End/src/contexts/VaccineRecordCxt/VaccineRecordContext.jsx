import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { VaccineDisplayContext } from "../VaccineContext/VaccineContext";
import axiosInstance from "../../ReusableFolder/axioxInstance";

import { VaccinePerContext } from "../PerBabyVacine/PerBabyVacineContext";
export const VaccineRecordDisplayContext = createContext();

export const VaccineRecordDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const [vaccineRecord, setVaccineRecord] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken, userId, role, Designatedzone } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { fetchVaccineContext } = useContext(VaccineDisplayContext);
    const [calendardata, setCalendarData] = useState([]);
    const [isMaleVacinated, setMale] = useState("");
    const [isFemaleVacinated, setFemale] = useState("");
    const [isTotalVacinated, setTotalVacinated] = useState("");
    const { fetchPerVaccine } = useContext(VaccinePerContext);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchVaccineRecordData = async () => {
        setLoading(true);

        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord`);

            const vaccineData = res?.data?.data || [];
            setCustomError("");

            if (role === "Admin") {
                setVaccineRecord(vaccineData);
                setCalendarData(vaccineData);
            } else if (role === "BHW") {
                const filteredRecords = vaccineData
                    .map((record) => {
                        const bhwsDoses = record.doses.filter((dose) => dose.administeredById === userId);
                        return bhwsDoses.length > 0 ? { ...record, doses: bhwsDoses } : null;
                    })
                    .filter((record) => record !== null);

                const filteredByZone = vaccineData.filter(
                    (record) => record.newbornZone?.toLowerCase().trim() === Designatedzone?.toLowerCase().trim(),
                );
                setVaccineRecord(filteredRecords);
                setCalendarData(filteredByZone);

                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                const vaccinatedThisMonthMap = new Map();
                filteredByZone.forEach((record) => {
                    record.doses.forEach((dose) => {
                        const doseDate = new Date(dose.dateGiven);
                        if (doseDate >= startOfMonth && doseDate <= endOfMonth) {
                            if (!vaccinatedThisMonthMap.has(record.newbornName)) {
                                vaccinatedThisMonthMap.set(record.newbornName, record.gender);
                            }
                        }
                    });
                });

                const totalVaccinated = vaccinatedThisMonthMap.size;
                let totalFemale = 0;
                let totalMale = 0;

                vaccinatedThisMonthMap.forEach((gender) => {
                    if (gender?.toLowerCase() === "female") totalFemale++;
                    else if (gender?.toLowerCase() === "male") totalMale++;
                });

                setMale(totalMale);
                setFemale(totalFemale);
                setTotalVacinated(totalVaccinated);
            } else {
                // Any user who is not BHW (or walang role) can view all data
                setVaccineRecord(vaccineData);
                setCalendarData(vaccineData);
            }
        } catch (error) {
            console.error("Error fetching vaccine records:", error);
            setCustomError(error.response?.data?.message || "Failed to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const AssignVaccine = async (values) => {
        try {
            const res = await axiosInstance.post(
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
                await Promise.all([fetchPerVaccine(), fetchVaccineRecordData(), fetchVaccineContext()]);
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: res?.data.data };
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

            return { success: false, error: error.message };
        }
    };

    const UpdateContext = async (values, recordId, doseId) => {
        try {
            setLoading(true);
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

                return { success: true, data: response?.data.data };
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
            const response = await axiosInstance.delete(
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
                isTotalVacinated,
                isMaleVacinated,
                isFemaleVacinated,
                customError,
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
