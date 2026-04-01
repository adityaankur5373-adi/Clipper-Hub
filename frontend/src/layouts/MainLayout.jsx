import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className=" bg-gradient-to-br from-[#5de0e6] to-[#004aad] min-h-screen">
      
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}