import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, ROLE_HOME } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import DonorDashboard from "../pages/donor/DonorDashboard";
import ReceiverDashboard from "../pages/receiver/ReceiverDashboard";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home(user)} replace /> : <Login />} />
      <Route path="/admin/dashboard" element={<Protected role="Admin"><AdminDashboard /></Protected>} />
      <Route path="/donor/dashboard" element={<Protected role="Donor"><DonorDashboard /></Protected>} />
      <Route path="/receiver/dashboard" element={<Protected role="Receiver"><ReceiverDashboard /></Protected>} />
      <Route path="/volunteer/dashboard" element={<Protected role="Volunteer"><VolunteerDashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
