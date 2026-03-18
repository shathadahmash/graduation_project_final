import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import AboutSystem from "../components/HomePage/AboutSystem";
import OurFeatures from "../components/HomePage/OurFeatures";

import Users from "../components/user/Users";
import Universities from "../components/uni_college_department_branch/Universities";

import ConnectUs from "../components/HomePage/ConnectUs";
import Footer from "../components/HomePage/Footer";

import { studentService } from "../services/studentService";
import { collegeService } from "../services/collegeServices";
import { departmentService } from "../services/departmentService";
import { projectService } from "../services/projectService";

export default function HomePage() {

  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    departments: 0,
    colleges: 0,
    projects: 0,
    students: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    }
  }, [location]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
  const [studentsRes, collegesRes, departmentsRes, projectsRes] = await Promise.all([
    studentService.getStudentCount(),  // returns a number
    collegeService.getColleges(),
    departmentService.getDepartments(),
    projectService.getPublicProjects()
  ]);

  console.log('Students response:', studentsRes);
  console.log('Colleges response:', collegesRes);
  console.log('Departments response:', departmentsRes);
  console.log('Projects response:', projectsRes);

  setStats({
    students: studentsRes, // ✅ use the awaited number directly
    colleges: collegesRes.count || collegesRes.results?.length || collegesRes.length || 0,
    departments: departmentsRes.count || departmentsRes.results?.length || departmentsRes.length || 0,
    projects: projectsRes.count || projectsRes.results?.length || projectsRes.length || 0,
  });
} catch (error) {
  console.error("Failed to fetch stats", error);
  setStats({
    students: 0,
    colleges: 0,
    departments: 0,
    projects: 0,
  });
}
    };
    fetchStats();
  }, []);

  return (

    <div className="w-full min-h-screen font-['Cairo'] bg-gray-50" dir="rtl">

      <Navbar />

      {/* HERO SECTION */}
<section className="relative overflow-hidden py-24">

  {/* خلفية gradient ثابتة */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF]"></div>

  {/* عناصر خلفية ضبابية */}
  <div className="absolute inset-0">
    <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-20 left-20"></div>
    <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl bottom-10 right-20"></div>
  </div>

  {/* المحتوى */}
  <div className="relative max-w-7xl mx-auto px-6 text-center text-white">

    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-all duration-1000 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`}>
      البوابة الموحدة
      <span className="block text-blue-200 mt-4 text-3xl md:text-4xl font-light">
        لمشاريع التخرج في الجامعات اليمنية
      </span>
    </h1>

    <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-10 leading-relaxed">
      منصة رقمية حديثة لإدارة ومتابعة مشاريع التخرج في الجامعات اليمنية
      باستخدام تقنيات ذكية ومعايير أكاديمية متقدمة.
    </p>

    {/* أزرار */}
    <div className="flex justify-center gap-4 flex-wrap">

      <button
        onClick={() => navigate("/login")}
        className="px-8 py-4 bg-white text-[#31257D] font-semibold rounded-xl shadow-lg hover:scale-105 transition"
      >
        الدخول إلى النظام
      </button>

      <button
        onClick={() =>
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
        }
        className="px-8 py-4 border border-white rounded-xl hover:bg-white hover:text-[#31257D] transition"
      >
        تعرف على النظام
      </button>

    </div>

  </div>
</section>


      {/* الإحصائيات */}
      <section className="py-16 bg-white">

        <div className="max-w-6xl mx-auto px-6">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {[
              { number: stats.departments + "+", label: "الأقسام" },
              { number: stats.colleges + "+", label: "الكليات" },
              { number: stats.projects + "+", label: "مشروع تخرج" },
              { number: stats.students + "+", label: "الطلاب" },
            ].map((item, i) => (

              <div
                key={i}
                className="bg-gray-50 border hover:border-[#4937BF] rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition"
              >
                <div className="text-4xl font-bold text-[#31257D] mb-2">
                  {item.number}
                </div>

                <div className="text-gray-600">
                  {item.label}
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* باقي الأقسام */}
      <section id="about">
        <AboutSystem />
      </section>

      <section id="features">
        <OurFeatures />
      </section>

      <section id="users">
        <Users />
      </section>

      <section id="universities">
        <Universities />
      </section>

      <section id="contact">
        <ConnectUs />
      </section>

      <Footer />

    </div>

  );
}