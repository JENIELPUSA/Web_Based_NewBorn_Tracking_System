import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import Card from "@/component/Card/card";
import LogActionAudit from "@/component/Graph/graphandlogaction";
import Tablefrom from "@/component/Table/Table";
import { AuthContext } from "../../contexts/AuthContext";
import WeeklySchedule from "../../component/Graph/WeeklySchedule";

const DashboardPage = () => {
    const { theme } = useTheme();
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (!role) {
            navigate("/login");
        }
    }, [role, navigate]);

    if (!role) return null;

    return role === "Admin" ? (
        <div className="flex flex-col gap-y-4">
            <h1 className="title text-blue-500">Dashboard</h1>
            <Card />
            <LogActionAudit />
            <Footer />
        </div>
    ) : role === "BHW" ? (
        <div className="flex flex-col gap-y-4">
            <h1 className="title text-blue-500">Dashboard</h1>
            <Card />
            <WeeklySchedule />
            <Footer />
        </div>
    ) : null;
};

export default DashboardPage;
