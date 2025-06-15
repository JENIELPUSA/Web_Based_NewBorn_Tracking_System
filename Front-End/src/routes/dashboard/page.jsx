import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTheme } from "@/hooks/use-theme";



import { Footer } from "@/layouts/footer";
import Card from "@/component/Card/card";
import LogActionAudit from "@/component/Graph/graphandlogaction"
import Tablefrom from "@/component/Table/Table"
import { AuthContext } from "../../contexts/AuthContext";
import WeeklySchedule from "../../component/Graph/WeeklySchedule";
import { useContext } from "react";



const DashboardPage = () => {
    const { theme } = useTheme();
    const {role}=useContext(AuthContext)

return (
    role === "Admin" ? (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            <Card />
            <LogActionAudit />
            <Footer />
        </div>
    ) : role==="BHW"?(
          <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            <Card/>
            <WeeklySchedule/>
            <Footer />
        </div>
    ):null
);

};

export default DashboardPage;
