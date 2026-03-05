import React, { useEffect, useState, useMemo } from "react";
import { groupService } from "../../../services/groupService";
import { projectService } from '../../../services/projectService';
import { exportToCSV } from '../../../components/tableUtils';
import { useAuthStore } from '../../../store/useStore';
import { FiSearch, FiChevronDown, FiX, FiPlus, FiCalendar, FiEdit3, FiTrash2 } from 'react-icons/fi';
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

interface GroupsTableProps {
  filteredGroups?: Group[];
}

const GroupsTable: React.FC<GroupsTableProps> = ({ filteredGroups }) => {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState<Record<number, any>>({});
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    if (filteredGroups !== undefined) {
      setGroups(filteredGroups);
      setLoading(false);
    } else {
      fetchGroups();
    }
  }, [filteredGroups]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await (groupService.getGroupsFields ? groupService.getGroupsFields() : groupService.getGroups());
      setGroups(data || []);

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

  const searchFilteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (group.group_name || '').toLowerCase().includes(q)
        || (group.project?.title || '').toLowerCase().includes(q)
        || (group.program?.p_name || '').toLowerCase().includes(q);
      const matchesDept = filterDepartment === '' || group.department?.name === filterDepartment;
      const matchesYear = filterYear === '' || group.academic_year === filterYear;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [groups, searchTerm, filterDepartment, filterYear]);

  const paginatedGroups = searchFilteredGroups.slice(0, visibleRows);

  const clearFilters = () => { setSearchTerm(''); setFilterDepartment(''); setFilterYear(''); };
  const handleEditGroup = (g: Group) => { setEditingGroup(g); setShowGroupForm(true); };
  const handleDeleteGroup = (g: Group) => { setEditingGroup(g); setShowGroupForm(true); };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" dir="rtl">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المجموعات</h1>
          <p className="text-gray-500 mt-1 text-sm">تنظيم ومتابعة المجموعات الأكاديمية والمشاريع المرتبطة بها</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportToCSV('groups.csv', searchFilteredGroups)} className="px-4 py-2 text-black bg-gray-100 rounded hover:bg-gray-200 transition">تصدير</button>
          <button onClick={() => { setEditingGroup(null); setShowGroupForm(true); }} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            <FiPlus /> إنشاء مجموعة جديدة
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[180px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="px-3 py-2 border rounded text-sm cursor-pointer">
          <option value="">جميع الأقسام</option>
          {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="px-3 py-2 border rounded text-sm cursor-pointer">
          <option value="">جميع السنوات</option>
          {academicYears.map((y, i) => <option key={i} value={y}>{y}</option>)}
        </select>
        {(searchTerm || filterDepartment || filterYear) && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-red-600 text-sm font-bold">مسح الفلاتر <FiX /></button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black px-4 py-2">المجموعة</th>
              <th className="border border-black px-4 py-2">الأعضاء</th>
              <th className="border border-black px-4 py-2">المشرفون</th>
              <th className="border border-black px-4 py-2">البرنامج / القسم</th>
              <th className="border border-black px-4 py-2">المشروع المرتبط</th>
              <th className="border border-black px-4 py-2">السنة الأكاديمية</th>
              <th className="border border-black px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6 text-gray-500">جاري تحميل البيانات...</td></tr>
            ) : paginatedGroups.length > 0 ? paginatedGroups.map((group, idx) => (
              <tr key={group.group_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="border border-black px-4 py-2">{group.group_name}</td>
                <td className="border border-black px-4 py-2">{group.members?.map(m => m.user_detail?.name || `#${m.user}`).join(', ') || '-'}</td>
                <td className="border border-black px-4 py-2">{group.supervisors?.map(s => s.user_detail?.name || `#${s.user}`).join(', ') || '-'}</td>
                <td className="border border-black px-4 py-2">{group.program?.p_name || '-'} / {group.department?.name || '-'}</td>
                <td className="border border-black px-4 py-2">
                  {(() => {
                    if (!group.project) return 'لم يتم تعيين مشروع';
                    if (typeof group.project === 'object') return group.project.title || group.project_detail?.title || 'لم يتم تعيين مشروع';
                    const pid = Number(group.project);
                    if (projectsMap[pid]) return projectsMap[pid].title;
                    if (group.project_detail?.title) return group.project_detail.title;
                    return 'لم يتم تعيين مشروع';
                  })()}
                </td>
                <td className="border border-black px-4 py-2">{group.academic_year || '-'}</td>
                <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                  <button onClick={() => handleEditGroup(group)} className="px-2 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100">تعديل</button>
                  <button onClick={() => handleDeleteGroup(group)} className="px-2 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100">حذف</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="border border-black text-center py-6 text-gray-400">
                  لم يتم العثور على مجموعات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && searchFilteredGroups.length > visibleRows && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <button onClick={() => setVisibleRows(prev => prev + 10)} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm font-bold">عرض المزيد ({searchFilteredGroups.length - visibleRows} متبقي)</button>
        </div>
      )}
      {!loading && visibleRows > 10 && (
        <div className="flex justify-center mt-2">
          <button onClick={() => setVisibleRows(10)} className="text-xs text-gray-600 underline">عرض أقل</button>
        </div>
      )}

      {/* GroupForm */}
      {showGroupForm && (
        <GroupForm
          isOpen={showGroupForm}
          initialData={editingGroup || undefined}
          mode={editingGroup ? 'edit' : 'create'}
          onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
          onSuccess={() => { setShowGroupForm(false); setEditingGroup(null); fetchGroups(); }}
        />
      )}
    </div>
  );
};

export default GroupsTable;