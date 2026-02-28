import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useStore";

// Dashboards
import SupervisorDashboard from "../pages/dashboards/Supervisor/SupervisorDashboard";
import CoSupervisorDashboard from "../pages/dashboards/Co-Supervisor/CoSupervisorDashboard";
import DepartmentHeadDashboard from "../Pages/dashboards/Departmenthead/DepartmentHeadDashboard";
import DeanDashboard from "../Pages/dashboards/dean/DeanDashboard";
import UniversityPresidentDashboard from "../pages/dashboards/UniversityPresidentDashboard";
import SystemManagerDashboard from "../Pages/dashboards/SystemManager/SystemManagerDashboard";
import MinistryDashboard from "../Pages/dashboards/ministry/MinistryDashboard";
import ExternalCompanyDashboard from "../pages/dashboards/ExternalCompanyDashboard";
import StudentDashboard from "../Pages/dashboards/StudentDashboard";

import SysManagerImportProjects from "../Pages/dashboards/SystemManager/sysManagerImportProjects";

const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        جاري التحميل...
      </div>
    );
  }
// i commented this because of undefined role 
  // const primaryRole =
  //   Array.isArray(user.roles) && user.roles.length > 0
  //     ? String(user.roles[0]).toLowerCase().trim()
  //     : "";
  // it was replaced with this
  let primaryRole = "";

if (Array.isArray(user.roles) && user.roles.length > 0) {
  const firstRole = user.roles[0];

  if (typeof firstRole === "string") {
    primaryRole = firstRole.toLowerCase().trim();
  } else if (typeof firstRole === "object" && firstRole !== null) {
    primaryRole =
      (firstRole.role__type || firstRole.type || "").toLowerCase().trim();
  }
}
// ....
  return (
    <Routes>
      {/* Default Dashboard */}
      <Route
        index
        element={
          primaryRole === "student" ? (
            <StudentDashboard />
          ) : primaryRole === "supervisor" ? (
            <SupervisorDashboard />
          ) : primaryRole === "co-supervisor" ? (
            <CoSupervisorDashboard />
          ) : primaryRole === "department head" ? (
            <DepartmentHeadDashboard />
          ) : primaryRole === "dean" ? (
            <DeanDashboard />
          ) : primaryRole === "university president" ? (
            <UniversityPresidentDashboard />
          ) : primaryRole === "system manager" ? (
            <SystemManagerDashboard />
          ) : primaryRole === "ministry" ? (
            <MinistryDashboard />
          ) : primaryRole === "external company" ? (
            <ExternalCompanyDashboard />
          ) : (
            <div className="h-screen flex items-center justify-center text-red-600">
              دور المستخدم غير معروف
            </div>
          )
        }
      />

      {/* Import Projects Page */}
      <Route
        path="system-manager/import-projects"
        element={<SysManagerImportProjects />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default DashboardRouter;