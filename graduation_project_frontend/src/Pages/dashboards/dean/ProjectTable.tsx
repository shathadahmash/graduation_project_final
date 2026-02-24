// Service	           Purpose
// projectService	     Fetch, filter, enrich, delete, and download projects
// userService	       Fetch users, affiliations, colleges, and departments
// useAuthStore	       Get the currently logged-in user



import React, { useEffect, useState } from 'react';
import { projectService, Project } from '../../../services/projectService';
import api from '../../../services/api';
import { groupService } from '../../../services/groupService';
import { userService, User } from '../../../services/userService';
import { FiDownload, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { exportToCSV } from '../../../components/tableUtils';
import { containerClass, tableWrapperClass, tableClass, theadClass } from '../../../components/tableStyles';
import ProjectForm from '../ProjectForm';
import { useAuthStore } from '../../../store/useStore';

interface ProjectWithUsers extends Project {
  users?: User[]; // optional: users associated with this project
}

const ProjectsTable: React.FC = () => {
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

  // fetchProjects moved to component scope so filters can call it
  const fetchProjects = async (params?: any) => {
    setLoading(true);
    console.log('[ProjectsTable] fetchProjects called');
    try {
      // Get dean's college from AcademicAffiliation (similar to StudentReportPage)
      const affiliations = await userService.getAffiliations();
      const userCollegeMap = new Map<number, number>();
      affiliations.forEach((affiliation: any) => {
        if (affiliation.college_id) {
          userCollegeMap.set(affiliation.user_id, affiliation.college_id);
        }
      });

      let deanCollegeId = user?.college_id || userCollegeMap.get(user?.id || 0);
      console.log('[ProjectsTable] dean college_id:', deanCollegeId);

      // Fetch projects with optional filters/search
      const paramsToSend = params ? { ...params } : {};
      if (search) paramsToSend.search = search;
      console.log('[ProjectsTable] fetching projects with params:', paramsToSend);

      const projectsResp = await projectService.getProjects(paramsToSend);
      const projectsRaw = Array.isArray(projectsResp) ? projectsResp : (projectsResp.results || []);

      console.log('[ProjectsTable] fetched projects:', projectsRaw.length);

      // Fetch bulk data for enrichment (like SystemManager version)
      const bulk = await projectService.getProjectsWithGroups();
      console.log('[ProjectsTable] bulk fetched:', bulk);
      let groups = Array.isArray(bulk.groups) ? bulk.groups : [];
      const groupMembers = Array.isArray(bulk.group_members) ? bulk.group_members : [];
      const groupSupervisors = Array.isArray(bulk.group_supervisors) ? bulk.group_supervisors : [];
      const users = Array.isArray(bulk.users) ? bulk.users : [];
      const colleges = Array.isArray(bulk.colleges) ? bulk.colleges : [];
      const departments = Array.isArray(bulk.departments) ? bulk.departments : [];

      // Fetch departments for college relationship
      const departmentsExtra = await userService.getDepartments();
      console.log('[ProjectsTable] departments fetched:', departmentsExtra.length);

      console.log('[ProjectsTable] counts:', {
        projects: projectsRaw.length,
        groups: groups.length,
        groupMembers: groupMembers.length,
        groupSupervisors: groupSupervisors.length,
        users: users.length,
        colleges: colleges.length,
        departments: departments.length,
      });

      // Fallback: if bulk didn't return groups, try fetching groups per project
      if ((!groups || groups.length === 0) && projectsRaw.length > 0) {
        console.warn('[ProjectsTable] bulk.groups empty — fetching groups per project as fallback');
        try {
          const groupPromises = projectsRaw.map((p: any) => api.get(`/groups/?project_id=${p.project_id}`).then(r => Array.isArray(r.data) ? r.data : (r.data.results || [])).catch(() => []));
          const groupsPerProject = await Promise.all(groupPromises);
          groups = groupsPerProject.flat();
          console.log('[ProjectsTable] fetched groups per project fallback, total groups:', groups.length);
        } catch (e) {
          console.error('[ProjectsTable] groups per-project fallback failed', e);
        }
      }

      const usersById = new Map<number, any>(users.map((u: any) => [u.id, u]));
      const collegesById = new Map<any, any>(colleges.map((c: any) => [c.cid, c.name_ar]));

      // Build departments map
      const departmentsMap = new Map<any, any>();
      departments.forEach((d: any) => {
        departmentsMap.set(d.department_id, d);
      });
      departmentsExtra.forEach((d: any) => {
        const existing = departmentsMap.get(d.department_id || d.id);
        if (existing) {
          if (!existing.college && d.college) {
            existing.college = d.college;
          }
        } else {
          departmentsMap.set(d.department_id || d.id, d);
        }
      });
      const departmentsById = departmentsMap;

      // Enrich projects with user data (like SystemManager version)
      const projectsWithUsers: ProjectWithUsers[] = projectsRaw.map((p: any) => {
        const relatedGroups = groups.filter((g: any) => g.project === p.project_id);
        const mainGroup = relatedGroups.length ? relatedGroups[0] : null;
        const groupId = mainGroup ? mainGroup.group_id : null;

        // students
        const memberRows = groupMembers.filter((m: any) => m.group === groupId);
        const students = memberRows
          .map((m: any) => {
            const u = usersById.get(m.user);
            if (!u) return null;
            return { ...u, displayName: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() };
          })
          .filter(Boolean);

        // supervisors
        const supRows = groupSupervisors.filter((s: any) => s.group === groupId && s.type === 'supervisor');
        const coSupRows = groupSupervisors.filter((s: any) => s.group === groupId && (s.type === 'co_supervisor' || s.type === 'co-supervisor' || s.type === 'co supervisor'));
        const supervisorUser = supRows.length ? usersById.get(supRows[0].user) : null;
        const coSupervisorUser = coSupRows.length ? usersById.get(coSupRows[0].user) : null;

        // Get department and college info
        let department = null;
        let departmentName = '-';
        let collegeId = null;
        let collegeName = '-';

        if (p.department) {
          const deptId = typeof p.department === 'number' ? p.department : (p.department.department_id || p.department.id);
          department = departmentsById.get(deptId);
        } else if (mainGroup && mainGroup.department) {
          department = departmentsById.get(mainGroup.department);
        }

        if (department) {
          departmentName = department.name || '-';
          if (typeof department.college === 'number') {
            collegeId = department.college;
          } else if (department.college && typeof department.college === 'object' && department.college.cid) {
            collegeId = department.college.cid;
          }
        }

        if (!collegeId && p.college) {
          collegeId = typeof p.college === 'number' ? p.college : (p.college.cid || p.college);
        }

        collegeName = collegeId ? (collegesById.get(collegeId) || '-') : '-';

        return {
          ...p,
          users: students,
          group_id: groupId,
          supervisor: supervisorUser ? { ...supervisorUser, name: supervisorUser.name || `${supervisorUser.first_name || ''} ${supervisorUser.last_name || ''}`.trim() } : null,
          co_supervisor: coSupervisorUser ? { ...coSupervisorUser, name: coSupervisorUser.name || `${coSupervisorUser.first_name || ''} ${coSupervisorUser.last_name || ''}`.trim() } : null,
          program: p.program,
          // expose resolved names for table rendering
          college_name: collegeName,
          department_name: departmentName,
        };
      });

      console.log('[ProjectsTable] enriched projects:', projectsWithUsers.length);

// Filter projects by dean's college using direct project college field
      let filteredProjects = projectsWithUsers;
      if (deanCollegeId) {
        console.log('[ProjectsTable] Filtering by dean college_id:', deanCollegeId);

        filteredProjects = projectsWithUsers.filter((p: any) => {
          // Get college ID from project (direct college field or from department)
          let projectCollegeId: number | null = null;

          if (p.college) {
            if (typeof p.college === 'number') {
              projectCollegeId = p.college;
            } else if (typeof p.college === 'object' && p.college.cid) {
              projectCollegeId = p.college.cid;
            }
          }

          // Fallback to department's college if project doesn't have direct college
          if (!projectCollegeId && p.department) {
            if (typeof p.department === 'object' && p.department.college) {
              if (typeof p.department.college === 'number') {
                projectCollegeId = p.department.college;
              } else if (p.department.college && typeof p.department.college === 'object' && p.department.college.cid) {
                projectCollegeId = p.department.college.cid;
              }
            }
          }

            // Additional check: if the project is linked to a group, use that group's department -> college
            if (!projectCollegeId) {
              try {
                const linkedGroup = groups.find((g: any) => g.project === p.project_id);
                if (linkedGroup && linkedGroup.department) {
                  const deptObj = departmentsById.get(linkedGroup.department);
                  if (deptObj) {
                    if (typeof deptObj.college === 'number') projectCollegeId = deptObj.college;
                    else if (deptObj.college && typeof deptObj.college === 'object' && deptObj.college.cid) projectCollegeId = deptObj.college.cid;
                    console.log('[ProjectsTable] resolved project via linked group:', p.project_id, 'group:', linkedGroup.group_id, 'dept:', linkedGroup.department, 'collegeId:', projectCollegeId);
                  }
                }
              } catch (e) {
                /* ignore resolution errors */
              }
            }

          const matches = projectCollegeId && Number(projectCollegeId) === Number(deanCollegeId);
          console.log(`[ProjectsTable] Project ${p.project_id} (${p.title}): college_id=${projectCollegeId}, dean college=${deanCollegeId}, matches=${matches}`);

          return matches;
        });

        console.log('[ProjectsTable] Filtered projects by college, kept:', filteredProjects.length, 'from', projectsWithUsers.length);
        // If nothing matched, try resolving project college via program-group links as a fallback
        if (filteredProjects.length === 0 && projectsWithUsers.length > 0) {
          console.warn('[ProjectsTable] No projects matched direct college field — resolving via program-group links');
          try {
            const resolved = await Promise.all(projectsWithUsers.map(async (p: any) => {
              if (p.college) return { project: p, collegeId: typeof p.college === 'number' ? p.college : (p.college?.cid || null) };
              try {
                const h = await groupService.fetchProgramHierarchyByProject(p.project_id);
                const cid = h.college ? (h.college.cid || h.college.id || null) : null;
                return { project: p, collegeId: cid };
              } catch (e) {
                return { project: p, collegeId: null };
              }
            }));

            const afterResolve = resolved.filter(r => r.collegeId && Number(r.collegeId) === Number(deanCollegeId)).map(r => r.project);
            if (afterResolve.length > 0) {
              filteredProjects = afterResolve;
              console.log('[ProjectsTable] Projects matched after program-group resolution:', filteredProjects.length);
            }
          } catch (e) {
            console.error('[ProjectsTable] program-group resolution fallback failed', e);
          }
        }
      } else {
        console.warn('[ProjectsTable] No dean college_id found, showing all projects');
        // If no dean college found, show all projects (temporary fallback)
        filteredProjects = projectsWithUsers;
      }

      setProjects(filteredProjects);

    } catch (err) {
      console.error('[ProjectsTable] Failed to fetch projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load filter options on mount
    (async () => {
      try {
        const opts = await projectService.getFilterOptions();
        console.log('[ProjectsTable] filter options:', opts);
        setFilterOptions(opts);
        // initialize display inputs for searchable filters when options are loaded
        if (opts.colleges && opts.colleges.length && filters.college) {
          const c = opts.colleges.find((x: any) => String(x.id) === String(filters.college));
          if (c) setCollegeInput(`${c.id}::${c.name}`);
        }
        if (opts.supervisors && opts.supervisors.length && filters.supervisor) {
          const s = opts.supervisors.find((x: any) => String(x.id) === String(filters.supervisor));
          if (s) setSupervisorInput(`${s.id}::${s.name}`);
        }
        if (opts.years && opts.years.length && filters.year) {
          const y = opts.years.find((x: any) => String(x) === String(filters.year));
          if (y) setYearInput(`::${y}`);
        }
        if (opts.types && opts.types.length && filters.type) {
          const t = opts.types.find((x: any) => String(x) === String(filters.type));
          if (t) setTypeInput(`::${t}`);
        }
        if (opts.states && opts.states.length && filters.state) {
          const st = opts.states.find((x: any) => String(x) === String(filters.state));
          if (st) setStateInput(`::${st}`);
        }
      } catch (e) {
        console.error('[ProjectsTable] failed to load filter options', e);
      }
    })();

    // initial load
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // auto-apply when filters (non-search) change. Search waits for Enter.
  React.useEffect(() => {
    const p: any = {};
    if (filters.college) p.college = Number(filters.college);
    if (filters.supervisor) p.supervisor = Number(filters.supervisor);
    if (filters.year) p.year = Number(filters.year);
    if (filters.type) p.type = filters.type;
    if (filters.state) p.state = filters.state;
    fetchProjects(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.college, filters.supervisor, filters.year, filters.type, filters.state]);

  const applyFilters = () => {
    const p: any = {};
    console.log("--------------------------------------------"+ p)
    if (filters.college) p.college = Number(filters.college);
    if (filters.supervisor) p.supervisor = Number(filters.supervisor);
    if (filters.year) p.year = Number(filters.year);
    if (filters.type) p.type = filters.type;
    if (filters.state) p.state = filters.state;
    console.log('[ProjectsTable] applyFilters -> sending params:', p, 'search:', search);
    fetchProjects(p);
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ college: '', supervisor: '', year: '', type: '', state: '' });
    fetchProjects();
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      await projectService.deleteProject(projectId);
      alert('تم حذف المشروع بنجاح');
      fetchProjects(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'خطأ غير معروف';
      alert(`فشل في حذف المشروع: ${errorMessage}`);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading projects...</div>;

  if (projects.length === 0) return <div className="p-6 text-center">لا توجد مشاريع</div>;

  return (
    <div className={containerClass}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة المشاريع</h1>
          <p className="text-slate-500 mt-1">تنظيم ومتابعة المشاريع الأكاديمية والتخرج</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV('projects.csv', projects)}
            className="bg-blue-50 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            تصدير
          </button>
          <button
            onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
          >
            <FiPlus />
            <span>إنشاء مشروع جديد</span>
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">بحث</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilters();
                  }
                }}
                placeholder="بحث بعنوان المشروع أو الوصف"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">الكلية</label>
              <input
                list="colleges-list"
                value={collegeInput}
                onChange={e => {
                  const v = e.target.value;
                  setCollegeInput(v);
                  const parts = String(v).split('::');
                  if (parts.length === 2) setFilters(f => ({ ...f, college: Number(parts[0]) }));
                  else setFilters(f => ({ ...f, college: '' }));
                }}
                placeholder="ابحث او اختر كلية"
                className="w-full border rounded px-2 py-2"
              />
              <datalist id="colleges-list">
                {filterOptions.colleges?.map((c: any) => (
                  <option key={c.id} value={`${c.id}::${c.name}`}>
                    {c.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">المشرف</label>
              <input
                list="supervisors-list"
                value={supervisorInput}
                onChange={e => {
                  const v = e.target.value;
                  setSupervisorInput(v);
                  const parts = String(v).split('::');
                  if (parts.length === 2) setFilters(f => ({ ...f, supervisor: Number(parts[0]) }));
                  else setFilters(f => ({ ...f, supervisor: '' }));
                }}
                placeholder="ابحث او اختر مشرف"
                className="w-full border rounded px-2 py-2"
              />
              <datalist id="supervisors-list">
                {filterOptions.supervisors?.map((s: any) => (
                  <option key={s.id} value={`${s.id}::${s.name}`}>
                    {s.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">السنة</label>
              <input
                list="years-list"
                value={yearInput}
                onChange={e => {
                  const v = e.target.value;
                  setYearInput(v);
                  const parts = String(v).split('::');
                  if (parts.length === 2) setFilters(f => ({ ...f, year: parts[1] }));
                  else setFilters(f => ({ ...f, year: v }));
                }}
                placeholder="ابحث او اختر سنة"
                className="w-full border rounded px-2 py-2"
              />
              <datalist id="years-list">
                {filterOptions.years?.map((y: any) => (
                  <option key={y} value={`::${y}`}>
                    {y}
                  </option>
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500 mb-1">النوع</label>
              <input
                list="types-list"
                value={typeInput}
                onChange={e => {
                  const v = e.target.value;
                  setTypeInput(v);
                  const parts = String(v).split('::');
                  if (parts.length === 2) setFilters(f => ({ ...f, type: parts[1] }));
                  else setFilters(f => ({ ...f, type: v }));
                }}
                placeholder="ابحث او اختر نوع المشروع"
                className="w-full border rounded px-2 py-2"
              />
              <datalist id="types-list">
                {filterOptions.types?.map((t: any, idx: number) => (
                  <option key={idx} value={`::${t}`}>
                    {t}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">الحالة</label>
              <input
                list="states-list"
                value={stateInput}
                onChange={e => {
                  const v = e.target.value;
                  setStateInput(v);
                  const parts = String(v).split('::');
                  if (parts.length === 2) setFilters(f => ({ ...f, state: parts[1] }));
                  else setFilters(f => ({ ...f, state: v }));
                }}
                placeholder="ابحث او اختر حالة"
                className="w-full border rounded px-2 py-2"
              />
              <datalist id="states-list">
                {filterOptions.states?.map((s: any, idx: number) => (
                  <option key={idx} value={`::${s}`}>
                    {s}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="mt-3 flex justify-end items-center gap-2">
            <button onClick={() => exportToCSV('projects.csv', projects)} className="text-sm bg-blue-700 text-white rounded px-3 py-1">تصدير</button>
            <button onClick={clearFilters} className="text-sm bg-gray-50 border rounded px-3 py-1 text-gray-700">مسح الكل</button>
          </div>
        </div>
      </div>

      <div className="dean-table-container overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="dean-table min-w-full border-collapse">
          <thead className="bg-slate-100 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold">عنوان المشروع</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">نوع المشروع</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الملخص</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المشرف</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المشرف المشارك</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الكلية</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">القسم</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">تاريخ الانتهاء</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">التخصص/المجال</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الأدوات</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">إنشأ بواسطة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">السنة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المستخدمون</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">ملف المشروع</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.project_id} className="border-b last:border-b-0 odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                <td className="px-4 py-3 text-right align-top max-w-[240px] break-words">{proj.title}</td>
                <td className="px-4 py-3 text-right align-top">{proj.type || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{proj.state}</td>
                <td className="px-4 py-3 text-right align-top max-w-[320px] break-words">{proj.description || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{proj.supervisor?.name || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{proj.co_supervisor?.name || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{(proj as any).college_name || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{(proj as any).department_name || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{
                  (() => {
                    const val = (proj as any).end_date ?? (proj as any).end;
                    if (val === null || val === undefined || val === '') return '-';
                    const n = Number(val);
                    // If it's a plain 4-digit year
                    if (!Number.isNaN(n) && n >= 1900 && n <= 3000) return String(n);
                    // Try parsing as a date string
                    const dt = new Date(val);
                    if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                    // If numeric but not 4-digit (maybe seconds), try converting to ms
                    if (!Number.isNaN(n)) {
                      const asMs = n > 1e12 ? n : (n > 1e9 ? n * 1000 : n);
                      const dt2 = new Date(asMs);
                      if (!isNaN(dt2.getTime())) return dt2.toLocaleDateString();
                    }
                    return '-';
                  })()
                }</td>
                <td className="px-4 py-3 text-right align-top">{(proj as any).field?.name || (proj as any).field || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{Array.isArray((proj as any).tools) ? (proj as any).tools.join(', ') : ((proj as any).tools || '-')}</td>
                <td className="px-4 py-3 text-right align-top">{(proj as any).created_by?.name || (proj as any).created_by_name || (proj as any).created_by || '-'}</td>
                <td className="px-4 py-3 text-right align-top">{
                  (() => {
                    const val = (proj as any).start_year ?? (proj as any).start_date ?? (proj as any).start;
                    if (!val && val !== 0) return '-';
                    const n = Number(val);
                    if (!Number.isNaN(n) && n >= 1900 && n <= 3000) return n;
                    const dt = new Date(val);
                    if (!isNaN(dt.getTime())) return dt.getFullYear();
                    if (!Number.isNaN(n)) {
                      const asMs = n > 1e12 ? n : (n > 1e9 ? n * 1000 : n);
                      const dt2 = new Date(asMs);
                      if (!isNaN(dt2.getTime())) return dt2.getFullYear();
                    }
                    return '-';
                  })()
                }</td>
                <td className="px-4 py-3 text-right align-top">
                  {proj.users?.length ? proj.users.map((u: any) => u.displayName || u.name).join(', ') : '-'}
                </td>
                <td className="px-4 py-3 text-center align-top">
                  <button
                    className="text-primary-700 hover:opacity-80 flex items-center justify-center gap-1"
                    onClick={() => projectService.downloadProjectFile(proj.project_id)}
                  >
                    <FiDownload /> تنزيل
                  </button>
                </td>
                <td className="px-4 py-3 text-center align-top">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setEditingProject(proj); setShowProjectForm(true); }}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="تعديل"
                    >
                      <FiEdit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.project_id)}
                      className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="حذف"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
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
