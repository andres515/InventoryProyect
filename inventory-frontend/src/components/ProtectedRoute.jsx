import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Normalizamos el rol
  const userRole = user.role?.toUpperCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;