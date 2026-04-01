import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
export default function ProtectedRoute({ children }) {

  const accessToken = useAuthStore((state) => state.accessToken);

  // 🔐 If not logged in → redirect
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}