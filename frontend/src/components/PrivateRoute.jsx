import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Prevent page flash while auth restores from localStorage
  if (loading) {
    return <Loader />;
  }

  // Extra security check:
  // if token removed manually but stale user exists, block access
  const token = localStorage.getItem("token");

  // Redirect unauthenticated users
  if (!isAuthenticated || !user || !token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Authenticated
  return children;
};

export default PrivateRoute;