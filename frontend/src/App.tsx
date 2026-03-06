import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SensorDashboard from "./pages/SensorDashboard"; // Ensure the filename matches

const isAuthenticated = (): boolean => {
  // Check for 'access_token' as that's what your login page saves to localStorage
  return !!localStorage.getItem("access_token");
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<PrivateRoute element={<SensorDashboard />} />} />
      </Routes>
    </Router>
  );
};

export default App;