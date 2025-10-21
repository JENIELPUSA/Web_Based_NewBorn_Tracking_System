import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext();
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const AuthProvider = ({ children }) => {
  //const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL); // Connect to your Socket.io server
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || null
  ); // Get token from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [fullName, setFullName] = useState(localStorage.getItem("fullName") || null);
  const [userId, setUserID] = useState(localStorage.getItem("userId") || null);
  const [Designatedzone, setDesignatedzone] = useState(localStorage.getItem("Designatedzone") || null);
  // Set the token globally for all axios requests
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers["Authorization"];
    }
  }, [authToken]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
        { email, password },
        { withCredentials: true } 
      );      

      console.log("Login response:", res.data);

      if (res.data.status === "Success") {
        const fullName=res.data.fullName;
        const token = res.data.token;
        const Designatedzone = res.data.Designatedzone;
        const role = res.data.role;
        const email = res.data.email;
        const userId = res.data.userId; // Get the user ID from response
        // Store token, role, email, and userId in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        localStorage.setItem("userId", userId); // Save ID
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("Designatedzone", Designatedzone);
        localStorage.setItem("authToken", token);
        


        // Set the token in global axios headers
        axios.defaults.headers["Authorization"] = `Bearer ${token}`;


        // Update the context
        setFullName(fullName)
        setAuthToken(token);
        setRole(role);
        setEmail(email);
        setUserID(userId); // Update context (if applicable)
        setDesignatedzone(Designatedzone)

        return { success: true, role, userId }; // Return ID along with role
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

const logout = () => {
  // Clear local storage
  localStorage.removeItem("fullName");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("Designatedzone");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  localStorage.removeItem("selectedLab");
  localStorage.removeItem("laboratory");
  localStorage.removeItem("selectedLabsData");
  localStorage.removeItem("assignedEquipments");
  localStorage.removeItem("maintenanceRequests");
  localStorage.removeItem("maintenanceData");
  localStorage.removeItem("maintenanceLabels");
   localStorage.removeItem("authToken");
  setAuthToken(null);
  setRole(null);
  setUserID(null);

  delete axios.defaults.headers["Authorization"];
};

  <ToastContainer />
  return (
    <AuthContext.Provider
      value={{ email, authToken, role, login, logout, userId,fullName,Designatedzone }}
    >
      {children}
    </AuthContext.Provider>
  );
  
};

export const useAuth = () => useContext(AuthContext);