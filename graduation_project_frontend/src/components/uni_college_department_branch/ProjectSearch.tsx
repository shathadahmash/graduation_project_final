import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiSearch, FiChevronDown, FiX, FiUser, FiCalendar, FiFilter, FiMapPin, FiBookOpen, FiEye, FiTool, FiUsers, FiBook, FiGlobe, FiSliders, FiInfo } from 'react-icons/fi';
import Navbar from '../Navbar';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

interface Project {
  project_id: number;
  title: string;
  supervisor_name: string;
  co_supervisor_name?: string;
  college_name: string;
  university_name: string;
  university_logo?: string;
  logo?: string;
  type: string;
  year: string;
  field: string;
  tools: string;
  description: string;
  language?: string;
  researcher?: string;
  views?: number;
  library_number?: string;
  deposit_year?: string;
}

interface FilterOptions {
  types: string[];
  years: string[];
  fields: string[];
  tools: string[];
  universities: { id: number; name: string; logo?: string }[];
  colleges: { id: number; name: string; university_id?: number; logo?: string }[];
  departments: { id: number; name: string; college_id?: number }[];
  supervisors: { id: number; name: string }[];
  co_supervisors: { id: number; name: string }[];
  states: string[];
  languages: string[];
}

// دالة لاستخراج السنة فقط
const extractYear = (dateString: string): string => {
  if (!dateString) return '';
  const yearMatch = dateString.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : dateString;
};

// دالة لبناء مسار الصورة - بدون استخدام process
const getImageUrl = (() => {
  const cache = new Map<string, string>();
  
  // تحديد الرابط الأساسي - يمكنك تغييره حسب إعدادات مشروعك
  const API_BASE_URL = (window as any).__RUNTIME_CONFIG__?.API_URL || 'http://localhost:8000';
  
  return (imagePath: string | undefined | null): string => {
    if (!imagePath) return '/default-project-logo.png';
    
    // التحقق من وجود الصورة في الكاش
    if (cache.has(imagePath)) {
      return cache.get(imagePath)!;
    }
    
    let url: string;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      url = imagePath;
    } else if (imagePath.startsWith('/media/')) {
      url = `${API_BASE_URL}${imagePath}`;
    } else if (imagePath.startsWith('media/')) {
      url = `${API_BASE_URL}/${imagePath}`;
    } else {
      // إزالة أي شرط زائدة من البداية
      const cleanPath = imagePath.replace(/^\/+/, '');
      url = `${API_BASE_URL}/media/${cleanPath}`;
    }
    
    // تخزين الرابط في الكاش
    cache.set(imagePath, url);
    return url;
  };
})();

// رابط API ثابت - يمكنك تغييره هنا مباشرة
const API_BASE_URL = 'http://localhost:8000';

