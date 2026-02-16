import React from "react";
import { FiBell, FiMenu } from "react-icons/fi";

export type SupervisorTab = "home" | "groups-projects" | "notifications";

type Props = {
  displayName: string;
  unreadCount: number;
  activeTab: SupervisorTab;
  onTabChange: (tab: SupervisorTab) => void;
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
};

const tabs: { id: SupervisorTab; label: string }[] = [
  { id: "home", label: "الرئيسية" },
  { id: "groups-projects", label: "المجموعات والمشاريع" },
  { id: "notifications", label: "الإشعارات" },
];

const SupervisorHeader: React.FC<Props> = ({
  displayName,
  unreadCount,
  activeTab,
  onTabChange,
  onOpenSidebar,
  onOpenNotifications,
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left: menu + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
          aria-label="فتح القائمة"
        >
          <FiMenu size={20} />
        </button>

        <h2 className="text-xl font-black text-slate-800">لوحة تحكم المشرف</h2>
      </div>

      {/* Center: tabs */}
      <nav className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() =>
                t.id === "notifications"
                  ? onOpenNotifications()
                  : onTabChange(t.id)
              }
              className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {t.label}
              {t.id === "notifications" && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: hello + avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-black text-slate-800 leading-none">مرحباً</p>
          <p className="text-[11px] text-slate-400 font-bold mt-1">{displayName}</p>
        </div>

        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center text-white font-black">
          {displayName?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default SupervisorHeader;
