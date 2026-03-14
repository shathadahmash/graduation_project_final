import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useStore";

// Dashboards
import SupervisorDashboard from "../Pages/dashboards/Supervisor/SupervisorDashboard.tsx";
import CoSupervisorDashboard from "../Pages/dashboards/Co-Supervisor/CoSupervisorDashboard.tsx";
import DepartmentHeadDashboard from "../Pages/dashboards/Departmenthead/DepartmentHeadDashboard.tsx";
import DeanDashboard from "../Pages/dashboards/dean/DeanDashboard.tsx";
import UniversityPresidentDashboard from "../Pages/dashboards/UniversityPresidentDashboard.tsx";
import SystemManagerDashboard from "../Pages/dashboards/SystemManager/SystemManagerDashboard.tsx";
import MinistryDashboard from "../Pages/dashboards/ministry/MinistryDashboard.tsx";
import ExternalCompanyDashboard from "../Pages/dashboards/ExternalCompanyDashboard.tsx";
import StudentDashboard from "../Pages/dashboards/StudentDashboard.tsx";
import ProjectDetails from "../components/uni_college_department_branch/ProjectDetails.tsx";
import SysManagerImportProjects from "../Pages/dashboards/SystemManager/sysManagerImportProjects.tsx";

const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        جاري التحميل...
      </div>
    );
  }

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
      <Route path="/projectdetail" element={<ProjectDetails />} />
    </Routes>
  );
};

export default DashboardRouter;