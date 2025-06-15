import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import SuccessFailed from "../ReusableFolder/SuccessandField";

export const NotificationDisplayContext = createContext();
export const NotificationDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, role, userId, Designatedzone,logout } = useContext(AuthContext);
    const [notify, setNotification] = useState([]); // Initialize notification state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [error, setError] = useState(null); // Initialize error state

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const [pendingCount, setPendingCount] = useState(0); // Track the pending notification count

    useEffect(() => {
        if (!authToken) {
            setNotification([]);
            setLoading(false); // Stop loading when there is no token
            return;
        }

        fetchNotification();
    }, [authToken]); // Dependencies to trigger effect when page or items per page change

    useEffect(() => {
        if (!Array.isArray(notify) || !userId) return;

        const unreadNotifications = notify.filter((notification) => !notification.readBy.includes(userId));

        setPendingCount(unreadNotifications.length);
    }, [notify, userId]);


const fetchNotification = async () => {
    if (!authToken) {
        // Walang token — force logout
        logout();
        return;
    }

    setLoading(true);

    try {
        const response = await axios.get(
            `${impYort.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification`,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const notifications = response?.data?.data || [];

        if (role === "Admin") {
            setNotification(notifications);
        } else if (role === "Guest") {
            const filtered = notifications.filter(
                (notification) => notification.mother?._id === userId
            );
            setNotification(filtered);
        } else {
            const filtered = notifications.filter(
                (notification) =>
                    notification.mother?.zone?.toLowerCase().trim() ===
                    Designatedzone?.toLowerCase().trim()
            );
            setNotification(filtered);
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    } finally {
        setLoading(false);
    }
};


    return (
        <NotificationDisplayContext.Provider value={{ fetchNotification, notify, setNotification, pendingCount }}>
            {children}

            {/* Modal should be rendered here */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </NotificationDisplayContext.Provider>
    );
};
