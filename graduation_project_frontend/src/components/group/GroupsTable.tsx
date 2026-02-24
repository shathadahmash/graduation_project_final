import React, { useEffect, useState, useMemo } from "react";
import { groupService } from "../../services/groupService";
import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiX, 
  FiUsers, 
  FiLayers, 
  FiCalendar,
  FiBookOpen,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiEdit3
} from "react-icons/fi";
import { containerClass, tableWrapperClass, tableClass, theadClass } from '../tableStyles';

interface Group {
  group_id: number;
  group_name: string;
  academic_year: string;
  department?: { name: string };
  program?: { p_name: string };
  pattern?: { name: string };
  project?: { title: string };
  created_at: string;
}

const GroupsTable: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Pagination state
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error("❌ Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unique values for filters
  const departments = useMemo(() => {
    const deps = groups.map(g => g.department?.name).filter(Boolean);
    return Array.from(new Set(deps));
  }, [groups]);

  const academicYears = useMemo(() => {
    const years = groups.map(g => g.academic_year).filter(Boolean);
    return Array.from(new Set(years));
  }, [groups]);

  // Filtered groups logic
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch = 
        (group.group_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.project?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.program?.p_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = filterDepartment === "" || group.department?.name === filterDepartment;
      const matchesYear = filterYear === "" || group.academic_year === filterYear;

      return matchesSearch && matchesDept && matchesYear;
    });
  }, [groups, searchTerm, filterDepartment, filterYear]);

  // Paginated groups
  const paginatedGroups = filteredGroups.slice(0, visibleRows);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterYear("");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className={containerClass} dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة المجموعات</h1>
          <p className="text-slate-500 mt-1">تنظيم ومتابعة المجموعات الأكاديمية والمشاريع المرتبطة بها</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV('groups.csv', filteredGroups)}
            className="bg-blue-50 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            تصدير
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
          >
            <FiPlus />
            <span>إنشاء مجموعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">بحث سريع</label>
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="اسم المجموعة، المشروع، البرنامج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">القسم</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm cursor-pointer appearance-none"
            >
              <option value="">جميع الأقسام</option>
              {departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">السنة الأكاديمية</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm cursor-pointer appearance-none"
            >
              <option value="">جميع السنوات</option>
              {academicYears.map((year, i) => (
                <option key={i} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || filterDepartment || filterYear) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
            >
              <FiX /> مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={tableWrapperClass}>
          <table className={tableClass + ' text-right'}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">المجموعة</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">البرنامج والقسم</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">المشروع المرتبط</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">السنة الأكاديمية</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري تحميل البيانات...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedGroups.length > 0 ? (
                paginatedGroups.map(group => (
                  <tr key={group.group_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                          <FiUsers />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{group.group_name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: #{group.group_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <FiBookOpen className="text-slate-300" />
                          {group.program?.p_name || "بدون برنامج"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <FiLayers className="text-slate-300" />
                          {group.department?.name || "بدون قسم"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[200px]">
                        <p className="text-xs font-bold text-slate-800 truncate" title={group.project?.title}>
                          {group.project?.title || "لم يتم تعيين مشروع"}
                        </p>
                        <span className="text-[10px] text-blue-500 font-black uppercase">
                          {group.pattern?.name || "النمط الافتراضي"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                        <FiCalendar className="text-slate-400" />
                        {group.academic_year || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <FiEdit3 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <FiTrash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FiSearch size={40} className="opacity-20" />
                      <p className="font-bold">لم يتم العثور على مجموعات تطابق البحث</p>
                      <button onClick={clearFilters} className="text-blue-600 text-sm underline">إعادة ضبط الفلاتر</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Show More */}
        {!loading && filteredGroups.length > visibleRows && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4">
            <button
              onClick={() => setVisibleRows(prev => prev + 10)}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FiChevronDown /> عرض المزيد ({filteredGroups.length - visibleRows} متبقي)
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              يتم عرض {paginatedGroups.length} من أصل {filteredGroups.length} مجموعة
            </p>
          </div>
        )}
        
        {!loading && visibleRows > 10 && (
          <div className="p-4 flex justify-center">
            <button
              onClick={() => setVisibleRows(10)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
            >
              عرض أقل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsTable;