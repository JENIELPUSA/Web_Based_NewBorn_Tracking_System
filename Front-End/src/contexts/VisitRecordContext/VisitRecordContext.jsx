import React, { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const VisitRecordContexts = createContext();

export const VisitRecordProvider = ({ children }) => {
    const [isRecord, setRecord] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { authToken, userId } = useContext(AuthContext);
    const [customError, setCustomError] = useState("");
    const [isSpecificData, setSpecificData] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLatestcData, setLatestData] = useState("");
    const AddVisit = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Record`,
                {
                    health_condition: values.health_condition,
                    newborn: values.newborn,
                    height: values.height,
                    weight: values.weight,
                    notes: values.notes,
                    visitDate: values.visitDate,
                    addedBy: values.addedBy,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                setRecord((prevUsers) => [...prevUsers, res.data.data]);
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

    const fetchSpecificData = useCallback(
        async (id) => {
            if (!authToken || !id) return;
            setLoading(true);
            try {
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Record/AllRelated/${id}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setSpecificData(res.data.data);
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) {
                    setSpecificData([]);
                } else {
                    console.error("Error fetching specific data:", error.response?.data || error.message);
                    setCustomError("Failed to fetch profile data");
                }
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );

    const fetchLatestData = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            console.log("Fetching latest record for ID:", id);
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Record/latest/${id}`);
            console.log("Response:", res.data);
            setLatestData(res.data.data);
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                setLatestData([]);
            } else {
                console.error("Error fetching latest data:", error.response?.data || error.message);
                setCustomError("Failed to fetch profile data");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const DeleteCheckup = async (CheckupID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Record/${CheckupID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setSpecificData((prevUsers) => prevUsers.filter((user) => user._id !== CheckupID));
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

    const UpdateVisit = async (id, values) => {
        try {
            const res = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Record/${id}`,
                {
                    health_condition: values.health_condition,
                    newborn: values.newborn,
                    height: values.height,
                    weight: values.weight,
                    notes: values.notes,
                    visitDate: values.visitDate,
                    addedBy: values.addedBy,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                setRecord((prevRecords) => prevRecords.map((record) => (record._id === id ? res.data.data : record)));
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
        <VisitRecordContexts.Provider
            value={{ UpdateVisit,DeleteCheckup, setSpecificData, setLatestData, fetchLatestData, AddVisit, isSpecificData, fetchSpecificData, isLatestcData }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </VisitRecordContexts.Provider>
    );
};
