import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
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
    const [records, setRecords] = useState([]);
    const [patientID, setPatientID] = useState("");

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
                // Get all records from the same zone
                const recordsInMyZone = vaccineData.filter(
                    (record) => record.newbornZone?.toLowerCase().trim() === Designatedzone?.toLowerCase().trim(),
                );

                // From zone records, extract only those with doses administered by this BHW
                const recordsWithMyDoses = recordsInMyZone
                    .map((record) => {
                        const bhwDoses = record.doses.filter((dose) => dose.administeredById === userId);
                        return bhwDoses.length > 0 ? { ...record, doses: bhwDoses } : null;
                    })
                    .filter((record) => record !== null);

                // Calendar shows all from zone
                setCalendarData(recordsInMyZone);

                // Table shows only their own doses
                setVaccineRecord(recordsWithMyDoses);

                // Count vaccinations done by this BHW this month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                const vaccinatedThisMonthMap = new Map();

                recordsWithMyDoses.forEach((record) => {
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
                // For other roles (if any), show all data
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

const fetchVaccinationNewborn = useCallback(async (filters = {}) => {
    const formatFullAddress = (fullAddress) => {
        if (!fullAddress) return "";
        if (fullAddress.includes(",")) return fullAddress.trim();
        const match = fullAddress.match(/^ZONE\s+(\d+)\s+(.*)$/i);
        if (match) {
            const zone = match[1];
            const address = match[2];
            return `ZONE ${zone}, ${address}`;
        }
        return fullAddress.trim();
    };

    const cleanFilters = Object.fromEntries(
        Object.entries(filters)
            .filter(([_, val]) => val !== "" && val !== null && val !== undefined)
            .map(([key, val]) => {
                const trimmed = String(val).trim();
                if (key === "FullAddress") {
                    return [key, formatFullAddress(trimmed)];
                }
                return [key, trimmed];
            }),
    );

    try {
        setLoading(true);

        const params = Object.entries(cleanFilters)
            .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
            .join("&");

        console.log("✅ Final encoded query:", params);

        const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/VaccinationRecord/vaccination-records?${params}`,
        );

        const data = response.data.data;

        if (Array.isArray(data) && data.length > 0) {
            setRecords(data);
            setPatientID(response.data.patientID);
            setCustomError(null);
        } else {
            setRecords([]);
            toast.error("No Baby's Record. Please Record.");
        }
    } catch (err) {
        console.error("❌ Axios Error:", err);
        setCustomError("Failed to fetch vaccination records");
        setRecords([]);
    } finally {
        setLoading(false);
    }
}, []);

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
                refetch: fetchVaccineRecordData,
                fetchVaccinationNewborn,
                records,
                patientID,
                setRecords,
                setPatientID,
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
