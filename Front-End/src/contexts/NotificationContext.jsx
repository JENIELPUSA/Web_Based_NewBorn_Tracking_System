import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import SuccessFailed from "../ReusableFolder/SuccessandField";

export const NotificationDisplayContext = createContext();

export const NotificationDisplayProvider = ({ children }) => {
  const [notify, setNotification] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");

  const { authToken, userId, logout } = useContext(AuthContext);

  // 🔁 Fetch notifications on authToken change
  useEffect(() => {
    if (!authToken) {
      setNotification([]);
      setLoading(false);
      return;
    }

    fetchNotification();
  }, [authToken]);

  // 🔁 Count unread notifications for the current user
  useEffect(() => {
    if (!Array.isArray(notify) || !userId) return;

    const unreadNotifications = notify.filter((notification) =>
      notification.viewers?.some(
        (viewer) =>
          viewer.user?.toString?.() === userId?.toString() &&
          viewer.isRead === false
      )
    );

    setPendingCount(unreadNotifications.length);
  }, [notify, userId]);

  // 📥 Fetch notifications from backend
  const fetchNotification = async () => {
    if (!authToken) {
      logout();
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const notifications = response?.data?.data || [];

      const filtered = notifications.filter((notification) =>
        notification.viewers?.some(
          (viewer) =>
            viewer.user?.toString?.() === userId?.toString()
        )
      );

      console.log("🔔 Filtered Notifications:", filtered);
      setNotification(filtered);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationDisplayContext.Provider
      value={{
        fetchNotification,
        notify,
        setNotification,
        pendingCount,
        loading,
        setLoading,
      }}
    >
      {children}

      <SuccessFailed
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </NotificationDisplayContext.Provider>
  );
};
