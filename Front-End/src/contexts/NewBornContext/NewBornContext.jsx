import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const NewBornDisplayContext = createContext();

//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
export const NewBornDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, role, Designatedzone } = useContext(AuthContext);
    const [newBorn, setNewBorn] = useState([]); // Initialize equipment state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [error, setError] = useState(null); // Initialize error state
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [Totalbaby, setTotalBaby] = useState("");
    const [TotalMale, setTotalMale] = useState("");
    const [TotalFemale, setTotalFemale] = useState("");
    const [isGraphData, setGraphData] = useState("");

    // Get token from localStorage
    const [usersPerPage, setusersPerPage] = useState(6);

    useEffect(() => {
        if (!authToken) {
            setNewBorn([]);
            setLoading(false); // Stop loading when there is no token
            return;
        }

        fetchGraph();

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

    useEffect(() => {
        if (!newBorn || newBorn.length === 0) {
            setTotalBaby(0);
            setTotalMale(0);
            setTotalFemale(0);
            return;
        }

        setTotalBaby(newBorn.length);
        setTotalMale(newBorn.filter((nb) => nb.gender === "Male").length);
        setTotalFemale(newBorn.filter((nb) => nb.gender === "Female").length);
    }, [newBorn]);

    const fetchUserData = async () => {
        if (!authToken) return;
        setLoading(true); // Set loading to true before fetching data
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const NewBornData = res?.data.data;
            const Totalbaby = res.data.totalRecords;
            const TotalMale = res.data.totalMale;
            const TotalFemale = res.data.totalFemale;

            if (role === "Admin") {
                setTotalMale(TotalMale);
                setNewBorn(NewBornData);
                setTotalFemale(TotalFemale);
                setTotalBaby(Totalbaby);
            } else if (role === "BHW") {
                const filteredUserData = NewBornData.filter((user) => {
                    return user.zone?.toLowerCase().trim() === Designatedzone.toLowerCase().trim();
                });

                setNewBorn(filteredUserData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const fetchGraph = async () => {
        if (!authToken) return;
        setLoading(true); // Set loading to true before fetching data
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/DisplayGraph`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const GraphData = res.data.topBabies;

            if (role === "Admin") {
                setGraphData(GraphData);
            } else if (role === "BHW") {
                const filteredUserData = GraphData.filter((user) => {
                    return user.zone?.toLowerCase().trim() === Designatedzone.toLowerCase().trim();
                });
                setGraphData(filteredUserData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const AddNewBorn = async (values, userId) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn`,
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    middleName: values.middleName,
                    extensionName: values.extensionName,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    birthWeight: values.birthWeight,
                    motherName: values.motherName,
                    address: values.address,
                    zone: values.zone,
                    addedBy: userId,
                    birthHeight: values.birthHeight,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                setNewBorn((prevUsers) => [...prevUsers, res.data.data]);
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

    const DeleteNewBorn = async (newbordID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/${newbordID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setNewBorn((prevUsers) => prevUsers.filter((user) => user._id !== newbordID));
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

    const UpdateBorn = async (bornID, values) => {
        try {
            const dataToSend = {
                firstName: values.firstName || "",
                lastName: values.lastName || "",
                extensionName: values.extensionName || "",
                middleName: values.middleName || "",
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString().slice(0, 10) : "",
                gender: values.gender || "",
                birthWeight: values.birthWeight || "",
                birthHeight: values.birthHeight || "",
                motherName: values.motherName || "",
            };

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/NewBorn/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data?.status === "success") {
                fetchUserData();
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
        <NewBornDisplayContext.Provider
            value={{
                TotalFemale,
                Totalbaby,
                TotalMale,
                newBorn,
                customError,
                AddNewBorn,
                DeleteNewBorn,
                UpdateBorn,
                isGraphData,
            }}
        >
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </NewBornDisplayContext.Provider>
    );
};
