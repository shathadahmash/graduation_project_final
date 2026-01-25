import React from "react";
import { FiX, FiHome, FiUsers, FiLayers, FiBell, FiFileText, FiChevronLeft } from "react-icons/fi";
import { useAuthStore } from "../../../store/useStore";

export type SupervisorTab = "home" | "groupproject" | "notifications";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SupervisorTab;
  onChangeTab: (tab: SupervisorTab) => void;
  unreadCount: number;
  pendingApprovalsCount: number;
  onOpenNotifications?: () => void; // ✅ NEW optional prop
}

const SupervisorSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  unreadCount,
  pendingApprovalsCount,
  onOpenNotifications, // ✅ NEW
}) => {
  const { user, logout } = useAuthStore();

  const menu = [
    { id: "home" as const, label: "الرئيسية", icon: <FiHome /> },
    { id: "groups" as const, label: "المجموعات", icon: <FiUsers /> },
    { id: "projects" as const, label: "المشاريع", icon: <FiLayers /> },
    { id: "approvals" as const, label: "الموافقات", icon: <FiFileText />, badge: pendingApprovalsCount },
    { id: "notifications" as const, label: "الإشعارات", icon: <FiBell />, badge: unreadCount },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-[#0F172A] text-white z-50 transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiUsers size={20} />
            </div>
            <div>
              <p className="font-black text-sm leading-none">لوحة المشرف</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">{user?.name || user?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 mt-3 space-y-1">
          {menu.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "notifications" && onOpenNotifications) {
                    // ✅ open notifications sidebar instead of switching tab
                    onOpenNotifications();
                  } else {
                    onChangeTab(item.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-white" : "group-hover:text-white"}`}>{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>

                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="mr-auto bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}

                {isActive && <FiChevronLeft className="mr-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
          <button
            onClick={() =>

{
              logout();
              window.location.href = "/login";
            }}
            className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl py-2 font-bold text-sm"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default SupervisorSidebar;