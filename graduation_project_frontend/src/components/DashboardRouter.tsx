import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

// Dashboards
import SupervisorDashboard from '../pages/dashboards/Supervisor/SupervisorDashboard';
import CoSupervisorDashboard from '../pages/dashboards/Co-Supervisor/CoSupervisorDashboard';
import DepartmentHeadDashboard from '../Pages/dashboards/Departmenthead/DepartmentHeadDashboard';
import DeanDashboard from '../Pages/dashboards/dean/DeanDashboard';
import UniversityPresidentDashboard from '../pages/dashboards/UniversityPresidentDashboard';
import SystemManagerDashboard from '../Pages/dashboards/SystemManager/SystemManagerDashboard';
import MinistryDashboard from '../Pages/dashboards/ministry/MinistryDashboard';
import ExternalCompanyDashboard from '../pages/dashboards/ExternalCompanyDashboard';
import StudentDashboard from '../Pages/dashboards/StudentDashboard';


const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  // Determine primary role
  let primaryRole = '';
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const firstRole = user.roles[0];
    if (typeof firstRole === 'string') {
      primaryRole = firstRole.toLowerCase().trim();
    } else if (typeof firstRole === 'object' && firstRole !== null) {
      primaryRole = (firstRole.role__type || '').toLowerCase().trim();
    }
  }

  console.log("DASHBOARD ROUTER PRIMARY ROLE =", primaryRole);

  switch (primaryRole) {
    case 'student':
      return <StudentDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'co-supervisor':
      return <CoSupervisorDashboard />;
    case 'department head':
      return <DepartmentHeadDashboard />;
    case 'dean':
      return <DeanDashboard />; // handles nested routes
    case 'university president':
      return <UniversityPresidentDashboard />;
    case 'system manager':
      return <SystemManagerDashboard />;
    case 'ministry':
      return <MinistryDashboard />;
    case 'external company':
      return <ExternalCompanyDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-600">دور المستخدم غير معروف</p>
        </div>
      );
  }
};

export default DashboardRouter;
