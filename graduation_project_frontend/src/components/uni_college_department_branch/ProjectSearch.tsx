import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers, 
  FiX, FiSearch, FiSliders, FiInfo, FiEye, FiFileText, 
  FiBriefcase, FiImage, FiArrowLeft, FiLoader, FiMail, FiPhone,
  FiAward, FiStar, FiClock, FiFilter, FiChevronDown, FiBookmark
} from 'react-icons/fi';
import Navbar from '../Navbar';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';

// الألوان الأكاديمية - مطابقة لألوان موقعك
const academicColors = {
  primary: '#312583',
  secondary: '#4a3fa0',
  accent: '#5d4db8',
  background: '#ffffff',
  paper: '#ffffff',
  text: '#1a1a2e',
  textLight: '#4a5568',
  border: '#312583/20',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  gradient: {
    primary: 'from-[#312583] to-[#4a3fa0]',
    secondary: 'from-[#4a3fa0] to-[#5d4db8]',
    accent: 'from-[#5d4db8] to-[#312583]',
  }
};

// تعريف الواجهات
interface Member {
  user: number;
  user_detail?: {
    id?: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
}

interface Group {
  id?: number;
  group_name?: string;
  members?: Member[];
}

interface Project {
  project_id: number;
  title: string;
  description: string;
  project_type: string;
  state: string;
  state_name?: string;
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
  groups?: Group[];
  rating: number;        // متوسط التقييم من 0 إلى 5
  ratings_count: number; // عدد التقييمات
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

// مكون InfoCard
const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({ icon, title, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border border-[#312583]/10 bg-white hover:shadow-md hover:border-[#4a3fa0]/30 transition-all duration-300 group">
    <div className="text-[#4a3fa0] text-xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <span className="text-[#4a5568] text-xs font-medium">{title}</span>
      <div className="text-[#312583] font-bold text-sm">{value || 'غير محدد'}</div>
    </div>
  </div>
);

// مكون Badge
const ProjectBadge: React.FC<{ type: string }> = ({ type }) => {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Governmental":
        return "bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white";
      case "External":
        return "bg-gradient-to-r from-[#4a3fa0] to-[#5d4db8] text-white";
      case "Proposed":
        return "bg-gradient-to-r from-[#5d4db8] to-[#312583] text-white";
      default:
        return "bg-gradient-to-r from-[#312583]/70 to-[#4a3fa0]/70 text-white";
    }
  };

  const getBadgeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'Governmental': 'حكومي',
      'External': 'شركات خارجية',
      'Proposed': 'مقترح'
    };
    return types[type] || type;
  };

  return (
    <span className={`${getBadgeStyle(type)} px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-[#312583]/20`}>
      {getBadgeLabel(type)}
    </span>
  );
};

const ProjectSearch: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
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
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // ثابت عنوان API
  const API_BASE_URL = 'http://localhost:8001/api/';

