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
    // Login Route
    {
      path: "/login",
      element: <Login />,
    },
    // Redirect root path to /login
    {
      path: "/",
      element: <Login />,
    },
    // Dashboard & a    ll children
    {
      path: "/dashboard",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "/dashboard/calendar",
          element: <CalendarLayout />,
        },
        {
          path: "/dashboard/reports",
          element: <h1 className="title">Reports</h1>,
        },
        {
          path: "/dashboard/add-user",
          element: <AddUser />,
        },
        {
          path: "/dashboard/new-born",
          element: <NewBorn />,
        },
        {
          path: "/dashboard/new-vaccine",
          element: <Vaccine />,
        },
        {
          path: "/dashboard/new-record-vaccine",
          element: <RecordOfVaccine />,
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
