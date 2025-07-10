// component/PublicRoute/PublicRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  return token ? (
    <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