  // دالة لبناء رابط الصورة الكامل
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '/default-project-logo.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\/+|\/+$/g, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  // دوال مساعدة
  const handleQuickView = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setShowModal(false);
  };

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

  const extractYear = (date: number | string): string => {
    if (!date) return 'غير محدد';
    return date.toString().substring(0, 4);
  };

  const getStudentsFromProject = (project: Project | null) => {
    if (!project) return [];
    return project.groups?.flatMap((group) =>
      group.members?.map((member) => ({
        name:
          member.user_detail?.name ||
          `${member.user_detail?.first_name || ""} ${
            member.user_detail?.last_name || ""
          }`.trim() ||
          member.user_detail?.username ||
          "طالب",
        email: member.user_detail?.email,
        id: member.user_detail?.id
      })) || []
    ) || [];
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

  // جلب المشاريع مع تحسين الفلاتر
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      // التحقق من وجود فلاتر نشطة
      const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchQuery.trim() !== '';
      setIsFilterActive(hasActiveFilters);
      
      const params: any = { limit: 50 };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      console.log('🔍 جلب المشاريع مع params:', params);
      
      const response = await projectService.getProjects(params);
      console.log('📦 استجابة API:', response);
      
      // معالجة البيانات
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.results && Array.isArray(response.results)) {
        data = response.results;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log(`📊 عدد المشاريع المستلمة: ${data.length}`);
      
      // معالجة البيانات وتحويلها مع التقييمات
      const processedData = data.map((p: any) => {
        const universityName = p.university?.name || p.university_name || 'غير محدد';
        const branchName = p.branch?.name || p.branch_name || 'غير محدد';
        const collegeName = p.college?.name || p.college_name || 'غير محدد';
        const departmentName = p.department?.name || p.department_name;
        const programName = p.program?.name || p.program_name;
        const stateName = p.state?.name || p.state || 'غير محدد';
        const externalCompanyName = p.external_company?.name || p.external_company;
        const logo = p.logo;

        // ✅ قراءة التقييمات بشكل صحيح
        let projectRating = 0;
        let projectRatingsCount = 0;
        
        // التحقق من وجود التقييمات في البيانات
        if (p.avg_rating !== undefined && p.avg_rating !== null) {
          projectRating = Number(p.avg_rating);
        } else if (p.average_rating !== undefined && p.average_rating !== null) {
          projectRating = Number(p.average_rating);
        } else if (p.rating !== undefined && p.rating !== null) {
          projectRating = Number(p.rating);
        }
        
        if (p.ratings_count !== undefined && p.ratings_count !== null) {
          projectRatingsCount = Number(p.ratings_count);
        } else if (p.total_ratings !== undefined && p.total_ratings !== null) {
          projectRatingsCount = Number(p.total_ratings);
        } else if (p.count !== undefined && p.count !== null) {
          projectRatingsCount = Number(p.count);
        }

        return {
          project_id: p.project_id || p.id,
          title: p.title || 'بدون عنوان',
          description: p.description || '',
          project_type: p.project_type || 'غير محدد',
          state: stateName,
          state_name: stateName,
          field: p.field || 'غير محدد',
          tools: p.tools || 'غير محدد',
          university_name: universityName,
          branch_name: branchName,
          college_name: collegeName,
          department_name: departmentName,
          program_name: programName,
          start_date: p.start_date,
          end_date: p.end_date,
          external_company: externalCompanyName,
          supervisor_name: p.supervisor_name || 'غير محدد',
          co_supervisor_name: p.co_supervisor_name,
          logo: logo,
          documentation: p.documentation,
          groups: p.groups || [],
          rating: projectRating,
          ratings_count: projectRatingsCount
        };
      });

      console.log("📊 أول مشروع بعد المعالجة:", processedData[0]);

      // تطبيق فلاتر إضافية للتأكد (في حال الـ API لا يطبق الفلاتر)
      let finalData = processedData;
      
      if (hasActiveFilters) {
        // تطبيق فلتر الجامعة يدوياً إذا لزم الأمر
        if (filters.university) {
          const universityId = parseInt(filters.university);
          const universityName = filterOptions.universities.find(u => u.id === universityId)?.name;
          if (universityName) {
            finalData = finalData.filter(p => 
              p.university_name === universityName || 
              p.university_name.includes(universityName)
            );
          }
        }
        
        // تطبيق فلتر الكلية
        if (filters.college) {
          const collegeId = parseInt(filters.college);
          const collegeName = filterOptions.colleges.find(c => c.id === collegeId)?.name;
          if (collegeName) {
            finalData = finalData.filter(p => 
              p.college_name === collegeName || 
              p.college_name.includes(collegeName)
            );
          }
        }
        
        // تطبيق فلتر القسم
        if (filters.department) {
          const departmentId = parseInt(filters.department);
          const departmentName = filterOptions.departments.find(d => d.id === departmentId)?.name;
          if (departmentName) {
            finalData = finalData.filter(p => 
              p.department_name === departmentName || 
              p.department_name?.includes(departmentName)
            );
          }
        }
      }

      console.log(`📊 عدد المشاريع بعد التصفية: ${finalData.length}`);
      setProjects(finalData);
      
    } catch (err) {
      console.error('❌ خطأ في جلب المشاريع:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, filterOptions]);

  // Effects
  useEffect(() => {
    fetchFilterOptions();
    fetchProjects();
  }, []);

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

  useEffect(() => {
    setActiveFilterCount(Object.values(filters).filter(v => v !== '').length);
  }, [filters]);

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
    <div className="min-h-screen bg-white font-['Cairo',sans-serif]" dir="rtl">
      <Navbar />
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#312583] via-[#4a3fa0] to-[#5d4db8] text-white py-16 mb-8 overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-10">
          <FiBookOpen size={120} className="text-white" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FiAward className="text-white/80" size={24} />
            <span className="text-sm font-semibold text-white/80 tracking-wider">المكتبة الأكاديمية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            مشاريع التخرج في الجامعات اليمنية 
          </h1>
          <p className="text-white/90 text-lg max-w-3xl mx-auto leading-relaxed">
            استعرض آلاف المشاريع الأكاديمية في مختلف التخصصات من الجامعات اليمنية
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* شريط البحث والفلاتر */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#312583]/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث في المشاريع... (العنوان، الوصف، المجال)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pr-5 pl-12 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none transition-all text-right bg-gray-50"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a3fa0]" size={20} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#312583] transition-colors"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            
            <button
              className={`px-6 py-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all ${
                showFilters
                  ? 'bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white border-transparent shadow-lg shadow-[#312583]/20'
                  : 'bg-white text-[#312583] border-[#312583]/20 hover:border-[#4a3fa0] hover:bg-gray-50'
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiSliders size={18} />
              <span>فلترة متقدمة</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#4a3fa0] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* عرض الفلاتر النشطة */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-[#312583]/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#312583] ml-2">الفلاتر النشطة:</span>
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
                    case 'supervisor': displayText = `مشرف: ${value}`; break;
                    case 'co_supervisor': displayText = `مشرف مساعد: ${value}`; break;
                    case 'project_type':
                      displayText = filterOptions.project_types.find(t => t.value === value)?.label || value;
                      break;
                  }
                  return (
                    <span key={key} className="bg-[#312583]/10 text-[#312583] border border-[#312583]/20 px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                      {displayText}
                      <button 
                        onClick={() => setFilters(f => ({ ...f, [key]: '' }))} 
                        className="hover:text-[#4a3fa0] transition-colors mr-1"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={clearAllFilters}
                  className="text-[#4a3fa0] hover:text-[#312583] text-sm px-3 py-1.5 font-semibold transition-colors"
                >
                  مسح الكل
                </button>
              </div>
            </div>
          )}
        </div>

        {/* لوحة الفلاتر المتقدمة */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#312583]/10 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* حقول الفلاتر */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">الجامعة</label>
                <select 
                  value={filters.university} 
                  onChange={e => setFilters(f => ({ ...f, university: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع الجامعات</option>
                  {filterOptions.universities.map(u => (
                    <option key={`uni-${u.id}`} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">الكلية</label>
                <select 
                  value={filters.college} 
                  onChange={e => setFilters(f => ({ ...f, college: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع الكليات</option>
                  {filteredColleges.map(c => (
                    <option key={`col-${c.id}`} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">القسم</label>
                <select 
                  value={filters.department} 
                  onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع الأقسام</option>
                  {filteredDepartments.map(d => (
                    <option key={`dept-${d.id}`} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">نوع المشروع</label>
                <select 
                  value={filters.project_type} 
                  onChange={e => setFilters(f => ({ ...f, project_type: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع الأنواع</option>
                  {filterOptions.project_types.map(t => (
                    <option key={`type-${t.value}`} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">سنة المشروع</label>
                <select 
                  value={filters.year} 
                  onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع السنوات</option>
                  {filterOptions.years.map((y, i) => (
                    <option key={`year-${y}`} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">المجال</label>
                <select 
                  value={filters.field} 
                  onChange={e => setFilters(f => ({ ...f, field: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع المجالات</option>
                  {filterOptions.fields.map((f, i) => (
                    <option key={`field-${f}`} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">الأدوات</label>
                <select 
                  value={filters.tools} 
                  onChange={e => setFilters(f => ({ ...f, tools: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع الأدوات</option>
                  {filterOptions.tools.map((t, i) => (
                    <option key={`tool-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">المشرف</label>
                <select 
                  value={filters.supervisor} 
                  onChange={e => setFilters(f => ({ ...f, supervisor: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع المشرفين</option>
                  {filterOptions.supervisors.map(s => (
                    <option key={`sup-${s.id}`} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#4a5568] mr-1">المشرف المساعد</label>
                <select 
                  value={filters.co_supervisor} 
                  onChange={e => setFilters(f => ({ ...f, co_supervisor: e.target.value }))}
                  className="w-full p-3 border-2 border-[#312583]/10 rounded-xl focus:border-[#4a3fa0] outline-none bg-gray-50"
                >
                  <option value="">جميع المشرفين المساعدين</option>
                  {filterOptions.co_supervisors.map(s => (
                    <option key={`cosup-${s.id}`} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* نتائج المشاريع */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4a3fa0] border-t-transparent"></div>
            <p className="mt-4 text-[#312583] font-medium">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-[#312583]/10 p-16 text-center">
            <div className="w-24 h-24 bg-[#312583]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiSearch className="text-[#312583]" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#312583] mb-3">
              {isFilterActive ? 'لا توجد نتائج مطابقة' : 'لا توجد مشاريع'}
            </h3>
            <p className="text-[#4a5568] max-w-md mx-auto mb-6">
              {isFilterActive 
                ? 'لم نتمكن من العثور على أي مشاريع تطابق معايير البحث الخاصة بك. جرب تغيير الفلاتر أو كلمات البحث.'
                : 'لا توجد مشاريع في النظام حالياً.'}
            </p>
            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#312583]/20 transition-all"
              >
                عرض جميع المشاريع
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-[#312583]/10">
              <div className="flex items-center gap-2">
                <FiBookOpen className="text-[#4a3fa0]" size={20} />
                <span className="text-[#312583]">
                  {isFilterActive ? 'نتائج البحث: ' : 'جميع المشاريع: '}
                  <span className="font-bold text-[#4a3fa0] text-lg">{projects.length}</span> مشروع
                </span>
              </div>
              {isFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-[#4a3fa0] hover:text-[#312583] text-sm flex items-center gap-1 font-medium transition-colors"
                >
                  <FiX size={16} />
                  إعادة تعيين
                </button>
              )}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(p => (
                <div
                  key={p.project_id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-[#312583]/10 transition-all duration-300 overflow-hidden border border-[#312583]/10 flex flex-col h-full"
                >
                  {/* صورة المشروع */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#312583]/10 to-[#4a3fa0]/10">
                    {p.logo ? (
                      <img
                        src={getImageUrl(p.logo)}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/default-project-logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#4a5568]">
                        <FiImage size={48} className="mb-2 opacity-50" />
                        <span className="text-sm">لا توجد صورة</span>
                      </div>
                    )}

                    {/* Badge نوع المشروع */}
                    {p.project_type !== 'غير محدد' && (
                      <div className="absolute top-4 right-4">
                        <ProjectBadge type={p.project_type} />
                      </div>
                    )}

                    {/* شريط زخرفي سفلي */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#312583] to-[#4a3fa0]"></div>
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-[#312583] mb-3 line-clamp-2 text-right leading-tight group-hover:text-[#4a3fa0] transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-[#4a5568] text-sm mb-4 line-clamp-2 border-r-2 border-[#4a3fa0] pr-3">
                      {p.description || 'لا يوجد ملخص متاح'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin className="text-[#4a3fa0]" size={14} />
                        <span className="text-[#312583] font-medium">الجامعة:</span>
                        <span className="text-[#4a5568]">{p.university_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiBookOpen className="text-[#4a3fa0]" size={14} />
                        <span className="text-[#312583] font-medium">الكلية:</span>
                        <span className="text-[#4a5568]">{p.college_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="text-[#4a3fa0]" size={14} />
                        <span className="text-[#312583] font-medium">السنة:</span>
                        <span className="text-[#4a5568]">{extractYear(p.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiUser className="text-[#4a3fa0]" size={14} />
                        <span className="text-[#312583] font-medium">المشرف:</span>
                        <span className="text-[#4a5568]">{p.supervisor_name}</span>
                      </div>
                      
                      {/* ✅ قسم التقييمات - معدل لعرض التقييمات بشكل صحيح */}
                      {/* ✅ قسم التقييمات - عرض العدد بشكل صحيح */}
<div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#312583]/10">
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar
        key={star}
        size={16}
        className={`${
          star <= Math.round(p.rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))}
  </div>
  <span className="text-sm text-[#4a5568]">
    {p.ratings_count > 0 ? (
      `(${p.ratings_count} ${p.ratings_count === 1 ? 'تقييم' : 'تقييمات'})`
    ) : p.rating > 0 ? (
      // إذا كان هناك متوسط تقييم ولكن العدد 0 (خطأ في البيانات)
      `(تقييم: ${p.rating.toFixed(1)})`
    ) : (
      '(لا توجد تقييمات)'
    )}
  </span>
</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button
                        onClick={() => handleQuickView(p)}
                        className="py-3 bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#312583]/20 transition-all flex items-center justify-center gap-2"
                      >
                        <FiEye size={16} />
                        عرض سريع
                      </button>

                      <Link
                        to={`/projects/${p.project_id}`}
                        className="py-3 bg-white text-[#312583] border-2 border-[#312583] rounded-xl text-sm font-medium hover:bg-gradient-to-r hover:from-[#312583] hover:to-[#4a3fa0] hover:text-white transition-all flex items-center justify-center gap-2 group"
                      >
                        <span>التفاصيل</span>
                        <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* نافذة العرض السريع */}
        {showModal && selectedProject && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative border border-[#312583]/10 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 left-4 text-gray-400 hover:text-[#312583] z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors"
              >
                <FiX size={20} />
              </button>

              <div className="max-h-[90vh] overflow-y-auto">
                <div className="relative h-64 bg-gradient-to-r from-[#312583] to-[#4a3fa0] overflow-hidden">
                  {selectedProject.logo ? (
                    <img
                      src={getImageUrl(selectedProject.logo)}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover opacity-40"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/default-project-logo.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage size={80} className="text-white/30" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#312583] via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-6 right-6 left-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ProjectBadge type={selectedProject.project_type} />
                      <span className="text-white/80 text-sm">• {selectedProject.state_name || selectedProject.state}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {selectedProject.title}
                    </h2>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* ✅ عرض التقييمات في النافذة المنبثقة */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-[#312583]/10">
                    <h3 className="text-lg font-bold text-[#312583] mb-3 flex items-center gap-2">
                      <FiStar className="text-[#4a3fa0]" />
                      تقييم المشروع
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={24}
                            className={`${
                              star <= Math.round(selectedProject.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-[#312583]">
                        {selectedProject.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-[#4a5568]">
                        ({selectedProject.ratings_count} {selectedProject.ratings_count === 1 ? 'تقييم' : 'تقييمات'})
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-[#312583]/10">
                    <h3 className="text-lg font-bold text-[#312583] mb-3 flex items-center gap-2">
                      <FiInfo className="text-[#4a3fa0]" />
                      ملخص المشروع
                    </h3>
                    <p className="text-[#1a1a2e] leading-relaxed">
                      {selectedProject.description || "لا يوجد ملخص متاح لهذا المشروع."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#312583] mb-4 flex items-center gap-2">
                      <FiBookOpen className="text-[#4a3fa0]" />
                      معلومات المشروع
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <InfoCard icon={<FiMapPin />} title="الجامعة" value={selectedProject.university_name} />
                      <InfoCard icon={<FiBookOpen />} title="الكلية" value={selectedProject.college_name} />
                      {selectedProject.department_name && (
                        <InfoCard icon={<FiBookOpen />} title="القسم" value={selectedProject.department_name} />
                      )}
                      {selectedProject.program_name && (
                        <InfoCard icon={<FiStar />} title="البرنامج" value={selectedProject.program_name} />
                      )}
                      <InfoCard icon={<FiMapPin />} title="الفرع" value={selectedProject.branch_name} />
                      <InfoCard
                        icon={<FiCalendar />}
                        title="الفترة"
                        value={`${extractYear(selectedProject.start_date)} - ${extractYear(selectedProject.end_date)}`}
                      />
                      <InfoCard icon={<FiUser />} title="المشرف" value={selectedProject.supervisor_name} />
                      {selectedProject.co_supervisor_name && (
                        <InfoCard icon={<FiUser />} title="مشرف مساعد" value={selectedProject.co_supervisor_name} />
                      )}
                      {selectedProject.external_company && (
                        <InfoCard icon={<FiBriefcase />} title="الشركة" value={selectedProject.external_company} />
                      )}
                      <InfoCard icon={<FiTool />} title="الأدوات" value={selectedProject.tools} />
                      <InfoCard icon={<FiAward />} title="المجال" value={selectedProject.field} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#312583] mb-4 flex items-center gap-2">
                      <FiUsers className="text-[#4a3fa0]" />
                      الطلاب المشاركون ({getStudentsFromProject(selectedProject).length})
                    </h3>

                    {(() => {
                      const students = getStudentsFromProject(selectedProject);
                      
                      return students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {students.map((student, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-[#312583]/10 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#312583] to-[#4a3fa0] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#312583]">{student.name}</p>
                                {student.email && (
                                  <p className="text-xs text-[#4a5568] flex items-center gap-1 mt-1">
                                    <FiMail size={12} />
                                    {student.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-[#312583]/10">
                          <FiUsers className="mx-auto mb-3 text-[#4a3fa0] opacity-50" size={40} />
                          <p className="text-[#4a5568] font-medium">لا يوجد طلاب مشاركين في هذا المشروع</p>
                        </div>
                      );
                    })()}
                  </div>

                  {selectedProject.documentation && (
                    <a
                      href={selectedProject.documentation.startsWith('http') 
                        ? selectedProject.documentation 
                        : `${API_BASE_URL}${selectedProject.documentation}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl border-2 border-[#312583]/10 text-[#312583] hover:border-[#4a3fa0] hover:bg-white transition-all"
                    >
                      <FiFileText size={20} className="text-[#4a3fa0]" />
                      <span className="font-medium">تحميل المستندات والملفات</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      navigate(`/projectdetail/${selectedProject.project_id}`, { state: { project: selectedProject } });
                      handleCloseModal();
                    }}
                    className="w-full py-4 bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[#312583]/20 hover:scale-[1.02] transition-all"
                  >
                    عرض التفاصيل الكاملة للمشروع
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default ProjectSearch;