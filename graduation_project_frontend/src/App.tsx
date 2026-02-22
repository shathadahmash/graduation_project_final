import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useStore';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import DashboardRouter from './components/DashboardRouter';

// ✅ import page
import SysManagerImport from "./Pages/dashboards/SystemManager/sysManagerImport";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ ADD THIS ROUTE HERE */}
        <Route
          path="/dashboard/system-manager/import-users"
          element={
            <ProtectedRoute>
              <SysManagerImport />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
