import React, { useMemo, useState } from "react";
import { useNotifications } from "../../../hooks/useNotifications";
import { useAuthStore, useNotificationsStore } from "../../../store/useStore";

// sidebar موجود (لا نعدله)
import SupervisorSidebar from "../supervisor/SupervisorSidebar";

// components (تصميم فقط)
import SupervisorHeader, { SupervisorTab } from "./SupervisorHeader";
import SupervisorStatCards from "./SupervisorStatsCards";
import SupervisorHomeCTA from "./SupervisorHomeCTA";
import SupervisorGroupsProjectsTable from "./SupervisorGroupProjectsTable";
import SupervisorNotificationsView from "./SupervisorNotificationsView";

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();

  // ✅ keep notifications system working (لا نغيره)
  useNotifications();

  const [activeTab, setActiveTab] = useState<SupervisorTab>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // نستخدم اسم المستخدم للعرض
  const displayName = useMemo(() => user?.name || user?.username || "مشرف", [user]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans system-manager-theme" dir="rtl">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar (لا تغيير) */}
      <SupervisorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onChangeTab={(t: SupervisorTab) => {
          setActiveTab(t);
          setIsSidebarOpen(false);
        }}
        unreadCount={unreadCount}
        pendingApprovalsCount={0}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <SupervisorHeader
          displayName={displayName}
          unreadCount={unreadCount}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === "home" && (
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Hero */}
<div className="relative overflow-hidden bg-gradient-to-r from-[#0E4C92] to-[#0E4C92] p-10 shadow-2xl rounded-3xl text-white">
  <div className="relative z-10">
    <h1 className="text-3xl font-black mb-3">
      مرحباً بك مجدداً، {displayName} 👋
    </h1>

    <p className="max-w-xl leading-relaxed font-medium text-white/90">
      إليك نظرة سريعة على الإشعارات والمجموعات والمشاريع التي تشرف عليها.
    </p>
  </div>

  <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-[-20%] right-[-5%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
</div>



              {/* Stat Cards */}
              <SupervisorStatCards />

              {/* CTA */}
              <SupervisorHomeCTA
                onOpenGroupsProjects={() => setActiveTab("groups-projects")}
              />
            </div>
          )}

          {activeTab === "groups-projects" && (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SupervisorGroupsProjectsTable />
            </div>
          )}
        </main>
      </div>

      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsNotificationsOpen(false)}
          ></div>

          {/* Notifications Sidebar */}
          <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">الإشعارات</h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <SupervisorNotificationsView />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
