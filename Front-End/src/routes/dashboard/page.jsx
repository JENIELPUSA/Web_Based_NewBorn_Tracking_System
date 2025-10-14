import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import Card from "@/component/Card/card";
import AdminLogActionAudit from "@/component/Graph/AdminGraphandLogs";
import WeeklySchedule from "../../component/Graph/WeeklySchedule";
import Banner from "../../routes/dashboard/AdminBanner";
import { AuthContext } from "../../contexts/AuthContext";

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

    return (
        <div className="bg-background min-h-screen w-full">
            {/* Main Content Container */}
            <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
                {role === "Admin" ? (
                    <div className="flex flex-col gap-6">
                        <Banner />
                        <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4 shadow-lg sm:p-6 md:p-8">
                            <h1 className="mb-4 text-2xl font-bold text-[#7B8D6A] sm:text-3xl">Dashboard</h1>
                            <div className="space-y-6">
                                <Card />
                                <AdminLogActionAudit /> 
                            </div>
                        </div>
                    </div>
                ) : role === "BHW" ? (
                    <div className="flex flex-col gap-6">
                        <Banner />
                        <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4 shadow-lg sm:p-6 md:p-8">
                            <h1 className="mb-4 text-2xl font-bold text-blue-500 sm:text-3xl">Dashboard</h1>
                            <div className="space-y-6">
                                <Card />
                                <WeeklySchedule />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default DashboardPage;
