import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
<nav className="fixed top-0 w-full z-50 h-16 
bg-indigo-100/80 backdrop-blur-md text-indigo-900 shadow-sm">
      {/* 🔹 Container */}
   <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* 🔹 Logo */}
       <div 
  className="flex items-center gap-3 cursor-pointer"
  onClick={() => navigate("/")}
>
 <img 
  src="/Logo_ClipperHub.jpg.jpeg" 
  alt="Clipper Hub Logo"
  className="h-10 w-auto object-contain"
/>
  <h1 className="text-xl font-semibold tracking-wide text-indigo-900">
    CLIPPER HUB
  </h1>
</div>

        {/* 🔹 Desktop Buttons */}
        <div className="hidden md:flex items-center gap-6">

          <button
            onClick={() => navigate("/launch")}
            className="px-5 py-2 border border-indigo-300 rounded-full text-sm text-indigo-700 hover:bg-indigo-100 transition"
          >
            Launch campaign
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-sm font-medium text-white hover:opacity-90 transition"
          >
            Join as creator
          </button>

        </div>

        {/* 🔹 Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="text-xl text-indigo-900"
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
            className="w-full px-4 py-2 border border-indigo-300 rounded-full text-sm text-indigo-700"
          >
            Launch campaign
          </button>

          <button
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
            className="w-full px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-sm font-medium text-white"
          >
            Join as creator
          </button>

        </div>
      )}
    </nav>
  );
}