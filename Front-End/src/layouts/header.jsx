import { useEffect, useState,useContext } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";
import NotificationDropdown from "../component/Notification/NotificationDropdown";
import socket from "@/socket"; // Make sure this is your default export from socket.js
import { NotificationDisplayContext } from "../contexts/NotificationContext";
import { AuthContext } from "../contexts/AuthContext";

export const Header = ({ collapsed, setCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const {fetchNotification,pendingCount,notify}=useContext(NotificationDisplayContext)
const {userId}=useContext(AuthContext);
  const handleBellClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    fetchNotification();
  };
  useEffect(() => {
    // Listen for "all-vaccines-completed" event
    socket.on("all-vaccines-completed", (data) => {
  console.log("Vaccine Completed Notification:", data.message);
  fetchNotification();
});

const handleVaccineNotification = (data) => {
    console.log("💉 Vaccine notification:", data.message);
   fetchNotification();
  };

socket.on("unvaccinated-alert", (data) => {
  console.log("🛎 Unvaccinated Alert:", data.message);
  fetchNotification();
});
 socket.on("vaccineNotification", handleVaccineNotification);
    // Clean up
    return () => {
       socket.off("vaccineNotification", handleVaccineNotification);
      socket.off("all-vaccines-completed");
       socket.off("unvaccinated-alert");
    };
  }, []);

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
      <div className="flex items-center gap-x-3">
        <button className="btn-ghost size-10" onClick={() => setCollapsed(!collapsed)}>
          <ChevronsLeft className={collapsed && "rotate-180"} />
        </button>
      </div>
      <div className="flex items-center gap-x-3">
        <button
          className="btn-ghost size-10"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun size={20} className="dark:hidden" />
          <Moon size={20} className="hidden dark:block" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="btn-ghost size-10" onClick={handleBellClick}>
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-xs text-white" />
            )}
          </button>
          {isNotificationDropdownOpen && (
            <NotificationDropdown
              notifications={notify}
              onClose={handleBellClick}
            />
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
