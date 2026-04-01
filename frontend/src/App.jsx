import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "./components/Loading";
import LandingPage from "./pages/Landingpage";
import AuthLayout from "./layouts/AuthLayout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import MainLayout from "./layouts/MainLayout";
import LaunchCampaign from "./pages/LaunchCampaign";
import { Toaster } from "react-hot-toast";
import AdminRoute from "./routes/AdminRoute";
import AdminCampaigns from "./pages/AdminCampaigns";
import AccountsPage from "./pages/AccountsPage";
import AdminAccounts from "./pages/AdminAccounts";
import CampaignDetails from "./pages/CampaignDetails";
import AdminLayout from "./layouts/AdminLayout";
import CreateCampaign from "./pages/CreateCampaign";
import Profile from "./pages/Profile";
import MyCampaigns from "./pages/MyCampaigns";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminInstagram from "./pages/AdminInstagram";
export default function App() {

  const restoreAuth = useAuthStore((state) => state.restoreAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await restoreAuth();
      } catch (err) {
        console.error("Auth restore failed", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [restoreAuth]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* ✅ GLOBAL TOASTER */}
      <Toaster
  position="top-center"
  toastOptions={{
    duration: 3000,
    style: {
      background: "#ffe4ec",   // light pink
      color: "#831843",        // deep pink text
      border: "1px solid #f9a8d4", // soft pink border
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 4px 20px rgba(244, 114, 182, 0.25)",
    },
  }}
/>

      <BrowserRouter>
        <Routes>

          {/* ✅ MAIN LAYOUT (Navbar + Footer) */}
          <Route element={<MainLayout />}>

            {/* Landing Page */}
            <Route
              path="/"
              element={
                  <LandingPage />
              }
            />

            {/* Launch Campaign (protected but with navbar/footer) */}
            <Route
              path="/launch"
              element={
                  <LaunchCampaign />
              }
            />

          </Route>

          {/* ✅ Auth Layout (NO Navbar/Footer) */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
          </Route>
          {/* ✅ Dashboard (separate layout if needed) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
           <Route
            path="/my-campaign"
            element={
              <ProtectedRoute>
                <MyCampaigns />
              </ProtectedRoute>
            }
          />
          <Route element={<AdminRoute />}>

        {/* 📦 ADMIN LAYOUT */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminCampaigns />} />
            <Route path="create/:id" element={<CreateCampaign />} />
          <Route path="users" element={<AdminAccounts />} />
           <Route path="submission" element={<AdminSubmissions/>} />
<Route path="withdrawl" element={<AdminWithdrawals/>} />
<Route path="instagram/:submissionId" element={<AdminInstagram />} />
        </Route>
      </Route>
 <Route
            path="/add-account"
            element={
              <ProtectedRoute>
               <AccountsPage/>
              </ProtectedRoute>
            }
          />
          <Route
  path="/campaign/:id"
  element={
    <ProtectedRoute>
      <CampaignDetails />
    </ProtectedRoute>
  }
/>
        </Routes>
      </BrowserRouter>
    </>
  );
}