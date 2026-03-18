import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers } from 'react-icons/fi';
import Navbar from './Navbar';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';

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
  universities: { id: number; name: string; logo?: string }[];
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
  colleges: { id: number; name: string; university_id?: number }[];
}

const ProjectSearch: React.FC<Props> = ({ universityId, colleges }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    project_university: universityId.toString(),
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
    universities: [],
    colleges: colleges || [],
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

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const removeDuplicatesById = <T extends { id: number }>(items: T[]): T[] => {
    const unique = new Map<number, T>();
    items.forEach(item => { if (!unique.has(item.id)) unique.set(item.id, item); });
    return Array.from(unique.values());
  };

  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await projectService.getFilterOptions();
      const departments = await userService.getDepartments();

      setFilterOptions(prev => ({
        ...prev,
        departments: removeDuplicatesById(departments || []),
        supervisors: removeDuplicatesById(options.supervisors || []),
        co_supervisors: removeDuplicatesById(options.co_supervisors || []),
        years: Array.from(new Set((options.years || []).map((y: string) => y.toString().substring(0, 4))))
          .sort((a, b) => parseInt(b) - parseInt(a)),
        fields: Array.from(new Set(options.fields || [])),
        tools: Array.from(new Set(options.tools || []))
      }));
    } catch (err) {
      console.error('خطأ في جلب خيارات الفلاتر', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!filters.project_university) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);
      const params: any = { limit: 50, project_university: Number(filters.project_university) };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filters.college) params.college = Number(filters.college);
      if (filters.department) params.department = Number(filters.department);
      if (filters.year) params.year = filters.year;
      if (filters.field) params.field = filters.field;
      if (filters.tools) params.tools = filters.tools;
      if (filters.supervisor) params.supervisor = filters.supervisor;
      if (filters.co_supervisor) params.co_supervisor = filters.co_supervisor;
      if (filters.project_type) params.project_type = filters.project_type;

      const response = await projectService.getPublicProjects(params);
      const data = Array.isArray(response) ? response : response?.results || response?.data || [];
      console.log('المشاريع المستلمة:', data);
      setProjects(data.map((p: any) => ({
        project_id: p.project_id,
        title: p.title,
        description: p.description,
        project_type: p.project_type,
        state: p.state_name || p.state?.name || '',
        field: p.field,
        tools: p.tools,
        university_name: p.university_name || p.university?.name || '',
        branch_name: p.branch_name || p.branch?.name || '',
        college_name: p.college_name || p.college?.name || 'لا توجد كلية',
        department_name: p.department?.name,
        start_date: p.start_date,
        end_date: p.end_date,
        external_company: p.external_company?.name,
        supervisor_name: p.supervisor_name || 'لا يوجد مشرف',
        co_supervisor_name: p.co_supervisor_name || 'لا يوجد مشرف مساعد',
        logo: p.logo || '/default-project-logo.png',
        documentation: p.documentation_url || null,
        students: p.students || []
      })));
    } catch (err) {
      console.error('خطأ في جلب المشاريع', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchProjects, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, filters, fetchProjects]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#31257D] mb-4">البحث عن مشاريع التخرج</h1>

        {/* Search & Filters */}
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
            {filterOptions.colleges
              .filter(c => c.university_id === Number(filters.project_university))
              .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Projects */}
        {loading ? (
          <p>جاري تحميل المشاريع...</p>
        ) : projects.length === 0 ? (
          <p>لا توجد مشاريع مطابقة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.project_id} className="bg-white p-4 rounded-lg shadow">
                <img
                  src={p.logo?.startsWith('http') ? p.logo : `http://localhost:8001${p.logo}`}
                  alt={p.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.project_type === 'Proposed' ? 'bg-purple-100 text-purple-700' :
                    p.project_type === 'Governmental' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                    {p.project_type === 'Proposed' ? 'مقترح' : p.project_type === 'Governmental' ? 'حكومي' : 'شركات خارجية'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{p.university_name} - {p.college_name}</p>
                <p className="text-sm"><FiUser className="inline mr-1" /> {p.supervisor_name}</p>
                <p className="text-sm"><FiUsers className="inline mr-1" /> {p.co_supervisor_name}</p>
                <p className="text-sm"><FiBookOpen className="inline mr-1" /> {p.field}</p>
                <p className="text-sm"><FiTool className="inline mr-1" /> {p.tools}</p>
                <p className="text-sm"><FiCalendar className="inline mr-1" /> {p.start_date} - {p.end_date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSearch;