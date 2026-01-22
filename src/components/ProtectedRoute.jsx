import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user.isLoggedIn) return <Navigate to="/" />;
  if (!allowedRoles.includes(user.role)) ;

  return children;
};

export default ProtectedRoute;
