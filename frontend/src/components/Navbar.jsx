import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 
   bg-white/10 backdrop-blur-xl border-b border-white/20">

      {/* 🔹 Container */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔹 Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-red-500 rounded-sm"></div>
          <h1 className="text-xl font-semibold tracking-wide text-gray-800">
            CLIPPER HUB
          </h1>
        </div>

        {/* 🔹 Desktop Buttons */}
        <div className="hidden md:flex items-center gap-6">

          <button
            onClick={() => navigate("/launch")}
            className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Launch campaign
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-sm font-medium text-white hover:opacity-90 transition"
          >
            Join as creator
          </button>

        </div>

        {/* 🔹 Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="text-xl text-gray-800"
          >
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>

      </div>

      {/* 🔹 Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-white/80 backdrop-blur-md">

          <button
            onClick={() => {
              navigate("/launch");
              setMenuOpen(false);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700"
          >
            Launch campaign
          </button>

          <button
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
            className="w-full px-5 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-sm font-medium text-white"
          >
            Join as creator
          </button>

        </div>
      )}
    </nav>
  );
}