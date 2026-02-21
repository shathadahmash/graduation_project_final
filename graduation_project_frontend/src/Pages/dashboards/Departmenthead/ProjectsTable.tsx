import React, { useEffect, useState } from 'react';
import { projectService, Project } from '../../../services/projectService';
import { userService, User } from '../../../services/userService';
import { FiDownload, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { exportToCSV } from '../../../components/tableUtils';
import { containerClass, tableWrapperClass, tableClass, theadClass } from '../../../components/tableStyles';
import ProjectForm from '../ProjectForm';
import { useAuthStore } from '../../../store/useStore';

interface ProjectWithUsers extends Project {
  users?: User[];
  group_name?: string;
  supervisor?: User;
  co_supervisor?: User;
  college_name?: string;
  department_name?: string;
  group_department?: number;
}

const ProjectsTable: React.FC = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({ college: '', supervisor: '', year: '', type: '', state: '' });
  const [filterOptions, setFilterOptions] = useState<any>({ colleges: [], supervisors: [], years: [], types: [], states: [] });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithUsers | null>(null);

  const fetchProjects = async (params?: any) => {
    setLoading(true);
    try {
      const paramsToSend = params ? { ...params } : {};
      if (search) paramsToSend.search = search;

      const projectsResp = await projectService.getProjects(paramsToSend);
      const projectsRaw = Array.isArray(projectsResp) ? projectsResp : (projectsResp.results || []);

      const bulk = await projectService.getProjectsWithGroups();
      const groups = Array.isArray(bulk.groups) ? bulk.groups : [];
      const groupMembers = Array.isArray(bulk.group_members) ? bulk.group_members : [];
      const groupSupervisors = Array.isArray(bulk.group_supervisors) ? bulk.group_supervisors : [];
      const users = Array.isArray(bulk.users) ? bulk.users : [];
      const colleges = Array.isArray(bulk.colleges) ? bulk.colleges : [];
      const departments = Array.isArray(bulk.departments) ? bulk.departments : [];

      const departmentsExtra = await userService.getDepartments();

      const usersById = new Map<number, any>(users.map(u => [u.id, u]));
      const collegesById = new Map<any, string>(colleges.map(c => [c.cid, c.name_ar]));

      const departmentsMap = new Map<any, any>();
      departments.forEach(d => departmentsMap.set(d.department_id, d));
      departmentsExtra.forEach(d => {
        const existing = departmentsMap.get(d.department_id || d.id);
        if (existing) {
          if (!existing.college && d.college) existing.college = d.college;
        } else {
          departmentsMap.set(d.department_id || d.id, d);
        }
      });

      const projectsWithUsers: ProjectWithUsers[] = projectsRaw.map(p => {
        const relatedGroups = groups.filter(g => g.project === p.project_id);
        const mainGroup = relatedGroups.length ? relatedGroups[0] : null;
        const groupId = mainGroup ? mainGroup.group_id : null;

        const students = groupMembers
          .filter(m => m.group === groupId)
          .map(m => {
            const u = usersById.get(m.user);
            if (!u) return null;
            return { ...u, displayName: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() };
          })
          .filter(Boolean);

        const supRows = groupSupervisors.filter(s => s.group === groupId && s.type === 'supervisor');
        const coSupRows = groupSupervisors.filter(s => s.group === groupId && (s.type?.includes('co') || s.type?.includes('co-supervisor')));
        const supervisorUser = supRows.length ? usersById.get(supRows[0].user) : null;
        const coSupervisorUser = coSupRows.length ? usersById.get(coSupRows[0].user) : null;

        let department = null;
        let departmentName = '-';
        let collegeId = null;

        if (p.department) {
          const deptId = typeof p.department === 'number' ? p.department : (p.department.department_id || p.department.id);
          department = departmentsMap.get(deptId);
        } else if (mainGroup && mainGroup.department) {
          department = departmentsMap.get(mainGroup.department);
        }

        if (department) {
          departmentName = department.name || '-';
          if (typeof department.college === 'number') collegeId = department.college;
          else if (department.college?.cid) collegeId = department.college.cid;
        }

        if (!collegeId && p.college) {
          collegeId = typeof p.college === 'number' ? p.college : (p.college.cid || p.college);
        }

        return {
          ...p,
          users: students,
          group_id: groupId,
          group_name: mainGroup ? mainGroup.group_name : null,
          supervisor: supervisorUser ? { ...supervisorUser, name: supervisorUser.name || `${supervisorUser.first_name || ''} ${supervisorUser.last_name || ''}`.trim() } : null,
          co_supervisor: coSupervisorUser ? { ...coSupervisorUser, name: coSupervisorUser.name || `${coSupervisorUser.first_name || ''} ${coSupervisorUser.last_name || ''}`.trim() } : null,
          college_name: collegeId ? (collegesById.get(collegeId) || '-') : '-',
          department_name: departmentName,
          group_department: mainGroup?.department ? Number(mainGroup.department) : null,
        };
      });

      // ------------------- تعديل فلترة المشاريع حسب صلاحية رئيس القسم -------------------
      const getProjectDepartmentId = (p: ProjectWithUsers): number | null => {
        if (p.department) {
          if (typeof p.department === 'number') return p.department;
          if (typeof p.department === 'object') return p.department.id || p.department.department_id || null;
        }
        if (p.group_department) return p.group_department;
        return null;
      };

      let filteredProjects = projectsWithUsers;
      if (user.role === 'head_of_department' && user.department_id) {
        const userDeptId = Number(user.department_id);
        filteredProjects = projectsWithUsers.filter(p => {
          const projDeptId = getProjectDepartmentId(p);
          return projDeptId === userDeptId;
        });
      }
      // ------------------- نهاية التعديل -------------------

      setProjects(filteredProjects);
    } catch (err) {
      console.error('[ProjectsTable] Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const opts = await projectService.getFilterOptions();
        setFilterOptions(opts);
      } catch (e) {
        console.error('Failed to load filter options', e);
      }
    })();
    fetchProjects();
  }, [user]);

  const applyFilters = () => {
    const p: any = {};
    if (filters.college) p.college = Number(filters.college);
    if (filters.supervisor) p.supervisor = Number(filters.supervisor);
    if (filters.year) p.year = Number(filters.year);
    if (filters.type) p.type = filters.type;
    if (filters.state) p.state = filters.state;
    fetchProjects(p);
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
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      alert('فشل في حذف المشروع');
    }
  };

  if (loading) return <div className="p-6 text-center">جاري تحميل المشاريع...</div>;
  if (projects.length === 0) return <div className="p-6 text-center">لا توجد مشاريع</div>;

  return (
    <div className={containerClass}>
      {/* هنا يمكنك وضع الجدول والفلاتر بنفس التصميم السابق */}
      {/* استدعاء ProjectForm إذا showProjectForm === true */}
    </div>
  );
};

export default ProjectsTable;
