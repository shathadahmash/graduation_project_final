import React from 'react';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationsClick, unreadCount }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition" title="فتح القائمة">
            <FiMenu size={24} className="text-gray-700" />
          </button>

          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2">
            <FiSearch className="text-gray-500" />
            <input type="text" placeholder="ابحث..." className="bg-transparent mr-2 outline-none text-sm w-48" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onNotificationsClick} className="relative p-2 hover:bg-gray-100 rounded-lg transition" title="الإشعارات">
            <FiBell size={24} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button className="text-sm text-gray-700 hover:text-blue-600 transition">العربية</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
