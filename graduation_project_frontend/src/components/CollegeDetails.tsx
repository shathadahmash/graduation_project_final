import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProjectCollegeSearch from "./ProjectCollegeSearch.tsx";
import Navbar from "./Navbar"; // <-- import your navbar

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
  logo?: string;
  location?: string;
  description?: string;
  departments: Department[];
  open?: boolean;
}

const CollegeDetails: React.FC = () => {
  const location = useLocation();
  console.log("Location state:", location.state);
  const college: College | undefined = location.state?.college;
  console.log("Received college data:", college);
  const [departments, setDepartments] = useState<Department[]>(college?.departments || []);

  const toggleDepartment = (deptId: number) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId ? { ...d, open: !d.open } : { ...d, open: false }
      )
    );
  };

  if (!college) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        الكلية غير موجودة
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <Navbar />

      {/* College Info */}
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-96 md:w-[450px] h-80 md:h-96 overflow-hidden bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
          <img
            src={college.logo || "/default-college-logo.png"}
            alt={college.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = "/default-college-logo.png";
            }}
          />
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-5xl font-bold text-[#31257D]">{college.name}</h1>
          <p className="text-lg text-gray-600">{college.location || "الموقع غير معروف"}</p>
          <p className="bg-white shadow-sm rounded-xl p-6 text-gray-600">
            {college.description && college.description.trim() !== ""
              ? college.description
              : "لا يوجد وصف متاح."}
          </p>
        </div>
      </div>

      {/* Departments */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">الأقسام</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center overflow-hidden flex-1 min-w-[250px] max-w-[300px]"
            >
              <h3 className="text-lg font-bold text-[#31257D] mb-4">{dept.name}</h3>
              <button
                onClick={() => toggleDepartment(dept.id)}
                className="bg-[#31257D] text-white py-2 px-4 rounded-lg text-sm font-medium"
              >
                عرض التخصصات
              </button>
              {dept.open && dept.programs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {dept.programs.map((prog) => (
                    <Link
                      key={prog.id}
                      to={`/ProjectProgramSearch/${prog.id}`}
                      state={{ program: prog }}
                      className="block bg-gray-100 p-2 rounded hover:bg-gray-200"
                    >
                      {prog.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* College Projects */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#31257D] text-center mb-12">
          مشاريع الكلية
        </h2>
        <ProjectCollegeSearch collegeId={college.id} />
      </section>
    </div>
  );
};

export default CollegeDetails;