import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import DashboardLayout from "./components/Layout/DashboardLayout";
// Imports ko update karein paths ke mutabiq
import { ForgotPassword, Login, ResetPassword, Signup } from "./pages/Auth";
import {
  Home,
  Usage,
  PredictionBill,
  Tips,
  Alerts,
  Support,
  History
} from "./pages/User";
import {
  AdminDashboard,
  AIPerformance,
  Broadcast,
  ManageUsers,
  OCRValidation,
  SupportTicket,
  SystemLogs,
} from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  About,
  Contact,
  Unauthorized,
  Startup,
  SlabWorking,
  Settings,
  TariffGuide,
} from "./pages/common";
import ApplianceForm from "./pages/User/ApplianceForm";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      {/* 🌍 Public Routes (Sab ke liye) */}
      <Route index element={<Startup />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="how-it-works" element={<SlabWorking />} />
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="register" element={<Signup />} />
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* 🔐 Protected Area (Dashboard Wrapper) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ⚙️ Shared Route: Dono Admin aur User isay access kar sakte hain */}

          <Route path="settings" element={<Settings />} />
          <Route path="tariff" element={<TariffGuide />} />

          {/* 👤 User Specific Routes */}
          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="setup-profile" element={<ApplianceForm />} />
            <Route path="home" element={<Home />} />
            <Route path="usage" element={<Usage />} />
            <Route path="predict" element={<PredictionBill />} />
            <Route path="history" element={<History />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="tips" element={<Tips />} />
            <Route path="about-slabguard" element={<About />} />
            <Route path="support" element={<Support />} />
            {/* Future user routes yahan ayenge */}
          </Route>

          {/* 🛡️ Admin Specific Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/manage-users" element={<ManageUsers />} />
            <Route path="admin/tariff-rates" element={<TariffGuide />} />
            <Route path="admin/ai-performance" element={<AIPerformance />} />
            <Route path="admin/ocr" element={<OCRValidation />} />
            <Route path="admin/broadcast" element={<Broadcast />} />
            <Route path="admin/support" element={<SupportTicket />} />
            <Route path="admin/logs" element={<SystemLogs />} />
          </Route>
        </Route>
      </Route>
    </Route>,
  ),
);

export default router;
