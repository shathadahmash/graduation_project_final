import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    // إذا كنا في الصفحة الرئيسية، تمرير إلى القسم
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // إذا كنا في صفحة أخرى، ننتقل إلى الصفحة الرئيسية مع تمرير القسم
      navigate(`/?section=${sectionId}`);
    }
    setOpen(false);
  };

  const handleNavigation = (path, sectionId = null) => {
    if (path === '/') {
      if (sectionId) {
        scrollToSection(sectionId);
      } else {
        navigate('/');
      }
    } else {
      navigate(path);
    }
    setOpen(false);
  };

  return (
    <div dir="rtl" className="w-full font-['Cairo',sans-serif]">

      {/* TOP BLUE BAR - أكاديمية وأنيقة */}
      <div className="text-center py-3 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] text-white text-sm tracking-wide border-b border-white/10">
        <span className="relative inline-block">
          جميع مشاريع التخرج اليمنية في مكان واحد
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full mx-auto w-12"></span>
        </span>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#0B2B4F]/10 px-6 md:px-16 flex items-center justify-between h-[80px] relative sticky top-0 z-50">

        {/* RIGHT — LOGO - يودي للرئيسية */}
        <div className="text-right group cursor-pointer" onClick={() => handleNavigation('/')}>
          <img 
            src="/YCIT.png" 
            alt="Y-CIT-HIE Logo" 
            className="h-12 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          />
          {/* خط سفلي أنيق تحت الشعار */}
          <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] transition-all duration-300 mt-1"></div>
        </div>

        {/* MOBILE MENU BUTTON - أنيق */}
        <button
          className="md:hidden text-2xl text-[#0B2B4F] hover:text-[#1E4A7A] transition-colors duration-300 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* CENTER — MENU (Desktop) - تصميم أكاديمي مع روابط محدثة */}
        <ul className="hidden md:flex gap-8 text-[#2C3E50] text-sm font-medium mx-auto">
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              الرئيسية
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
          
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/', 'about')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              عن النظام
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
          
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/', 'features')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              مميزاتنا
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
          
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/', 'users')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              المستفيدون
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
          
          {/* تم استبدال "الخدمات" بـ "الجامعات" */}
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/', 'universities')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              الجامعات
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
          
          {/* تم استبدال "تواصل معنا" بـ "البحث عن مشاريع" */}
          <li className="relative group">
            <button 
              onClick={() => handleNavigation('/search')}
              className="hover:text-[#0B2B4F] transition-colors duration-300 py-2 block"
            >
              البحث عن مشاريع
            </button>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] group-hover:w-full transition-all duration-300"></span>
          </li>
        </ul>

        {/* LEFT — BUTTONS (Desktop) - أكاديمية */}
        <div className="hidden md:flex gap-3">
          <Link
            to="/register"
            className="relative px-5 py-2.5 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] text-white text-sm rounded-none overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              إنشاء حساب
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            {/* تأثير وهج */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          </Link>

          <Link
            to="/login"
            className="relative px-5 py-2.5 bg-transparent text-[#0B2B4F] text-sm border border-[#0B2B4F]/30 hover:border-[#0B2B4F] rounded-none overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              تسجيل الدخول
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            {/* خلفية متحركة عند التحويم */}
            <span className="absolute inset-0 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU - بنفس التصميم مع التحديثات */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#0B2B4F]/10 shadow-lg px-6 py-6 space-y-4 text-right animate-slideDown">
          
          {/* الشعار في الموبايل */}
          <div className="flex justify-center mb-4">
            <img 
              src="/YCIT.png" 
              alt="Y-CIT-HIE Logo" 
              className="h-12 w-auto object-contain cursor-pointer"
              onClick={() => handleNavigation('/')}
            />
          </div>

          {/* القائمة - محدثة */}
          <ul className="flex flex-col gap-4 text-[#2C3E50] text-sm font-medium">
            <li className="group">
              <button 
                onClick={() => handleNavigation('/')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">الرئيسية</span>
              </button>
            </li>
            <li className="group">
              <button 
                onClick={() => handleNavigation('/', 'about')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">عن النظام</span>
              </button>
            </li>
            <li className="group">
              <button 
                onClick={() => handleNavigation('/', 'features')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">مميزاتنا</span>
              </button>
            </li>
            <li className="group">
              <button 
                onClick={() => handleNavigation('/', 'users')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">المستفيدون</span>
              </button>
            </li>
            <li className="group">
              <button 
                onClick={() => handleNavigation('/', 'universities')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">الجامعات</span>
              </button>
            </li>
            <li className="group">
              <button 
                onClick={() => handleNavigation('/search')}
                className="flex items-center justify-between py-2 border-b border-[#0B2B4F]/10 hover:border-[#0B2B4F] transition-colors duration-300 w-full"
              >
                <span className="text-[#0B2B4F] group-hover:translate-x-2 transition-transform duration-300">←</span>
                <span className="group-hover:text-[#0B2B4F] transition-colors duration-300">البحث عن مشاريع</span>
              </button>
            </li>
          </ul>

          {/* الأزرار في الموبايل */}
          <div className="flex flex-col gap-3 mt-6">
            <Link
              to="/register"
              className="relative px-5 py-3 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] text-white text-sm rounded-none overflow-hidden group shadow-md text-center"
              onClick={() => setOpen(false)}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                إنشاء حساب
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </span>
            </Link>

            <Link
              to="/login"
              className="relative px-5 py-3 bg-transparent text-[#0B2B4F] text-sm border border-[#0B2B4F]/30 hover:border-[#0B2B4F] rounded-none overflow-hidden group text-center"
              onClick={() => setOpen(false)}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                تسجيل الدخول
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            </Link>
          </div>

          {/* نص مساعد في الموبايل */}
          <p className="text-xs text-[#A0AEC0] text-center mt-4 pt-4 border-t border-[#0B2B4F]/10">
            منصة معتمدة من وزارة التعليم العالي
          </p>
        </div>
      )}
    </div>
  );
}

export default Navbar;