const ProjectSearch: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // حالة إظهار/إخفاء القائمة الجانبية للفلاتر
  const [showFilters, setShowFilters] = useState(false);
  
  // الفلاتر
  const [filters, setFilters] = useState({
    university: '',
    college: '',
    department: '',
    year: '',
    field: '',
    tools: '',
    supervisor: '',
    co_supervisor: ''
  });
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    years: [],
    fields: [],
    tools: [],
    universities: [],
    colleges: [],
    departments: [],
    supervisors: [],
    co_supervisors: [],
    states: [],
    languages: []
  });

  // حالات للفلاتر المرتبطة
  const [filteredColleges, setFilteredColleges] = useState<{ id: number; name: string; university_id?: number; logo?: string }[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<{ id: number; name: string; college_id?: number }[]>([]);

  // حالة المعاينة
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // حالة للتحكم في الصور المعطلة
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // استخدام useRef لتخزين المؤقت للطلبات
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // تحديث الكليات عند تغيير الجامعة
  useEffect(() => {
    if (filters.university) {
      const collegesForUniversity = filterOptions.colleges.filter(
        (college) => college.university_id === parseInt(filters.university)
      );
      setFilteredColleges(collegesForUniversity.length ? collegesForUniversity : filterOptions.colleges);
      
      if (filters.college) {
        const collegeExists = collegesForUniversity.some(c => c.id === parseInt(filters.college));
        if (!collegeExists) {
          setFilters(prev => ({ ...prev, college: '', department: '' }));
        }
      }
    } else {
      setFilteredColleges(filterOptions.colleges);
    }
  }, [filters.university, filterOptions.colleges]);

  // تحديث الأقسام عند تغيير الكلية
  useEffect(() => {
    if (filters.college) {
      const departmentsForCollege = filterOptions.departments.filter(
        (dept) => dept.college_id === parseInt(filters.college)
      );
      setFilteredDepartments(departmentsForCollege.length ? departmentsForCollege : filterOptions.departments);
      
      if (filters.department) {
        const deptExists = departmentsForCollege.some(d => d.id === parseInt(filters.department));
        if (!deptExists) {
          setFilters(prev => ({ ...prev, department: '' }));
        }
      }
    } else {
      setFilteredDepartments(filterOptions.departments);
    }
  }, [filters.college, filterOptions.departments]);

  // دالة جلب المشاريع المحسنة
  const fetchProjects = useCallback(async (showLoading = true) => {
    // إلغاء الطلب السابق إذا كان موجوداً
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // إنشاء AbortController جديد
    abortControllerRef.current = new AbortController();

    if (showLoading) setLoading(true);
    
    try {
      const params: any = {};
      
      if (searchQuery?.trim()) {
        params.search = searchQuery.trim();
      }
      
      // إضافة الفلاتر فقط إذا كانت ذات قيمة
      if (filters.university) params.university = Number(filters.university);
      if (filters.college) params.college = Number(filters.college);
      if (filters.department) params.department = Number(filters.department);
      if (filters.year) params.year = filters.year;
      if (filters.field) params.field = filters.field;
      if (filters.tools) params.tools = filters.tools;
      if (filters.supervisor) params.supervisor = Number(filters.supervisor);
      if (filters.co_supervisor) params.co_supervisor = Number(filters.co_supervisor);

      // إضافة حدود للنتائج
      params.limit = 50;

      const response = await projectService.getProjects(params, {
        signal: abortControllerRef.current.signal
      });
      
      let projectsData = [];
      if (Array.isArray(response)) {
        projectsData = response;
      } else if (response?.results) {
        projectsData = response.results;
      } else if (response?.data) {
        projectsData = response.data;
      }

      // معالجة المشاريع
      const processedProjects = projectsData.map((p: any) => ({
        ...p,
        logo: p.logo,
        university_logo: p.university_logo || '/default-uni-logo.png',
        language: p.language || 'العربية',
        researcher: p.researcher || p.supervisor_name,
        year: p.year ? extractYear(p.year) : '',
        views: p.views || 0,
        library_number: p.library_number || '0000',
        deposit_year: p.deposit_year ? extractYear(p.deposit_year) : ''
      }));

      setProjects(processedProjects);
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('خطأ في جلب المشاريع:', error);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [searchQuery, filters]);

  // جلب خيارات الفلاتر مرة واحدة فقط
  useEffect(() => {
    let isMounted = true;
    
    const loadFilterOptions = async () => {
      try {
        const options = await projectService.getFilterOptions();
        
        if (!isMounted) return;

        let departmentsList: { id: number; name: string; college_id?: number }[] = [];
        try {
          const departments = await userService.getDepartments();
          departmentsList = departments.map((d: any) => ({
            id: d.id || d.department_id,
            name: d.name,
            college_id: d.college_id
          }));
        } catch (err) {
          console.error('Failed to load departments:', err);
        }

        const universitiesList = (options.universities || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          logo: u.logo || u.university_logo
        }));

        const collegesList = (options.colleges || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          university_id: c.university_id,
          logo: c.logo || c.college_logo
        }));

        const supervisorsList = options.supervisors || [];
        const coSupervisorsList = options.co_supervisors || [];

        const rawYears = options.years || [];
        const years = [...new Set(rawYears.map((year: string) => extractYear(year)))]
          .filter(Boolean)
          .sort((a: string, b: string) => parseInt(b) - parseInt(a));

        const fields = options.fields || [];
        const tools = (options.tools || []).slice(0, 30);

        setFilterOptions({
          universities: universitiesList,
          colleges: collegesList,
          departments: departmentsList,
          supervisors: supervisorsList,
          co_supervisors: coSupervisorsList,
          years: years.length ? years : ['2025', '2024', '2023', '2022', '2021'],
          fields: fields.length ? fields : ['طب وعلوم صحية', 'هندسة', 'علوم حاسب', 'إدارة أعمال', 'شريعة وقانون'],
          tools: tools.length ? tools : ['React', 'Python', 'JavaScript', 'Node.js', 'PHP'],
          types: [],
          states: [],
          languages: []
        });

        setFilteredColleges(collegesList);
        setFilteredDepartments(departmentsList);
        
      } catch (error) {
        console.error('خطأ في جلب خيارات الفلاتر:', error);
      }
    };
    
    loadFilterOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // جلب المشاريع عند تحميل الصفحة
  useEffect(() => {
    fetchProjects();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // تحسين البحث بتأخير
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProjects(true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePreview = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewProject(project);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewProject(null);
  };

  const handleViewDetails = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  // معالجة أخطاء تحميل الصور
  const handleImageError = (projectId: number) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };

  // حساب عدد الفلاتر النشطة
  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({ 
      university: '', college: '', department: '',
      year: '', field: '', tools: '', 
      supervisor: '', co_supervisor: ''
    });
  };

  // عرض الفلاتر النشطة
  const activeFiltersDisplay = useMemo(() => {
    if (getActiveFiltersCount === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#31257D]/10">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;
          let displayText = '';
          switch(key) {
            case 'university':
              const uni = filterOptions.universities.find(u => u.id === parseInt(value));
              displayText = uni ? `الجامعة: ${uni.name}` : '';
              break;
            case 'college':
              const col = filterOptions.colleges.find(c => c.id === parseInt(value));
              displayText = col ? `الكلية: ${col.name}` : '';
              break;
            case 'department':
              const dept = filterOptions.departments.find(d => d.id === parseInt(value));
              displayText = dept ? `القسم: ${dept.name}` : '';
              break;
            case 'year':
              displayText = `السنة: ${value}`;
              break;
            case 'field':
              displayText = `التصنيف: ${value}`;
              break;
            case 'tools':
              displayText = `الأدوات: ${value}`;
              break;
            case 'supervisor':
              const sup = filterOptions.supervisors.find(s => s.id === parseInt(value));
              displayText = sup ? `المشرف: ${sup.name}` : '';
              break;
            case 'co_supervisor':
              const cosup = filterOptions.co_supervisors.find(cs => cs.id === parseInt(value));
              displayText = cosup ? `المشرف المساعد: ${cosup.name}` : '';
              break;
          }
          if (!displayText) return null;
          return (
            <span key={key} className="bg-[#31257D]/10 text-[#31257D] text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {displayText}
              <button 
                onClick={() => handleFilterChange(key, '')}
                className="hover:text-red-600 mr-1"
              >
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
    );
  }, [filters, filterOptions, getActiveFiltersCount]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      <Navbar />
      <div className="h-[80px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* عنوان الصفحة */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h1 className="text-3xl md:text-4xl font-bold text-[#31257D] relative z-10">
              البحث عن مشاريع التخرج
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4">
            استعرض مشاريع التخرج والرسائل العلمية في الجامعات اليمنية
          </p>
        </div>

        {/* شريط البحث وزر الفلترة */}
        <div className="bg-white rounded-xl shadow-sm border border-[#31257D]/5 p-4 mb-6">
          <div className="flex gap-3">
            {/* شريط البحث */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ابحث في المشاريع..."
                className="w-full p-3 pr-12 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4937BF]" size={20} />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#31257D]/20 border-t-[#31257D] rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* زر الفلترة */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
                showFilters 
                  ? 'bg-[#31257D] text-white border-[#31257D]' 
                  : 'bg-white text-[#31257D] border-[#31257D]/20 hover:bg-[#31257D]/5'
              }`}
            >
              <FiSliders size={20} />
              <span className="hidden sm:inline">فلترة</span>
              {getActiveFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getActiveFiltersCount}
                </span>
              )}
            </button>
          </div>

          {activeFiltersDisplay}
        </div>

        {/* تخطيط من عمودين */}
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* الشريط الجانبي للفلاتر */}
          {showFilters && (
            <div className="lg:w-1/4 order-1 lg:order-2 animate-slideIn">
              <div className="bg-white rounded-xl shadow-lg border border-[#31257D]/10 p-6 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#31257D] flex items-center gap-2">
                    <FiFilter className="text-[#4937BF]" /> تصفية المشاريع
                  </h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="text-[#4A5568] hover:text-red-600 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* الموقع الأكاديمي */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#31257D] mb-3 flex items-center gap-2 border-b border-[#31257D]/10 pb-2">
                    <FiGlobe className="text-[#4937BF]" size={16} />
                    الموقع الأكاديمي
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">الجامعة</label>
                    <select 
                      value={filters.university}
                      onChange={(e) => handleFilterChange('university', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.universities.map((uni) => (
                        <option key={uni.id} value={String(uni.id)}>{uni.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">الكلية</label>
                    <select 
                      value={filters.college}
                      onChange={(e) => handleFilterChange('college', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                      disabled={filteredColleges.length === 0}
                    >
                      <option value="">الكل</option>
                      {filteredColleges.map((col) => (
                        <option key={col.id} value={String(col.id)}>{col.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">القسم</label>
                    <select 
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                      disabled={filteredDepartments.length === 0}
                    >
                      <option value="">الكل</option>
                      {filteredDepartments.map((dept) => (
                        <option key={dept.id} value={String(dept.id)}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* معلومات المشروع */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#31257D] mb-3 flex items-center gap-2 border-b border-[#31257D]/10 pb-2">
                    <FiBookOpen className="text-[#4937BF]" size={16} />
                    معلومات المشروع
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">سنة المشروع</label>
                    <select 
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.years.map((year, idx) => (
                        <option key={idx} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">تصنيف المشروع</label>
                    <select 
                      value={filters.field}
                      onChange={(e) => handleFilterChange('field', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.fields.map((field, idx) => (
                        <option key={idx} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">أدوات المشروع</label>
                    <select 
                      value={filters.tools}
                      onChange={(e) => handleFilterChange('tools', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.tools.map((tool, idx) => (
                        <option key={idx} value={tool}>{tool}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* المشرفون */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#31257D] mb-3 flex items-center gap-2 border-b border-[#31257D]/10 pb-2">
                    <FiUsers className="text-[#4937BF]" size={16} />
                    المشرفون
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">المشرف</label>
                    <select 
                      value={filters.supervisor}
                      onChange={(e) => handleFilterChange('supervisor', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.supervisors.map((sup) => (
                        <option key={sup.id} value={String(sup.id)}>{sup.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-2">المشرف المساعد</label>
                    <select 
                      value={filters.co_supervisor}
                      onChange={(e) => handleFilterChange('co_supervisor', e.target.value)}
                      className="w-full p-3 border border-[#31257D]/10 rounded-lg focus:border-[#31257D] outline-none bg-white"
                    >
                      <option value="">الكل</option>
                      {filterOptions.co_supervisors.map((cosup) => (
                        <option key={cosup.id} value={String(cosup.id)}>{cosup.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="mt-6 pt-6 border-t border-[#31257D]/10 space-y-3">
                  <button 
                    onClick={clearAllFilters}
                    className="w-full py-3 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    إعادة تعيين الكل
                  </button>
                  
                  <div className="text-center text-sm text-[#4A5568]">
                    عدد المشاريع: <span className="font-bold text-[#31257D]">{projects.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* نتائج البحث */}
          <div className={`${showFilters ? 'lg:w-3/4' : 'lg:w-full'} order-2 lg:order-1 transition-all duration-300`}>
            
            {initialLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-3 border-[#31257D]/20 border-t-[#31257D] rounded-full animate-spin"></div>
                <p className="mr-4 text-[#4A5568]">جاري تحميل المشاريع...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#31257D]/5">
                <FiSearch className="mx-auto text-[#A0AEC0] mb-4" size={48} />
                <p className="text-[#2C3E50] font-semibold">لا توجد مشاريع مطابقة للبحث</p>
                <p className="text-[#718096] text-sm mt-2">جرب تغيير كلمات البحث أو الفلاتر</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-[#4A5568]">
                  تم العثور على <span className="font-bold text-[#31257D]">{projects.length}</span> مشروع
                </div>
                
                <div className={`grid gap-6 ${
                  showFilters 
                    ? 'grid-cols-1 md:grid-cols-2' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {projects.map((project) => {
                    const imageSource = imageErrors[project.project_id] 
                      ? '/default-project-logo.png' 
                      : getImageUrl(project.logo);
                    
                    return (
                      <div 
                        key={project.project_id} 
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#31257D]/5 group"
                      >
                        <div className="h-40 bg-gradient-to-br from-[#31257D]/5 to-[#4937BF]/5 flex items-center justify-center p-4">
                          <img 
                            src={imageSource}
                            alt={project.title}
                            className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={() => handleImageError(project.project_id)}
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 bg-[#31257D]/10 text-[#31257D] text-xs rounded-full">
                              {project.type}
                            </span>
                            <span className="text-xs text-[#718096] flex items-center gap-1">
                              <FiCalendar size={12} />
                              {project.year}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-[#31257D] mb-2 line-clamp-2 group-hover:text-[#4937BF] transition-colors">
                            {project.title}
                          </h3>
                          
                          <p className="text-sm text-[#4A5568] mb-3 flex items-center gap-2">
                            <FiUser className="text-[#4937BF]" size={14} />
                            {project.researcher || project.supervisor_name}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full flex items-center gap-1">
                              <FiMapPin size={10} />
                              {project.university_name}
                            </span>
                            {project.college_name && (
                              <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full">
                                {project.college_name}
                              </span>
                            )}
                            {project.field && (
                              <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full flex items-center gap-1">
                                <FiBookOpen size={10} />
                                {project.field}
                              </span>
                            )}
                            {project.tools && (
                              <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full flex items-center gap-1">
                                <FiTool size={10} />
                                {project.tools.split(',')[0]}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => handlePreview(project, e)}
                              className="flex-1 py-2 border border-[#31257D] text-[#31257D] rounded-lg text-sm font-medium hover:bg-[#31257D] hover:text-white transition-colors duration-300 flex items-center justify-center gap-1"
                            >
                              <FiEye size={14} />
                              معاينة
                            </button>
                            <button 
                              onClick={() => handleViewDetails(project.project_id)}
                              className="flex-1 py-2 bg-[#31257D] text-white rounded-lg text-sm font-medium hover:bg-[#4937BF] transition-colors duration-300"
                            >
                              تفاصيل
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* مودال المعاينة */}
      {isPreviewOpen && previewProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClosePreview}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-l from-[#31257D] to-[#4937BF] p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <FiInfo size={20} />
                <h2 className="text-xl font-bold">تفاصيل المشروع الكاملة</h2>
              </div>
              <button 
                onClick={handleClosePreview}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-center mb-6">
                <img 
                  src={imageErrors[previewProject.project_id] ? '/default-project-logo.png' : getImageUrl(previewProject.logo)}
                  alt={previewProject.title}
                  className="w-24 h-24 object-contain rounded-xl border border-[#31257D]/10"
                  onError={() => handleImageError(previewProject.project_id)}
                />
              </div>

              <h3 className="text-2xl font-bold text-[#31257D] mb-4 text-center">
                {previewProject.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 border-y border-[#31257D]/10 py-4 mb-4">
                <div>
                  <p className="text-xs text-[#4A5568]">المشرف</p>
                  <p className="font-bold text-[#31257D]">{previewProject.supervisor_name}</p>
                </div>
                {previewProject.co_supervisor_name && (
                  <div>
                    <p className="text-xs text-[#4A5568]">المشرف المساعد</p>
                    <p className="font-bold text-[#31257D]">{previewProject.co_supervisor_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#4A5568]">الكلية</p>
                  <p className="font-bold text-[#31257D]">{previewProject.college_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A5568]">الجامعة</p>
                  <p className="font-bold text-[#31257D]">{previewProject.university_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A5568]">النوع</p>
                  <p className="font-bold text-[#31257D]">{previewProject.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A5568]">السنة</p>
                  <p className="font-bold text-[#31257D]">{previewProject.year}</p>
                </div>
                {previewProject.field && (
                  <div>
                    <p className="text-xs text-[#4A5568]">المجال</p>
                    <p className="font-bold text-[#31257D]">{previewProject.field}</p>
                  </div>
                )}
                {previewProject.tools && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#4A5568]">الأدوات المستخدمة</p>
                    <p className="font-bold text-[#31257D]">{previewProject.tools}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#31257D] mb-2">وصف المشروع:</h4>
                <p className="text-[#4A5568] leading-relaxed">
                  {previewProject.description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 text-center">
              <button 
                onClick={handleClosePreview}
                className="px-10 py-2 bg-gray-200 text-[#31257D] rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProjectSearch;