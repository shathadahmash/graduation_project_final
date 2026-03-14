import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiCalendar, FiMapPin, FiBookOpen, FiUser, FiEye, FiSearch, FiArrowLeft } from 'react-icons/fi';
import Navbar from './Navbar';
import { projectService } from '../services/projectService';
import ProjectDetailModal from './ProjectDetailModal';
import { Link, useParams } from "react-router-dom";

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

interface FilterOptions {
  supervisors: { id: number; name: string }[];
  co_supervisors: { id: number; name: string }[];
  years: string[];
  fields: string[];
  tools: string[];
  project_types: { value: string; label: string }[];
}

const ProgramProjects: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    year: '',
    field: '',
    tools: '',
    supervisor: '',
    co_supervisor: '',
    project_type: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    supervisors: [],
    co_supervisors: [],
    years: [],
    fields: [],
    tools: [],
    project_types: [
      { value: 'Governmental', label: 'حكومي' },
      { value: 'External', label: 'شركات خارجية' },
      { value: 'Proposed', label: 'مقترح' }
    ]
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectStudents, setSelectedProjectStudents] = useState<{ name: string; id?: string }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeDuplicatesById = <T extends { id: number }>(items: T[]): T[] => {
    const unique = new Map<number, T>();
    items.forEach(item => {
      if (!unique.has(item.id)) unique.set(item.id, item);
    });
    return Array.from(unique.values());
  };

  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await projectService.getFilterOptions();
      setFilterOptions(prev => ({
        ...prev,
        supervisors: removeDuplicatesById(options.supervisors || []),
        co_supervisors: removeDuplicatesById(options.co_supervisors || []),
        years: Array.from(new Set((options.years || []).map(y => y.toString().substring(0, 4)))).sort((a, b) => parseInt(b) - parseInt(a)),
        fields: Array.from(new Set(options.fields || [])),
        tools: Array.from(new Set(options.tools || []))
      }));
    } catch (err) {
      console.error('خطأ في جلب خيارات الفلاتر', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!programId) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);

      const params: any = {
        limit: 50,
        program_id: Number(programId) // filter by program
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filters.year) params.year = filters.year;
      if (filters.field) params.field = filters.field;
      if (filters.tools) params.tools = filters.tools;
      if (filters.supervisor) params.supervisor = filters.supervisor;
      if (filters.co_supervisor) params.co_supervisor = filters.co_supervisor;
      if (filters.project_type) params.project_type = filters.project_type;

      const response = await projectService.getProjects(params);
      setProjects(response);
    } catch (err) {
      console.error('خطأ في جلب المشاريع', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [programId, filters, searchQuery]);

  const handleQuickView = (project: Project) => {
    setSelectedProject(project);
    setSelectedProjectStudents(project.students || []);
  };

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

  
  const extractYear = (date: number) => date ? new Date(date).getFullYear() : 'غير محدد';

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchProjects, 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, filters, fetchProjects]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#31257D] mb-6">مشاريع البرنامج</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="ابحث في المشاريع..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />

          <select
            value={filters.year}
            onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
          >
            <option value="">السنة</option>
            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={filters.project_type}
            onChange={e => setFilters(f => ({ ...f, project_type: e.target.value }))}
          >
            <option value="">نوع المشروع</option>
            {filterOptions.project_types.map(pt => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#31257D]"></div>
            <p className="mt-4 text-[#4A5568]">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <FiSearch size={40} className="mx-auto text-[#31257D]" />
            <p className="mt-4 text-[#4A5568]">لا توجد مشاريع مطابقة</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => {
              const badge = getProjectTypeBadge(p.project_type);
              return (
                <div key={p.project_id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-[#31257D]/10 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={p.logo?.startsWith('http') ? p.logo : `http://localhost:8001${p.logo}`}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = '/default-project-logo.png'; }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`${badge.bg} ${badge.color} px-3 py-1 rounded-full text-xs font-bold`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-[#31257D] mb-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description || 'لا يوجد ملخص'}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div><FiMapPin className="inline mr-1" />{p.university_name}</div>
                      <div><FiBookOpen className="inline mr-1" />{p.college_name}</div>
                      <div><FiCalendar className="inline mr-1" />{extractYear(p.start_date)}</div>
                      <div><FiUser className="inline mr-1" />{p.supervisor_name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button onClick={() => handleQuickView(p)} className="py-2 bg-[#31257D] text-white rounded-lg text-sm flex items-center justify-center gap-1">
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