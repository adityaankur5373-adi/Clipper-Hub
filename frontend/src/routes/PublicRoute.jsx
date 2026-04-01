import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PublicRoute({ children }) {

  const accessToken = useAuthStore((state) => state.accessToken);

  // 🔐 If already logged in → go to dashboard
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}