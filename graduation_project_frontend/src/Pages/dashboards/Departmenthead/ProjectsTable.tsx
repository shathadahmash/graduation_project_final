import React, { useEffect, useState, useMemo } from 'react';
import { bulkFetch } from '../../../services/bulkService';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useStore';
import { FiSearch, FiLayers, FiUsers, FiCalendar, FiInfo } from 'react-icons/fi';

const ProjectsTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const currentUser = useAuthStore.getState().user;
        let deptId = currentUser?.department_id ? Number(currentUser.department_id) : null;

        const resp = await bulkFetch([
          { table: 'projects', fields: ['project_id', 'title', 'type', 'state', 'start_date', 'description'] },
          { table: 'groups', fields: ['group_id', 'group_name', 'project', 'department'] },
          { table: 'group_members', fields: ['id', 'user', 'group'] },
          { table: 'group_supervisors', fields: ['id', 'user', 'group', 'type'] },
          { table: 'users', fields: ['id', 'name'] },
          { table: 'academic_affiliations', fields: ['user_id', 'department_id'] }
        ]);

        const affs = Array.isArray(resp?.academic_affiliations) ? resp.academic_affiliations : [];
        if (deptId === null && currentUser?.id) {
          const myAff = affs.find((a: any) => Number(a.user_id) === Number(currentUser.id));
          if (myAff) deptId = Number(myAff.department_id);
        }

        const allProjects = Array.isArray(resp?.projects) ? resp.projects : [];
        const groups = Array.isArray(resp?.groups) ? resp.groups : [];
        const groupMembers = Array.isArray(resp?.group_members) ? resp.group_members : [];
        const groupSupervisors = Array.isArray(resp?.group_supervisors) ? resp.group_supervisors : [];
        const users = Array.isArray(resp?.users) ? resp.users : [];

        const deptGroups = groups.filter((g: any) => Number(g.department) === deptId);
        const deptGroupIds = new Set(deptGroups.map((g: any) => g.group_id));
        const deptProjectIds = new Set(deptGroups.map((g: any) => g.project).filter(Boolean));

        const filteredProjects = allProjects
          .filter((p: any) => deptProjectIds.has(p.project_id))
          .map((p: any) => {
            const group = deptGroups.find((g: any) => g.project === p.project_id);
            const groupId = group?.group_id;
            const members = groupMembers
              .filter((m: any) => m.group === groupId)
              .map((m: any) => users.find(u => Number(u.id) === Number(m.user))?.name)
              .filter(Boolean);
            const supervisors = groupSupervisors
              .filter((s: any) => s.group === groupId)
              .map((s: any) => users.find(u => Number(u.id) === Number(s.user))?.name)
              .filter(Boolean);

            return {
              ...p,
              group_name: group?.group_name,
              members,
              supervisors
            };
          });

        setProjects(filteredProjects);
      } catch (err) {
        console.error('[ProjectsTable] load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.group_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  if (loading) return <div className="p-12 text-center text-slate-500">جاري تحميل المشاريع...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FiLayers className="text-blue-600" /> مشاريع القسم
        </h2>
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في المشاريع..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <FiInfo size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">لا توجد مشاريع مطابقة للبحث في هذا القسم</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <div key={p.project_id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{p.title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  p.state === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {p.state || 'نشط'}
                </span>
              </div>
              
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{p.description || 'لا يوجد وصف متاح لهذا المشروع.'}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">المجموعة</p>
                    <p className="text-slate-700 font-medium">{p.group_name || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">الطلاب</p>
                    <p className="text-slate-700 font-medium">{p.members.join('، ') || 'لا يوجد طلاب'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">المشرفون</p>
                    <p className="text-slate-700 font-medium">{p.supervisors.join('، ') || 'لا يوجد مشرفين'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsTable;
