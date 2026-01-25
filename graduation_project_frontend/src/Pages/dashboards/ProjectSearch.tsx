import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiChevronDown, FiX, FiInfo, FiCalendar, FiUser, FiBookOpen } from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';

const ProjectSearch: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // الفلاتر
  const [filters, setFilters] = useState({ college: '', department: '', supervisor: '', year: '', type: '', state: '' });
  const [filterOptions, setFilterOptions] = useState<any>({ colleges: [], departments: [], supervisors: [], years: [], types: [], states: [] });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // مودال التفاصيل
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // دالة البحث والفلترة المشتركة
  const fetchProjects = useCallback(async (currentSearch: string, currentFilters: any) => {
    setLoading(true);
    try {
      const params: any = {};
      
      // Add search query only if it has a value
      if (currentSearch && currentSearch.trim()) {
        params.search = currentSearch.trim();
      }
      
      // Add filters only if they have values (convert to numbers where needed)
      if (currentFilters.college) params.college = Number(currentFilters.college);
      if (currentFilters.department) params.department = Number(currentFilters.department);
      if (currentFilters.supervisor) params.supervisor = Number(currentFilters.supervisor);
      if (currentFilters.year) params.year = currentFilters.year;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.state) params.state = currentFilters.state;
      
      console.log('[ProjectSearch] Fetching projects with params:', params);
      const data = await projectService.getProjects(params);
      
      // Handle both array and paginated response
      const projectsList = Array.isArray(data) ? data : (data?.results || data?.data || []);
      console.log('[ProjectSearch] Received projects:', projectsList.length);
      setProjects(projectsList);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // تنفيذ البحث والفلترة اللحظية
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(searchQuery, filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, fetchProjects]);

  // جلب خيارات الفلاتر عند البداية
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Get filter options from project service (colleges, supervisors, years)
        const options = await projectService.getFilterOptions();
        
        // Get departments from user service
        const departments = await userService.getDepartments();
        const departmentsList = departments.map((d: any) => ({
          id: d.id || d.department_id,
          name: d.name,
        }));
        
        // Combine all filter options
        setFilterOptions({
          ...options,
          departments: departmentsList,
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen" dir="rtl">
      
      {/* 1. قسم البحث النصي */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث بالعنوان أو الوصف (تحديث لحظي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pr-12 border-none rounded-2xl shadow-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={22} />
        </div>
      </div>

      {/* 2. قسم الفلاتر (الكلية، القسم، المشرف، السنة، النوع، الحالة) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {/* فلتر الكلية */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'col' ? null : 'col');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'col' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="text-right flex-1">{filterOptions.colleges?.find((c:any) => String(c.id) === String(filters.college))?.name || 'كل الكليات'}</span>
          </button>
          {activeDropdown === 'col' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, college: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.colleges?.length > 0 ? (
                filterOptions.colleges.map((c: any) => (
                  <div 
                    key={c.id} 
                    onClick={() => { setFilters({...filters, college: String(c.id)}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {c.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا توجد كليات</div>
              )}
            </div>
          )}
        </div>

        {/* فلتر القسم */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'dept' ? null : 'dept');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'dept' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="text-right flex-1">{filterOptions.departments?.find((d:any) => String(d.id) === String(filters.department))?.name || 'كل الأقسام'}</span>
          </button>
          {activeDropdown === 'dept' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, department: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.departments?.length > 0 ? (
                filterOptions.departments.map((d: any) => (
                  <div 
                    key={d.id} 
                    onClick={() => { setFilters({...filters, department: String(d.id)}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {d.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا توجد أقسام</div>
              )}
            </div>
          )}
        </div>

        {/* فلتر المشرف */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'sup' ? null : 'sup');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'sup' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="text-right flex-1">{filterOptions.supervisors?.find((s:any) => String(s.id) === String(filters.supervisor))?.name || 'كل المشرفين'}</span>
          </button>
          {activeDropdown === 'sup' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, supervisor: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.supervisors?.length > 0 ? (
                filterOptions.supervisors.map((s: any) => (
                  <div 
                    key={s.id} 
                    onClick={() => { setFilters({...filters, supervisor: String(s.id)}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {s.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا يوجد مشرفون</div>
              )}
            </div>
          )}
        </div>

        {/* فلتر السنة */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'yr' ? null : 'yr');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'yr' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="flex-1 text-right">{filters.year || 'كل السنوات'}</span>
          </button>
          {activeDropdown === 'yr' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, year: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.years?.length > 0 ? (
                filterOptions.years.map((y: string) => (
                  <div 
                    key={y} 
                    onClick={() => { setFilters({...filters, year: y}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {y}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا توجد سنوات</div>
              )}
            </div>
          )}
        </div>

        {/* فلتر النوع */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'type' ? null : 'type');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'type' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="flex-1 text-right">{filters.type || 'كل الأنواع'}</span>
          </button>
          {activeDropdown === 'type' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, type: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.types?.length > 0 ? (
                filterOptions.types.map((type: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => { setFilters({...filters, type: type}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {type}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا توجد أنواع</div>
              )}
            </div>
          )}
        </div>

        {/* فلتر الحالة */}
        <div className="relative filter-dropdown">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'state' ? null : 'state');
            }} 
            className="w-full p-3 bg-white rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <FiChevronDown className={activeDropdown === 'state' ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
            <span className="flex-1 text-right">{filters.state || 'كل الحالات'}</span>
          </button>
          {activeDropdown === 'state' && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto filter-dropdown">
              <div 
                onClick={() => { setFilters({...filters, state: ''}); setActiveDropdown(null); }} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-blue-600 border-b font-semibold"
              >
                الكل
              </div>
              {filterOptions.states?.length > 0 ? (
                filterOptions.states.map((state: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => { setFilters({...filters, state: state}); setActiveDropdown(null); }} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-right"
                  >
                    {state}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-400 text-right">لا توجد حالات</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Show active filters count */}
      {(filters.college || filters.department || filters.supervisor || filters.year || filters.type || filters.state) && (
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">فلاتر نشطة:</span>
          {filters.college && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filterOptions.colleges?.find((c:any) => String(c.id) === String(filters.college))?.name || filters.college}
            </span>
          )}
          {filters.department && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filterOptions.departments?.find((d:any) => String(d.id) === String(filters.department))?.name || filters.department}
            </span>
          )}
          {filters.supervisor && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filterOptions.supervisors?.find((s:any) => String(s.id) === String(filters.supervisor))?.name || filters.supervisor}
            </span>
          )}
          {filters.year && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filters.year}
            </span>
          )}
          {filters.type && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filters.type}
            </span>
          )}
          {filters.state && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {filters.state}
            </span>
          )}
          <button 
            onClick={() => setFilters({ college: '', department: '', supervisor: '', year: '', type: '', state: '' })}
            className="text-red-600 hover:text-red-800 font-semibold text-xs"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* 3. نتائج البحث */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <FiSearch className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-semibold">لم يتم العثور على مشاريع</p>
            <p className="text-gray-400 text-sm mt-2">جرب تغيير معايير البحث أو الفلاتر</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              تم العثور على <span className="font-bold text-blue-600">{projects.length}</span> مشروع
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
          <div key={project.project_id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{project.type}</span>
                <span className="text-gray-400 text-xs">{project.year}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2">{project.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-400" /> {project.supervisor_name}
              </p>
            </div>
            
            <button onClick={() => { setSelectedProject(project); setIsModalOpen(true); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <FiInfo /> تفاصيل المشروع
            </button>
          </div>
        ))}
            </div>
          </>
        )}
      </div>

      {/* 4. مودال التفاصيل (Pop-up) */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">تفاصيل المشروع الكاملة</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-2 rounded-full"><FiX size={24} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-right">
              <h3 className="text-2xl font-black text-gray-900">{selectedProject.title}</h3>
              <div className="grid grid-cols-2 gap-4 border-y py-4 border-gray-100">
                <div><p className="text-xs text-gray-400">المشرف</p><p className="font-bold">{selectedProject.supervisor_name}</p></div>
                <div><p className="text-xs text-gray-400">الكلية</p><p className="font-bold">{selectedProject.college_name}</p></div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">وصف المشروع:</h4>
                <p className="text-gray-600 leading-relaxed">{selectedProject.description}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-2 bg-gray-200 rounded-xl font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;