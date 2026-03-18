import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useStore';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import DashboardRouter from './components/DashboardRouter';
import ProjectSearch from './components/uni_college_department_branch/ProjectSearch';
import UniversityDetails from "./components/UniversityDetails";

// Pages
import SysManagerImport from "./Pages/dashboards/SystemManager/sysManagerImport";
import ProjectDetails from './components/uni_college_department_branch/ProjectDetails';
import ProjectDetailModal from './components/ProjectDetailModal';
import ProjectCollegeSearch from './components/ProjectCollegeSearch';
import ProjectUniversitySearch from './components/ProjectUniversitySearch';
import ProjectDepartmentSearch from './components/ProjectDepartmentSearch';
import ProjectProgramSearch from './components/ProjectProgramSearch';

import CollegeDetails from './components/CollegeDetails';
     // NEW


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

        {/* System Manager Import */}
        <Route
          path="/dashboard/system-manager/import-users"
          element={
            <ProtectedRoute>
              <SysManagerImport />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Project Routes */}
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/projectdetail/:id" element={<ProjectDetails />} />
        <Route path="/projectdetail" element={<ProjectDetails />} />

        {/* Project Search Variants */}
        <Route path="/ProjectSearch" element={<ProjectSearch />} />
        <Route path="/ProjectUniversitySearch" element={<ProjectUniversitySearch />} />
        <Route path="/ProjectCollegeSearch/:collegeId" element={<ProjectCollegeSearch />} />
        <Route path="/ProjectDepartmentSearch/:deptId" element={<ProjectDepartmentSearch />} />
        <Route path="/ProjectProgramSearch/:programId" element={<ProjectProgramSearch />} />

        {/* University Details */}
        <Route path="/university/:id" element={<UniversityDetails />} />

        {/* College Details */}
        <Route path="/college/:id" element={<CollegeDetails />} />


        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
