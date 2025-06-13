import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const LogContext = createContext();

export const LogDisplayProvider = ({ children }) => {
  const [LogData, setLogData] = useState();
  const [error, setError] = useState(null);
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    if (!authToken) {
      setLogData([]);
      return;
    }

    fetchLogData();
  }, [authToken]);

  const fetchLogData = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/LogAudit`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const userData = res?.data.data;
      setLogData(userData);
      console.log("fwqfqwf",userData)
    } catch (error) {
      console.error("Error fetching log data:", error);
      toast.error("Failed to fetch log data. Please try again later.");
      setError("Failed to fetch log data");
    }
  };

  return (
    <LogContext.Provider value={{ LogData}}>
      {children}
    </LogContext.Provider>
  );
};
