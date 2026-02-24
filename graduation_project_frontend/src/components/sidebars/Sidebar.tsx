// src/components/Sidebar.tsx

import React from 'react';
import { useAuthStore } from '../../store/useStore';
import { FiHome, FiUsers, FiFileText, FiSearch, FiCheckSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = () => {
    // تعريف مسارات ثابتة
    const ROUTES = {
      DASHBOARD: '/dashboard',
      GROUPS: '/dashboard/groups',
      PROJECTS: '/dashboard/projects',
      PROJECT_SEARCH: '/dashboard/search',
      APPROVALS: '/dashboard/approvals', // المسار الجديد للموافقات
      SETTINGS: '/dashboard/settings',
    };

    if (!user?.roles) return [{ icon: FiHome, label: 'الرئيسية', href: ROUTES.DASHBOARD }];
    
    const base = [{ icon: FiHome, label: 'الرئيسية', href: ROUTES.DASHBOARD }];

    // تبويبات الطالب
    if (user.roles.some(r => r.role__type === 'Student')) {
      base.push(
        { icon: FiUsers, label: 'المجموعة', href: ROUTES.GROUPS },
        { icon: FiFileText, label: 'مشاريعي', href: ROUTES.PROJECTS },
        { icon: FiSearch, label: 'البحث عن المشاريع', href: ROUTES.PROJECT_SEARCH }
      );
    }

    // تبويبات المشرف (Supervisor, Co-supervisor, Dean, Department Head, etc.)
    const approvalRoles = ['Supervisor', 'Co-supervisor', 'Dean', 'Department Head', 'System Manager'];
    if (user.roles.some(r => approvalRoles.includes(r.role__type))) {
      base.push(
        { icon: FiCheckSquare, label: 'الموافقات', href: ROUTES.APPROVALS },
        { icon: FiUsers, label: 'المجموعات', href: ROUTES.GROUPS }
      );
    }
    
    // تبويبات الإعدادات (للمدير أو الأدوار العليا)
    if (user.roles.some(r => r.role__type === 'System Manager')) {
        base.push(
            { icon: FiSettings, label: 'الإعدادات', href: ROUTES.SETTINGS }
        );
    }

    return base;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity" onClick={onToggle} />}

      <aside className={`fixed right-0 top-0 h-screen w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">GPMS</h1>
          <p className="text-sm text-gray-600 mt-1">البوابة الموحدة</p>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold">{user?.username?.charAt(0)}</span>
          </div>
          <p className="font-semibold text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-600 mt-1">{user?.roles?.[0]?.type}</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems().map((item, idx) => (
            <a key={idx} href={item.href} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition">
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FiLogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
