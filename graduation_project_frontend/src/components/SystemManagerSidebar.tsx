import React, { useState } from "react";
import { FiChevronDown, FiLogOut, FiBell, FiFileText, FiSettings } from "react-icons/fi";
import { BsBoxes } from "react-icons/bs";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { useAuthStore } from "../store/useStore";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ElementType;
  action?: () => void;
  path?: string;
  subItems?: MenuItem[];
}

const SystemManagerSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems: MenuItem[] = [
    {
      label: "إدارة المستخدمين",
      icon: FiChevronDown,
      subItems: [
        { label: "إدارة الطلاب", path: "/system-manager/students", action: () => navigate("/system-manager/students") },
        { label: "الكادر الأكاديمي والإداري", path: "/system-manager/staff", action: () => navigate("/system-manager/staff") },
      ],
    },
    {
      label: "إدارة المشاريع",
      icon: BsBoxes,
      subItems: [
        { label: "جميع المشاريع", path: "/system-manager/projects", action: () => navigate("/system-manager/projects") },
        {
          label: "أنواع المشاريع",
          subItems: [
            { label: "مشاريع خاصة بالكلية", path: "/system-manager/project-types", action: () => navigate("/system-manager/project-types") },
          ],
        },
      ],
    },
    { label: "الصلاحيات", icon: MdOutlineVerifiedUser, path: "/system-manager/roles", action: () => navigate("/system-manager/roles") },
    { label: "الإشعارات", icon: FiBell, path: "/system-manager/notifications", action: () => navigate("/system-manager/notifications") },
    {
      label: "التقارير",
      icon: FiFileText,
      subItems: [
        { label: "تقارير الطلاب", path: "/system-manager/reports/students", action: () => navigate("/system-manager/reports/students") },
        { label: "تقارير المشاريع", path: "/system-manager/reports/projects", action: () => navigate("/system-manager/reports/projects") },
      ],
    },
    { label: "الإعدادات", icon: FiSettings, path: "/system-manager/settings", action: () => navigate("/system-manager/settings") },
  ];

  // Recursive rendering of sub-items
  const renderSubItems = (subItems: MenuItem[], parentLabel?: string, level = 1) => {
    return subItems.map((sub, idx) => {
      const isActive = sub.path === location.pathname;
      const hasNested = sub.subItems && sub.subItems.length > 0;
      const isOpen = openMenus[sub.label] || false;

      // Apply green only for "التقارير" sub-items
      const isReportSubItem = parentLabel === "التقارير";

      return (
        <div key={idx} className="flex flex-col">
          <button
            onClick={() => {
              if (hasNested) {
                toggleMenu(sub.label);
              } else {
                sub.action?.();
                onToggle();
              }
            }}
            className={`w-full text-left transition-all rounded-sm text-[8px] md:text-[9px] px-2 py-1 my-0.5 ${
              isActive
                ? isReportSubItem
                  ? "bg-gradient-to-r from-green-100 to-green-200 font-semibold text-green-700 shadow-sm"
                  : "bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-sm"
                : isReportSubItem
                ? "text-green-700 hover:bg-green-600 hover:text-white"
                : "text-gray-700 hover:bg-blue-600 hover:text-white"
            }`}
            style={{ paddingLeft: `${level * 10}px` }}
          >
            {sub.label}
          </button>
          {hasNested && isOpen && (
            <div className="flex flex-col ml-1">{renderSubItems(sub.subItems!, sub.label, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const renderMenuItem = (item: MenuItem, idx: number) => {
    const isActive = item.path === location.pathname;
    const hasSub = item.subItems && item.subItems.length > 0;
    const isOpen = openMenus[item.label] || false;

    if (hasSub) {
      return (
        <div key={idx}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm md:text-sm transition-all ${
              isOpen || item.subItems?.some((sub) => sub.path === location.pathname)
                ? item.label === "التقارير"
                  ? "bg-gradient-to-r from-green-100 to-green-200 font-semibold text-green-700 shadow-sm"
                  : "bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-sm"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon size={18} className={item.label === "التقارير" ? "text-green-600" : "text-blue-600"} />}
              <span>{item.label}</span>
            </div>
            <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""} text-gray-500`} />
          </button>
          {isOpen && <div className="flex flex-col mt-1">{renderSubItems(item.subItems!, item.label)}</div>}
        </div>
      );
    } else {
      return (
        <button
          key={idx}
          onClick={() => {
            item.action?.();
            onToggle();
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm md:text-sm transition-all ${
            isActive
              ? "bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100"
          }`}
        >
          {item.icon && <item.icon size={18} className="text-blue-600" />}
          <span>{item.label}</span>
        </button>
      );
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-30 sm:hidden" onClick={onToggle} />}

      <aside
        className={`fixed right-0 top-0 h-screen w-full sm:w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col items-start bg-gradient-to-r from-blue-50 to-blue-100">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">GPMS</h1>
          <p className="text-sm text-gray-500">لوحة تحكم مدير النظام</p>
        </div>

        {/* User Box */}
        <div className="p-6 border-b border-gray-200 flex flex-col items-center bg-blue-50 rounded-b-xl shadow-inner">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-white shadow-lg">
            {user?.username?.charAt(0)}
          </div>
          <p className="font-semibold text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-500 mt-1">{user?.roles?.[0]?.type || "مدير النظام"}</p>
        </div>

        {/* Menu */}
        <nav className="p-4 flex-1 overflow-y-auto space-y-2">{menuItems.map((item, idx) => renderMenuItem(item, idx))}</nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-all font-medium shadow-sm justify-center"
          >
            <FiLogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default SystemManagerSidebar;
