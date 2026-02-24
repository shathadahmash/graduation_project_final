// src/components/Layout.tsx
import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./sidebars/Sidebar";
import SystemManagerSidebar from "./sidebars/SystemManagerSidebar";
import DeanSidebar from "./sidebars/DeanSidebar";
import DepartmentHeadSidebar from "./sidebars/DepartmentHeadSidebar";
import PresidentSidebar from "./sidebars/PresidentSidebar"; // import the new sidebar
import NotificationsPanel from "./notifications/NotificationsPanel";
import Header from "./HomePage/Header";
import { useNotificationsStore, useAuthStore } from "../store/useStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemSidebarOpen, setSystemSidebarOpen] = useState(false);
  const [deanSidebarOpen, setDeanSidebarOpen] = useState(false);
  const [departmentSidebarOpen, setDepartmentSidebarOpen] = useState(false);
  const [presidentSidebarOpen, setPresidentSidebarOpen] = useState(false); // new state
  const [showNotifications, setShowNotifications] = useState(false);

  const { unreadCount } = useNotificationsStore();
  const { user } = useAuthStore();

  const isSystemManager = user?.roles?.includes("System Manager");
  const isDean = user?.roles?.includes("Dean");
  const isDepartmentHead = user?.roles?.includes("Department Head");
  const isPresident = user?.roles?.includes("University President"); // detect president

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Hamburger button for mobile */}
      <button
        onClick={() => {
          if (isSystemManager) setSystemSidebarOpen(true);
          else if (isDean) setDeanSidebarOpen(true);
          else if (isDepartmentHead) setDepartmentSidebarOpen(true);
          else if (isPresident) setPresidentSidebarOpen(true); // open president sidebar
          else setSidebarOpen(true);
        }}
        className="md:hidden fixed top-4 right-4 z-[60] bg-white p-2 rounded-full shadow-lg"
      >
        <FiMenu className="text-2xl text-gray-700" />
      </button>

      {/* Sidebars */}
      {!isSystemManager && !isDean && !isDepartmentHead && !isPresident && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      {isSystemManager && (
        <SystemManagerSidebar
          isOpen={systemSidebarOpen}
          onToggle={() => setSystemSidebarOpen(!systemSidebarOpen)}
        />
      )}
      {isDean && (
        <DeanSidebar
          isOpen={deanSidebarOpen}
          onToggle={() => setDeanSidebarOpen(!deanSidebarOpen)}
        />
      )}
      {isDepartmentHead && (
        <DepartmentHeadSidebar
          isOpen={departmentSidebarOpen}
          onToggle={() => setDepartmentSidebarOpen(!departmentSidebarOpen)}
        />
      )}
      {isPresident && ( // render president sidebar
        <PresidentSidebar
          isOpen={presidentSidebarOpen}
          onToggle={() => setPresidentSidebarOpen(!presidentSidebarOpen)}
        />
      )}

      {/* Main content */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onClick={() => {
          if (sidebarOpen) setSidebarOpen(false);
          if (systemSidebarOpen) setSystemSidebarOpen(false);
          if (deanSidebarOpen) setDeanSidebarOpen(false);
          if (departmentSidebarOpen) setDepartmentSidebarOpen(false);
          if (presidentSidebarOpen) setPresidentSidebarOpen(false); // close president sidebar
        }}
      >
        <Header
          onMenuClick={() => {
            if (isSystemManager) setSystemSidebarOpen(true);
            else if (isDean) setDeanSidebarOpen(true);
            else if (isDepartmentHead) setDepartmentSidebarOpen(true);
            else if (isPresident) setPresidentSidebarOpen(true);
            else setSidebarOpen(true);
          }}
          onNotificationsClick={() => setShowNotifications((prev) => !prev)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Layout;
