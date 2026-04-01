import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);


  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />; // ❗ MUST
}