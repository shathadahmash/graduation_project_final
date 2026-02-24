import React from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import AboutSystem from "../components/HomePage/AboutSystem";
import OurFeatures from "../components/HomePage/OurFeatures";
import Users from "../components/user/Users";
import Universities from "../components/uni_college_department_branch/Universities";
import ConnectUs from "../components/HomePage/ConnectUs";
import Footer from "../components/HomePage/Footer";

export default function HomePage() {
  const navigate = useNavigate(); // <-- ADD THIS

  return (
    <div className="w-full min-h-screen font-sans">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 px-6 lg:px-0">

          {/* LEFT — HERO IMAGES */}
          <div className="lg:w-1/2 hidden lg:flex justify-center items-center relative gap-6">
            <img src="/hero1.jpg" alt="Graduation 1" className="hero-arch z-20" />
            <img src="/hero2.jpg" alt="Graduation 2" className="hero-arch absolute left-12 top-10 z-10" />
          </div>

          {/* RIGHT — TEXT */}
          <div className="lg:w-1/2 text-right space-y-5 px-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-snug text-[#0E4C92]">
              البوابة الموحدة لإدارة مشاريع<br />التخرج في الجامعات اليمنية
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              منصة متكاملة لإدارة ومتابعة مشاريع التخرج بما في ذلك تكوين الفرق،
              الاعتماد، والتقييم الذكي.
            </p>

            {/* BUTTON → GO TO LOGIN */}
            <button
              onClick={() => navigate("./login")}
              className="bg-[#0E4C92] text-white px-8 py-3 text-lg rounded-lg hover:bg-[#0b3a6c] transition-colors"
            >
              ابدأ الآن
            </button>
          </div>

        </div>
      </section>

      {/* ABOUT SYSTEM */}
      <AboutSystem />

      {/* FEATURES */}
      <OurFeatures />

      {/* USERS */}
      <Users />

      {/* UNIVERSITIES */}
      <Universities />

      {/* CONNECT US */}
      <ConnectUs />

      {/* FOOTER */}
      <Footer />

    </div>
  );
}