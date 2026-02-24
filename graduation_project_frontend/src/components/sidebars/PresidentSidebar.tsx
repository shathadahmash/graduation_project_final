// src/components/PresidentSidebar.tsx
import React from "react";
import {
  FiChevronDown,
  FiBell,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";
import { BsBoxes } from "react-icons/bs";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { useAuthStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ElementType;
  href?: string;
  subItems?: Array<string | MenuItem>;
}

const PresidentSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      label: "إدارة المستخدمين",
      icon: FiChevronDown,
      subItems: ["إدارة الطلاب", "الكادر الأكاديمي والإداري", "الجهات الخارجية"],
    },
    {
      label: "إدارة الجامعات والكليات",
      icon: FaUniversity,
      subItems: ["إدارة الجامعات", "إدارة الكليات", "إدارة الأقسام"],
    },
    {
      label: "إدارة المشاريع",
      icon: BsBoxes,
      subItems: [
        { label: "جميع المشاريع" },
        {
          label: "أنواع المشاريع",
          subItems: ["مشاريع خارجية", "مشاريع خاصة", "مشاريع حكومية"],
        },
      ],
    },
    { label: "الصلاحيات", icon: MdOutlineVerifiedUser },
    { label: "الإشعارات", icon: FiBell },
    { label: "التقارير", icon: FiFileText },
    { label: "الإعدادات", icon: FiSettings },
  ];

  const renderSubItems = (subItems: Array<string | MenuItem>, level = 1) => {
    return subItems.map((sub, idx) => {
      if (typeof sub === "string") {
        return (
          <button
            key={idx}
            onClick={() => {}}
            className={`text-right px-3 py-2 rounded-lg transition-colors hover:text-white hover:bg-blue-600 text-sm ml-${level * 2}`}
          >
            {sub}
          </button>
        );
      } else if (sub.subItems) {
        return (
          <details key={idx} className={`group ml-${level * 2}`}>
            <summary className="flex justify-between cursor-pointer hover:text-blue-600 font-medium px-3 py-2 rounded-lg transition-colors">
              {sub.label}
              <FiChevronDown className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="ml-4 mt-1 flex flex-col space-y-1 text-sm text-gray-700">
              {renderSubItems(sub.subItems, level + 1)}
            </div>
          </details>
        );
      } else {
        return (
          <button
            key={idx}
            onClick={() => {}}
            className={`text-right px-3 py-2 rounded-lg transition-colors hover:text-white hover:bg-blue-600 text-sm ml-${level * 2}`}
          >
            {sub.label}
          </button>
        );
      }
    });
  };

  const renderMenuItem = (item: MenuItem, idx: number) => {
    if (item.subItems) {
      return (
        <details key={idx} className="group">
          <summary className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 font-semibold transition-colors">
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={20} />}
              <span>{item.label}</span>
            </div>
            <FiChevronDown className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="ml-2 mt-2 flex flex-col space-y-1">{renderSubItems(item.subItems)}</div>
        </details>
      );
    } else {
      return (
        <button
          key={idx}
          onClick={() => item.href && navigate(item.href)}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-right"
        >
          {item.icon && <item.icon size={20} />}
          <span>{item.label}</span>
        </button>
      );
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed right-0 top-0 h-screen w-64 bg-white shadow-xl border-l z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button (mobile only) */}
        <div className="md:hidden flex justify-end p-3">
          <button onClick={onToggle}>
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col items-center bg-blue-50">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
            <span className="text-blue-600 font-bold text-xl">
              {user?.username?.charAt(0)}
            </span>
          </div>
          <h3 className="font-bold text-gray-900">{user?.username || "اسم المستخدم"}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {user?.roles?.[0]?.type || "رئيس الجامعة"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 text-right overflow-y-auto h-[calc(100vh-250px)]">
          {menuItems.map((item, idx) => renderMenuItem(item, idx))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FiLogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default PresidentSidebar;
