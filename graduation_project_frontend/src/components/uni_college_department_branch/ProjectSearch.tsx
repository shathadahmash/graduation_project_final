import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers, FiX, FiSearch, FiSliders, FiFilter, FiInfo, FiEye, FiFileText, FiBriefcase, FiTag, FiClock, FiImage, FiDownload, FiLink, FiArrowLeft, FiUserCheck, FiLoader } from 'react-icons/fi';
import Navbar from '../Navbar';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';

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
  studentsLoading?: boolean;
}

interface GroupMember {
  user: number;
  user_detail: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string | null;
    gender: string;
    CID: string | null;
    roles: { role__role_ID: number; role__type: string }[];
    department_id: number | null;
    college_id: number | null;
    staff_profiles: any[];
  };
  group: number;
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

const ProjectSearch: React.FC = () => {
  // تعريف جميع حالات useState أولاً
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectStudents, setSelectedProjectStudents] = useState<{ name: string; id?: string }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
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
  const [filteredColleges, setFilteredColleges] = useState<{ id: number; name: string; university_id?: number }[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<{ id: number; name: string; college_id?: number }[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // ثابت عنوان API
  const API_BASE_URL = 'http://localhost:8000/api/';

  // دالة لبناء رابط الصورة الكامل
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) {
      return '/default-project-logo.png';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+|\/+$/g, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  // دالة لجلب طلاب المشروع
  const fetchProjectStudents = async (projectId: number) => {
    try {
      const response = await projectService.getProjectGroups(projectId);

      console.log("GROUP RESPONSE:", response);

      const groups = response?.data || response?.results || response || [];
      const students: { name: string; id?: string }[] = [];

      if (Array.isArray(groups)) {
        groups.forEach((group: any) => {
          if (group.members && Array.isArray(group.members)) {
            group.members.forEach((member: any) => {
              const user = member.user_detail;

              if (user) {
                students.push({
                  name:
                    user.name ||
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username ||
                    "طالب",
                  id: user.id?.toString(),
                });
              }
            });
          }
        });
      }

      return students;
    } catch (error) {
      console.error("خطأ في جلب طلاب المشروع:", error);
      return [];
    }
  };
  // دالة لفتح نافذة العرض السريع وجلب الطلاب
  const handleQuickView = async (project: Project) => {
    setSelectedProject(project);
    setLoadingStudents(true);
    setSelectedProjectStudents([]);

    const students = await fetchProjectStudents(project.project_id);
    setSelectedProjectStudents(students);
    setLoadingStudents(false);
  };

  // جلب خيارات الفلاتر
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await projectService.getFilterOptions();
      const departments = await userService.getDepartments();

      const uniqueColleges = removeDuplicatesByName(options.colleges || []);
      const uniqueDepartments = removeDuplicatesByName(departments || []);
      const uniqueUniversities = removeDuplicatesById(options.universities || []);
      const uniqueSupervisors = removeDuplicatesById(options.supervisors || []);
      const uniqueCoSupervisors = removeDuplicatesById(options.co_supervisors || []);

      const uniqueFields = Array.from(new Set(options.fields || []));
      const uniqueTools = Array.from(new Set(options.tools || []));
      const uniqueYears = Array.from(new Set(
        (options.years || [])
          .map((y: string) => {
            const match = y.match(/\d{4}/);
            return match ? match[0] : y;
          })
      )).sort((a, b) => parseInt(b) - parseInt(a));

      setFilterOptions({
        universities: uniqueUniversities,
        colleges: uniqueColleges,
        departments: uniqueDepartments,
        supervisors: uniqueSupervisors,
        co_supervisors: uniqueCoSupervisors,
        years: uniqueYears,
        fields: uniqueFields,
        tools: uniqueTools,
        project_types: [
          { value: 'Governmental', label: 'حكومي' },
          { value: 'External', label: 'شركات خارجية' },
          { value: 'Proposed', label: 'مقترح' }
        ]
      });

      setFilteredColleges(uniqueColleges);
      setFilteredDepartments(uniqueDepartments);

    } catch (err) {
      console.error('خطأ في جلب خيارات الفلاتر', err);
    }
  }, []);

  // جلب المشاريع - تعديل هنا لإصلاح الخطأ
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await projectService.getProjects(params);
      const data = Array.isArray(response) ? response : response?.results || response?.data || [];
      console.log('------------------------------------------------------', data)
      const processedData = data.map((p: any) => {
        // التحقق من وجود القيم قبل استخدامها
        const universityName = p.university?.name || p.university_name || 'غير محدد';
        console.log(p.stateName);
        const branchName = p.branch?.name || p.branch_name || 'غير محدد';
        const collegeName = p.college?.name || p.college_name || 'غير محدد';
        const departmentName = p.department?.name || p.department_name;
        const stateName = p.state?.name || p.state || 'غير محدد';
        const externalCompanyName = p.external_company?.name || p.external_company;
        const logo = p.logo;
        console.log("--------------------------", logo);
        return {
          project_id: p.project_id || p.id,
          title: p.title || 'بدون عنوان',
          description: p.description || '',
          project_type: p.project_type || 'غير محدد',
          state: stateName,
          field: p.field || 'غير محدد',
          tools: p.tools || 'غير محدد',
          university_name: universityName,
          branch_name: branchName,
          college_name: collegeName,
          department_name: departmentName,
          start_date: p.start_date,
          end_date: p.end_date,
          external_company: externalCompanyName,
          supervisor_name: p.supervisor_name || 'غير محدد',
          co_supervisor_name: p.co_supervisor_name,
          logo: logo,
          documentation: p.documentation,
          students: [],
          studentsLoading: false
        };
      });

      setProjects(processedData);
      setInitialLoad(false);
    } catch (err) {
      console.error('خطأ في جلب المشاريع', err);
      setProjects([]);
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // دالة لإزالة التكرار من المصفوفات
  const removeDuplicatesByName = <T extends { id: number; name: string }>(items: T[]): T[] => {
    const uniqueMap = new Map<string, T>();
    items.forEach(item => {
      if (!uniqueMap.has(item.name)) {
        uniqueMap.set(item.name, item);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const removeDuplicatesById = <T extends { id: number }>(items: T[]): T[] => {
    const uniqueMap = new Map<number, T>();
    items.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // دالة لاستخراج السنة من التاريخ الرقمي
  const extractYear = (date: number | string): string => {
    if (!date) return '';
    const dateStr = date.toString();
    return dateStr.substring(0, 4);
  };

  // ترجمة نوع المشروع
  const getProjectTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'Governmental': 'حكومي',
      'External': 'شركات خارجية',
      'Proposed': 'مقترح'
    };
    return types[type] || type;
  };

  // ترجمة نوع المشروع مع لون مناسب
  const getProjectTypeBadge = (type: string) => {
    const badges: { [key: string]: { color: string; bg: string; label: string } } = {
      'Governmental': { color: 'text-blue-700', bg: 'bg-blue-100', label: 'حكومي' },
      'External': { color: 'text-green-700', bg: 'bg-green-100', label: 'شركات خارجية' },
      'Proposed': { color: 'text-purple-700', bg: 'bg-purple-100', label: 'مقترح' }
    };
    return badges[type] || { color: 'text-gray-700', bg: 'bg-gray-100', label: type };
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchProjects();
  }, [fetchFilterOptions, fetchProjects]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProjects(), 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, filters, fetchProjects]);

  useEffect(() => {
    if (filters.university) {
      const universityId = parseInt(filters.university);

      const cols = filterOptions.colleges.filter(c => c.university_id === universityId);
      const uniqueCols = removeDuplicatesByName(cols);
      setFilteredColleges(uniqueCols.length ? uniqueCols : filterOptions.colleges);

      if (filters.college && !uniqueCols.some(c => c.id === parseInt(filters.college))) {
        setFilters(f => ({ ...f, college: '', department: '' }));
      }
    } else {
      setFilteredColleges(filterOptions.colleges);
    }
  }, [filters.university, filterOptions.colleges]);

  useEffect(() => {
    if (filters.college) {
      const collegeId = parseInt(filters.college);
      const depts = filterOptions.departments.filter(d => d.college_id === collegeId);
      const uniqueDepts = removeDuplicatesByName(depts);
      setFilteredDepartments(uniqueDepts.length ? uniqueDepts : filterOptions.departments);

      if (filters.department && !uniqueDepts.some(d => d.id === parseInt(filters.department))) {
        setFilters(f => ({ ...f, department: '' }));
      }
    } else {
      setFilteredDepartments(filterOptions.departments);
    }
  }, [filters.college, filterOptions.departments]);

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(v => v !== '').length;
  };

  const clearAllFilters = () => {
    setFilters({
      university: '',
      college: '',
      department: '',
      year: '',
      field: '',
      tools: '',
      supervisor: '',
      co_supervisor: '',
      project_type: ''
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* عنوان الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#31257D] mb-2">البحث عن مشاريع التخرج</h1>
          <p className="text-[#4A5568]">استعرض مشاريع التخرج والرسائل العلمية في الجامعات اليمنية</p>
        </div>

        {/* شريط البحث والفلاتر */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث في المشاريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pr-4 pl-10 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4937BF]" size={18} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <button
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${showFilters
              ? 'bg-[#31257D] text-white border-[#31257D]'
              : 'bg-white text-[#31257D] border-[#31257D]/20 hover:bg-[#31257D]/5'
              }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiSliders />
            فلترة
            {getActiveFiltersCount() > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* عرض الفلاتر النشطة */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 bg-white p-3 rounded-lg border border-[#31257D]/10">
            <span className="text-sm text-[#31257D] font-semibold ml-2">الفلاتر النشطة:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              let displayText = '';
              switch (key) {
                case 'university':
                  displayText = filterOptions.universities.find(u => u.id === parseInt(value))?.name || value;
                  break;
                case 'college':
                  displayText = filterOptions.colleges.find(c => c.id === parseInt(value))?.name || value;
                  break;
                case 'department':
                  displayText = filterOptions.departments.find(d => d.id === parseInt(value))?.name || value;
                  break;
                case 'year': displayText = `سنة ${value}`; break;
                case 'field': displayText = `مجال ${value}`; break;
                case 'tools': displayText = `أدوات ${value}`; break;
                case 'supervisor': displayText = `مشرف ${value}`; break;
                case 'co_supervisor': displayText = `مشرف مساعد ${value}`; break;
                case 'project_type':
                  displayText = `نوع: ${filterOptions.project_types.find(t => t.value === value)?.label || value}`;
                  break;
              }
              return (
                <span key={key} className="bg-[#31257D]/10 text-[#31257D] text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  {displayText}
                  <button onClick={() => setFilters(f => ({ ...f, [key]: '' }))} className="hover:text-red-600">
                    <FiX size={12} />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 font-semibold"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* لوحة الفلاتر */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl shadow border border-[#31257D]/10">
            <select value={filters.university} onChange={e => setFilters(f => ({ ...f, university: e.target.value }))}>
              <option value="">الجامعة</option>
              {filterOptions.universities.map(u => (
                <option key={`uni-${u.id}`} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select value={filters.college} onChange={e => setFilters(f => ({ ...f, college: e.target.value }))}>
              <option value="">الكلية</option>
              {filteredColleges.map(c => (
                <option key={`col-${c.id}-${c.name}`} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="">القسم</option>
              {filteredDepartments.map(d => (
                <option key={`dept-${d.id}-${d.name}`} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select value={filters.project_type} onChange={e => setFilters(f => ({ ...f, project_type: e.target.value }))}>
              <option value="">نوع المشروع</option>
              {filterOptions.project_types.map(t => (
                <option key={`type-${t.value}`} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}>
              <option value="">سنة المشروع</option>
              {filterOptions.years.map((y, i) => (
                <option key={`year-${y}-${i}`} value={y}>{y}</option>
              ))}
            </select>

            <select value={filters.field} onChange={e => setFilters(f => ({ ...f, field: e.target.value }))}>
              <option value="">المجال</option>
              {filterOptions.fields.map((f, i) => (
                <option key={`field-${f}-${i}`} value={f}>{f}</option>
              ))}
            </select>

            <select value={filters.tools} onChange={e => setFilters(f => ({ ...f, tools: e.target.value }))}>
              <option value="">الأدوات</option>
              {filterOptions.tools.map((t, i) => (
                <option key={`tool-${t}-${i}`} value={t}>{t}</option>
              ))}
            </select>

            <select value={filters.supervisor} onChange={e => setFilters(f => ({ ...f, supervisor: e.target.value }))}>
              <option value="">المشرف</option>
              {filterOptions.supervisors.map(s => (
                <option key={`sup-${s.id}`} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select value={filters.co_supervisor} onChange={e => setFilters(f => ({ ...f, co_supervisor: e.target.value }))}>
              <option value="">المشرف المساعد</option>
              {filterOptions.co_supervisors.map(s => (
                <option key={`cosup-${s.id}`} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* نتائج المشاريع */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#31257D]"></div>
            <p className="mt-4 text-[#4A5568]">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-[#31257D]/5">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                <FiSearch className="text-[#31257D]" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#31257D] mb-2">لا توجد مشاريع مطابقة</h3>
            <p className="text-[#4A5568] mb-4 max-w-md mx-auto">
              لم نتمكن من العثور على أي مشاريع تطابق معايير البحث الخاصة بك.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#4A5568] flex items-center justify-between">
              <span>
                تم العثور على <span className="font-bold text-[#31257D]">{projects.length}</span> مشروع
              </span>
              {(searchQuery || getActiveFiltersCount() > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <FiX size={14} />
                  إعادة تعيين
                </button>
              )}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(p => {
                const badge = getProjectTypeBadge(p.project_type);
                return (
                  <div
                    key={p.project_id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#31257D]/10 flex flex-col h-full group"
                  >
                    {/* صورة المشروع */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#31257D]/5 to-[#4937BF]/5">
                      <img
                        src={p.logo}
                        alt={p.title}
                        className="w-full h-full object-cover transition-all duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/default-project-logo.png';
                        }}
                      />

                      {/* شارة نوع المشروع على الصورة */}
                      {p.project_type !== 'غير محدد' && (
                        <div className="absolute top-3 right-3">
                          <span className={`${badge.bg} ${badge.color} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                            {badge.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* محتوى البطاقة */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* عنوان المشروع */}
                      <h3 className="font-bold text-xl text-[#31257D] mb-3 line-clamp-2 text-right leading-tight">
                        {p.title}
                      </h3>

                      {/* ملخص المشروع */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 border-r-2 border-[#4937BF] pr-3">
                        {p.description || 'لا يوجد ملخص متاح'}
                      </p>

                      {/* المعلومات الأساسية */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* الجامعة */}
                        <div className="bg-[#F8FAFC] p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-[#4937BF] mb-1">
                            <FiMapPin size={14} />
                            <span className="text-xs">الجامعة</span>
                          </div>
                          <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.university_name}</p>
                        </div>

                        {/* الكلية */}
                        <div className="bg-[#F8FAFC] p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-[#4937BF] mb-1">
                            <FiBookOpen size={14} />
                            <span className="text-xs">الكلية</span>
                          </div>
                          <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.college_name}</p>
                        </div>

                        {/* السنة */}
                        <div className="bg-[#F8FAFC] p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-[#4937BF] mb-1">
                            <FiCalendar size={14} />
                            <span className="text-xs">السنة</span>
                          </div>
                          <p className="font-medium text-[#31257D] text-sm">
                            {extractYear(p.start_date) || 'غير محدد'}
                          </p>
                        </div>

                        {/* المشرف */}
                        <div className="bg-[#F8FAFC] p-2 rounded-lg">
                          <div className="flex items-center gap-1 text-[#4937BF] mb-1">
                            <FiUser size={14} />
                            <span className="text-xs">المشرف</span>
                          </div>
                          <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.supervisor_name}</p>
                        </div>
                      </div>

                      {/* زرين - عرض سريع وتفاصيل كاملة */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                          onClick={() => handleQuickView(p)}
                          className="py-2.5 bg-[#31257D] text-white rounded-lg text-sm font-medium hover:bg-[#4937BF] transition-colors flex items-center justify-center gap-1"
                        >
                          <FiEye size={16} />
                          عرض سريع
                        </button>

                        <Link
                          to={`/projects/${p.project_id}`}
                          className="py-2.5 bg-white text-[#31257D] border-2 border-[#31257D] rounded-lg text-sm font-medium hover:bg-[#31257D] hover:text-white transition-all duration-300 flex items-center justify-center gap-1 group"
                        >
                          <span>التفاصيل</span>
                          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* نافذة العرض السريع المنبثقة */}
        {selectedProject && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
            onClick={() => {
              setSelectedProject(null);
              setSelectedProjectStudents([]);
            }}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              {/* رأس النافذة */}
              <div className="bg-gradient-to-l from-[#31257D] to-[#4937BF] p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <FiInfo size={20} />
                  <h2 className="text-xl font-bold">عرض سريع للمشروع</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedProjectStudents([]);
                  }}
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* محتوى النافذة */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  {/* صورة مصغرة */}
                  <div className="w-24 h-24 bg-[#F8FAFC] rounded-lg overflow-hidden border border-[#31257D]/10 flex-shrink-0">
                    <img
                      src={getImageUrl(selectedProject.logo)}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/default-project-logo.png';
                      }}
                    />
                  </div>

                  {/* عنوان ونوع المشروع */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#31257D] mb-2">{selectedProject.title}</h3>
                    {selectedProject.project_type !== 'غير محدد' && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedProject.project_type === 'Governmental' ? 'bg-blue-100 text-blue-700' :
                        selectedProject.project_type === 'External' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                        {getProjectTypeLabel(selectedProject.project_type)}
                      </span>
                    )}
                  </div>
                </div>

                {/* معلومات سريعة */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#F8FAFC] p-3 rounded-lg">
                    <p className="text-xs text-[#4A5568] mb-1">الجامعة</p>
                    <p className="font-medium text-[#31257D]">{selectedProject.university_name}</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-lg">
                    <p className="text-xs text-[#4A5568] mb-1">الكلية</p>
                    <p className="font-medium text-[#31257D]">{selectedProject.college_name}</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-lg">
                    <p className="text-xs text-[#4A5568] mb-1">المشرف</p>
                    <p className="font-medium text-[#31257D]">{selectedProject.supervisor_name}</p>
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-lg">
                    <p className="text-xs text-[#4A5568] mb-1">السنة</p>
                    <p className="font-medium text-[#31257D]">{extractYear(selectedProject.start_date)}</p>
                  </div>
                </div>

                {/* ملخص سريع */}
                <div className="bg-[#F8FAFC] p-4 rounded-lg mb-4">
                  <h4 className="font-bold text-[#31257D] mb-2 flex items-center gap-2">
                    <FiBookOpen className="text-[#4937BF]" />
                    ملخص المشروع
                  </h4>
                  <p className="text-[#4A5568] text-sm line-clamp-3">
                    {selectedProject.description || 'لا يوجد ملخص متاح'}
                  </p>
                </div>

                {/* عرض أعضاء المجموعة */}
                <div className="bg-[#F8FAFC] p-4 rounded-lg mb-4">
                  <h4 className="font-bold text-[#31257D] mb-3 flex items-center gap-2">
                    <FiUsers className="text-[#4937BF]" />
                    أعضاء المجموعة
                    {loadingStudents && <FiLoader className="animate-spin mr-2" size={16} />}
                  </h4>

                  {loadingStudents ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#31257D]"></div>
                      <p className="text-sm text-[#4A5568] mt-2">جاري تحميل أعضاء المجموعة...</p>
                    </div>
                  ) : selectedProjectStudents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProjectStudents.map((student, index) => (
                        <div key={index} className="bg-white p-2 rounded-lg border border-[#31257D]/10 flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                            <FiUserCheck className="text-[#31257D]" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#31257D] text-sm">{student.name}</p>
                            {student.id && <p className="text-xs text-gray-500">رقم: {student.id}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#4A5568] text-center py-2">لا يوجد أعضاء في هذه المجموعة</p>
                  )}
                </div>

                {/* زر الانتقال للصفحة الكاملة */}
                <Link
                  to={`/projects/${selectedProject.project_id}`}
                  className="w-full py-3 bg-gradient-to-l from-[#31257D] to-[#4937BF] text-white rounded-lg font-bold hover:from-[#4937BF] hover:to-[#31257D] transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedProjectStudents([]);
                  }}
                >
                  <span>عرض التفاصيل الكاملة</span>
                  <FiArrowLeft size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* إضافة حركة الظهور */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </div>
  );
};

export default ProjectSearch;