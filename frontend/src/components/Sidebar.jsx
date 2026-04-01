import { Home, UserPlus, Megaphone , Wallet, LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const [open, setOpen] = useState(false);

  const navItems = [
    { icon: <Home size={18} />, path: "/dashboard" },
    { icon: <UserPlus size={18} />, path: "/add-account" },
    { icon: <Megaphone  size={18} />, path: "/my-campaign" },
    { icon: <Wallet size={18} />, path: "/my-profile" },
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
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-pink-100 flex justify-between items-center p-3 shadow z-50">
        <h1 className="font-semibold">Dashboard</h1>

        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold">Clipster</h2>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* NAV */}
        <div className="p-4 space-y-3">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full p-2 rounded-lg ${
                location.pathname === item.path
                  ? "bg-pink-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.path.replace("/", "")}</span>
            </button>
          ))}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-100 rounded-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-16 bg-pink-100 flex-col items-center py-6 gap-6 shadow-sm z-50 border-r border-pink-200">

        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 bg-pink-500 rounded-md cursor-pointer"
        />

        {/* Nav Icons */}
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className={`p-3 rounded-xl transition ${
              location.pathname === item.path
                ? "bg-pink-500 text-white"
                : "text-pink-700 hover:bg-pink-200"
            }`}
          >
            {item.icon}
          </button>
        ))}

        {/* Logout */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="p-3 text-red-500 hover:bg-red-100 rounded-xl"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );
}