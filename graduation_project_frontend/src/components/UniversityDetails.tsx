import React, { useEffect, useState } from "react";
import { data, Link, useParams } from "react-router-dom";
import api, { API_ENDPOINTS } from "../services/api.ts";
import { projectService } from "../services/projectService.ts"; // <-- import your project service
import ProjectSearch from "./ProjectUniversitySearch.tsx"; // adjust path as needed
interface Program {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  programs: Program[];
  open?: boolean;
}

interface College {
  id: number;
  name: string;
  departments: Department[];
  open?: boolean;
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

interface Project {
  id: number;
  title: string;
  description: string;
  logo?: string;
}

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  // University projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Fetch university details
  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await api.get(
          `${API_ENDPOINTS.related_to_university}${id}/related/`
        );
        const data = response.data;
        console.log("--------------------------------------------University Data:", data); // Debug log

        if (!data || !data.university) {
          setUniversity(null);
          return;
        }

        const colleges: College[] = (data.branches || []).flatMap(
          (branch: any) =>
            (branch.colleges || []).map((c: any) => ({
              id: c.cid,
              name: c.name_ar || c.name_en || "اسم الكلية",
              open: false,
              logo: c.image || data.university.image || "/default-college-logo.png",
              location: branch.city_detail?.bname_ar || branch.city_detail?.bname_en || "الموقع غير معروف",
              departments: (c.departments || []).map((d: any) => ({
                id: d.department_id,
                name: d.name || d.department_name,
                open: false,
                programs: (d.programs || []).map((p: any) => ({
                  id: p.pid || p.program_id,
                  name: p.p_name || p.program_name,
                })),
              })),
            }))
        );

        setUniversity({
          id: data.university.uid,
          name: data.university.uname_ar || "جامعة",
          type:
            data.university.type === "Government"
              ? "حكومية"
              : data.university.type === "Private"
                ? "أهلية"
                : data.university.type || "جامعة",
          location: data.university.city_detail?.cname_ar || data.university.city_detail?.cname_en || "الموقع غير معروف",
          logo: data.university.image || "/default-uni-logo.png",
          description: data.university.description || "لا يوجد وصف متاح.",
          colleges,
        });
      } catch (error) {
        console.error("Error fetching university", error);
        setUniversity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  // Fetch university projects using projectService
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const fetchedProjects = await projectService.getUniversityProjects(parseInt(id));
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching university projects", error);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [id]);

  // ... rest of your component (header, colleges, etc.)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#31257D]/20 border-t-[#31257D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        الجامعة غير موجودة
      </div>
    );
  }

  const toggleCollege = (collegeId: number) => {
    setUniversity((prev) =>
      prev
        ? {
          ...prev,
          colleges: prev.colleges.map((c) => ({
            ...c,
            open: c.id === collegeId ? !c.open : false,
            departments: c.departments.map((d) => ({ ...d, open: false })),
          })),
        }
        : prev
    );
  };

  const toggleDepartment = (collegeId: number, deptId: number) => {
    setUniversity((prev) =>
      prev
        ? {
          ...prev,
          colleges: prev.colleges.map((c) =>
            c.id === collegeId
              ? {
                ...c,
                departments: c.departments.map((d) =>
                  d.id === deptId
                    ? { ...d, open: !d.open }
                    : { ...d, open: false }
                ),
              }
              : c
          ),
        }
        : prev
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#31257D] text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold">{university.name}</h1>

          <nav className="flex gap-6">
            <Link to="/" className="hover:underline">
              الصفحة الرئيسية
            </Link>
            <Link to={`/universities/${university.id}/about`}>
              عن الجامعة
            </Link>
            <Link to={`/universities/${university.id}/projects`}>
              المشاريع
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row gap-10 items-center">

        <img
          src={university.logo}
          alt={university.name}
          className="w-64 h-80 md:w-80 md:h-96 object-cover shadow-lg transition-all duration-300"
          onError={(e) => {
            e.currentTarget.src = '/default-uni-logo.png';
          }}
        />

        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-[#31257D]">
            {university.name}
          </h1>

          <p className="text-lg text-gray-600">
            {university.type} • {university.location}
          </p>

          <p className="bg-white shadow-sm rounded-xl p-6 text-gray-600">
            {university.description}
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">
          الكليات
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {university.colleges.map((college) => (
            <div key={college.id} className="w-80">

              {/* College Card */}
              <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center relative overflow-hidden">

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Logo */}
                  <div className="relative mb-4 w-full h-56 md:h-64 mx-auto">
                    <img
                      src={college.logo}
                      alt={college.name}
                      className="w-full h-full object-cover shadow-lg transition-all duration-300"
                      onError={(e) => { e.currentTarget.src = '/default-college-logo.png'; }}
                    />
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-[#31257D] group-hover:text-white transition-colors mb-3">
                    {college.name}
                  </h3>

                  {/* City */}
                  <div className="flex justify-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#31257D]/5 text-gray-600 group-hover:bg-white/20 group-hover:text-white">
                      {college.location}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleCollege(college.id)}
                      className="bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#31257D]"
                    >
                      عرض الأقسام
                    </button>

                    <Link
                      to={`/colleges/${college.id}/projects`}
                      className="text-center bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#31257D]"
                    >
                      مشاريع الكلية
                    </Link>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#4937BF] transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>

              {/* Departments: move outside the college card wrapper */}
            </div>
          ))}
        </div>

        {/* All department cards container (full width, outside college card) */}
        {university.colleges.map((college) =>
          college.open ? (
            <div
              key={`depts-${college.id}`}
              className="mt-6 flex flex-wrap justify-center gap-6 animate-fadeIn"
            >
              {college.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center overflow-hidden flex-1 min-w-[250px] max-w-[300px]"
                >
                  {/* Gradient hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF] opacity-0 group-hover:opacity-30 transition-all duration-500"></div>

                  <div className="relative z-10">
                    <h4 className="text-lg font-bold text-[#31257D] group-hover:text-white mb-3">
                      {dept.name}
                    </h4>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => toggleDepartment(college.id, dept.id)}
                        className="bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#31257D]"
                      >
                        عرض التخصصات
                      </button>

                      <Link
                        to={`/departments/${dept.id}/projects`}
                        className="text-center bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#31257D]"
                      >
                        عرض المشاريع
                      </Link>
                    </div>

                    {/* Programs */}
                    {dept.open && dept.programs.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mt-3">
                        {dept.programs.map((prog) => (
                          <div
                            key={prog.id}
                            className="bg-white px-3 py-2 rounded-lg shadow-sm text-[#31257D] text-sm"
                          >
                            {prog.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#4937BF] transition-all duration-300 w-0 group-hover:w-full"></div>
                </div>
              ))}
            </div>
          ) : null
        )}
      </section>
      {/* University Projects */}
      {/* University Projects Section */}
      {/* University Projects */}
      {/* University Projects Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <ProjectSearch
          universityId={university?.id}
          colleges={university?.colleges || []}
        />
      </section>
      <style>
        {`
        @keyframes fadeIn {
          from {opacity:0; transform:translateY(10px);}
          to {opacity:1; transform:translateY(0);}
        }
        .animate-fadeIn{
          animation:fadeIn .4s ease forwards;
        }
        `}
      </style>
    </div>
  );
};

export default UniversityDetails;