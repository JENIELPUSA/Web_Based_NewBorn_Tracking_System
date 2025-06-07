import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import socket from "../socket.js";
import { toast } from "react-toastify";

const SocketListener = () => {
  const { role, userId } = useAuth();

useEffect(() => {
  if (!userId || !role) return;

  // Always register on every connection
  const handleConnect = () => {
    socket.emit("register-user", { userId, role });
    console.log(`✅ User ${role} (${userId}) registered on socket connect.`);
  };

  socket.on("connect", handleConnect);
  socket.connect(); // always try to connect

  // Handlers
  const handleNotification = (data) => {
    console.log("🛠️ Maintenance notification:", data);
    toast.info(data.message || "New maintenance request");
  };

  const handleVaccineNotification = (data) => {
    console.log("💉 Vaccine notification:", data.message);
    toast.success(data.message || "Vaccine notification received");
  };

  const handleUnvaccinatedAlert = (data) => {
    console.log("🚨 Unvaccinated alert:", data.message);
    toast.warning(data.message || "Unvaccinated alert received");
  };

  // Register listeners
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
