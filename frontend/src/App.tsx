import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SensorDashboard from "./pages/SensorDashboard";
import LoginPage from "./pages/Loginpage";
import AdminDashboard from "./pages/AdminDashboard";

// ─── Auth check ───────────────────────────────────────────────────────────────
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

// ─── Protected route ──────────────────────────────────────────────────────────
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root → redirect to login (or dashboard if already authenticated) */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Protected dashboard */}
        <Route path="/dashboard" element={<PrivateRoute element={<SensorDashboard />} />} />

        {/* Protected admin — same guard as dashboard */}
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;