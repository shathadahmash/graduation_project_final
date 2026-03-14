import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiBookOpen, FiUser, FiSearch, FiEye, FiArrowLeft } from 'react-icons/fi';
import Navbar from './Navbar';
import { Group, projectService } from '../services/projectService';
import { userService } from '../services/userService';
import ProjectDetailModal from './ProjectDetailModal';

interface Project {
  project_id: number;
  title: string;
  description: string;
  project_type: string;
  state_name: string;
  field: string;
  tools: string;
  university_name: string;
  college_name?: string;
  department_name?: string;
  program_name?: string;
  branch_name?: string;
  start_date?: number;
  end_date?: number;
  external_company?: string;
  supervisor_name: string;
  co_supervisor_name?: string;
  logo?: string;
  documentation?: string;
  groups?: Group[];
}

interface FilterOptions {
  colleges: { id: number; name: string; university_id?: number }[];
  departments: { id: number; name: string; college_id?: number }[];
  supervisors: { id: number; name: string }[];
  co_supervisors: { id: number; name: string }[];
  years: string[];
  fields: string[];
  tools: string[];
  project_types: { value: string; label: string }[];
}

interface Props {
  universityId: number;
}

const ProjectSearch: React.FC<Props> = ({ universityId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    university_id: universityId,
    college: '',
    department: '',
    year: '',
    field: '',
    tools: '',
    supervisor: '',
    co_supervisor: '',
    project_type: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    colleges: [],
    departments: [],
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
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const removeDuplicatesById = <T extends { id: number }>(items: T[]): T[] => {
    const unique = new Map<number, T>();
    items.forEach(item => { if (!unique.has(item.id)) unique.set(item.id, item); });
    return Array.from(unique.values());
  };

  // ------------------ Filter Options ------------------
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await projectService.getFilterOptions();
      const departments = await userService.getDepartments();
      const colleges = await userService.getColleges(); // fetch all colleges

      setFilterOptions({
        colleges: removeDuplicatesById(colleges || []).filter(c => c.university_id === universityId),
        departments: removeDuplicatesById(departments || []),
        supervisors: removeDuplicatesById(options.supervisors || []),
        co_supervisors: removeDuplicatesById(options.co_supervisors || []),
        years: Array.from(new Set((options.years || []).map((y: string) => y.toString().substring(0, 4)))).sort((a, b) => parseInt(b) - parseInt(a)),
        fields: Array.from(new Set(options.fields || [])),
        tools: Array.from(new Set(options.tools || [])),
        project_types: [
          { value: 'Governmental', label: 'حكومي' },
          { value: 'External', label: 'شركات خارجية' },
          { value: 'Proposed', label: 'مقترح' }
        ]
      });
    } catch (err) {
      console.error('Error fetching filter options', err);
    }
  }, [universityId]);

  // ------------------ Fetch Projects ------------------
  const fetchProjects = useCallback(async () => {
    if (!filters.university_id) return setProjects([]);
    try {
      setLoading(true);
      const params: any = { limit: 50, university_id: filters.university_id };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filters.college) params.college = filters.college;
      if (filters.department) params.department = filters.department;
      if (filters.year) params.year = filters.year;
      if (filters.field) params.field = filters.field;
      if (filters.tools) params.tools = filters.tools;
      if (filters.supervisor) params.supervisor = filters.supervisor;
      if (filters.co_supervisor) params.co_supervisor = filters.co_supervisor;
      if (filters.project_type) params.project_type = filters.project_type;

      const response = await projectService.getProjects(params);
      const data = Array.isArray(response) ? response : response?.results || response?.data || [];

      setProjects(data.map((p: any) => ({
        project_id: p.project_id,
        title: p.title,
        description: p.description,
        project_type: p.project_type,
        state_name: p.state_name || p.state?.name || '',
        field: p.field,
        tools: p.tools,
        university_name: p.university_name || p.university?.name || '',
        branch_name: p.branch_name || p.branch?.name || '',
        college_name: p.college_name || p.college?.name || 'لا توجد كلية',
        department_name: p.department?.name,
        program_name: p.program?.p_name || p.program_name,
        start_date: p.start_date,
        end_date: p.end_date,
        supervisor_name: p.supervisor_name || 'لا يوجد مشرف',
        co_supervisor_name: p.co_supervisor_name || 'لا يوجد مشرف مساعد',
        logo: p.logo || '/default-project-logo.png',
        documentation: p.documentation_url || null,
        groups: p.groups || []
      })));
    } catch (err) {
      console.error('Error fetching projects', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // ------------------ Effects ------------------
  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchProjects, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, filters, fetchProjects]);

  // ------------------ Quick View ------------------
  const handleQuickView = (project: Project) => {
    setSelectedProject(project);
    const students = project.groups?.flatMap(g =>
      g.members?.map(m => ({
        name: m.user_detail?.name || `${m.user_detail?.first_name || ''} ${m.user_detail?.last_name || ''}`.trim()
      })) || []
    ) || [];
    setSelectedProjectStudents(students);
  };

  // ------------------ Render ------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#31257D] mb-4">مشاريع الجامعة</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="ابحث في المشاريع..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <select value={filters.college} onChange={e => setFilters(f => ({ ...f, college: e.target.value }))}>
            <option value="">الكلية</option>
            {filterOptions.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">جاري تحميل المشاريع...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">لا توجد مشاريع مطابقة</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => (
              <div key={p.project_id} className="bg-white rounded-xl shadow-md flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={p.logo?.startsWith('http') ? p.logo : `http://localhost:8001${p.logo}`}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/default-project-logo.png'; }}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{p.description || 'لا يوجد ملخص'}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div><FiMapPin className="inline mr-1" />{p.university_name}</div>
                    <div><FiBookOpen className="inline mr-1" />{p.college_name}</div>
                    <div><FiCalendar className="inline mr-1" />{p.start_date ? new Date(p.start_date).getFullYear() : '-'}</div>
                    <div><FiUser className="inline mr-1" />{p.supervisor_name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => handleQuickView(p)} className="py-2 bg-[#31257D] text-white rounded-lg text-sm">عرض سريع</button>
                    <Link to={`/projects/${p.project_id}`} className="py-2 border border-[#31257D] text-[#31257D] rounded-lg text-sm flex justify-center">التفاصيل</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            students={selectedProjectStudents}
            loadingStudents={loadingStudents}
            onClose={() => { setSelectedProject(null); setSelectedProjectStudents([]); }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectSearch;