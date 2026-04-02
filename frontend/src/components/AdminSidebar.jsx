import { Home, Users, Inbox, Wallet, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function AdminSidebar() {
const [open, setOpen] = useState(false);
const navigate = useNavigate();
const location = useLocation();
const logout = useAuthStore((state) => state.logout);

const navItems = [
{ name: "Dashboard", icon: <Home size={18} />, path: "/admin" },
{ name: "Users", icon: <Users size={18} />, path: "/admin/users" },
{ name: "Submissions", icon: <Inbox size={18} />, path: "/admin/submission" },
{ name: "Withdrawal", icon: <Wallet size={18} />, path: "/admin/withdrawal" },
];

const handleLogout = async () => {
try {
await logout();
toast.success("Logged out successfully 👋");
navigate("/login");
} catch {
toast.error("Logout failed ❌");
}
};

return (
<>
{/* ===== MOBILE TOP BAR ===== */} <div className="md:hidden fixed top-0 left-0 right-0 bg-blue-950 text-white flex justify-between items-center p-4 shadow z-50"> <h1 className="font-semibold">Admin Panel</h1>
<button onClick={() => setOpen(true)}> <Menu /> </button> </div>

```
  {/* ===== MOBILE DRAWER ===== */}
  <div
    className={`fixed top-0 left-0 h-full w-64 bg-blue-950 text-blue-100 z-50 shadow transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"} md:hidden`}
  >
    <div className="flex justify-between items-center p-4 border-b border-blue-800">
      <h2 className="font-bold">Admin</h2>
      <button onClick={() => setOpen(false)}>
        <X />
      </button>
    </div>

    <div className="p-4 space-y-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition ${
              isActive
                ? "bg-blue-800 text-white border-l-4 border-yellow-400"
                : "hover:bg-blue-900"
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  </div>

  {/* ===== OVERLAY ===== */}
  {open && (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/40 z-40 md:hidden"
    />
  )}

  {/* ===== DESKTOP SIDEBAR ===== */}
  <div className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-blue-950 text-blue-100 border-r border-blue-800 shadow-sm flex-col p-4">

    <h2 className="text-xl font-bold mb-6">Admin</h2>

    <div className="space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${
              isActive
                ? "bg-blue-800 text-white border-l-4 border-yellow-400"
                : "hover:bg-blue-900"
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        );
      })}
    </div>

    <div className="mt-auto">
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  </div>
</>
);
}
