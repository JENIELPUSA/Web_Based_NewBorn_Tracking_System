import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import socket from "../socket.js";

const SocketListener = () => {
  const { role, userId } = useAuth();

  useEffect(() => {
    if (!userId || !role) return;

    const handleConnect = () => {
      socket.emit("register-user", { userId, role });
    };

    socket.connect();
    socket.on("connect", handleConnect);

    // Handlers (no UI notifications)
    const handleNotification = (data) => {
      // Maintenance notifications received
    };

    const handleVaccineNotification = (data) => {
      // Vaccine notification received
    };

    const handleUnvaccinatedAlert = (data) => {
      // Unvaccinated alert received
    };

    socket.on("maintenance-notifications", handleNotification);
    socket.on("vaccineNotification", handleVaccineNotification);
    socket.on("unvaccinated-alert", handleUnvaccinatedAlert);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("maintenance-notifications", handleNotification);
      socket.off("vaccineNotification", handleVaccineNotification);
      socket.off("unvaccinated-alert", handleUnvaccinatedAlert);
    };
  }, [role, userId]);

  return null;
};

export default SocketListener;
