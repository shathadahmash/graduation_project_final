import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiBookOpen, FiUser, FiEye, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectDetailModal from './ProjectDetailModal';

interface Project {
  project_id: number;
  title: string;
  description?: string;
  project_type: string;
  start_date?: number;
  supervisor_name?: string;
  co_supervisor_name?: string;
  university_name?: string;
  college_name?: string;
  logo?: string;
  students?: { name: string; id?: string }[];
}

interface Props {
  collegeId: number;
}

const ProjectCollegeSearch: React.FC<Props> = ({ collegeId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectStudents, setSelectedProjectStudents] = useState<{ name: string; id?: string }[]>([]);

  useEffect(() => {
    if (!collegeId) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjects({ college_id: collegeId });
        setProjects(response || []);
      } catch (err) {
        console.error('Error fetching college projects', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [collegeId]);

  const getProjectTypeBadge = (type: string) => {
    switch (type) {
      case 'Proposed':
        return { label: 'مقترح', bg: 'bg-purple-100', color: 'text-purple-700' };
      case 'Governmental':
        return { label: 'حكومي', bg: 'bg-blue-100', color: 'text-blue-700' };
      case 'External':
        return { label: 'شركات خارجية', bg: 'bg-green-100', color: 'text-green-700' };
      default:
        return { label: 'غير محدد', bg: 'bg-gray-100', color: 'text-gray-700' };
    }
  };

  const extractYear = (date?: number) => (date ? new Date(date).getFullYear() : 'غير محدد');

  const handleQuickView = (project: Project) => {
    setSelectedProject(project);
    setSelectedProjectStudents(project.students || []);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#31257D]" />
        <p className="mt-4 text-[#4A5568]">جاري تحميل المشاريع...</p>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow-sm">
        لا توجد مشاريع مطابقة
      </div>
    );
  }

  const collegeName = projects[0].college_name || 'الكلية غير محددة';

  return (
    <>
      <h1 className="text-3xl font-bold text-[#31257D] mb-6 text-center">
        مشاريع كلية: {collegeName}
      </h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const badge = getProjectTypeBadge(p.project_type);
          return (
            <div
              key={p.project_id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-[#31257D]/10 flex flex-col"
            >
              {/* Image and Badge */}
              <div className="relative h-48 overflow-hidden rounded-t-xl flex items-center justify-center bg-gray-100">
                <img
                  src={p.logo?.startsWith('http') ? p.logo : `http://localhost:8001${p.logo}`}
                  alt={p.title}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/default-project-logo.png'; }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`${badge.bg} ${badge.color} px-3 py-1 rounded-full text-xs font-bold`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-[#31257D] mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {p.description || 'لا يوجد ملخص'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                  {p.university_name && (
                    <div><FiMapPin className="inline mr-1" />{p.university_name}</div>
                  )}
                  {p.college_name && (
                    <div><FiBookOpen className="inline mr-1" />{p.college_name}</div>
                  )}
                  <div><FiCalendar className="inline mr-1" />{extractYear(p.start_date)}</div>
                  {p.supervisor_name && (
                    <div><FiUser className="inline mr-1" />{p.supervisor_name}</div>
                  )}
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
                    التفاصيل
                    <FiArrowLeft size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          students={selectedProjectStudents}
          loadingStudents={false}
          onClose={() => {
            setSelectedProject(null);
            setSelectedProjectStudents([]);
          }}
        />
      )}
    </>
  );
};

export default ProjectCollegeSearch;