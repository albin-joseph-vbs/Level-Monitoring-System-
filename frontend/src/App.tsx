import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/Dashboard"; // ← add your protected pages here

// ─── Simple auth guard ────────────────────────────────────────────────────────
// Replace this with your real auth check (e.g. check context / redux store / token)
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — uncomment and add your pages */}
        {/* <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} /> */}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;