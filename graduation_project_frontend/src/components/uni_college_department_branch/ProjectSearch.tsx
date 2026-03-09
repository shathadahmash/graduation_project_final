import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiChevronDown, FiX, FiInfo, FiUser, FiMapPin, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import Navbar from '../Navbar'; // ✅ استيراد الـ Navbar

const ProjectSearch: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // الفلاتر
  const [filters, setFilters] = useState({ 
    college: '', department: '', supervisor: '', co_supervisor: '', 
    year: '', type: '', state: '', tools: '', field: '', university: '' 
  });
  const [filterOptions, setFilterOptions] = useState<any>({ 
    colleges: [], departments: [], supervisors: [], co_supervisors: [], 
    years: [], types: [], states: [], tools: [], fields: [], universities: [] 
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // مودال التفاصيل
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = useCallback(async (currentSearch: string, currentFilters: any) => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (currentSearch?.trim()) params.search = currentSearch.trim();
      if (currentFilters.college) params.college = Number(currentFilters.college);
      if (currentFilters.department) params.department = Number(currentFilters.department);
      if (currentFilters.university) params.university = Number(currentFilters.university);
      if (currentFilters.supervisor) params.supervisor = Number(currentFilters.supervisor);
      if (currentFilters.co_supervisor) params.co_supervisor = Number(currentFilters.co_supervisor);
      if (currentFilters.year) params.year = currentFilters.year;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.state) params.state = currentFilters.state;
      if (currentFilters.tools) params.tools = currentFilters.tools;
      if (currentFilters.field) params.field = currentFilters.field;
      
      const data = await projectService.getProjects(params);
      const projectsList = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setProjects(projectsList);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(searchQuery, filters), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, fetchProjects]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await projectService.getFilterOptions();
        const departments = await userService.getDepartments();
        const departmentsList = departments.map((d: any) => ({
          id: d.id || d.department_id,
          name: d.name,
        }));
        
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) setActiveDropdown(null);
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      {/* ✅ إضافة الـ Navbar */}
      <Navbar />
      
      {/* تعويض المساحة التي أخذها النافبار الثابت */}
      <div className="h-[80px]"></div>
      
      {/* خط علوي أكاديمي */}
      <div className="absolute top-[80px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0B2B4F]/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* عنوان الصفحة */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B2B4F] relative z-10">
              البحث عن مشاريع التخرج
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4">
            استعرض مشاريع التخرج في جميع الجامعات اليمنية
          </p>
        </div>

        {/* شريط البحث */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن مشروع... (العنوان، الوصف، الكلمات المفتاحية)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pr-14 pl-4 bg-white border border-[#0B2B4F]/10 rounded-xl focus:border-[#0B2B4F] focus:ring-1 focus:ring-[#0B2B4F]/20 outline-none transition-all duration-300 font-['Cairo',sans-serif]"
            />
            <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1E4A7A]" size={22} />
          </div>
        </div>

        {/* الفلاتر */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {/* فلتر الجامعة */}
          <div className="relative filter-dropdown">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'uni' ? null : 'uni')}
              className="w-full py-3 px-3 bg-white border border-[#0B2B4F]/10 rounded-lg flex items-center justify-between hover:border-[#0B2B4F]/30 transition-all duration-300 text-sm font-['Cairo',sans-serif]"
            >
              <span className="truncate ml-2">
                {filterOptions.universities?.find((u:any) => String(u.id) === String(filters.university))?.name || 'الجامعة'}
              </span>
              <FiChevronDown className={`flex-shrink-0 transition-transform duration-300 ${activeDropdown === 'uni' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'uni' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#0B2B4F]/10 rounded-lg shadow-lg max-h-60 overflow-y-auto font-['Cairo',sans-serif]">
                <div 
                  onClick={() => { setFilters({...filters, university: ''}); setActiveDropdown(null); }}
                  className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer text-[#0B2B4F] border-b border-[#0B2B4F]/10"
                >
                  الكل
                </div>
                {filterOptions.universities?.map((u: any) => (
                  <div 
                    key={u.id}
                    onClick={() => { setFilters({...filters, university: String(u.id)}); setActiveDropdown(null); }}
                    className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer"
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فلتر الكلية */}
          <div className="relative filter-dropdown">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'col' ? null : 'col')}
              className="w-full py-3 px-3 bg-white border border-[#0B2B4F]/10 rounded-lg flex items-center justify-between hover:border-[#0B2B4F]/30 transition-all duration-300 text-sm font-['Cairo',sans-serif]"
            >
              <span className="truncate ml-2">
                {filterOptions.colleges?.find((c:any) => String(c.id) === String(filters.college))?.name || 'الكلية'}
              </span>
              <FiChevronDown className={`flex-shrink-0 transition-transform duration-300 ${activeDropdown === 'col' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'col' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#0B2B4F]/10 rounded-lg shadow-lg max-h-60 overflow-y-auto font-['Cairo',sans-serif]">
                <div 
                  onClick={() => { setFilters({...filters, college: ''}); setActiveDropdown(null); }}
                  className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer text-[#0B2B4F] border-b border-[#0B2B4F]/10"
                >
                  الكل
                </div>
                {filterOptions.colleges?.map((c: any) => (
                  <div 
                    key={c.id}
                    onClick={() => { setFilters({...filters, college: String(c.id)}); setActiveDropdown(null); }}
                    className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer"
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فلتر القسم */}
          <div className="relative filter-dropdown">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'dept' ? null : 'dept')}
              className="w-full py-3 px-3 bg-white border border-[#0B2B4F]/10 rounded-lg flex items-center justify-between hover:border-[#0B2B4F]/30 transition-all duration-300 text-sm font-['Cairo',sans-serif]"
            >
              <span className="truncate ml-2">
                {filterOptions.departments?.find((d:any) => String(d.id) === String(filters.department))?.name || 'القسم'}
              </span>
              <FiChevronDown className={`flex-shrink-0 transition-transform duration-300 ${activeDropdown === 'dept' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'dept' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#0B2B4F]/10 rounded-lg shadow-lg max-h-60 overflow-y-auto font-['Cairo',sans-serif]">
                <div 
                  onClick={() => { setFilters({...filters, department: ''}); setActiveDropdown(null); }}
                  className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer text-[#0B2B4F] border-b border-[#0B2B4F]/10"
                >
                  الكل
                </div>
                {filterOptions.departments?.map((d: any) => (
                  <div 
                    key={d.id}
                    onClick={() => { setFilters({...filters, department: String(d.id)}); setActiveDropdown(null); }}
                    className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer"
                  >
                    {d.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فلتر المشرف */}
          <div className="relative filter-dropdown">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'sup' ? null : 'sup')}
              className="w-full py-3 px-3 bg-white border border-[#0B2B4F]/10 rounded-lg flex items-center justify-between hover:border-[#0B2B4F]/30 transition-all duration-300 text-sm font-['Cairo',sans-serif]"
            >
              <span className="truncate ml-2">
                {filterOptions.supervisors?.find((s:any) => String(s.id) === String(filters.supervisor))?.name || 'المشرف'}
              </span>
              <FiChevronDown className={`flex-shrink-0 transition-transform duration-300 ${activeDropdown === 'sup' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'sup' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#0B2B4F]/10 rounded-lg shadow-lg max-h-60 overflow-y-auto font-['Cairo',sans-serif]">
                <div 
                  onClick={() => { setFilters({...filters, supervisor: ''}); setActiveDropdown(null); }}
                  className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer text-[#0B2B4F] border-b border-[#0B2B4F]/10"
                >
                  الكل
                </div>
                {filterOptions.supervisors?.map((s: any) => (
                  <div 
                    key={s.id}
                    onClick={() => { setFilters({...filters, supervisor: String(s.id)}); setActiveDropdown(null); }}
                    className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فلتر السنة */}
          <div className="relative filter-dropdown">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'yr' ? null : 'yr')}
              className="w-full py-3 px-3 bg-white border border-[#0B2B4F]/10 rounded-lg flex items-center justify-between hover:border-[#0B2B4F]/30 transition-all duration-300 text-sm font-['Cairo',sans-serif]"
            >
              <span className="truncate ml-2">{filters.year || 'السنة'}</span>
              <FiChevronDown className={`flex-shrink-0 transition-transform duration-300 ${activeDropdown === 'yr' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'yr' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-[#0B2B4F]/10 rounded-lg shadow-lg max-h-60 overflow-y-auto font-['Cairo',sans-serif]">
                <div 
                  onClick={() => { setFilters({...filters, year: ''}); setActiveDropdown(null); }}
                  className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer text-[#0B2B4F] border-b border-[#0B2B4F]/10"
                >
                  الكل
                </div>
                {filterOptions.years?.map((y: string) => (
                  <div 
                    key={y}
                    onClick={() => { setFilters({...filters, year: y}); setActiveDropdown(null); }}
                    className="p-2 hover:bg-[#0B2B4F]/5 cursor-pointer"
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* الفلاتر النشطة */}
        {(filters.university || filters.college || filters.department || filters.supervisor || filters.year) && (
          <div className="flex flex-wrap items-center gap-2 mb-8 p-4 bg-white rounded-lg border border-[#0B2B4F]/5">
            <span className="text-sm font-medium text-[#2C3E50]">فلاتر نشطة:</span>
            {filters.university && (
              <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                {filterOptions.universities?.find((u:any) => String(u.id) === String(filters.university))?.name}
              </span>
            )}
            {filters.college && (
              <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                {filterOptions.colleges?.find((c:any) => String(c.id) === String(filters.college))?.name}
              </span>
            )}
            {filters.department && (
              <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                {filterOptions.departments?.find((d:any) => String(d.id) === String(filters.department))?.name}
              </span>
            )}
            {filters.supervisor && (
              <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                {filterOptions.supervisors?.find((s:any) => String(s.id) === String(filters.supervisor))?.name}
              </span>
            )}
            {filters.year && (
              <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                {filters.year}
              </span>
            )}
            <button 
              onClick={() => setFilters({ university: '', college: '', department: '', supervisor: '', co_supervisor: '', year: '', type: '', state: '', tools: '', field: '' })}
              className="mr-auto text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* نتائج البحث */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-3 border-[#0B2B4F]/20 border-t-[#0B2B4F] rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#0B2B4F]/5">
            <FiSearch className="mx-auto text-[#A0AEC0] mb-4" size={48} />
            <p className="text-[#2C3E50] font-semibold">لا توجد مشاريع مطابقة للبحث</p>
            <p className="text-[#718096] text-sm mt-2">جرب تغيير كلمات البحث أو الفلاتر</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#4A5568]">
              تم العثور على <span className="font-bold text-[#0B2B4F]">{projects.length}</span> مشروع
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.project_id} 
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#0B2B4F]/5"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-[#0B2B4F]/5 text-[#0B2B4F] rounded-full text-xs">
                        {project.type}
                      </span>
                      <span className="text-xs text-[#718096] flex items-center gap-1">
                        <FiCalendar size={12} />
                        {project.year}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#0B2B4F] mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-[#4A5568] mb-4 flex items-center gap-2">
                      <FiUser className="text-[#1E4A7A]" size={14} />
                      {project.supervisor_name}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full flex items-center gap-1">
                        <FiMapPin size={10} />
                        {project.college_name}
                      </span>
                      {project.field && (
                        <span className="text-xs px-2 py-1 bg-[#F8FAFC] text-[#718096] rounded-full flex items-center gap-1">
                          <FiBookOpen size={10} />
                          {project.field}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                      className="w-full py-2.5 bg-[#0B2B4F] text-white rounded-lg text-sm font-medium hover:bg-[#1E4A7A] transition-colors duration-300"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* مودال التفاصيل */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-l from-[#0B2B4F] to-[#1E4A7A] p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">تفاصيل المشروع</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-[#0B2B4F] mb-6">{selectedProject.title}</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-[#718096] mb-1">المشرف</p>
                  <p className="font-medium text-[#2C3E50]">{selectedProject.supervisor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#718096] mb-1">الكلية</p>
                  <p className="font-medium text-[#2C3E50]">{selectedProject.college_name}</p>
                </div>
                {selectedProject.field && (
                  <div>
                    <p className="text-xs text-[#718096] mb-1">المجال</p>
                    <p className="font-medium text-[#2C3E50]">{selectedProject.field}</p>
                  </div>
                )}
                {selectedProject.tools && (
                  <div>
                    <p className="text-xs text-[#718096] mb-1">الأدوات</p>
                    <p className="font-medium text-[#2C3E50]">{selectedProject.tools}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-[#0B2B4F]/10 pt-6">
                <h4 className="font-bold text-[#0B2B4F] mb-3">وصف المشروع</h4>
                <p className="text-[#4A5568] leading-relaxed">{selectedProject.description}</p>
              </div>
            </div>
            
            <div className="p-4 bg-[#F8FAFC] text-center border-t border-[#0B2B4F]/5">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2 bg-[#0B2B4F] text-white rounded-lg hover:bg-[#1E4A7A] transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;