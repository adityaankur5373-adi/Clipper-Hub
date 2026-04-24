import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 min-h-screen">
      
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}