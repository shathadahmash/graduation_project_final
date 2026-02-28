import React, { useEffect, useState } from 'react';
import { projectService, Project } from '../../../services/projectService';
import api from '../../../services/api';
import { userService, User } from '../../../services/userService';
import { FiDownload, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { exportToCSV } from '../../../components/tableUtils';
import ProjectForm from '../ProjectForm';
import { useAuthStore } from '../../../store/useStore';
//f
import { useNavigate } from "react-router-dom";
interface ProjectWithUsers extends Project {
  users?: User[]; // optional: users associated with this project
}

interface Props {
  filteredProjects?: any[];
}

const ProjectsTable: React.FC<Props> = ({ filteredProjects }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithUsers[]>([]);

  // utility to safely render values in table cells, converting objects to text
  const renderVal = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    if (typeof v === 'object') {
      if ('name' in v && v.name !== undefined) return v.name;
      if ('username' in v && v.username !== undefined) return v.username;
      if ('title' in v && v.title !== undefined) return v.title;
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
  };
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importOpts, setImportOpts] = useState<any>({ universities: [], colleges: [], departments: [], programs: [] });
  const [importSelection, setImportSelection] = useState<any>({ university: '', college: '', department: '', program: '' });
  const [showAddUni, setShowAddUni] = useState(false);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddProg, setShowAddProg] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newProgName, setNewProgName] = useState('');

  // fetchProjects moved to component scope so filters can call it
  const fetchProjects = async (params?: any) => {
    setLoading(true);
    console.log('[ProjectsTable] fetchProjects called (bulk)');
    try {
      // First fetch projects with optional filters/search
      const paramsToSend = params ? { ...params } : {};
      if (search) paramsToSend.search = search;
      console.log('[ProjectsTable] fetching projects with params:', paramsToSend);
      const projectsResp = await projectService.getProjects(paramsToSend);
      console.log('[ProjectsTable] projects response:', projectsResp);
      const projectsRaw = Array.isArray(projectsResp) ? projectsResp : (projectsResp.results || []);

      // Then fetch related tables for enrichment
      const bulk = await projectService.getProjectsWithGroups();
      console.log('[ProjectsTable] bulk fetched:', bulk);
      const groups = Array.isArray(bulk.groups) ? bulk.groups : [];
      const groupMembers = Array.isArray(bulk.group_members) ? bulk.group_members : [];
      const groupSupervisors = Array.isArray(bulk.group_supervisors) ? bulk.group_supervisors : [];
      const users = Array.isArray(bulk.users) ? bulk.users : [];
      const colleges = Array.isArray(bulk.colleges) ? bulk.colleges : [];
      const departments = Array.isArray(bulk.departments) ? bulk.departments : [];
      const universities = Array.isArray(bulk.universities) ? bulk.universities : [];
      const groupprograms = Array.isArray(bulk.groupprogram) ? bulk.groupprogram : [];
      const programGroups = Array.isArray(bulk.program_groups) ? bulk.program_groups : [];
      const programs = Array.isArray(bulk.programs) ? bulk.programs : [];

      // Fetch departments for college relationship (dean version approach)
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

      const usersById = new Map<number, any>(users.map((u: any) => [u.id, u]));
      const collegesById = new Map<any, any>(colleges.map((c: any) => [c.cid, c]));
      const universitiesById = new Map<any, any>(universities.map((u: any) => [u.uid ?? u.id ?? u.uid, u]));
      const groupprogramByGroup = new Map<string, any>();
      groupprograms.forEach((gp: any) => { if (gp.group) groupprogramByGroup.set(String(gp.group), gp); });
      const programGroupsById = new Map<any, any>(programGroups.map((pg: any) => [pg.id, pg]));
      const programGroupsByGroup = new Map<string, any>();
      programGroups.forEach((pg: any) => { if (pg.group) programGroupsByGroup.set(String(pg.group), pg); });
      const programsById = new Map<any, any>(programs.map((pr: any) => [pr.id, pr]));
      
      // Build departments map using bulk fetch departments (which include college field)
      // Merge with departmentsExtra if needed, but prioritize bulk fetch data
      const departmentsMap = new Map<any, any>();
      // First, add departments from bulk fetch (these have the college field)
      departments.forEach((d: any) => {
        departmentsMap.set(d.department_id, d);
      });
      // Then, add or update with departmentsExtra if they have additional fields
      departmentsExtra.forEach((d: any) => {
        const existing = departmentsMap.get(d.department_id || d.id);
        if (existing) {
          // Merge if college field is missing
          if (!existing.college && d.college) {
            existing.college = d.college;
          }
        } else {
          // Add if not already in map
          departmentsMap.set(d.department_id || d.id, d);
        }
      });
      const departmentsById = departmentsMap;

      const projectsWithUsers: ProjectWithUsers[] = projectsRaw.map((p: any) => {
        // normalize project id for matching against groups which may reference project by id or object
        const projectId = p.project_id || p.id || (p.project && (p.project.project_id || p.project.id)) || null;

        const relatedGroups = groups.filter((g: any) => {
          if (!g) return false;
          // group.project may be number or object
          const gp = (typeof g.project === 'number' || typeof g.project === 'string') ? g.project : (g.project && (g.project.project_id || g.project.id));
          return gp != null && projectId != null && Number(gp) === Number(projectId);
        });
        const mainGroup = relatedGroups.length ? relatedGroups[0] : null;
        const groupId = mainGroup ? (mainGroup.group_id || mainGroup.id) : null;

        // students
        const memberRows = groupMembers.filter((m: any) => String(m.group) === String(groupId));
        const students = memberRows
          .map((m: any) => {
            const u = usersById.get(m.user);
            if (!u) return null;
            return { ...u, displayName: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() };
          })
          .filter(Boolean);

        // supervisors
        const supRows = groupSupervisors.filter((s: any) => String(s.group) === String(groupId) && String(s.type).toLowerCase().includes('supervisor') && !String(s.type).toLowerCase().includes('co'));
        const coSupRows = groupSupervisors.filter((s: any) => String(s.group) === String(groupId) && String(s.type).toLowerCase().includes('co'));
        const supervisorUser = supRows.length ? usersById.get(supRows[0].user) : null;
        const coSupervisorUser = coSupRows.length ? usersById.get(coSupRows[0].user) : null;

        // Resolve department and college robustly (project may include department object or id; group may include department)
        let department: any = null;
        let departmentName = '-';
        let collegeId: any = null;

        if (p.department) {
          const deptId = typeof p.department === 'number' ? p.department : (p.department.department_id || p.department.id);
          department = departmentsById.get(deptId) || p.department || null;
        } else if (mainGroup && mainGroup.department) {
          const gidDept = typeof mainGroup.department === 'number' ? mainGroup.department : (mainGroup.department && (mainGroup.department.department_id || mainGroup.department.id));
          department = departmentsById.get(gidDept) || mainGroup.department || null;
        }

        if (department) {
          departmentName = department.name || department.department_name || '-';
          if (typeof department.college === 'number') {
            collegeId = department.college;
          } else if (department.college && typeof department.college === 'object') {
            collegeId = department.college.cid || department.college.id || null;
          }
        }

        // Fallback to project's college if department doesn't have one
        if (!collegeId && p.college) {
          collegeId = typeof p.college === 'number' ? p.college : (p.college.cid || p.college);
        }

        const collegeObj = collegeId ? collegesById.get(collegeId) : null;
        const collegeName = collegeObj ? (collegeObj.name_ar || collegeObj.name || '-') : '-';
        // Resolve university preferring the group's configured university (groupprogram),
        // then via program_groups->program->department->college->branch->university, then fallback to college object
        let universityName = '-';
        const resolveUniFromGroup = () => {
          try {
            // 1) prefer groupprogram serializer
            const gp = groupprogramByGroup.get(String(groupId));
            if (gp) {
              if (gp.university_name) return gp.university_name;
              const gpUniId = gp.university_id || gp.university || (gp.university_detail && (gp.university_detail.uid || gp.university_detail.id));
              if (gpUniId) {
                const u = universitiesById.get(gpUniId);
                if (u) return u.uname_ar || u.name_ar || u.uname_en || u.name;
              }
            }

            // 2) try program_groups -> programs -> departments -> colleges -> university
            const pg = programGroupsByGroup.get(String(groupId));
            if (pg) {
              const pr = programsById.get(pg.program || pg.program_id || pg.program);
              if (pr) {
                const dept = departmentsById.get(pr.department || pr.department_id || pr.department_id);
                if (dept) {
                  const colId = (typeof dept.college === 'number') ? dept.college : (dept.college && (dept.college.cid || dept.college.id));
                  const col = colId ? collegesById.get(colId) : null;
                  if (col) {
                    const uniId = col.university_id || (col.university && (col.university.id || col.university)) || (col.branch_detail && col.branch_detail.university_detail && (col.branch_detail.university_detail.uid || col.branch_detail.university_detail.id));
                    const uni = uniId ? universitiesById.get(uniId) : (col.branch_detail && col.branch_detail.university_detail ? col.branch_detail.university_detail : null);
                    if (uni) return uni.uname_ar || uni.name_ar || uni.uname_en || uni.name;
                  }
                }
              }

                // 2.5) try mainGroup direct shapes (program object or university fields)

                // 2.5) try mainGroup direct shapes (program object or university fields)
                if (mainGroup) {
                  if (mainGroup.university_name) return mainGroup.university_name;
                  const mgUniId = mainGroup.university || (mainGroup.university_detail && (mainGroup.university_detail.uid || mainGroup.university_detail.id)) || (mainGroup.branch_detail && mainGroup.branch_detail.university_detail && (mainGroup.branch_detail.university_detail.uid || mainGroup.branch_detail.university_detail.id));
                  if (mgUniId) {
                    const mu = universitiesById2.get(mgUniId);
                    if (mu) return mu.uname_ar || mu.name_ar || mu.uname_en || mu.name;
                    if (mainGroup.university && typeof mainGroup.university === 'object') return mainGroup.university.uname_ar || mainGroup.university.name_ar || mainGroup.university.uname_en || mainGroup.university.name || '-';
                  }
                  // check nested program object on mainGroup
                  if (mainGroup.program && typeof mainGroup.program === 'object') {
                    const mgPr = mainGroup.program;
                    const mgDept = departmentsMap2.get(mgPr.department || mgPr.department_id || (mgPr.department && (mgPr.department.department_id || mgPr.department.id))) || mgPr.department || null;
                    if (mgDept) {
                      const mgColId = (typeof mgDept.college === 'number') ? mgDept.college : (mgDept.college && (mgDept.college.cid || mgDept.college.id));
                      const mgCol = mgColId ? collegesById2.get(mgColId) : (mgDept.college && typeof mgDept.college === 'object' ? mgDept.college : null);
                      if (mgCol) {
                        const mgUniId2 = mgCol.university_id || (mgCol.university && (mgCol.university.id || mgCol.university)) || (mgCol.branch_detail && mgCol.branch_detail.university_detail && (mgCol.branch_detail.university_detail.uid || mgCol.branch_detail.university_detail.id));
                        const mgUni = mgUniId2 ? universitiesById2.get(mgUniId2) : (mgCol.branch_detail && mgCol.branch_detail.university_detail ? mgCol.branch_detail.university_detail : null);
                        if (mgUni) return mgUni.uname_ar || mgUni.name_ar || mgUni.uname_en || mgUni.name;
                      }
                    }
                  }
                }
                if (mainGroup) {
                  if (mainGroup.university_name) return mainGroup.university_name;
                  const mgUniId = mainGroup.university || (mainGroup.university_detail && (mainGroup.university_detail.uid || mainGroup.university_detail.id)) || (mainGroup.branch_detail && mainGroup.branch_detail.university_detail && (mainGroup.branch_detail.university_detail.uid || mainGroup.branch_detail.university_detail.id));
                  if (mgUniId) {
                    const mu = universitiesById.get(mgUniId);
                    if (mu) return mu.uname_ar || mu.name_ar || mu.uname_en || mu.name;
                    if (mainGroup.university && typeof mainGroup.university === 'object') return mainGroup.university.uname_ar || mainGroup.university.name_ar || mainGroup.university.uname_en || mainGroup.university.name || '-';
                  }
                  // check nested program object on mainGroup
                  if (mainGroup.program && typeof mainGroup.program === 'object') {
                    const mgPr = mainGroup.program;
                    const mgDept = departmentsById.get(mgPr.department || mgPr.department_id || (mgPr.department && (mgPr.department.department_id || mgPr.department.id))) || mgPr.department || null;
                    if (mgDept) {
                      const mgColId = (typeof mgDept.college === 'number') ? mgDept.college : (mgDept.college && (mgDept.college.cid || mgDept.college.id));
                      const mgCol = mgColId ? collegesById.get(mgColId) : (mgDept.college && typeof mgDept.college === 'object' ? mgDept.college : null);
                      if (mgCol) {
                        const mgUniId2 = mgCol.university_id || (mgCol.university && (mgCol.university.id || mgCol.university)) || (mgCol.branch_detail && mgCol.branch_detail.university_detail && (mgCol.branch_detail.university_detail.uid || mgCol.branch_detail.university_detail.id));
                        const mgUni = mgUniId2 ? universitiesById.get(mgUniId2) : (mgCol.branch_detail && mgCol.branch_detail.university_detail ? mgCol.branch_detail.university_detail : null);
                        if (mgUni) return mgUni.uname_ar || mgUni.name_ar || mgUni.uname_en || mgUni.name;
                      }
                    }
                  }
                }
            }

            // 3) fallback to collegeObj -> nested university
            if (collegeObj) {
              let uniId = collegeObj.university_id || (collegeObj.university && (collegeObj.university.id || collegeObj.university));
              if (!uniId && collegeObj.branch_detail && collegeObj.branch_detail.university_detail) {
                uniId = collegeObj.branch_detail.university_detail.uid || collegeObj.branch_detail.university_detail.id;
              }
              let uni = uniId ? universitiesById.get(uniId) : null;
              if (!uni && collegeObj.branch_detail && collegeObj.branch_detail.university_detail) {
                uni = collegeObj.branch_detail.university_detail;
              }
              return uni ? (uni.uname_ar || uni.name_ar || uni.uname_en || uni.name || '-') : '-';
            }
          } catch (e) {
            /* ignore resolution errors */
          }
          return '-';
        };
        universityName = resolveUniFromGroup();

        const enriched = {
          ...p,
          users: students,
          group_id: groupId,
          group_name: mainGroup ? mainGroup.group_name : null,
          supervisor: supervisorUser ? { ...supervisorUser, name: supervisorUser.name || `${supervisorUser.first_name || ''} ${supervisorUser.last_name || ''}`.trim() } : (p.supervisor || null),
          co_supervisor: coSupervisorUser ? { ...coSupervisorUser, name: coSupervisorUser.name || `${coSupervisorUser.first_name || ''} ${coSupervisorUser.last_name || ''}`.trim() } : (p.co_supervisor || null),
          college_name: collegeName,
          university_name: universityName,
          department_name: departmentName || (p.department && (p.department.name || p.department.department_name) ) || '-',
            // prefer program from group, then program_groups bulk, then project, then field
            program_name: (() => {
              let name = '-';
              if (mainGroup) {
                if (mainGroup.program && typeof mainGroup.program === 'object') {
                  name = mainGroup.program.p_name || mainGroup.program.name || name;
                } else if (mainGroup.program) {
                  const pg = programGroupsById.get(Number(mainGroup.program)) || programGroupsByGroup.get(String(groupId));
                  if (pg) {
                    const pr = programsById.get(pg.program || pg.program_id || pg.program);
                    name = (pr && (pr.p_name || pr.name)) || pg.program_name || name;
                  }
                } else {
                  const pg = programGroupsByGroup.get(String(groupId));
                  if (pg) {
                    const pr = programsById.get(pg.program || pg.program_id || pg.program);
                    name = (pr && (pr.p_name || pr.name)) || pg.program_name || name;
                  }
                }
              }
              if (name === '-' && p.program) name = (p.program.p_name || p.program.name) || name;
              if (name === '-' && p.field) name = (p.field.name || p.field) || name;
              return name;
            })(),
          // prefer academic_year/start_year from group then project then derive from start_date
          start_year: (mainGroup && (mainGroup.academic_year || mainGroup.start_year)) || p.start_year || (() => {
            const sd = p.start_date;
            if (sd === null || sd === undefined || sd === '') return null;
            // if it's already a numeric year (e.g. 2022 or "2022"), return it directly
            const n = Number(sd);
            if (!Number.isNaN(n) && n >= 1900 && n <= 3000) return n;
            // try parse as ISO date string
            try {
              const dt = new Date(sd);
              if (!isNaN(dt.getTime())) {
                const yr = dt.getFullYear();
                if (yr >= 1900 && yr <= 3000) return yr;
              }
            } catch (e) { /* ignore */ }
            // if it's a timestamp in seconds or milliseconds, normalize and try
            if (!Number.isNaN(n)) {
              const asMs = n > 1e12 ? n : (n > 1e9 ? n * 1000 : n);
              const dt2 = new Date(asMs);
              if (!isNaN(dt2.getTime())) {
                const yr2 = dt2.getFullYear();
                if (yr2 >= 1900 && yr2 <= 3000) return yr2;
              }
            }
            return null;
          })(),
        };

        // Prefer groupprogram serializer values if available for the linked group
        try {
          const gp = groupprogramByGroup.get(String(groupId));
          if (gp) {
            if (gp.program_name) enriched.program_name = gp.program_name;
            if (gp.department_name) enriched.department_name = gp.department_name;
            if (gp.college_name) enriched.college_name = gp.college_name;
            if (gp.university_name) enriched.university_name = gp.university_name;
          }
        } catch (e) { /* ignore */ }

        // additional fallback: try to read university from the linked group directly
        if ((!enriched.university_name || enriched.university_name === '-') && mainGroup) {
          try {
            if (mainGroup.university_name) enriched.university_name = mainGroup.university_name;
            else if (mainGroup.university && typeof mainGroup.university === 'object') {
              enriched.university_name = mainGroup.university.uname_ar || mainGroup.university.name_ar || mainGroup.university.uname_en || mainGroup.university.name || enriched.university_name;
            } else if (mainGroup.branch_detail && mainGroup.branch_detail.university_detail) {
              const ud = mainGroup.branch_detail.university_detail;
              enriched.university_name = ud.uname_ar || ud.name_ar || ud.uname_en || ud.name || enriched.university_name;
            } else if (mainGroup.program && typeof mainGroup.program === 'object') {
              const mgPr: any = mainGroup.program;
              const mgDeptId = mgPr.department || mgPr.department_id || (mgPr.department && (mgPr.department.department_id || mgPr.department.id));
              const mgDept = departmentsMap.get(mgDeptId) || (mgPr.department && typeof mgPr.department === 'object' ? mgPr.department : null);
              if (mgDept) {
                const mgColId = mgDept.college || mgDept.college_id || (mgDept.college && (mgDept.college.cid || mgDept.college.id));
                const mgCol = mgColId ? collegesById.get(mgColId) : (mgDept.college && typeof mgDept.college === 'object' ? mgDept.college : null);
                if (mgCol) {
                  const mgUniId = mgCol.university_id || (mgCol.university && (mgCol.university.id || mgCol.university)) || (mgCol.branch_detail && mgCol.branch_detail.university_detail && (mgCol.branch_detail.university_detail.uid || mgCol.branch_detail.university_detail.id));
                  const mgUni = mgUniId ? universitiesById.get(mgUniId) : (mgCol.branch_detail && mgCol.branch_detail.university_detail ? mgCol.branch_detail.university_detail : null);
                  if (mgUni) enriched.university_name = mgUni.uname_ar || mgUni.name_ar || mgUni.uname_en || mgUni.name || enriched.university_name;
                }
              }
            }
          } catch (e) { /* ignore */ }
        }

        // If college_name still missing, try program_groups -> program -> department -> college
        if ((!enriched.college_name || enriched.college_name === '-') && groupId) {
          try {
            const pg = programGroupsByGroup.get(String(groupId));
            if (pg) {
              if (pg.college_name) enriched.college_name = pg.college_name;
              else if (pg.college_id || pg.college) {
                const cid = pg.college_id || pg.college;
                const col = colleges.find((c: any) => String(c.cid || c.id || c.college_id) === String(cid));
                if (col) enriched.college_name = col.name_ar || col.name || col.college_name || '-';
              }
            }
          } catch (e) { /* ignore */ }
        }

        return enriched;
      });

      console.log('[ProjectsTable] processed projects:', projectsWithUsers);
      try {
        console.log('[ProjectsTable] processed projects count:', projectsWithUsers.length);
        if (projectsWithUsers.length > 0) console.log('[ProjectsTable] first project preview:', projectsWithUsers[0]);
      } catch (e) {
        console.error('[ProjectsTable] error logging processed projects preview', e);
      }

      // If parent provided filteredProjects (e.g. SystemManager dashboard), prefer that list
      if (filteredProjects && Array.isArray(filteredProjects)) {
        // Enrich projects provided by parent (SystemManager) so supervisor, co_supervisor and department are available
        try {
          setLoading(true);
          const bulk2 = await projectService.getProjectsWithGroups();
          const groups2 = Array.isArray(bulk2.groups) ? bulk2.groups : [];
          const groupMembers2 = Array.isArray(bulk2.group_members) ? bulk2.group_members : [];
          const groupSupervisors2 = Array.isArray(bulk2.group_supervisors) ? bulk2.group_supervisors : [];
          const users2 = Array.isArray(bulk2.users) ? bulk2.users : [];
          const colleges2 = Array.isArray(bulk2.colleges) ? bulk2.colleges : [];
          const departments2 = Array.isArray(bulk2.departments) ? bulk2.departments : [];
          const universities2 = Array.isArray(bulk2.universities) ? bulk2.universities : [];
            const groupprograms2 = Array.isArray(bulk2.groupprogram) ? bulk2.groupprogram : [];
            const programGroups2 = Array.isArray(bulk2.program_groups) ? bulk2.program_groups : [];
            const programs2 = Array.isArray(bulk2.programs) ? bulk2.programs : [];

          const usersById2 = new Map<number, any>(users2.map((u: any) => [u.id, u]));
          const collegesById2 = new Map<any, any>(colleges2.map((c: any) => [c.cid, c]));
          const universitiesById2 = new Map<any, any>(universities2.map((u: any) => [u.uid ?? u.id ?? u.uid, u]));

          const programGroupsById2 = new Map<any, any>(programGroups2.map((pg: any) => [pg.id, pg]));
          const programGroupsByGroup2 = new Map<string, any>();
          programGroups2.forEach((pg: any) => { if (pg.group) programGroupsByGroup2.set(String(pg.group), pg); });
          const programsById2 = new Map<any, any>(programs2.map((pr: any) => [pr.id, pr]));
          const groupprogramByGroup2 = new Map<string, any>();
          groupprograms2.forEach((gp: any) => { if (gp.group) groupprogramByGroup2.set(String(gp.group), gp); });

          const departmentsMap2 = new Map<any, any>();
          departments2.forEach((d: any) => { departmentsMap2.set(d.department_id, d); });
          const departmentsExtra2 = await userService.getDepartments();
          departmentsExtra2.forEach((d: any) => {
            const existing = departmentsMap2.get(d.department_id || d.id);
            if (existing) {
              if (!existing.college && d.college) existing.college = d.college;
            } else {
              departmentsMap2.set(d.department_id || d.id, d);
            }
          });

          const projectsWithUsers2: ProjectWithUsers[] = (filteredProjects as any[]).map((p: any) => {
            const projectId = p.project_id || p.id || (p.project && (p.project.project_id || p.project.id)) || null;
            const relatedGroups = groups2.filter((g: any) => {
              if (!g) return false;
              const gp = (typeof g.project === 'number' || typeof g.project === 'string') ? g.project : (g.project && (g.project.project_id || g.project.id));
              return gp != null && projectId != null && Number(gp) === Number(projectId);
            });
            const mainGroup = relatedGroups.length ? relatedGroups[0] : null;
            const groupId = mainGroup ? (mainGroup.group_id || mainGroup.id) : null;

            const memberRows = groupMembers2.filter((m: any) => String(m.group) === String(groupId));
            const students = memberRows.map((m: any) => {
              const u = usersById2.get(m.user);
              if (!u) return null;
              return { ...u, displayName: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() };
            }).filter(Boolean);

            const supRows = groupSupervisors2.filter((s: any) => String(s.group) === String(groupId) && String(s.type).toLowerCase().includes('supervisor') && !String(s.type).toLowerCase().includes('co'));
            const coSupRows = groupSupervisors2.filter((s: any) => String(s.group) === String(groupId) && String(s.type).toLowerCase().includes('co'));
            const supervisorUser = supRows.length ? usersById2.get(supRows[0].user) : null;
            const coSupervisorUser = coSupRows.length ? usersById2.get(coSupRows[0].user) : null;

            let department: any = null;
            let departmentName = '-';
            let collegeId: any = null;

            if (p.department) {
              const deptId = typeof p.department === 'number' ? p.department : (p.department.department_id || p.department.id);
              department = departmentsMap2.get(deptId) || p.department || null;
            } else if (mainGroup && mainGroup.department) {
              const gidDept = typeof mainGroup.department === 'number' ? mainGroup.department : (mainGroup.department && (mainGroup.department.department_id || mainGroup.department.id));
              department = departmentsMap2.get(gidDept) || mainGroup.department || null;
            }

            if (department) {
              departmentName = department.name || department.department_name || '-';
              if (typeof department.college === 'number') {
                collegeId = department.college;
              } else if (department.college && typeof department.college === 'object') {
                collegeId = department.college.cid || department.college.id || null;
              }
            }

            if (!collegeId && p.college) {
              collegeId = typeof p.college === 'number' ? p.college : (p.college.cid || p.college);
            }

            const collegeObj2 = collegeId ? collegesById2.get(collegeId) : null;
            const collegeName = collegeObj2 ? (collegeObj2.name_ar || collegeObj2.name || '-') : '-';
            // Resolve university preferring the group's configured university (groupprogram),
            // then via program_groups->program->department->college->branch->university, then fallback to college object
            let universityName2 = '-';
            const resolveUniFromGroup2 = () => {
              try {
                const gp = groupprogramByGroup2.get(String(groupId));
                if (gp) {
                  if (gp.university_name) return gp.university_name;
                  const gpUniId = gp.university_id || gp.university || (gp.university_detail && (gp.university_detail.uid || gp.university_detail.id));
                  if (gpUniId) {
                    const u = universitiesById2.get(gpUniId);
                    if (u) return u.uname_ar || u.name_ar || u.uname_en || u.name;
                  }
                }

                const pg = programGroupsByGroup2.get(String(groupId));
                if (pg) {
                  const pr = programsById2.get(pg.program || pg.program_id || pg.program);
                  if (pr) {
                    const dept = departmentsMap2.get(pr.department || pr.department_id || pr.department_id);
                    if (dept) {
                      const colId = (typeof dept.college === 'number') ? dept.college : (dept.college && (dept.college.cid || dept.college.id));
                      const col = colId ? collegesById2.get(colId) : null;
                      if (col) {
                        const uniId = col.university_id || (col.university && (col.university.id || col.university)) || (col.branch_detail && col.branch_detail.university_detail && (col.branch_detail.university_detail.uid || col.branch_detail.university_detail.id));
                        const uni = uniId ? universitiesById2.get(uniId) : (col.branch_detail && col.branch_detail.university_detail ? col.branch_detail.university_detail : null);
                        if (uni) return uni.uname_ar || uni.name_ar || uni.uname_en || uni.name;
                      }
                    }
                  }
                }

                if (collegeObj2) {
                  let uniId2 = collegeObj2.university_id || (collegeObj2.university && (collegeObj2.university.id || collegeObj2.university));
                  if (!uniId2 && collegeObj2.branch_detail && collegeObj2.branch_detail.university_detail) {
                    uniId2 = collegeObj2.branch_detail.university_detail.uid || collegeObj2.branch_detail.university_detail.id;
                  }
                  let uni2 = uniId2 ? universitiesById2.get(uniId2) : null;
                  if (!uni2 && collegeObj2.branch_detail && collegeObj2.branch_detail.university_detail) {
                    uni2 = collegeObj2.branch_detail.university_detail;
                  }
                  return uni2 ? (uni2.uname_ar || uni2.name_ar || uni2.uname_en || uni2.name || '-') : '-';
                }
              } catch (e) {
                /* ignore */
              }
              return '-';
            };
            universityName2 = resolveUniFromGroup2();

            const enriched: any = {
              ...p,
              users: students,
              group_id: groupId,
              group_name: mainGroup ? mainGroup.group_name : null,
              supervisor: supervisorUser ? { ...supervisorUser, name: supervisorUser.name || `${supervisorUser.first_name || ''} ${supervisorUser.last_name || ''}`.trim() } : (p.supervisor || null),
              co_supervisor: coSupervisorUser ? { ...coSupervisorUser, name: coSupervisorUser.name || `${coSupervisorUser.first_name || ''} ${coSupervisorUser.last_name || ''}`.trim() } : (p.co_supervisor || null),
              college_name: collegeName,
              university_name: universityName2,
              department_name: departmentName || (p.department && (p.department.name || p.department.department_name) ) || '-',
              program_name: (() => {
                let name = '-';
                if (mainGroup) {
                  if (mainGroup.program && typeof mainGroup.program === 'object') {
                    name = mainGroup.program.p_name || mainGroup.program.name || name;
                  } else if (mainGroup.program) {
                    const pg = programGroupsById2.get(Number(mainGroup.program)) || programGroupsByGroup2.get(String(groupId));
                    if (pg) {
                      const pr = programsById2.get(pg.program || pg.program_id || pg.program);
                      name = (pr && (pr.p_name || pr.name)) || pg.program_name || name;
                    }
                  } else {
                    const pg = programGroupsByGroup2.get(String(groupId));
                    if (pg) {
                      const pr = programsById2.get(pg.program || pg.program_id || pg.program);
                      name = (pr && (pr.p_name || pr.name)) || pg.program_name || name;
                    }
                  }
                }
                if (name === '-' && p.program) name = (p.program.p_name || p.program.name) || name;
                if (name === '-' && p.field) name = (p.field.name || p.field) || name;
                return name;
              })(),
              start_year: (mainGroup && (mainGroup.academic_year || mainGroup.start_year)) || p.start_year || (p.start_date ? (() => { const d = new Date(p.start_date); return isNaN(d.getTime()) ? null : d.getFullYear(); })() : null) || null,
            };

            // prefer groupprogram serializer values if available
            try {
              const gp = groupprogramByGroup2.get(String(groupId));
              if (gp) {
                if (gp.program_name) enriched.program_name = gp.program_name;
                if (gp.department_name) enriched.department_name = gp.department_name;
                if (gp.college_name) enriched.college_name = gp.college_name;
                if (gp.university_name) enriched.university_name = gp.university_name;
              }
            } catch (e) { /* ignore */ }

            // additional fallback: try to read university from the linked group directly
            if ((!enriched.university_name || enriched.university_name === '-') && mainGroup) {
              try {
                if (mainGroup.university_name) enriched.university_name = mainGroup.university_name;
                else if (mainGroup.university && typeof mainGroup.university === 'object') {
                  enriched.university_name = mainGroup.university.uname_ar || mainGroup.university.name_ar || mainGroup.university.uname_en || mainGroup.university.name || enriched.university_name;
                } else if (mainGroup.branch_detail && mainGroup.branch_detail.university_detail) {
                  const ud = mainGroup.branch_detail.university_detail;
                  enriched.university_name = ud.uname_ar || ud.name_ar || ud.uname_en || ud.name || enriched.university_name;
                } else if (mainGroup.program && typeof mainGroup.program === 'object') {
                  const mgPr: any = mainGroup.program;
                  const mgDeptId = mgPr.department || mgPr.department_id || (mgPr.department && (mgPr.department.department_id || mgPr.department.id));
                  const mgDept = departmentsMap2.get(mgDeptId) || (mgPr.department && typeof mgPr.department === 'object' ? mgPr.department : null);
                  if (mgDept) {
                    const mgColId = mgDept.college || mgDept.college_id || (mgDept.college && (mgDept.college.cid || mgDept.college.id));
                    const mgCol = mgColId ? collegesById2.get(mgColId) : (mgDept.college && typeof mgDept.college === 'object' ? mgDept.college : null);
                    if (mgCol) {
                      const mgUniId = mgCol.university_id || (mgCol.university && (mgCol.university.id || mgCol.university)) || (mgCol.branch_detail && mgCol.branch_detail.university_detail && (mgCol.branch_detail.university_detail.uid || mgCol.branch_detail.university_detail.id));
                      const mgUni = mgUniId ? universitiesById2.get(mgUniId) : (mgCol.branch_detail && mgCol.branch_detail.university_detail ? mgCol.branch_detail.university_detail : null);
                      if (mgUni) enriched.university_name = mgUni.uname_ar || mgUni.name_ar || mgUni.uname_en || mgUni.name || enriched.university_name;
                    }
                  }
                }
              } catch (e) { /* ignore */ }
            }

            // If college_name still missing, try program_groups -> program -> department -> college
            if ((!enriched.college_name || enriched.college_name === '-') && groupId) {
              try {
                const pg = programGroupsByGroup2.get(String(groupId));
                if (pg) {
                  if (pg.college_name) enriched.college_name = pg.college_name;
                  else if (pg.college_id || pg.college) {
                    const cid = pg.college_id || pg.college;
                    const col = colleges2.find((c: any) => String(c.cid || c.id || c.college_id) === String(cid));
                    if (col) enriched.college_name = col.name_ar || col.name || col.college_name || '-';
                  }
                }
              } catch (e) { /* ignore */ }
            }

            return enriched;
          });

          setProjects(projectsWithUsers2);
          console.log('[ProjectsTable] set projects from enriched parent filteredProjects count:', projectsWithUsers2.length);
        } catch (e) {
          console.error('[ProjectsTable] failed to enrich parent filteredProjects', e);
          setProjects(filteredProjects as any[]);
          console.log('[ProjectsTable] fallback: set projects from parent filteredProjects count:', (filteredProjects as any[]).length);
        } finally {
          setLoading(false);
        }
      } else {
        // For ministry dashboard, show all projects without filtering by college
        const fp = projectsWithUsers;

        // Client-side fallback for supervisor filter: if backend didn't filter, apply locally
        const supervisorFilter = paramsToSend?.supervisor || params?.supervisor;
        if (supervisorFilter) {
          const supIdStr = String(supervisorFilter);
          const filtered = fp.filter((p: any) => {
            const relatedGroup = groups.find((g: any) => g.project === p.project_id);
            const groupId = relatedGroup ? relatedGroup.group_id : null;
            if (!groupId) return false;
            return groupSupervisors.some((s: any) => String(s.group) === String(groupId) && String(s.user) === supIdStr);
          });
          console.log('[ProjectsTable] applied client-side supervisor filter, kept:', filtered.length);
          setProjects(filtered);
          console.log('[ProjectsTable] applied client-side supervisor filter -> projects count:', filtered.length);
        } else {
          setProjects(fp);
          console.log('[ProjectsTable] set projects from fetch path (fp) count:', fp.length);
        }
      }
    } catch (err) {
      console.error('[ProjectsTable] Failed to fetch projects:', err);
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

    // Always call fetchProjects so parent-supplied `filteredProjects` get enriched
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // when parent filteredProjects change, update table
  useEffect(() => {
    // when parent filteredProjects change, re-run enrichment by fetching (fetchProjects handles enriching parent list)
    console.log('[ProjectsTable] parent filteredProjects changed; length:', Array.isArray(filteredProjects) ? filteredProjects.length : filteredProjects);
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProjects]);

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

  const openImportModal = async () => {
    setShowImportModal(true);
    try {
      // fetch universities directly from the universities table endpoint
      let universities: any[] = [];
      try {
        const uResp = await api.get('/universities/');
        const uData = uResp?.data;
        universities = Array.isArray(uData) ? uData : (Array.isArray(uData?.results) ? uData.results : []);
      } catch (e) {
        console.warn('Failed to fetch /universities/, falling back to bulk:', e);
        const bulk = await projectService.getProjectsWithGroups();
        universities = Array.isArray(bulk.universities) ? bulk.universities : [];
      }
      // fetch bulk once and reuse
      const bulkAll = await projectService.getProjectsWithGroups();
      const colleges = Array.isArray(bulkAll.colleges) ? bulkAll.colleges : [];
      const departments = Array.isArray(bulkAll.departments) ? bulkAll.departments : [];
      // try to fetch programs from dedicated endpoint first
      let programs: any[] = [];
      try {
        const pResp = await api.get('/programs/');
        const pData = pResp?.data;
        programs = Array.isArray(pData) ? pData : (Array.isArray(pData?.results) ? pData.results : []);
      } catch (err) {
        console.warn('Failed to fetch /programs/, will derive from bulk:', err);
        programs = Array.isArray(bulkAll.programs) ? bulkAll.programs : [];
      }

      // derive programs from program_groups / groupprogram if needed
      if ((!programs || programs.length === 0) && Array.isArray(bulkAll.program_groups) && bulkAll.program_groups.length) {
        const progMap = new Map<any, any>();
        bulkAll.program_groups.forEach((pg: any) => {
          const pid = pg.program || pg.program_id || pg.programId || null;
          if (!pid) return;
          if (!progMap.has(pid)) {
            progMap.set(pid, { id: pid, p_name: pg.program_name || pg.name || null, department_id: pg.department_id || null });
          }
        });
        if (Array.isArray(bulkAll.groupprogram)) {
          bulkAll.groupprogram.forEach((gp: any) => {
            const pid = gp.program || gp.program_id || gp.programId || null;
            if (!pid) return;
            const existing = progMap.get(pid) || { id: pid };
            if (!existing.p_name && gp.program_name) existing.p_name = gp.program_name;
            progMap.set(pid, existing);
          });
        }
        programs = Array.from(progMap.values()).map((x: any) => ({ id: x.id, p_name: x.p_name || x.name || `برنامج ${x.id}`, department_id: x.department_id || null }));
      }

      // keep a full copy for filtering when user selects a university/program
      allImportOptsRef.current = { universities, colleges, departments, programs };
      // initially set full lists, then they will be filtered when user makes a selection
      setImportOpts({ universities, colleges, departments, programs });
    } catch (e) {
      console.error('Failed to load import options', e);
    }
  };

  // reference to full option lists so we can filter client-side without re-fetching
  const allImportOptsRef = React.useRef<any>({ universities: [], colleges: [], departments: [], programs: [] });

  const updateFilteredImportOpts = (sel: any) => {
    const full = allImportOptsRef.current || { universities: [], colleges: [], departments: [], programs: [] };
    let { universities, colleges, departments, programs } = full;

    if (sel?.university) {
      const uniId = String(sel.university);
      // filter colleges that reference this university
      colleges = (full.colleges || []).filter((c: any) => {
        const u = c.university_id || (c.university && (c.university.id || c.university)) || (c.branch_detail && c.branch_detail.university_detail && (c.branch_detail.university_detail.uid || c.branch_detail.university_detail.id));
        return u != null && String(u) === uniId;
      });

      // filter departments whose college is in filtered colleges
      const collegeIds = new Set(colleges.map((c: any) => String(c.cid || c.id || c.college_id)));
      departments = (full.departments || []).filter((d: any) => {
        const colId = d.college || d.college_id || (d.college && (d.college.cid || d.college.id));
        return colId != null && collegeIds.has(String(colId));
      });

      // filter programs whose department belongs to the filtered departments
      const deptIds = new Set(departments.map((d: any) => String(d.department_id || d.id)));
      programs = (full.programs || []).filter((p: any) => {
        const dep = p.department || p.department_id || (p.department && (p.department.department_id || p.department.id));
        if (dep != null && deptIds.has(String(dep))) return true;
        // fallback: some program objects may carry college/university directly
        const pCol = p.college || p.college_id || (p.college && (p.college.cid || p.college.id));
        if (pCol) {
          const c = (full.colleges || []).find((cc: any) => String(cc.cid || cc.id || cc.college_id) === String(pCol));
          if (c) {
            const u = c.university_id || (c.university && (c.university.id || c.university)) || (c.branch_detail && c.branch_detail.university_detail && (c.branch_detail.university_detail.uid || c.branch_detail.university_detail.id));
            if (u != null && String(u) === String(sel.university)) return true;
          }
        }
        return false;
      });
    }

    setImportOpts({ universities: full.universities, colleges, departments, programs });
  };

  // when university selection changes, filter options
  React.useEffect(() => {
    updateFilteredImportOpts(importSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importSelection.university]);

  // when program selection changes, auto-fill department/college/university if possible
  React.useEffect(() => {
    try {
      if (!importSelection.program) return;
      const full = allImportOptsRef.current || { universities: [], colleges: [], departments: [], programs: [] };
      const prog = (full.programs || []).find((p: any) => String(p.id || p.pid) === String(importSelection.program) || String(p.p_name) === String(importSelection.program));
      if (!prog) return;
      // determine department
      const deptId = prog.department || prog.department_id || (prog.department && (prog.department.department_id || prog.department.id));
      const dept = (full.departments || []).find((d: any) => String(d.department_id || d.id) === String(deptId)) || null;
      // determine college
      let college = null;
      if (dept) {
        const colId = dept.college || dept.college_id || (dept.college && (dept.college.cid || dept.college.id));
        college = (full.colleges || []).find((c: any) => String(c.cid || c.id || c.college_id) === String(colId)) || null;
      }
      // determine university
      let uni = null;
      if (college) {
        const uId = college.university_id || (college.university && (college.university.id || college.university)) || (college.branch_detail && college.branch_detail.university_detail && (college.branch_detail.university_detail.uid || college.branch_detail.university_detail.id));
        uni = (full.universities || []).find((u: any) => String(u.uid || u.id) === String(uId)) || null;
      }

      setImportSelection((s: any) => ({
        ...s,
        department: dept ? (dept.department_id || dept.id) : s.department,
        college: college ? (college.cid || college.id || college.college_id) : s.college,
        university: uni ? (uni.uid || uni.id) : s.university,
      }));
    } catch (e) {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importSelection.program]);

  const downloadTemplate = () => {
    const rows: string[] = [];
    const meta = [
      `University:${importSelection.university || ''}`,
      `College:${importSelection.college || ''}`,
      `Department:${importSelection.department || ''}`,
      `Program:${importSelection.program || ''}`,
    ].join(',');
    rows.push(meta);
    rows.push('');
    const headers = ['project_id', 'title', 'description', 'supervisor_id', 'co_supervisor_id', 'start_date', 'end_date', 'program_id', 'field', 'tools'];
    rows.push(headers.join(','));
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `projects_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    URL.revokeObjectURL(url);
    setShowImportModal(false);
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

  if (projects.length === 0) return <div className="p-6 text-center text-red-600">لا توجد مشاريع</div>;

  return (
    <div>
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
            onClick={openImportModal}
            className="bg-green-50 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            إستيراد
          </button>
          <button
            onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
          >
            <FiPlus />
            <span>إنشاء مشروع جديد</span>
          </button>
          <button
  onClick={() => navigate("/dashboard/system-manager/import-projects")}
  className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-bold flex items-center gap-2"
>
  📂
  <span>استيراد مشاريع</span>
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
      <div className="bg-white text-slate-900">
        <table className="table-auto min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-right">عنوان المشروع</th>
            <th className="px-4 py-2 text-right">نوع المشروع</th>
            <th className="px-4 py-2 text-right">الحالة</th>
            <th className="px-4 py-2 text-right">الملخص</th>
            <th className="px-4 py-2 text-right">المشرف</th>
            <th className="px-4 py-2 text-right">المشرف المشارك</th>
            <th className="px-4 py-2 text-right">الكلية</th>
            <th className="px-4 py-2 text-right">الجامعة</th>
            <th className="px-4 py-2 text-right">القسم</th>
            <th className="px-4 py-2 text-right">تاريخ الانتهاء</th>
            <th className="px-4 py-2 text-right">المجال</th>
            <th className="px-4 py-2 text-right">التخصص</th>
            <th className="px-4 py-2 text-right">الأدوات</th>
            <th className="px-4 py-2 text-right">إنشأ بواسطة</th>
            <th className="px-4 py-2 text-right">تاريخ البداية</th>
            <th className="px-4 py-2 text-right">المستخدمون</th>
            <th className="px-4 py-2 text-center">ملف المشروع</th>
            <th className="px-4 py-2 text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.project_id} className="border-b last:border-b-0">
              <td className="px-4 py-2 text-right">{proj.title}{proj.group_name ? ` — ${proj.group_name}` : ''}</td>
              <td className="px-4 py-2 text-right">{proj.type}</td>
              <td className="px-4 py-2 text-right">{proj.state}</td>
              <td className="px-4 py-2 text-right">{proj.description}</td>
              <td className="px-4 py-2 text-right">{proj.supervisor?.name || '-'}</td>
              <td className="px-4 py-2 text-right">{(proj as any).group_name || '-'}</td>
              <td className="px-4 py-2 text-right">{proj.co_supervisor?.name || '-'}</td>
              <td className="px-4 py-2 text-right">{(proj as any).college_name || '-'}</td>
              <td className="px-4 py-2 text-right">{(proj as any).department_name || '-'}</td>
              <td className="px-4 py-2 text-right">{proj.start_date ? new Date(proj.start_date).getFullYear() : '-'}</td>
              {/* <td className="px-4 py-2 text-right">
  {proj.start_date ? `${proj.start_date}${proj.end_date ? ` - ${proj.end_date}` : ""}` : "-"}
</td> */}
              <td className="px-4 py-2 text-right">
                {renderVal(proj.users?.length ? proj.users.map((u: any) => u.displayName || u.name).join(', ') : '-')}
              </td>
              <td className="px-4 py-2 text-center align-top">
                <button
                  className="text-primary-700 hover:opacity-80 flex items-center justify-center gap-1"
                  onClick={() => projectService.downloadProjectFile(proj.project_id)}
                >
                  <FiDownload /> تنزيل
                </button>
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => { setEditingProject(proj); setShowProjectForm(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mr-2"
                  title="تعديل"
                >
                  <FiEdit3 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProject(proj.project_id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="حذف"
                >
                  <FiTrash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {showImportModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
          <h2 className="text-lg font-bold mb-4">استيراد قالب المشاريع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">الجامعة</label>
              <div className="flex gap-2">
                <select className="w-full border rounded px-2 py-2" value={importSelection.university} onChange={e => setImportSelection((s:any)=>({...s, university: e.target.value}))}>
                  <option value="">-- اختر جامعة --</option>
                  {importOpts.universities?.map((u: any) => (
                    <option key={u.uid || u.id} value={u.uid || u.id || u.uname_ar || u.name_ar}>{u.uname_ar || u.name_ar}</option>
                  ))}
                </select>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddUni(s => !s)}>إضافة</button>
              </div>
              {showAddUni && (
                <div className="mt-2 flex gap-2">
                  <input value={newUniName} onChange={e=>setNewUniName(e.target.value)} placeholder="اسم الجامعة" className="border px-2 py-1 rounded flex-1" />
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                    if(!newUniName) return alert('أدخل اسم الجامعة');
                    try{
                      const resp = await api.post('/universities/', { uname_ar: newUniName });
                      const created = resp.data;
                      setImportOpts((s:any)=>({ ...s, universities: [ ...(s.universities||[]), created ] }));
                      setImportSelection((s:any)=>({...s, university: created.uid || created.id || created.uname_ar }));
                      setNewUniName(''); setShowAddUni(false);
                    }catch(err){ console.error('create university failed', err); alert('فشل إنشاء الجامعة'); }
                  }}>حفظ</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الكلية</label>
              <div className="flex gap-2">
                <select className="w-full border rounded px-2 py-2" value={importSelection.college} onChange={e => setImportSelection((s:any)=>({...s, college: e.target.value}))}>
                  <option value="">-- اختر كلية --</option>
                  {importOpts.colleges?.map((c: any) => (
                    <option key={c.cid || c.id} value={c.cid || c.id || c.name_ar || c.name}>{c.name_ar || c.name}</option>
                  ))}
                </select>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddCollege(s => !s)}>إضافة</button>
              </div>
              {showAddCollege && (
                <div className="mt-2 flex gap-2">
                  <input value={newCollegeName} onChange={e=>setNewCollegeName(e.target.value)} placeholder="اسم الكلية" className="border px-2 py-1 rounded flex-1" />
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                    if(!newCollegeName) return alert('أدخل اسم الكلية');
                    try{
                      // need university id selection to create college; try to use selected university
                      const uniVal = importSelection.university;
                      let payload: any = { name_ar: newCollegeName };
                      if(uniVal) payload.branch = uniVal; // backend may accept branch/university field
                      const resp = await api.post('/colleges/', payload);
                      const created = resp.data;
                      setImportOpts((s:any)=>({ ...s, colleges: [ ...(s.colleges||[]), created ] }));
                      setImportSelection((s:any)=>({...s, college: created.cid || created.id || created.name_ar }));
                      setNewCollegeName(''); setShowAddCollege(false);
                    }catch(err){ console.error('create college failed', err); alert('فشل إنشاء الكلية'); }
                  }}>حفظ</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">القسم</label>
              <div className="flex gap-2">
                <select className="w-full border rounded px-2 py-2" value={importSelection.department} onChange={e => setImportSelection((s:any)=>({...s, department: e.target.value}))}>
                  <option value="">-- اختر قسم --</option>
                  {importOpts.departments?.map((d: any) => (
                    <option key={d.department_id || d.id} value={d.department_id || d.id || d.name || d.department_name}>{d.name || d.department_name}</option>
                  ))}
                </select>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddDept(s => !s)}>إضافة</button>
              </div>
              {showAddDept && (
                <div className="mt-2 flex gap-2">
                  <input value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} placeholder="اسم القسم" className="border px-2 py-1 rounded flex-1" />
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                    if(!newDeptName) return alert('أدخل اسم القسم');
                    try{
                      const payload: any = { name: newDeptName };
                      if(importSelection.college) payload.college = importSelection.college;
                      const resp = await api.post('/departments/', payload);
                      const created = resp.data;
                      setImportOpts((s:any)=>({ ...s, departments: [ ...(s.departments||[]), created ] }));
                      setImportSelection((s:any)=>({...s, department: created.department_id || created.id || created.name }));
                      setNewDeptName(''); setShowAddDept(false);
                    }catch(err){ console.error('create department failed', err); alert('فشل إنشاء القسم'); }
                  }}>حفظ</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">التخصص</label>
              <div className="flex gap-2">
                <select className="w-full border rounded px-2 py-2" value={importSelection.program} onChange={e => setImportSelection((s:any)=>({...s, program: e.target.value}))}>
                  <option value="">-- اختر تخصص --</option>
                  {importOpts.programs?.map((p: any) => (
                    <option key={p.id || p.pid} value={p.id || p.pid || p.p_name || p.name}>{p.p_name || p.name}</option>
                  ))}
                </select>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddProg(s => !s)}>إضافة</button>
              </div>
              {showAddProg && (
                <div className="mt-2 flex gap-2">
                  <input value={newProgName} onChange={e=>setNewProgName(e.target.value)} placeholder="اسم التخصص" className="border px-2 py-1 rounded flex-1" />
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                    if(!newProgName) return alert('أدخل اسم التخصص');
                    try{
                      const payload: any = { p_name: newProgName };
                      if(importSelection.department) payload.department = importSelection.department;
                      const resp = await api.post('/programs/', payload);
                      const created = resp.data;
                      setImportOpts((s:any)=>({ ...s, programs: [ ...(s.programs||[]), created ] }));
                      setImportSelection((s:any)=>({...s, program: created.id || created.pid || created.p_name }));
                      setNewProgName(''); setShowAddProg(false);
                    }catch(err){ console.error('create program failed', err); alert('فشل إنشاء التخصص'); }
                  }}>حفظ</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded">إلغاء</button>
            <button onClick={downloadTemplate} className="px-4 py-2 bg-green-600 text-white rounded">تحميل الملف</button>
          </div>
        </div>
      </div>
    )}

    {showProjectForm && (
      <ProjectForm
        isOpen={showProjectForm}
        initialData={editingProject || undefined}
        // system manager can assign from all groups
        showAllGroups={true}
        mode={editingProject ? 'edit' : 'create'}
        onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
        onSuccess={() => { setShowProjectForm(false); setEditingProject(null); fetchProjects(); }}
      />
    )}
  </div>
  );
};

export default ProjectsTable;
