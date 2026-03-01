import React, { useEffect, useState, useMemo } from "react";
import { groupService } from "../../../services/groupService";
import { projectService } from '../../../services/projectService';
import { userService } from '../../../services/userService';
import { fetchTableFields } from '../../../services/bulkService';
import { exportToCSV } from '../../../components/tableUtils';
import { useAuthStore } from '../../../store/useStore';
import {
  FiSearch,
  FiChevronDown,
  FiX,
  FiUsers,
  FiLayers,
  FiPlus,
  FiBookOpen,
  FiCalendar,
  FiEdit3,
  FiTrash2,
  FiMoreVertical,
} from 'react-icons/fi';
import GroupForm from '../GroupForm';


interface GroupMember { user: number; user_detail?: any }
interface GroupSupervisor { user: number; user_detail?: any }
interface Group {
  group_id: number;
  group_name: string;
  department?: any;
  program?: any;
  academic_year?: string;
  pattern?: any;
  project?: any;
  project_detail?: any;
  members?: GroupMember[];
  supervisors?: GroupSupervisor[];
  created_at?: string;
}

const GroupsTable: React.FC = () => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState<Record<number, any>>({});
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [visibleRows, setVisibleRows] = useState(10);

  // Helper function to get dean's college from AcademicAffiliation
  const getDeanCollegeId = async (userId: number): Promise<number | null> => {
    try {
      const affiliations = await userService.getAffiliations();
      
      // Find active affiliation for the logged-in dean user
      const activeAffiliations = affiliations.filter((aff: any) => {
        if (aff.user_id !== userId) return false;
        if (!aff.end_date) return true;
        const endDate = new Date(aff.end_date);
        return endDate >= new Date();
      });
      
      // Get the most recent active affiliation with a college
      const affiliationWithCollege = activeAffiliations
        .filter((aff: any) => aff.college_id)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          return dateB.getTime() - dateA.getTime();
        })[0];
      
      let collegeId = affiliationWithCollege?.college_id || null;
      
      // Fallback to user.college_id from auth store if no affiliation found
      if (!collegeId && user?.college_id) {
        collegeId = user.college_id;
      }
      
      return collegeId;
    } catch (err) {
      console.error('[GroupsTable] Failed to fetch dean college:', err);
      return user?.college_id || null;
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Get dean's college from AcademicAffiliation
      const deanCollegeId = user?.id ? await getDeanCollegeId(user.id) : null;

      const [data, fetchedDepartments, fetchedColleges] = await Promise.all([
        // fetch full group rows (bulk-aware) so we have complete columns
        (groupService.getGroupsFields ? groupService.getGroupsFields() : groupService.getGroups()),
        fetchTableFields('departments'),
        fetchTableFields('colleges')
      ]);
      setAllDepartments(fetchedDepartments);
      setColleges(fetchedColleges);

      // Filter groups by dean's college using department_id
      const filteredGroups = deanCollegeId ? (data || []).filter((g: any) => {
        if (g.department) {
          const department = fetchedDepartments.find((d: any) => d.department_id === g.department);
          if (department && department.college === deanCollegeId) {
            return true;
          }
        }
        return false;
      }) : (data || []);
      setGroups(filteredGroups);

      const projectIds = Array.from(new Set(
        (data || [])
          .map((g: any) => {
            if (!g) return null;
            if (typeof g.project === 'number') return g.project;
            if (g.project && typeof g.project === 'object') return g.project.project_id || g.project.id;
            if (g.project_detail && g.project_detail.project_id) return g.project_detail.project_id;
            return null;
          })
          .filter(Boolean)
      ));

      if (projectIds.length > 0) {
        const fetched: Record<number, any> = {};
        await Promise.all(projectIds.map(async (pid: number) => {
          try {
            const p = await projectService.getProjectById(pid);
            if (p && (p.project_id || p.id)) fetched[p.project_id || p.id] = p;
          } catch (e) { /* ignore */ }
        }));
        setProjectsMap(fetched);
      }
    } catch (err) {
      console.error('Error fetching groups', err);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => Array.from(new Set(groups.map(g => g.department?.name).filter(Boolean))), [groups]);
  const academicYears = useMemo(() => Array.from(new Set(groups.map(g => g.academic_year).filter(Boolean))), [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (group.group_name || '').toLowerCase().includes(q) || (group.project?.title || '').toLowerCase().includes(q) || (group.program?.p_name || '').toLowerCase().includes(q);
      const matchesDept = filterDepartment === '' || group.department?.name === filterDepartment;
      const matchesYear = filterYear === '' || group.academic_year === filterYear;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [groups, searchTerm, filterDepartment, filterYear]);

  const paginatedGroups = filteredGroups.slice(0, visibleRows);

  const clearFilters = () => { setSearchTerm(''); setFilterDepartment(''); setFilterYear(''); };

  const handleEditGroup = (g: Group) => { setEditingGroup(g); setShowGroupForm(true); };
  const handleDeleteGroup = (g: Group) => { setEditingGroup(g); setShowGroupForm(true); };

  return (
    <div  dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة المجموعات</h1>
          <p className="text-slate-500 mt-1">تنظيم ومتابعة المجموعات الأكاديمية والمشاريع المرتبطة بها</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportToCSV('groups.csv', filteredGroups)} className="bg-blue-50 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold">تصدير</button>
          <button onClick={() => { setEditingGroup(null); setShowGroupForm(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex items-center gap-2">
            <FiPlus />
            <span>إنشاء مجموعة جديدة</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">بحث سريع</label>
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="اسم المجموعة، المشروع، البرنامج..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">القسم</label>
            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm cursor-pointer appearance-none">
              <option value="">جميع الأقسام</option>
              {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">السنة الأكاديمية</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm cursor-pointer appearance-none">
              <option value="">جميع السنوات</option>
              {academicYears.map((y, i) => <option key={i} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {(searchTerm || filterDepartment || filterYear) && (
          <div className="mt-4 flex justify-end">
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"><FiX /> مسح الفلاتر</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div >
          <table>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">المجموعة</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">الأعضاء</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">المشرفون</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">القسم</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">الكلية</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">البرنامج</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">المشروع المرتبط</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">السنة الأكاديمية</th>
                <th className="px-6 py-5 text-sm font-black !text-slate-400 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center"><div className="flex justify-center items-center gap-2 text-slate-400"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/> <span>جاري تحميل البيانات...</span></div></td></tr>
              ) : paginatedGroups.length > 0 ? (
                paginatedGroups.map(group => {
                  const department = allDepartments.find(d => d.department_id === group.department);
                  const college = colleges.find(c => c.cid === department?.college);
                  const collegeName = college?.name_ar || 'غير محدد';
                  return (
                  <tr key={group.group_id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base"><FiUsers /></div>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-800">{group.group_name}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">ID: #{group.group_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">{(group.members && group.members.length > 0) ? group.members.map((m, idx) => (<div key={idx} className="text-sm text-slate-700 font-bold">{m.user_detail?.name || m.user_detail?.username || `#${m.user}`}</div>)) : (<div className="text-sm text-slate-500">لا يوجد أعضاء</div>)}</div>
                    </td>
                    <td className="px-6 py-5">{(group.supervisors && group.supervisors.length > 0) ? group.supervisors.map((s, idx) => (<div key={idx} className="text-sm text-slate-700 font-bold">{s.user_detail?.name || `#${s.user}`}</div>)) : (<div className="text-sm text-slate-500">لا يوجد مشرفون</div>)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <FiLayers className="text-slate-400" size={18} />
                        <span className="text-sm font-bold text-slate-700">{department?.name || "بدون قسم"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <FiBookOpen className="text-blue-500" size={18} />
                        <span className="text-sm font-bold text-blue-700">{collegeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <FiBookOpen className="text-slate-400" size={18} />
                        <span className="text-sm font-bold text-slate-600">{group.program?.p_name || "بدون برنامج"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[220px]">
                        <p className="text-sm font-bold text-slate-800 truncate" title={typeof group.project === 'object' ? (group.project?.title || group.project_detail?.title) : undefined}>
                          {(() => {
                            if (!group.project) return 'لم يتم تعيين مشروع';
                            if (typeof group.project === 'object') return group.project.title || group.project_detail?.title || 'لم يتم تعيين مشروع';
                            const pid = Number(group.project);
                            if (projectsMap[pid]) return projectsMap[pid].title;
                            if (group.project_detail && group.project_detail.title) return group.project_detail.title;
                            return 'لم يتم تعيين مشروع';
                          })()}
                        </p>
                        <span className="text-xs text-blue-500 font-black uppercase">{group.pattern?.name || "النمط الافتراضي"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit"><FiCalendar className="text-slate-400" size={16} />{group.academic_year || "N/A"}</div></td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditGroup(group)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FiEdit3 size={20} /></button>
                        <button onClick={() => handleDeleteGroup(group)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><FiTrash2 size={20} /></button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"><FiMoreVertical size={20} /></button>
                      </div>
                    </td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
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

        {!loading && filteredGroups.length > visibleRows && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4">
            <button onClick={() => setVisibleRows(prev => prev + 10)} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"><FiChevronDown /> عرض المزيد ({filteredGroups.length - visibleRows} متبقي)</button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">يتم عرض {paginatedGroups.length} من أصل {filteredGroups.length} مجموعة</p>
          </div>
        )}

        {!loading && visibleRows > 10 && (
          <div className="p-4 flex justify-center"><button onClick={() => setVisibleRows(10)} className="text-xs text-slate-400 hover:text-slate-600 font-bold underline">عرض أقل</button></div>
        )}

      </div>

      {showGroupForm && (
        <GroupForm isOpen={showGroupForm} initialData={editingGroup || undefined} mode={editingGroup ? 'edit' : 'create'} onClose={() => { setShowGroupForm(false); setEditingGroup(null); }} onSuccess={() => { setShowGroupForm(false); setEditingGroup(null); fetchGroups(); }} />
      )}

    </div>
  );
};

export default GroupsTable;
