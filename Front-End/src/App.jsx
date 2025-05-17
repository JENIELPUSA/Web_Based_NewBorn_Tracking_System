import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import AddUser from "./component/User/Layout";
import NewBorn from "./component/NewBorn/Layout"
import Login from "./component/Login/login";
import Vaccine from "./component/Vaccine/Layout"
import RecordOfVaccine from "./component/VaccineRecord/Layout"
import CalendarLayout from "./component/Calendar/CalendarLayout"

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "Calendar",
                    element:<CalendarLayout/>,
                },
                {
                    path: "reports",
                    element: <h1 className="title">Reports</h1>,
                },
                {
                    path: "add-user",
                    element:<AddUser/>
                },
                {
                    path: "new-born",
                    element:<NewBorn/>,
                },
                {
                    path: "new-vaccine",
                    element: <Vaccine/>,
                },
                {
                    path: "new-record-vaccine",
                    element: <RecordOfVaccine/>,
                },
                {
                    path: "/login",
                    element: <Login/>
                },
                {
                    path: "new-product",
                    element: <h1 className="title">New Product</h1>,
                },
                {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
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
