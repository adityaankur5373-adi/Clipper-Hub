import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-100 min-h-screen overflow-x-hidden">
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
        <Outlet />
      </div>
    </div>
  );
}