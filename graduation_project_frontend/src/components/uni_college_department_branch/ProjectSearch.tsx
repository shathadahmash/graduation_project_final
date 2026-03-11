import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers, FiX, FiSearch, FiSliders, FiFilter, FiInfo, FiEye, FiFileText, FiBriefcase, FiTag, FiClock, FiImage, FiDownload } from 'react-icons/fi';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // ثابت عنوان API
  const API_BASE_URL = 'https://back.graduation-projects.ycithe.net/api/';

  // دالة لإزالة التكرار من المصفوفات بناءً على الاسم
  const removeDuplicatesByName = <T extends { id: number; name: string }>(items: T[]): T[] => {
    const uniqueMap = new Map<string, T>();
    items.forEach(item => {
      if (!uniqueMap.has(item.name)) {
        uniqueMap.set(item.name, item);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // دالة لإزالة التكرار من المصفوفات بناءً على id
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

  // دالة محسنة لبناء رابط الصورة
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) {
      return '/default-project-logo.png';
    }
    
    // إذا كان الرابط كامل (يبدأ بـ http)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // تنظيف المسار من الشرطات الزائدة
    const cleanPath = imagePath.replace(/^\/+|\/+$/g, '');
    
    // قائمة بالمسارات الممكنة للصور
    const possiblePaths = [
      // المسار الأصلي
      `${API_BASE_URL}/media/${cleanPath}`,
      
      // إذا كان المسار يبدأ بـ media/
      ...(cleanPath.startsWith('media/') ? [`${API_BASE_URL}/${cleanPath}`] : []),
      
      // إذا كان المسار يبدأ بـ logos/ أو project_logos/
      ...(cleanPath.startsWith('logos/') || cleanPath.startsWith('project_logos/') 
        ? [`${API_BASE_URL}/media/${cleanPath}`, `${API_BASE_URL}/${cleanPath}`] 
        : []),
      
      // إذا كان المسار مجرد اسم ملف
      ...(!cleanPath.includes('/') 
        ? [
            `${API_BASE_URL}/media/project_logos/${cleanPath}`,
            `${API_BASE_URL}/media/logos/${cleanPath}`,
            `${API_BASE_URL}/media/${cleanPath}`
          ] 
        : []),
      
      // مسارات إضافية للمرونة
      `${API_BASE_URL}/media/uploads/${cleanPath.split('/').pop()}`,
      `${API_BASE_URL}/uploads/${cleanPath.split('/').pop()}`,
    ];
    
    // إزالة التكرار من المسارات
    return [...new Set(possiblePaths)][0];
  };

  // دالة للتحقق من وجود الصورة ومحاولة مسارات بديلة
  const tryImageLoad = (projectId: number, imagePath: string, imgElement: HTMLImageElement, attempt: number = 0) => {
    const possiblePaths = [
      imagePath,
      `${API_BASE_URL}/media/${imagePath.replace(/^\/+/, '')}`,
      `${API_BASE_URL}/media/project_logos/${imagePath.split('/').pop()}`,
      `${API_BASE_URL}/media/logos/${imagePath.split('/').pop()}`,
      `${API_BASE_URL}/uploads/${imagePath.split('/').pop()}`,
      '/default-project-logo.png'
    ];

    if (attempt < possiblePaths.length) {
      console.log(`محاولة تحميل الصورة للمشروع ${projectId}:`, possiblePaths[attempt]);
      imgElement.src = possiblePaths[attempt];
      
      imgElement.onload = () => {
        console.log(`تم تحميل الصورة بنجاح للمشروع ${projectId} من المسار:`, possiblePaths[attempt]);
        setImageLoading(prev => ({ ...prev, [projectId]: false }));
        setImageErrors(prev => ({ ...prev, [projectId]: false }));
      };
      
      imgElement.onerror = () => {
        console.log(`فشل تحميل الصورة للمشروع ${projectId} من المسار:`, possiblePaths[attempt]);
        tryImageLoad(projectId, imagePath, imgElement, attempt + 1);
      };
    } else {
      console.log(`فشلت جميع محاولات تحميل الصورة للمشروع ${projectId}`);
      setImageLoading(prev => ({ ...prev, [projectId]: false }));
      setImageErrors(prev => ({ ...prev, [projectId]: true }));
    }
  };

  // معالجة خطأ تحميل الصورة
  const handleImageError = (projectId: number, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const project = projects.find(p => p.project_id === projectId);
    
    if (!project || !project.logo) {
      img.src = '/default-project-logo.png';
      return;
    }

    setImageLoading(prev => ({ ...prev, [projectId]: true }));
    tryImageLoad(projectId, project.logo, img);
  };

  // معالجة نجاح تحميل الصورة
  const handleImageLoad = (projectId: number) => {
    setImageLoading(prev => ({ ...prev, [projectId]: false }));
    setImageErrors(prev => ({ ...prev, [projectId]: false }));
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

  // جلب المشاريع
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
      
      console.log('Fetching with params:', params);
      const response = await projectService.getProjects(params);
      const data = Array.isArray(response) ? response : response?.results || response?.data || [];
      
      const processedData = data.map((p: any) => {
        console.log(`مشروع ${p.project_id} - مسار الصورة الأصلي:`, p.logo);
        return {
          project_id: p.project_id,
          title: p.title,
          description: p.description,
          project_type: p.project_type,
          state: p.state?.name || p.state,
          field: p.field,
          tools: p.tools,
          university_name: p.university?.name || p.university_name,
          branch_name: p.branch?.name || p.branch_name,
          college_name: p.college?.name || p.college_name,
          department_name: p.department?.name,
          start_date: p.start_date,
          end_date: p.end_date,
          external_company: p.external_company?.name,
          supervisor_name: p.supervisor_name,
          co_supervisor_name: p.co_supervisor_name,
          logo: p.logo,
          documentation: p.documentation,
          students: p.students || []
        };
      });
      
      setProjects(processedData);
      
      // إعادة تعيين أخطاء الصور عند تحميل مشاريع جديدة
      setImageErrors({});
      setImageLoading({});
      
      setInitialLoad(false);
    } catch (err) {
      console.error('خطأ في جلب المشاريع', err);
      setProjects([]);
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // التحقق المسبق من الصور
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        if (project.logo && !imageErrors[project.project_id]) {
          const img = new Image();
          img.onload = () => {
            console.log(`✅ الصورة تعمل للمشروع ${project.project_id}`);
          };
          img.onerror = () => {
            console.log(`❌ فشل تحميل الصورة للمشروع ${project.project_id}`);
          };
          img.src = getImageUrl(project.logo);
        }
      });
    }
  }, [projects]);

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

  // مكون عرض الصورة
  const ProjectImage: React.FC<{ project: Project }> = ({ project }) => {
    const [localError, setLocalError] = useState(false);
    const [localLoading, setLocalLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      if (project.logo && imgRef.current) {
        const img = imgRef.current;
        const possiblePaths = [
          `${API_BASE_URL}/media/${project.logo.replace(/^\/+/, '')}`,
          `${API_BASE_URL}/media/project_logos/${project.logo.split('/').pop()}`,
          `${API_BASE_URL}/media/logos/${project.logo.split('/').pop()}`,
          `${API_BASE_URL}/uploads/${project.logo.split('/').pop()}`,
          '/default-project-logo.png'
        ];

        let currentAttempt = 0;

        const tryNextPath = () => {
          if (currentAttempt < possiblePaths.length) {
            console.log(`محاولة ${currentAttempt + 1} للمشروع ${project.project_id}:`, possiblePaths[currentAttempt]);
            img.src = possiblePaths[currentAttempt];
            currentAttempt++;
          } else {
            setLocalLoading(false);
            setLocalError(true);
          }
        };

        img.onload = () => {
          console.log(`✅ تم تحميل الصورة للمشروع ${project.project_id}`);
          setLocalLoading(false);
          setLocalError(false);
        };

        img.onerror = () => {
          console.log(`❌ فشل تحميل المحاولة ${currentAttempt} للمشروع ${project.project_id}`);
          tryNextPath();
        };

        tryNextPath();
      } else {
        setLocalLoading(false);
        setLocalError(true);
      }
    }, [project]);

    if (localLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#31257D]"></div>
        </div>
      );
    }

    if (localError || !project.logo) {
      return (
        <div className="flex flex-col items-center justify-center text-[#A0AEC0]">
          <FiImage size={40} />
          <span className="text-xs mt-1">لا توجد صورة</span>
        </div>
      );
    }

    return (
      <img
        ref={imgRef}
        alt={project.title}
        className="w-full h-full object-contain p-2 transition-transform hover:scale-105"
        style={{ display: localError ? 'none' : 'block' }}
      />
    );
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
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
              showFilters 
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
              switch(key) {
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
              {projects.map(p => (
                <div 
                  key={p.project_id} 
                  className="bg-white shadow rounded-xl p-4 border border-[#31257D]/5 hover:shadow-lg transition-all flex flex-col h-full"
                >
                  {/* صورة المشروع - باستخدام المكون المخصص */}
                  <div className="w-full h-40 bg-[#F8FAFC] rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-[#31257D]/10">
                    <ProjectImage project={p} />
                  </div>
                  
                  {/* عنوان المشروع */}
                  <h3 className="font-bold text-[#31257D] text-lg mb-2 line-clamp-2 text-center">{p.title}</h3>
                  
                  {/* شارة نوع المشروع */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      p.project_type === 'Governmental' ? 'bg-blue-100 text-blue-700' :
                      p.project_type === 'External' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {getProjectTypeLabel(p.project_type)}
                    </span>
                  </div>

                  {/* معلومات المشروع في الكارد */}
                  <div className="space-y-2 flex-1">
                    {/* الجامعة والكلية */}
                    <div className="bg-[#F8FAFC] p-2 rounded-lg">
                      <p className="text-xs text-[#4A5568] flex items-center gap-1">
                        <FiMapPin className="text-[#4937BF]" size={12} />
                        الجامعة
                      </p>
                      <p className="font-medium text-[#31257D] text-sm">{p.university_name}</p>
                      <p className="text-xs text-[#4A5568] mt-1">{p.college_name}</p>
                    </div>

                    {/* سنة المشروع */}
                    <div className="bg-[#F8FAFC] p-2 rounded-lg">
                      <p className="text-xs text-[#4A5568] flex items-center gap-1">
                        <FiCalendar className="text-[#4937BF]" size={12} />
                        سنة المشروع
                      </p>
                      <p className="font-medium text-[#31257D] text-sm">
                        {extractYear(p.start_date)}
                        {p.end_date && p.end_date !== p.start_date ? ` - ${extractYear(p.end_date)}` : ''}
                      </p>
                    </div>

                    {/* المجال */}
                    {p.field && (
                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <p className="text-xs text-[#4A5568] flex items-center gap-1">
                          <FiBookOpen className="text-[#4937BF]" size={12} />
                          المجال
                        </p>
                        <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.field}</p>
                      </div>
                    )}

                    {/* الأدوات */}
                    {p.tools && (
                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <p className="text-xs text-[#4A5568] flex items-center gap-1">
                          <FiTool className="text-[#4937BF]" size={12} />
                          الأدوات
                        </p>
                        <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.tools.split(',')[0]}</p>
                      </div>
                    )}

                    {/* المشرفون */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#F8FAFC] p-2 rounded-lg">
                        <p className="text-xs text-[#4A5568] flex items-center gap-1">
                          <FiUser className="text-[#4937BF]" size={12} />
                          المشرف
                        </p>
                        <p className="font-medium text-[#31257D] text-sm line-clamp-1">{p.supervisor_name}</p>
                      </div>
                      
                      {p.co_supervisor_name && (
                        <div className="bg-[#F8FAFC] p-2 rounded-lg">
                          <p className="text-xs text-[#4A5568] flex items-center gap-1">
                            <FiUsers className="text-[#4937BF]" size={12} />
                            مساعد
                          </p>
                          <p className="font-medium text-[#4937BF] text-sm line-clamp-1">{p.co_supervisor_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* زر المزيد */}
                  <button
                    onClick={() => setSelectedProject(p)}
                    className="w-full mt-4 py-2.5 bg-gradient-to-l from-[#31257D] to-[#4937BF] text-white rounded-lg font-bold hover:from-[#4937BF] hover:to-[#31257D] transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FiInfo size={18} />
                    المزيد من التفاصيل
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* نافذة التفاصيل المنبثقة */}
        {selectedProject && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              {/* رأس النافذة */}
              <div className="bg-gradient-to-l from-[#31257D] to-[#4937BF] p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <FiInfo size={20} />
                  <h2 className="text-xl font-bold">تفاصيل المشروع</h2>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* محتوى النافذة */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* صورة المشروع في النافذة المنبثقة */}
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-[#31257D]/5 rounded-xl flex items-center justify-center p-2 overflow-hidden border border-[#31257D]/10">
                    {selectedProject.logo ? (
                      <img 
                        src={getImageUrl(selectedProject.logo)}
                        alt={selectedProject.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.src = '/default-project-logo.png';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#A0AEC0]">
                        <FiImage size={40} />
                        <span className="text-xs mt-1">لا توجد صورة</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* عنوان المشروع */}
                <h3 className="text-2xl font-bold text-[#31257D] text-center mb-4">
                  {selectedProject.title}
                </h3>

                {/* شارة نوع المشروع في التفاصيل */}
                <div className="flex justify-center mb-6">
                  <span className={`px-4 py-1.5 text-sm rounded-full ${
                    selectedProject.project_type === 'Governmental' ? 'bg-blue-100 text-blue-700' :
                    selectedProject.project_type === 'External' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {getProjectTypeLabel(selectedProject.project_type)}
                  </span>
                </div>

                {/* بقية محتوى النافذة يبقى كما هو */}
                {/* ملخص المشروع */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#31257D] mb-3 flex items-center gap-2 text-lg">
                    <FiBookOpen className="text-[#4937BF]" />
                    ملخص المشروع
                  </h4>
                  <div className="bg-[#F8FAFC] p-4 rounded-lg">
                    <p className="text-[#4A5568] leading-relaxed whitespace-pre-line">
                      {selectedProject.description || 'لا يوجد ملخص متاح'}
                    </p>
                  </div>
                </div>

                {/* الطلاب المشاركون */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#31257D] mb-3 flex items-center gap-2 text-lg">
                    <FiUsers className="text-[#4937BF]" />
                    الطلاب المشاركون
                  </h4>
                  <div className="bg-[#F8FAFC] p-4 rounded-lg">
                    {selectedProject.students && selectedProject.students.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProject.students.map((student, index) => (
                          <div key={index} className="bg-white p-2 rounded-lg border border-[#31257D]/10">
                            <p className="font-medium text-[#31257D]">{student.name}</p>
                            {student.id && <p className="text-xs text-[#4A5568]">رقم: {student.id}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#4A5568] text-center">لا يوجد طلاب مسجلين</p>
                    )}
                  </div>
                </div>

                {/* ملف التوثيق */}
                {selectedProject.documentation && (
                  <div className="mb-4">
                    <h4 className="font-bold text-[#31257D] mb-3 flex items-center gap-2 text-lg">
                      <FiFileText className="text-[#4937BF]" />
                      ملف التوثيق
                    </h4>
                    <div className="bg-[#F8FAFC] p-4 rounded-lg">
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#31257D]/10">
                        <div className="flex items-center gap-3">
                          <FiFileText className="text-[#4937BF]" size={24} />
                          <div>
                            <p className="font-medium text-[#31257D]">ملف التوثيق</p>
                            <p className="text-xs text-[#4A5568]">غير قابل للتحميل - للعرض فقط</p>
                          </div>
                        </div>
                        <button 
                          className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2"
                          disabled
                          title="غير متاح للتحميل"
                        >
                          <FiDownload size={16} />
                          تحميل
                        </button>
                      </div>
                      {selectedProject.documentation.startsWith('http') ? (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-[#4A5568] mb-2">معاينة الرابط:</p>
                          <a 
                            href={selectedProject.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#31257D] hover:text-[#4937BF] underline text-sm break-all"
                          >
                            {selectedProject.documentation}
                          </a>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                          <p className="text-sm text-[#4A5568] whitespace-pre-line">
                            {selectedProject.documentation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* معلومات إضافية */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm bg-[#F8FAFC] p-4 rounded-lg">
                  <div>
                    <p className="text-[#4A5568]">الجامعة</p>
                    <p className="font-bold text-[#31257D]">{selectedProject.university_name}</p>
                  </div>
                  <div>
                    <p className="text-[#4A5568]">الكلية</p>
                    <p className="font-bold text-[#31257D]">{selectedProject.college_name}</p>
                  </div>
                  {selectedProject.department_name && (
                    <div>
                      <p className="text-[#4A5568]">القسم</p>
                      <p className="font-bold text-[#31257D]">{selectedProject.department_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[#4A5568]">المشرف</p>
                    <p className="font-bold text-[#31257D]">{selectedProject.supervisor_name}</p>
                  </div>
                  {selectedProject.co_supervisor_name && (
                    <div>
                      <p className="text-[#4A5568]">المشرف المساعد</p>
                      <p className="font-bold text-[#4937BF]">{selectedProject.co_supervisor_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[#4A5568]">سنة البداية</p>
                    <p className="font-bold text-[#31257D]">{extractYear(selectedProject.start_date) || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-[#4A5568]">سنة النهاية</p>
                    <p className="font-bold text-[#31257D]">{extractYear(selectedProject.end_date) || 'غير محدد'}</p>
                  </div>
                  {selectedProject.field && (
                    <div className="col-span-2">
                      <p className="text-[#4A5568]">المجال</p>
                      <p className="font-bold text-[#31257D]">{selectedProject.field}</p>
                    </div>
                  )}
                  {selectedProject.tools && (
                    <div className="col-span-2">
                      <p className="text-[#4A5568]">الأدوات المستخدمة</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedProject.tools.split(',').map((tool, idx) => (
                          <span key={idx} className="bg-white px-2 py-1 rounded-full text-xs text-[#31257D] border border-[#31257D]/20">
                            {tool.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* أسفل النافذة */}
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-8 py-2 bg-gray-200 text-[#31257D] rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  إغلاق
                </button>
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
      `}</style>
    </div>
  );
};

export default ProjectSearch;