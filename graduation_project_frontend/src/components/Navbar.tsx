// export default Navbar;
import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="w-full">

      {/* TOP BLUE BAR */}
      <div className="text-center font-medium py-2 bg-[#0055D6] text-white text-sm">
        جميع مشاريع التخرج اليمنية في مكان واحد
      </div>

      {/* NAVBAR */}
      <nav className="bg-white shadow px-6 md:px-16 flex items-center justify-between h-[70px] relative">

        {/* RIGHT — TITLE */}
        <div className="text-right leading-tight">
          <h1 className="text-xl font-bold">بوابة</h1>
          <p className="text-sm text-gray-500">إدارة مشاريع التخرج</p>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-3xl text-gray-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* CENTER — MENU (Desktop) */}
        <ul className="hidden md:flex gap-10 text-gray-700 text-sm font-medium mx-auto">
          <li className="hover:text-blue-600 cursor-pointer">
            <Link to="/">الرئيسية</Link>
          </li>

          <li className="hover:text-blue-600 cursor-pointer">عن النظام</li>
          <li className="hover:text-blue-600 cursor-pointer">مميزاتنا</li>
          <li className="hover:text-blue-600 cursor-pointer">المستفيدين</li>
        </ul>

        {/* LEFT — BUTTONS (Desktop only) */}
        <div className="hidden md:flex gap-3">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            إنشاء حساب
          </Link>

          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium"
          >
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white shadow px-6 py-4 space-y-4 text-right">

          <ul className="flex flex-col gap-4 text-gray-700 text-sm font-medium">
            <li className="hover:text-blue-600 cursor-pointer">
              <Link to="/">الرئيسية</Link>
            </li>
            <li className="hover:text-blue-600 cursor-pointer">عن النظام</li>
            <li className="hover:text-blue-600 cursor-pointer">مميزاتنا</li>
            <li className="hover:text-blue-600 cursor-pointer">المستفيدين</li>
          </ul>

          {/* MOBILE BUTTONS */}
          <div className="flex flex-col gap-3 mt-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              إنشاء حساب
            </Link>

            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;