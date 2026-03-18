import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { API_ENDPOINTS } from "../services/api.ts";
import ProjectUniversitySearch from "./ProjectUniversitySearch.tsx";
import ProjectDepartmentSearch from "./ProjectDepartmentSearch.tsx";
import ProjectProgramSearch from "./ProjectProgramSearch.tsx";

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
  description?: string;
  open?: boolean;
  logo?: string;
  location?: string;
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

  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await api.get(
          `${API_ENDPOINTS.related_to_university}${id}/related/`
        );
        const data = response.data;

        if (!data?.university) {
          setUniversity(null);
          return;
        }

        const colleges: College[] = (data.branches || []).flatMap((branch: any) =>
          (branch.colleges || []).map((c: any) => ({
            id: c.cid,
            name: c.name_ar || c.name_en || "اسم الكلية",
            logo: c.image || data.university.image || "/default-college-logo.png",
            location:
              branch.city_detail?.bname_ar ||
              branch.city_detail?.bname_en ||
              "الموقع غير معروف",
            description: c.description || "لا يوجد وصف متاح.",
            open: false,
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
          location:
            data.university.city_detail?.cname_ar ||
            data.university.city_detail?.cname_en ||
            "الموقع غير معروف",
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
                  d.id === deptId ? { ...d, open: !d.open } : { ...d, open: false }
                ),
              }
              : c
          ),
        }
        : prev
    );
  };

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
            <Link to={`/universities/${university.id}/about`}>عن الجامعة</Link>
            <Link to={`/universities/${university.id}/projects`}>المشاريع</Link>
          </nav>
        </div>
      </header>

      {/* University Info */}
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-shrink-0 w-96 md:w-[450px] h-80 md:h-96 overflow-hidden bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
          <img
            src={university.logo || "/default-uni-logo.png"}
            alt={university.name}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-5xl font-bold text-[#31257D]">{university.name}</h1>
          <p className="text-lg text-gray-600">
            {university.type} • {university.location}
          </p>
          <p className="bg-white shadow-sm rounded-xl p-6 text-gray-600">
            {university.description}
          </p>
        </div>
      </div>

      {/* Colleges */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">
          الكليات
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {university.colleges.map((college) => (
            <div key={college.id} className="w-80">
              <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="relative mb-4 w-full h-56 md:h-64 mx-auto overflow-hidden bg-gray-100 rounded-lg">
                    <img
                      src={college.logo || "/default-college-logo.png"}
                      alt={college.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-[#31257D] mb-3">
                    {college.name}
                  </h3>

                  <div className="flex justify-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#31257D]/5 text-gray-600">
                      {college.location}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleCollege(college.id)}
                      className="bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium"
                    >
                      عرض الأقسام
                    </button>

                    <Link
                      to={`/college/${college.id}`}
                      state={{
                        college,
                        universityId: university.id,       // pass parent university ID
                        universityName: university.name,   // pass parent university name
                      }}
                      className="text-center bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium"
                    >
                      مشاريع الكلية
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Departments */}
        {university.colleges.map((college) =>
          college.open ? (
            <div key={college.id} className="mt-6 flex flex-wrap justify-center gap-6">
              {college.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-lg shadow-sm p-6 text-center min-w-[250px] max-w-[300px]"
                >
                  <h4 className="text-lg font-bold text-[#31257D] mb-3">
                    {dept.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => toggleDepartment(college.id, dept.id)}
                      className="bg-[#31257D] text-white py-2 rounded-lg text-sm"
                    >
                      عرض التخصصات
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDepartment(dept.id);
                        setSelectedProgram(null);
                      }}
                      className="bg-[#31257D] text-white py-2 rounded-lg text-sm"
                    >
                      عرض المشاريع
                    </button>
                  </div>

                  {dept.open &&
                    dept.programs.map((prog) => (
                      <div key={prog.id} className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedProgram(prog.id);
                            setSelectedDepartment(null);
                          }}
                          className="w-full bg-[#31257D] text-white py-2 rounded-lg text-sm"
                        >
                          {prog.name}
                        </button>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ) : null
        )}
      </section>

      {/* Dynamic Project Search */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {selectedProgram && <ProjectProgramSearch programId={selectedProgram} />}

        {!selectedProgram && selectedDepartment && (
          <ProjectDepartmentSearch departmentId={selectedDepartment} />
        )}

        {!selectedProgram && !selectedDepartment && (
          <ProjectUniversitySearch
            universityId={university.id}
            colleges={university.colleges}
          />
        )}
      </section>
    </div>
  );
};

export default UniversityDetails;