import React, { useState, useEffect, useCallback } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiBookOpen,
  FiUser,
  FiEye,
  FiArrowLeft
} from "react-icons/fi";
import { projectService } from "../services/projectService";
import ProjectDetailModal from "./ProjectDetailModal";
import { Link } from "react-router-dom";

interface Project {
  project_id: number;
  title: string;
  description: string;
  project_type: string;
  state: string;
  field: string;
  tools: string;
  university_name: string;
  branch_name: string;
  college_name: string;
  department_name?: string;
  program_name?: string;
  start_date: number;
  end_date: number;
  external_company?: string;
  supervisor_name: string;
  co_supervisor_name?: string;
  logo?: string;
  documentation?: string;
  students?: { name: string; id?: string }[];
}

interface Props {
  programId: number;
}

const ProgramProjects: React.FC<Props> = ({ programId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [programName, setProgramName] = useState<string>("غير محدد");
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectStudents, setSelectedProjectStudents] = useState<
    { name: string; id?: string }[]
  >([]);
  const [loadingStudents] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!programId) return;
    try {
      setLoading(true);
      const response = await projectService.getProjects({ limit: 50, program_id: programId });
      setProjects(response || []);

      if (response && response.length > 0 && response[0].program_name) {
        setProgramName(response[0].program_name);
      } else {
        setProgramName("غير محدد");
      }
    } catch (err) {
      console.error("خطأ في جلب المشاريع", err);
      setProjects([]);
      setProgramName("غير محدد");
    } finally {
      setLoading(false);
    }
  }, [programId]);

  const handleQuickView = (project: Project) => {
    setSelectedProject(project);
    setSelectedProjectStudents(project.students || []);
  };

  const getProjectTypeBadge = (type: string) => {
    switch (type) {
      case "Proposed":
        return { label: "مقترح", bg: "bg-purple-100", color: "text-purple-700" };
      case "Governmental":
        return { label: "حكومي", bg: "bg-blue-100", color: "text-blue-700" };
      case "External":
        return { label: "شركات خارجية", bg: "bg-green-100", color: "text-green-700" };
      default:
        return { label: "غير محدد", bg: "bg-gray-100", color: "text-gray-700" };
    }
  };

  const extractYear = (date: number) => (date ? new Date(date).getFullYear() : "غير محدد");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="bg-[#F8FAFC]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#31257D]" />
            <p className="mt-4 text-[#4A5568]">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="mt-4 text-[#4A5568]">لا توجد مشاريع متاحة</p>
          </div>
        ) : (
          <>
            {/* Program Name */}
            <h2 className="text-3xl font-bold text-[#31257D] text-center mb-6">
              برنامج: {programName}
            </h2>

            {/* Projects Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                const badge = getProjectTypeBadge(p.project_type);
                return (
                  <div
                    key={p.project_id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-[#31257D]/10 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          p.logo
                            ? p.logo.startsWith("http")
                              ? p.logo
                              : `http://localhost:8001${p.logo}`
                            : "/default-project-logo.png"
                        }
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`${badge.bg} ${badge.color} px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-[#31257D] mb-2">{p.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {p.description || "لا يوجد ملخص"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div>
                          <FiMapPin className="inline mr-1" />
                          {p.university_name}
                        </div>
                        <div>
                          <FiBookOpen className="inline mr-1" />
                          {p.college_name}
                        </div>
                        <div>
                          <FiCalendar className="inline mr-1" />
                          {extractYear(p.start_date)}
                        </div>
                        <div>
                          <FiUser className="inline mr-1" />
                          {p.supervisor_name}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                          onClick={() => handleQuickView(p)}
                          className="py-2 bg-[#31257D] text-white rounded-lg text-sm flex items-center justify-center gap-1"
                        >
                          <FiEye size={16} /> عرض سريع
                        </button>

                        <Link
                          to={`/projects/${p.project_id}`}
                          className="py-2 border-2 border-[#31257D] text-[#31257D] rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-[#31257D] hover:text-white"
                        >
                          التفاصيل <FiArrowLeft size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            students={selectedProjectStudents}
            loadingStudents={loadingStudents}
            onClose={() => {
              setSelectedProject(null);
              setSelectedProjectStudents([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgramProjects;