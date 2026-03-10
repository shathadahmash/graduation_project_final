import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

interface Program {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  programs: Program[];
}

interface College {
  id: number;
  name: string;
  departments: Department[];
}

interface University {
  id: number;
  name: string;
  type: string;
  location: string;
  logo: string;
  description?: string | null;
  colleges: College[];
}

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await api.get(`/universities/${id}`);
        const data = response.data;

        const mapped: University = {
          id: data.uid,
          name: data.uname_ar || "جامعة",
          type:
            data.type === "Government"
              ? "حكومية"
              : data.type === "Private"
                ? "أهلية"
                : data.type || "جامعة",
          location: data.location || "اليمن",
          logo: data.image || "/default-uni-logo.png",
          description: data.description || "لا يوجد وصف متاح.",
          colleges: data.colleges?.map((c: any) => ({
            id: c.college_id,
            name: c.college_name,
            departments: c.departments?.map((d: any) => ({
              id: d.department_id,
              name: d.department_name,
              programs:
                d.programs?.map((p: any) => ({
                  id: p.program_id,
                  name: p.program_name,
                })) || [],
            })) || [],
          })) || [],
        };

        setUniversity(mapped);
      } catch (error) {
        console.error("خطأ في جلب تفاصيل الجامعة", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-[#31257D]/20 border-t-[#31257D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!university) {
    return <div className="text-center mt-20 text-red-500 text-xl">الجامعة غير موجودة</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      {/* Sticky Header */}
      <header className="bg-[#31257D] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold">{university.name}</h1>
          <nav className="flex space-x-10 text-lg font-medium"> {/* Increased space between links */}
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              الصفحة الرئيسية
            </Link>
            <Link
              to={`/universities/${university.id}/about`}
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              عن الكلية
            </Link>
            <Link
              to={`/universities/${university.id}/projects`}
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              المشاريع
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* University Hero */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center flex flex-col items-center space-y-4">
          <img
            src={university.logo}
            alt={university.name}
            className="w-40 h-40 rounded-full object-contain border-4 border-[#31257D]/30"
          />
          <h1 className="text-5xl font-extrabold text-[#31257D]">{university.name}</h1>
          <p className="text-lg text-gray-700">{university.type} - {university.location}</p>
        </div>

        {/* University Description */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-gray-700">
          <h2 className="text-3xl font-semibold mb-4 border-b-2 border-[#31257D]/40 inline-block pb-2">عن الجامعة</h2>
          <p className="text-lg leading-relaxed">{university.description}</p>
        </section>

        {/* Colleges, Departments, Programs */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-gray-700 space-y-6">
          <h2 className="text-3xl font-semibold mb-4 border-b-2 border-[#31257D]/40 inline-block pb-2">الكليات والأقسام والبرامج</h2>
          {university.colleges.length === 0 ? (
            <p className="text-gray-500 font-bold">لا توجد كليات متاحة</p>
          ) : (
            <div className="space-y-6">
              {university.colleges.map((college) => (
                <div key={college.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">{college.name}</h3>
                  {college.departments.length === 0 ? (
                    <p className="text-gray-500 ml-4">لا توجد أقسام</p>
                  ) : (
                    <ul className="ml-4 space-y-2">
                      {college.departments.map((dept) => (
                        <li key={dept.id}>
                          <span className="font-semibold">{dept.name}</span>
                          {dept.programs.length > 0 && (
                            <ul className="ml-6 list-disc space-y-1">
                              {dept.programs.map((prog) => (
                                <li key={prog.id}>{prog.name}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UniversityDetails;