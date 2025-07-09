import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const ReportDisplayContext = createContext();

export const ReportDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [profilingData, setProfilingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customError, setCustomError] = useState("");
    const [message, setmessage] = useState("");

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000); // auto-dismiss after 5s

            return () => clearTimeout(timer); // cleanup
        }
    }, [customError]);

    // Helper function to extract error message from Axios error
    const getErrorMessage = async (error) => {
        if (error.response) {
            // If responseType is blob, try to read the blob as text
            if (error.response.data instanceof Blob) {
                try {
                    const errorText = await error.response.data.text();
                    try {
                        const errorJson = JSON.parse(errorText);
                        return errorJson.message || errorJson.error || "Unknown error from server (JSON blob).";
                    } catch (e) {
                        return errorText || "Unknown error from server (text blob).";
                    }
                } catch (readError) {
                    return "Failed to read error response (blob).";
                }
            } else {
                // For non-blob responses (e.g., JSON)
                const errorData = error.response.data;
                return typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
            }
        } else if (error.request) {
            return "No response from the server. Please check your network connection.";
        } else {
            return error.message || "An unexpected error occurred.";
        }
    };

    // For viewing/fetching data (JSON)
    const fetchProfillingData = async (from = "", to = "") => {
        if (!authToken) return;
        setLoading(true);
        setCustomError(""); // Clear previous error
        setmessage(""); // Clear previous message
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling/SpecificProfilling?from=${from}&to=${to}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            setProfilingData(res.data);
            if (res.data && res.data.length === 0) {
                setmessage("No data found."); // Set a specific message for no data
            } else {
                setmessage("Data fetched successfully!");
            }
        } catch (error) {
            const errorMessage = await getErrorMessage(error); // Use the helper
            setCustomError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // For downloading file (PDF or Excel) - Profilling
    const downloadProfillingReport = async (from, to) => {
        if (!authToken) return;
        setLoading(true);
        setCustomError(""); // Clear previous error
        setmessage(""); // Clear previous message
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Profilling/SpecificProfilling?from=${from}&to=${to}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    responseType: "blob", // Required for downloading files
                },
            );

            if (res.data.size === 0) {
                toast.info("No profiling report data found for the selected date range.");
                setmessage("No profiling report data found.");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition = res.headers["content-disposition"];
            let filename = "Profilling_Report.pdf";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object

            toast.success("Profiling report download started!");
            setmessage("Profiling report download started!");
        } catch (error) {
            const errorMessage = await getErrorMessage(error); // Use the helper
            setCustomError(errorMessage);
            toast.error(`Error downloading profiling report: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // For downloading file (PDF or Excel) - Newborn
    const downloadNewBornReport = async (from, to) => {
        if (!authToken) return;
        setLoading(true);
        setCustomError(""); // Clear previous error
        setmessage(""); // Clear previous message
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/GetBabyReport?from=${from}&to=${to}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                responseType: "blob",
            });

            if (res.data.size === 0) {
                toast.info("No newborn report data found for the selected date range.");
                setmessage("No newborn report data found.");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition = res.headers["content-disposition"];
            let filename = "Newborn_Report.pdf";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object

            toast.success("Newborn report download started!");
            setmessage("Newborn report download started!");
        } catch (error) {
            const errorMessage = await getErrorMessage(error); // Use the helper
            setCustomError(errorMessage);
            toast.error(`Error downloading newborn report: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // For downloading file (PDF or Excel) - Inventory
    const downloadIventoryReport = async (from, to) => {
        if (!authToken) return;
        setLoading(true);
        setCustomError(""); // Clear previous error
        setmessage(""); // Clear previous message
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Vaccine/VaccineReports?from=${from}&to=${to}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                responseType: "blob",
            });

            if (res.data.size === 0) {
                toast.info("No inventory report data found for the selected date range.");
                setmessage("No inventory report data found.");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition = res.headers["content-disposition"];
            let filename = "Inventory_Reports.pdf";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object

            toast.success("Inventory report download started!");
            setmessage("Inventory report download started!");
        } catch (error) {
            const errorMessage = await getErrorMessage(error); // Use the helper
            setCustomError(errorMessage);
            toast.error(`Error downloading inventory report: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ReportDisplayContext.Provider
            value={{
                customError,
                message,
                downloadIventoryReport,
                fetchProfillingData,
                downloadProfillingReport,
                downloadNewBornReport,
                profilingData,
                loading,
            }}
        >
            {children}
        </ReportDisplayContext.Provider>
    );
};
