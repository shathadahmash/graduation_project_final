import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProjectCollegeSearch from "./ProjectCollegeSearch.tsx";
import ProjectDepartmentSearch from "./ProjectDepartmentSearch.tsx";
import ProjectProgramSearch from "./ProjectProgramSearch.tsx";
import Navbar from "./Navbar";

interface Program { id: number; name: string; }
interface Department { id: number; name: string; programs: Program[]; open?: boolean; }
interface College {
  id: number;
  name: string;
  logo?: string;
  location?: string;
  description?: string;
  departments: Department[];
  universityId?: number;
}

const CollegeDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const college: College | undefined = location.state?.college;
  const universityId = location.state?.universityId || college?.universityId;

  const [departments, setDepartments] = useState<Department[]>(college?.departments || []);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  const toggleDepartment = (deptId: number) => {
    setDepartments(prev =>
      prev.map(d => d.id === deptId ? { ...d, open: !d.open } : { ...d, open: false })
    );
  };

  if (!college) {
    return <div className="text-center mt-20 text-red-500 text-xl">الكلية غير موجودة</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <Navbar />

      {/* Go Back to University Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate(universityId ? `/university/${universityId}` : "/universities")}
          className="inline-block bg-[#31257D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#241b5c]"
        >
          ← العودة إلى {location.state?.universityName || "الجامعة"}
        </button>
      </div>

      {/* College Info */}
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-96 md:w-[450px] h-80 md:h-96 overflow-hidden bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
          <img
            src={college.logo || "/default-college-logo.png"}
            alt={college.name}
            className="w-full h-full object-contain"
            onError={e => (e.currentTarget.src = "/default-college-logo.png")}
          />
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-5xl font-bold text-[#31257D]">{college.name}</h1>
          <p className="text-lg text-gray-600">{college.location || "الموقع غير معروف"}</p>
          <p className="bg-white shadow-sm rounded-xl p-6 text-gray-600">
            {college.description?.trim() || "لا يوجد وصف متاح."}
          </p>
        </div>
      </div>

      {/* Departments */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">الأقسام</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center overflow-hidden flex-1 min-w-[250px] max-w-[300px]"
            >
              <h3 className="text-lg font-bold text-[#31257D] mb-4">{dept.name}</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => toggleDepartment(dept.id)}
                  className="bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium"
                >
                  عرض التخصصات
                </button>
                <button
                  onClick={() => {
                    setSelectedDepartment(dept.id);
                    setSelectedProgram(null);
                  }}
                  className="bg-[#31257D] text-white py-2 rounded-lg text-sm font-medium"
                >
                  عرض المشاريع
                </button>
              </div>
              {dept.open && dept.programs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {dept.programs.map(prog => (
                    <button
                      key={prog.id}
                      onClick={() => {
                        setSelectedProgram(prog.id);
                        setSelectedDepartment(null);
                      }}
                      className="block w-full bg-gray-100 p-2 rounded hover:bg-gray-200"
                    >
                      {prog.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Projects Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {(selectedDepartment || selectedProgram) && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setSelectedDepartment(null); setSelectedProgram(null); }}
              className="bg-[#31257D] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#241b5c]"
            >
              عرض مشاريع الكلية
            </button>
          </div>
        )}

        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">المشاريع</h2>

        {selectedProgram && <ProjectProgramSearch programId={selectedProgram} />}
        {!selectedProgram && selectedDepartment && <ProjectDepartmentSearch departmentId={selectedDepartment} />}
        {!selectedProgram && !selectedDepartment && <ProjectCollegeSearch collegeId={college.id} />}
      </section>
    </div>
  );
};

export default CollegeDetails;