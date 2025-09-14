import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import AddUser from "./component/User/Layout";
import NewBorn from "./component/NewBorn/Layout";
import Login from "./component/Login/login";
import Vaccine from "./component/Vaccine/Layout";
import RecordOfVaccine from "./component/VaccineRecord/Layout";
import CalendarLayout from "./component/Calendar/CalendarLayout";
import ProfillingLayout from "./component/Profilling/Layout";
import ForgotPassword from "./component/ForgotPassword/ForgotPassword";
import ResetPassword from "./component/ResetPassword/ResetPassword";
import ParentLayout from "./component/ParentsComponent/LayoutParent";
import PdfReport from "./component/Reports/ReportsLayout";
import ParentLayoutTable from "./component/ParentsComponent/ParentLayoutTable";
import Brand from "./component/Brand/LayoutTable";
import ParentLayoutFinals from "./component/ParentsComponent/ParentLayoutFinals";
import ParentComponent from "./component/ParentsComponent/ParentComponent";
import Profile from "./component/User/Profile";
import ParentDashboard from "./component/ParentDashboard/ParentDashboard";
import ParentLayoutDashboard from "./component/ParentDashboard/ParentLayoutDashboar";
import PrivateRoute from "./component/PrivateRoute/PrivateRoute";
import PublicRoute from "./component/PublicRoute/PublicRoute";
import LandingPage from "./component/LandingPage/landingpage";
function App() {
    const router = createBrowserRouter([
        // Public Routes (Login, Reset Password)
        {
            element: <PublicRoute />, // 👈 Wrap public routes
            children: [
                {
                    path: "/login",
                    element: <LandingPage />,
                },
                {
                    path: "/reset-password/:token",
                    element: <ResetPassword />,
                },
                {
                    path: "/",
                    element: <LandingPage/>,
                }
                 
            ],
        },

        // Parent Routes (optional public)
        {
            path: "/parent-dashboard",
            element: <ParentLayoutDashboard />,
        },
        {
            path: "/parent-view",
            element: <ParentLayoutFinals />,
        },

        // Protected Routes under /dashboard
        {
            element: <PrivateRoute />, // 👈 Require token
            children: [
                {
                    path: "/dashboard",
                    element: <Layout />,
                    children: [
                        {
                            index: true,
                            element: <DashboardPage />,
                        },
                        {
                            path: "calendar",
                            element: <CalendarLayout />,
                        },
                        {
                            path: "add-user",
                            element: <AddUser />,
                        },
                        {
                            path: "add-parent",
                            element: <ParentLayoutTable />,
                        },
                        {
                            path: "new-born",
                            element: <NewBorn />,
                        },
                        {
                            path: "brand",
                            element: <Brand />,
                        },
                        {
                            path: "new-vaccine",
                            element: <Vaccine />,
                        },
                        {
                            path: "new-record-vaccine",
                            element: <RecordOfVaccine />,
                        },
                        {
                            path: "Profilling_Dash",
                            element: <ProfillingLayout />,
                        },
                        {
                            path: "update-password",
                            element: <Profile />,
                        },
                        {
                            path: "PDF-Report",
                            element: <PdfReport />,
                        },
                    ],
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}
export default App;
