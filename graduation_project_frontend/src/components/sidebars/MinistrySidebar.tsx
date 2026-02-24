// src/components/SystemManagerSidebar.tsx
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

const SystemManagerSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "إدارة المستخدمين",
      icon: FiChevronDown,
      subItems: ["إدارة الطلاب", "الكادر الأكاديمي والإداري", "الجهات الخارجية"],
    },
    { label: "اللجان الخارجية", icon: FiChevronDown },
    {
      label: "إدارة الجامعات والأقسام",
      icon: FaUniversity,
      subItems: ["إدارة الجامعات", "إدارة الكليات", "إدارة الاقسام"],
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
        <div className="p-6 border-b border-gray-200 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold">
              {user?.username?.charAt(0)}
            </span>
          </div>
          <h3 className="font-bold">{user?.username || "اسم المستخدم"}</h3>
          <p className="text-gray-500 text-sm">
            {user?.roles?.[0]?.type || "مدير النظام"}
          </p>
        </div>

        {/* Navigation (Scrollable Area) */}
        <nav className="p-4 space-y-2 text-right overflow-y-auto h-[calc(100vh-250px)]">
          {menuItems.map((item, idx) =>
            item.subItems ? (
              <details key={idx} className="group">
                <summary className="flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-100 font-semibold">
                  {item.label}
                  <FiChevronDown className="transition-transform group-open:rotate-180" />
                </summary>

                <div className="mr-5 mt-2 space-y-2 text-gray-700 text-sm pb-1">
                  {item.subItems.map((sub, i) =>
                    typeof sub === "string" ? (
                      <p
                        key={i}
                        className="hover:text-blue-600 cursor-pointer"
                      >
                        {sub}
                      </p>
                    ) : sub.subItems ? (
                      <details key={i} className="group mr-2">
                        <summary className="cursor-pointer hover:text-blue-600 font-medium flex justify-between">
                          {sub.label}
                          <FiChevronDown className="transition-transform group-open:rotate-180" />
                        </summary>

                        <div className="mr-4 mt-2 space-y-2 text-sm text-gray-700">
                          {sub.subItems.map((sub2, idx2) => (
                            <p
                              key={idx2}
                              className="hover:text-blue-600 cursor-pointer"
                            >
                              {sub2}
                            </p>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <p
                        key={i}
                        className="hover:text-blue-600 cursor-pointer"
                      >
                        {sub.label}
                      </p>
                    )
                  )}
                </div>
              </details>
            ) : (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-100"
              >
                <span className="font-semibold">{item.label}</span>
                <item.icon />
              </button>
            )
          )}
        </nav>

        {/* Logout button fixed at bottom */}
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

export default SystemManagerSidebar;
