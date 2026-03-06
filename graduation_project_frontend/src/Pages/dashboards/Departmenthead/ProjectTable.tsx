import React, { useEffect, useState } from 'react';
import { projectService, Project } from '../../../services/projectService';
import { userService, User } from '../../../services/userService';
import { FiDownload, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { exportToCSV } from '../../../components/tableUtils';
import ProjectForm from '../ProjectForm';
import { useAuthStore } from '../../../store/useStore';

interface ProjectWithUsers extends Project {
  users?: User[];
  group_name?: string;
  supervisor?: User;
  co_supervisor?: User;
  college_name?: string;
  department_name?: string;
  group_id?: number;
}

interface ProjectsTableProps {
  departmentId?: number;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ departmentId }) => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({ college: '', supervisor: '', year: '', type: '', state: '' });
  const [filterOptions, setFilterOptions] = useState<any>({ colleges: [], supervisors: [], years: [], types: [], states: [] });

  const [collegeInput, setCollegeInput] = useState('');
  const [supervisorInput, setSupervisorInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [stateInput, setStateInput] = useState('');

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithUsers | null>(null);

  const fetchProjects = async (params?: any) => {
    setLoading(true);
    try {
      // departmentId من props أو user.department_id
      let departmentHeadDepartmentId = departmentId || user?.department_id;

      // جلب المشاريع
      const projectsResp = await projectService.getProjects(params || {});
      const projectsRaw = Array.isArray(projectsResp) ? projectsResp : projectsResp.results || [];

      // جلب بيانات إضافية مثل المجموعات، المشرفين، الطلاب، الكليات، الأقسام
      const bulk = await projectService.getProjectsWithGroups();
      const groups = Array.isArray(bulk.groups) ? bulk.groups : [];
      const groupMembers = Array.isArray(bulk.group_members) ? bulk.group_members : [];
      const groupSupervisors = Array.isArray(bulk.group_supervisors) ? bulk.group_supervisors : [];
      const users = Array.isArray(bulk.users) ? bulk.users : [];
      const colleges = Array.isArray(bulk.colleges) ? bulk.colleges : [];
      const departments = Array.isArray(bulk.departments) ? bulk.departments : [];

      const usersById = new Map<number, any>(users.map(u => [u.id, u]));
      const collegesById = new Map<any, any>(colleges.map(c => [c.cid, c.name_ar]));
      const departmentsById = new Map<any, any>(departments.map(d => [d.department_id || d.id, d]));

      // تجهيز المشاريع مع المستخدمين والمشرفين والكلية والقسم
      const projectsWithUsers: ProjectWithUsers[] = projectsRaw.map(p => {
        const relatedGroup = groups.find(g => g.project === p.project_id);
        const groupId = relatedGroup?.group_id || null;

        const members = groupMembers
          .filter(m => m.group === groupId)
          .map(m => {
            const u = usersById.get(m.user);
            if (!u) return null;
            return { ...u, displayName: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() };
          })
          .filter(Boolean);

        const supRow = groupSupervisors.find(s => s.group === groupId && s.type === 'supervisor');
        const coSupRow = groupSupervisors.find(s => s.group === groupId && ['co_supervisor', 'co-supervisor', 'co supervisor'].includes(s.type));

        const supervisorUser = supRow ? usersById.get(supRow.user) : null;
        const coSupervisorUser = coSupRow ? usersById.get(coSupRow.user) : null;

        let dept = p.department ? (typeof p.department === 'number' ? departmentsById.get(p.department) : departmentsById.get(p.department.id || p.department.department_id)) : relatedGroup ? departmentsById.get(relatedGroup.department) : null;
        let departmentName = dept?.name || '-';
        let collegeName = dept?.college ? (typeof dept.college === 'number' ? collegesById.get(dept.college) : collegesById.get(dept.college.cid)) : '-';

        return {
          ...p,
          users: members,
          group_id: groupId,
          group_name: relatedGroup?.group_name || '-',
          supervisor: supervisorUser ? { ...supervisorUser, name: supervisorUser.name || `${supervisorUser.first_name || ''} ${supervisorUser.last_name || ''}`.trim() } : null,
          co_supervisor: coSupervisorUser ? { ...coSupervisorUser, name: coSupervisorUser.name || `${coSupervisorUser.first_name || ''} ${coSupervisorUser.last_name || ''}`.trim() } : null,
          department_name: departmentName,
          college_name: collegeName,
        };
      });

      // فلترة حسب قسم رئيس القسم
      let filteredProjects = projectsWithUsers;
      if (departmentHeadDepartmentId) {
        filteredProjects = projectsWithUsers.filter(p => {
          let projDeptId: number | null = null;
          if (p.department) {
            if (typeof p.department === 'number') projDeptId = p.department;
            else if (typeof p.department === 'object') projDeptId = p.department.id || p.department.department_id || null;
          }
          const deptHeadId = Number(departmentHeadDepartmentId);
          const projDeptNum = projDeptId !== null ? Number(projDeptId) : null;
          return projDeptNum === deptHeadId;
        });
      }

      console.log('[ProjectsTable] loaded projects:', filteredProjects.length);
      setProjects(filteredProjects);
    } catch (err) {
      console.error('[ProjectsTable] Failed to fetch projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load filter options
    (async () => {
      try {
        const opts = await projectService.getFilterOptions();
        setFilterOptions(opts);
      } catch (e) {
        console.error('[ProjectsTable] Failed to load filter options', e);
      }
    })();

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // تطبيق الفلاتر
  useEffect(() => {
    const params: any = {};
    if (filters.college) params.college = Number(filters.college);
    if (filters.supervisor) params.supervisor = Number(filters.supervisor);
    if (filters.year) params.year = Number(filters.year);
    if (filters.type) params.type = filters.type;
    if (filters.state) params.state = filters.state;
    fetchProjects(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const applyFilters = () => {
    const params: any = {};
    if (filters.college) params.college = Number(filters.college);
    if (filters.supervisor) params.supervisor = Number(filters.supervisor);
    if (filters.year) params.year = Number(filters.year);
    if (filters.type) params.type = filters.type;
    if (filters.state) params.state = filters.state;
    fetchProjects(params);
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ college: '', supervisor: '', year: '', type: '', state: '' });
    fetchProjects();
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    try {
      await projectService.deleteProject(projectId);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('فشل حذف المشروع');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading projects...</div>;
  if (projects.length === 0) return <div className="p-6 text-center">لا توجد مشاريع</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
        <button onClick={() => { setEditingProject(null); setShowProjectForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">إنشاء مشروع</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-right">عنوان المشروع</th>
              <th className="px-3 py-2 text-right">نوع المشروع</th>
              <th className="px-3 py-2 text-right">الحالة</th>
              <th className="px-3 py-2 text-right">الملخص</th>
              <th className="px-3 py-2 text-right">المشرف</th>
              <th className="px-3 py-2 text-right">المشرف المشارك</th>
              <th className="px-3 py-2 text-right">المجموعة</th>
              <th className="px-3 py-2 text-right">الكلية</th>
              <th className="px-3 py-2 text-right">القسم</th>
              <th className="px-3 py-2 text-right">السنة</th>
              <th className="px-3 py-2 text-right">المستخدمون</th>
              <th className="px-3 py-2 text-center">ملف المشروع</th>
              <th className="px-3 py-2 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr key={proj.project_id} className="border-b">
                <td className="px-3 py-2 text-right">{proj.title}</td>
                <td className="px-3 py-2 text-right">{proj.type}</td>
                <td className="px-3 py-2 text-right">{proj.state}</td>
                <td className="px-3 py-2 text-right">{proj.description}</td>
                <td className="px-3 py-2 text-right">{proj.supervisor?.name || '-'}</td>
                <td className="px-3 py-2 text-right">{proj.co_supervisor?.name || '-'}</td>
                <td className="px-3 py-2 text-right">{proj.group_name || '-'}</td>
                <td className="px-3 py-2 text-right">{proj.college_name || '-'}</td>
                <td className="px-3 py-2 text-right">{proj.department_name || '-'}</td>
                <td className="px-3 py-2 text-right">{proj.start_date ? new Date(proj.start_date).getFullYear() : '-'}</td>
                <td className="px-3 py-2 text-right">{proj.users?.map(u => u.displayName || u.name).join(', ') || '-'}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => projectService.downloadProjectFile(proj.project_id)}>تنزيل</button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => { setEditingProject(proj); setShowProjectForm(true); }}>تعديل</button>
                  <button onClick={() => handleDeleteProject(proj.project_id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showProjectForm && (
        <ProjectForm
          isOpen={showProjectForm}
          initialData={editingProject || undefined}
          mode={editingProject ? 'edit' : 'create'}
          onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          onSuccess={() => { setShowProjectForm(false); setEditingProject(null); fetchProjects(); }}
        />
      )}
    </div>
  );
};

export default ProjectsTable;