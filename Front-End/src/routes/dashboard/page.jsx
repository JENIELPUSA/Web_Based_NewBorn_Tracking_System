import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTheme } from "@/hooks/use-theme";



import { Footer } from "@/layouts/footer";
import Card from "@/component/Card/card";
import LogActionAudit from "@/component/Graph/graphandlogaction"
import Tablefrom from "@/component/Table/Table"



const DashboardPage = () => {
    const { theme } = useTheme();


    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            <Card/>
            <LogActionAudit/>
            <Footer />
        </div>
    );
};

export default DashboardPage;
