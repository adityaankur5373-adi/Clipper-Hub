import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className=" bg-gradient-to-br bg-pink-100 min-h-screen">
      
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}