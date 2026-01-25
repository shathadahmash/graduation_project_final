import React from 'react';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSearch,
  FiCheckSquare,
  FiBarChart2,
  FiLayers,
  FiChevronDown,
  FiLogOut,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ElementType;
  href?: string;
  subItems?: MenuItem[];
}

const DeanSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    // Original items
    { label: 'الرئيسية', icon: FiHome, href: '/dean/dashboard' },
    {
      label: 'طلبات الموافقة',
      icon: FiCheckSquare,
      subItems: [
        { label: 'المعلقة', href: '/dean/approvals/pending' },
        { label: 'المقبولة', href: '/dean/approvals/approved' },
        { label: 'المرفوضة', href: '/dean/approvals/rejected' },
      ],
    },
    { label: 'مجموعات المشاريع', icon: FiUsers, href: '/dean/groups' },
    {
      label: 'المشاريع',
      icon: FiLayers,
      subItems: [
        { label: 'جميع المشاريع', href: '/dean/projects/all' },
        { label: 'المشاريع الخارجية', href: '/dean/projects/external' },
        { label: 'المشاريع الخاصة', href: '/dean/projects/private' },
        { label: 'المشاريع الحكومية', href: '/dean/projects/government' },
      ],
    },
    {
      label: 'ادارة الأقسام',
      icon: FiUsers,
      href: '/dean/departments',
    },
    { label: 'الإحصائيات', icon: FiBarChart2, href: '/dean/statistics' },
    // New items with icons
    { label: 'مركز الموافقات', icon: FiCheckSquare, href: '/dean/approval-center' },
    { label: 'المشرفون', icon: FiUsers, href: '/dean/supervisors' },
    { label: 'الأرشيف / البحث', icon: FiSearch, href: '/dean/archive-search' },
    { label: 'السياسات', icon: FiFileText, href: '/dean/policies' },
    { label: 'التقارير', icon: FiBarChart2, href: '/dean/reports-overview' },
  ];

  const renderMenuItem = (item: MenuItem, idx: number) => {
    const isActive = item.href && location.pathname === item.href;

    if (item.subItems) {
      const subActive = item.subItems.some(sub => sub.href === location.pathname);
      return (
        <details key={idx} className="group">
          <summary
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300
              ${subActive ? 'bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100'}`}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={20} className="text-blue-600" />}
              <span className="text-sm md:text-base">{item.label}</span>
            </div>
            <FiChevronDown className="transition-transform group-open:rotate-180 text-gray-500" />
          </summary>
          <div className="ml-6 mt-2 space-y-1 text-gray-700 flex flex-col">
            {item.subItems.map((sub, i) => (
              <button
                key={i}
                onClick={() => sub.href && navigate(sub.href)}
                className={`text-right px-3 py-2 rounded-lg transition-colors text-sm hover:text-white hover:bg-blue-600 ${
                  sub.href === location.pathname ? 'bg-blue-600 text-white font-medium shadow-md' : ''
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </details>
      );
    } else {
      return (
        <button
          key={idx}
          onClick={() => item.href && navigate(item.href)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm md:text-base
            ${isActive ? 'bg-gradient-to-r from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100'}`}
        >
          {item.icon && <item.icon size={20} className="text-blue-600" />}
          <span>{item.label}</span>
          {isActive && <div className="w-1 h-full bg-blue-600 rounded-l-full absolute right-0 top-0" />}
        </button>
      );
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-30" onClick={onToggle} />}
      <aside
        className={`fixed right-0 top-0 h-screen w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col items-start bg-gradient-to-r from-blue-50 to-blue-100">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">GPMS</h1>
          <p className="text-sm text-gray-500">لوحة تحكم العميد</p>
        </div>

        {/* User Box */}
        <div className="p-6 border-b border-gray-200 flex flex-col items-center bg-blue-50 rounded-b-xl shadow-inner">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-white shadow-lg">
            {user?.username?.charAt(0)}
          </div>
          <p className="font-semibold text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-500 mt-1">عميد الكلية</p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-3 flex-1 overflow-y-auto">
          {menuItems.map((item, idx) => renderMenuItem(item, idx))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all font-medium shadow-md justify-center"
          >
            <FiLogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default DeanSidebar;
