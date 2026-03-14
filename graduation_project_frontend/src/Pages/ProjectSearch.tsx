// src/pages/ProjectSearch.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import ProjectSearchComponent from '../components/ProjectSearchComponent';

const ProjectSearch: React.FC = () => {
  const API_BASE_URL = 'http://localhost:8001/api/';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* عنوان الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#31257D] mb-2">البحث عن مشاريع التخرج</h1>
          <p className="text-[#4A5568]">استعرض مشاريع التخرج والرسائل العلمية في الجامعات اليمنية</p>
        </div>

        {/* مكون البحث */}
        <ProjectSearchComponent API_BASE_URL={API_BASE_URL} />
      </div>

      <style>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </div>
  );
};

export default ProjectSearch;