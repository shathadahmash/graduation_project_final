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
        await Promise.all(projectIds.map(async (pid: any) => {
          try {
            const p = await projectService.getProjectById(Number(pid));
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
    if (!groups) return [];
    return groups.filter((group) => {
      const q = searchTerm.trim().toLowerCase();
      const groupNameMatch = (group.group_name || '').toLowerCase().includes(q);
      const projectTitleMatch = (
        group.project?.title || 
        group.project_detail?.title || 
        (typeof group.project === 'number' && projectsMap[group.project]?.title) || 
        ''
      ).toLowerCase().includes(q);
      const programMatch = (group.program?.p_name || '').toLowerCase().includes(q);
      const matchesSearch = q === "" || groupNameMatch || projectTitleMatch || programMatch;
      const matchesDept = filterDepartment === '' || group.department?.name === filterDepartment;
      const matchesYear = filterYear === '' || group.academic_year === filterYear;
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [groups, searchTerm, filterDepartment, filterYear, projectsMap]);

  const paginatedGroups = useMemo(() => searchFilteredGroups.slice(0, visibleRows), [searchFilteredGroups, visibleRows]);

  const clearFilters = () => { setSearchTerm(''); setFilterDepartment(''); setFilterYear(''); };
  
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupForm(true);
  };

  const handleEditGroup = (g: Group) => {
    setEditingGroup(g);
    setShowGroupForm(true);
  };

  const handleDeleteGroup = async (g: Group) => {
    if (confirm(`هل أنت متأكد من حذف المجموعة "${g.group_name}"؟`)) {
      try {
        await groupService.deleteGroup(g.group_id);
        alert('تم حذف المجموعة بنجاح');
        fetchGroups();
      } catch (err) {
        console.error('Error deleting group:', err);
        alert('فشل حذف المجموعة');
      }
    }
  };

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
          <button onClick={handleCreateGroup} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
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
        <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="px-3 py-2 border rounded text-sm cursor-pointer bg-white">
          <option value="">جميع الأقسام</option>
          {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="px-3 py-2 border rounded text-sm cursor-pointer bg-white">
          <option value="">جميع السنوات</option>
          {academicYears.map((y, i) => <option key={i} value={y}>{y}</option>)}
        </select>
        {(searchTerm || filterDepartment || filterYear) && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-red-600 text-sm font-bold hover:underline">مسح الفلاتر <FiX /></button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse text-right">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="border-l border-black px-4 py-3 font-bold">المجموعة</th>
              <th className="border-l border-black px-4 py-3 font-bold">الأعضاء</th>
              <th className="border-l border-black px-4 py-3 font-bold">المشرفون</th>
              <th className="border-l border-black px-4 py-3 font-bold">البرنامج / القسم</th>
              <th className="border-l border-black px-4 py-3 font-bold">المشروع المرتبط</th>
              <th className="border-l border-black px-4 py-3 font-bold">السنة الأكاديمية</th>
              <th className="px-4 py-3 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">جاري تحميل البيانات...</td></tr>
            ) : paginatedGroups.length > 0 ? paginatedGroups.map((group, idx) => (
              <tr key={group.group_id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                <td className="border-l border-gray-200 px-4 py-3 font-medium">{group.group_name}</td>
                <td className="border-l border-gray-200 px-4 py-3 text-sm">
                  {group.members?.map(m => m.user_detail?.name || `#${m.user}`).join(', ') || '-'}
                </td>
                <td className="border-l border-gray-200 px-4 py-3 text-sm">
                  {group.supervisors?.map(s => s.user_detail?.name || `#${s.user}`).join(', ') || '-'}
                </td>
                <td className="border-l border-gray-200 px-4 py-3 text-sm">
                  {group.program?.p_name || '-'} <br/> <span className="text-xs text-gray-500">{group.department?.name || '-'}</span>
                </td>
                <td className="border-l border-gray-200 px-4 py-3 text-sm">
                  {(() => {
                    if (!group.project) return 'لم يتم تعيين مشروع';
                    if (typeof group.project === 'object') return group.project.title || group.project_detail?.title || 'لم يتم تعيين مشروع';
                    const pid = Number(group.project);
                    if (projectsMap[pid]) return projectsMap[pid].title;
                    if (group.project_detail?.title) return group.project_detail.title;
                    return 'لم يتم تعيين مشروع';
                  })()}
                </td>
                <td className="border-l border-gray-200 px-4 py-3 text-sm">{group.academic_year || '-'}</td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button onClick={() => handleEditGroup(group)} className="p-1.5 text-yellow-600 border border-yellow-600 rounded-md hover:bg-yellow-50 transition-colors" title="تعديل">
                    <FiEdit3 size={16} />
                  </button>
                  <button onClick={() => handleDeleteGroup(group)} className="p-1.5 text-rose-600 border border-rose-600 rounded-md hover:bg-rose-50 transition-colors" title="حذف">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  {groups.length === 0 ? "لا توجد مجموعات متاحة" : "لم يتم العثور على مجموعات تطابق البحث"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && searchFilteredGroups.length > visibleRows && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <button onClick={() => setVisibleRows(prev => prev + 10)} className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 text-sm font-bold transition">
            عرض المزيد ({searchFilteredGroups.length - visibleRows} متبقي)
          </button>
        </div>
      )}

      {/* GroupForm Modal */}
      {showGroupForm && (
        <GroupForm
          isOpen={showGroupForm}
          initialData={editingGroup || undefined}
          mode={editingGroup ? 'edit' : 'create'}
          // only suppress notifications when editing from the table
          silent={editingGroup != null}
          onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
          onSuccess={() => { setShowGroupForm(false); setEditingGroup(null); fetchGroups(); }}
        />
      )}
    </div>
  );
};

export default GroupsTable;
