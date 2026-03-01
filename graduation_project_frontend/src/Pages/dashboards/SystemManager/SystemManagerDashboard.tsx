import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../../../store/useStore';
import {
  FiUsers,
  FiLayers,
  FiFileText,
  FiBell,
  FiMenu,
  FiX,
  FiHome,
  FiSettings,
  FiDatabase,
  FiChevronLeft,
  FiPieChart,
  FiActivity,
  FiCompass,
  FiShield,
} from 'react-icons/fi';

import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';
import { projectService } from '../../../services/projectService';
import { groupService } from '../../../services/groupService';
import { fetchTableFields } from '../../../services/bulkService';
import { programService } from '../../../services/programService';
import { branchService } from '../../../services/branchService';
import { useAuthStore } from '../../../store/useStore';
import NotificationsPanel from '../../../components/notifications/NotificationsPanel';
import UsersTable from './UsersTable';
import RolesTable from './RolesTable';
import GroupsTable from './GroupsTable';
import UsersReport from './UsersReport';
import ProjectReport from './ProjectReport';
import GroupsReport from './GroupsReport';
import ProjectsTable from './ProjectTable';
import UniversitiesTable from './UniversitiesTable.tsx';
import CollegesTable from './CollegeTable.tsx';
import DepartmentsTable from './DepartmentsTable.tsx';
import ProgramsTable from './ProgramTable.tsx';
import Branches from './BranchTable';
import collegeServices from  '../../../services/collegeServices.ts';

const SystemManagerDashboard: React.FC = () => {
   const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'home' | 'users' | 'projects' | 'groups' | 'approvals' | 'settings'
  >('home');
  console.log("user : ",user?.name)
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  const [activeCardPanel, setActiveCardPanel] = useState<string | null>(null);
  const [showManagementContent, setShowManagementContent] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  /* ==========================
     Fetch Data
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settled = await Promise.allSettled([
          userService.getAllUsers(),
          roleService.getAllRoles(),
          projectService.getProjects(), // use plural to guarantee an array
          groupService.getGroups(),
          userService.getAffiliations(),
          fetchTableFields('departments'),
          collegeServices.getColleges(),
          fetchTableFields('universities'),
          fetchTableFields('programs'),
          fetchTableFields('branches')
        ]);

        const results = settled.map(s => s.status === 'fulfilled' ? (s as any).value : null);
        const [fetchedUsers, fetchedRoles, fetchedProjectsRaw, fetchedGroups, fetchedAffiliations, fetchedDepartments, fetchedColleges, fetchedUniversities, fetchedPrograms, fetchedBranches] = results;

        // Log rejections for visibility
        settled.forEach((s, idx) => { if (s.status === 'rejected') console.warn('fetch failed idx', idx, (s as any).reason); });

        console.log('SystemManagerDashboard raw fetched (settled):', { fetchedUsers, fetchedRoles, fetchedProjectsRaw, fetchedGroups, fetchedAffiliations, fetchedDepartments, fetchedColleges, fetchedUniversities, fetchedPrograms, fetchedBranches });

        // Extra diagnostics for problematic tables
        const diag = (name: string, val: any) => {
          try {
            console.log(`DIAG ${name}:`, {
              typeof: typeof val,
              isArray: Array.isArray(val),
              keys: val && typeof val === 'object' ? Object.keys(val).slice(0,10) : undefined,
              sample: (() => { try { return JSON.stringify(val).slice(0,1000); } catch(e){ return String(val); } })(),
            });
          } catch (e) { console.warn('diag error', e); }
        };
        diag('fetchedUniversities', fetchedUniversities);
        diag('fetchedPrograms', fetchedPrograms);
        diag('fetchedBranches', fetchedBranches);
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
        setProjects(Array.isArray(fetchedProjectsRaw) ? fetchedProjectsRaw : (fetchedProjectsRaw?.results || []));
        setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : (fetchedGroups?.results || []));
        setAffiliations(Array.isArray(fetchedAffiliations) ? fetchedAffiliations : (fetchedAffiliations?.results || []));
        setDepartments(Array.isArray(fetchedDepartments) ? fetchedDepartments : (fetchedDepartments?.results || []));

        const normalizeBulk = (v: any, preferredKey?: string) => {
          if (!v) return [];
          if (Array.isArray(v)) return v;
          if (typeof v !== 'object') return [];

          // 1) preferred key (e.g., 'universities', 'programs', 'branches')
          if (preferredKey && v[preferredKey]) {
            if (Array.isArray(v[preferredKey])) return v[preferredKey];
            if (v[preferredKey].results && Array.isArray(v[preferredKey].results)) return v[preferredKey].results;
          }

          // 2) common results key
          if (Array.isArray(v.results)) return v.results;

          // 3) search recursively for arrays and pick the longest
          const arraysFound: any[] = [];
          const visit = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
              arraysFound.push(obj);
              return;
            }
            for (const k of Object.keys(obj)) visit(obj[k]);
          };
          visit(v);
          if (arraysFound.length === 0) {
            // maybe the response is an object-of-records (id->obj), return its values
            const objVals = Object.values(v).filter((x: any) => x && typeof x === 'object' && !Array.isArray(x));
            if (objVals.length > 0) return objVals;
            return [];
          }
          arraysFound.sort((a, b) => b.length - a.length);
          return arraysFound[0];
        };

        let normColleges = normalizeBulk(fetchedColleges, 'colleges');
        let normUniversities = normalizeBulk(fetchedUniversities, 'universities');
        let normPrograms = normalizeBulk(fetchedPrograms, 'programs');
        let normBranches = normalizeBulk(fetchedBranches, 'branches');

        // Fallback: if bulk fetch didn't return arrays for programs/branches, call their services directly.
        try {
          if (!Array.isArray(normPrograms) || normPrograms.length === 0) {
            const ps = await programService.getPrograms();
            if (Array.isArray(ps) && ps.length) normPrograms = ps;
          }
        } catch (e) { console.warn('programService fallback failed', e); }

        try {
          if (!Array.isArray(normBranches) || normBranches.length === 0) {
            const bs = await branchService.getBranches();
            if (Array.isArray(bs) && bs.length) normBranches = bs;
          }
        } catch (e) { console.warn('branchService fallback failed', e); }

        setColleges(Array.isArray(normColleges) ? normColleges : []);
        setUniversities(Array.isArray(normUniversities) ? normUniversities : []);
        setPrograms(Array.isArray(normPrograms) ? normPrograms : []);
        setBranches(Array.isArray(normBranches) ? normBranches : []);

        console.log('SystemManagerDashboard normalized samples:', {
          colleges: Array.isArray(normColleges) ? normColleges.slice(0,5) : normColleges,
          universities: Array.isArray(normUniversities) ? normUniversities.slice(0,5) : normUniversities,
          programs: Array.isArray(normPrograms) ? normPrograms.slice(0,5) : normPrograms,
          branches: Array.isArray(normBranches) ? normBranches.slice(0,5) : normBranches,
        });

        console.log('SystemManagerDashboard fetched counts:', {
          users: Array.isArray(fetchedUsers) ? fetchedUsers.length : (fetchedUsers?.results?.length ?? null),
          roles: Array.isArray(fetchedRoles) ? fetchedRoles.length : null,
          projects: Array.isArray(fetchedProjectsRaw) ? fetchedProjectsRaw.length : (fetchedProjectsRaw?.results?.length ?? null),
          groups: Array.isArray(fetchedGroups) ? fetchedGroups.length : (fetchedGroups?.results?.length ?? null),
          affiliations: Array.isArray(fetchedAffiliations) ? fetchedAffiliations.length : null,
          departments: Array.isArray(normColleges) ? normColleges.length : null,
          colleges: Array.isArray(normColleges) ? normColleges.length : null,
          universities: Array.isArray(normUniversities) ? normUniversities.length : null,
          programs: Array.isArray(normPrograms) ? normPrograms.length : null,
          branches: Array.isArray(normBranches) ? normBranches.length : null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  /* ==========================
     Helper Functions
  ========================== */
  const getSystemManagerCollegeId = (): number | null => {
    if (!user?.id || !affiliations.length) return user?.college_id || null;

    // Find system manager's affiliation
    const smAffiliation = affiliations.find((aff: any) => String(aff.user_id) === String(user.id));
    if (smAffiliation) {
      // Handle different college field structures
      if (typeof smAffiliation.college === 'number') {
        return smAffiliation.college;
      } else if (typeof smAffiliation.college === 'object' && smAffiliation.college) {
        return smAffiliation.college.id || smAffiliation.college.cid;
      } else if (smAffiliation.college_id) {
        return smAffiliation.college_id;
      }
    }

    // Try to get from department affiliation
    const deptAffiliation = affiliations.find((aff: any) =>
      String(aff.user_id) === String(user.id) && aff.department_id
    );
    if (deptAffiliation?.department_id) {
      // Find the department and get its college
      const department = departments.find((d: any) => String(d.department_id) === String(deptAffiliation.department_id));
      if (department) {
        // Handle department college field
        if (typeof department.college === 'number') {
          return department.college;
        } else if (typeof department.college === 'object' && department.college) {
          return department.college.id || department.college.cid;
        } else if (department.college_id) {
          return department.college_id;
        }
      }
    }

    // Fallback to user.college_id from auth store if no affiliation found
    if (user?.college_id) {
      return user.college_id;
    }

    return null;
  };

  /* ==========================
     Filtered Data
  ========================== */
  const systemManagerCollegeId = useMemo(() => getSystemManagerCollegeId(), [affiliations, departments, user]);

  console.log('System Manager Dashboard - systemManagerCollegeId:', systemManagerCollegeId);
  console.log('System Manager Dashboard - affiliations sample:', affiliations.slice(0, 3));
  console.log('System Manager Dashboard - users sample:', users.slice(0, 3));
  console.log('System Manager Dashboard - projects sample:', projects.slice(0, 3));
  console.log('System Manager Dashboard - groups sample:', groups.slice(0, 3));

  const filteredUsers = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all users');
      return users;
    }

    console.log('System Manager Dashboard - filtering users for college:', systemManagerCollegeId);

    const result = users.filter((user: any) => {
      // Primary check: user.college_id
      if (user.college_id && Number(user.college_id) === Number(systemManagerCollegeId)) {
        console.log('User matched by college_id:', user.id, user.name, user.college_id);
        return true;
      }

      // Secondary check: affiliation college
      const userAffiliation = affiliations.find((aff: any) => String(aff.user_id) === String(user.id));
      if (userAffiliation) {
        let userCollegeId = null;
        if (typeof userAffiliation.college === 'number') {
          userCollegeId = userAffiliation.college;
        } else if (typeof userAffiliation.college === 'object' && userAffiliation.college) {
          userCollegeId = userAffiliation.college.id || userAffiliation.college.cid;
        } else if (userAffiliation.college_id) {
          userCollegeId = userAffiliation.college_id;
        }

        if (userCollegeId && Number(userCollegeId) === Number(systemManagerCollegeId)) {
          console.log('User matched by affiliation:', user.id, user.name, userCollegeId);
          return true;
        }
      }

      // Tertiary check: department affiliation
      const deptAffiliation = affiliations.find((aff: any) =>
        String(aff.user_id) === String(user.id) && aff.department_id
      );
      if (deptAffiliation?.department_id) {
        const department = departments.find((d: any) => String(d.department_id) === String(deptAffiliation.department_id));
        if (department) {
          let deptCollegeId = null;
          if (typeof department.college === 'number') {
            deptCollegeId = department.college;
          } else if (typeof department.college === 'object' && department.college) {
            deptCollegeId = department.college.id || department.college.cid;
          } else if (department.college_id) {
            deptCollegeId = department.college_id;
          }

          if (deptCollegeId && Number(deptCollegeId) === Number(systemManagerCollegeId)) {
            console.log('User matched by department:', user.id, user.name, deptCollegeId);
            return true;
          }
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredUsers result:', result.length, 'from total:', users.length);
    return result;
  }, [users, affiliations, departments, systemManagerCollegeId]);

  const filteredProjects = useMemo(() => {
    // Enrich projects using the group assigned to each project. This ensures
    // supervisor/co_supervisor and department/college are resolved from the group
    // when the project object itself lacks those fields.
    const usersById = new Map<any, any>(users.map((u: any) => [u.id, u]));

    const enriched = projects.map((project: any) => {
      const pid = project.project_id || project.id || null;
      // find group assigned to this project (group.project may be id or object)
      const linkedGroup = groups.find((g: any) => {
        if (!g) return false;
        const gp = (typeof g.project === 'number' || typeof g.project === 'string') ? g.project : (g.project && (g.project.project_id || g.project.id));
        return gp != null && pid != null && String(gp) === String(pid);
      });

      const enrichedProj: any = { ...project };

      if (linkedGroup) {
        enrichedProj.group_id = linkedGroup.group_id || linkedGroup.id || null;
        enrichedProj.group_name = linkedGroup.group_name || linkedGroup.name || null;

        // resolve supervisors from group if available (group may have supervisors array)
        if (Array.isArray(linkedGroup.supervisors) && linkedGroup.supervisors.length > 0) {
          const supRow = linkedGroup.supervisors.find((s: any) => String(s.type || '').toLowerCase().includes('supervisor') && !String(s.type || '').toLowerCase().includes('co'));
          const coRow = linkedGroup.supervisors.find((s: any) => String(s.type || '').toLowerCase().includes('co'));
          const resolveUser = (row: any) => {
            if (!row) return null;
            if (row.user_detail) return row.user_detail;
            if (row.user && usersById.has(row.user)) return usersById.get(row.user);
            return null;
          };
          enrichedProj.supervisor = resolveUser(supRow) || project.supervisor || null;
          enrichedProj.co_supervisor = resolveUser(coRow) || project.co_supervisor || null;
        }

        // resolve department/college from group.department if the project lacks them
        if (linkedGroup.department) {
          const deptId = typeof linkedGroup.department === 'number' ? linkedGroup.department : (linkedGroup.department.department_id || linkedGroup.department.id);
          const deptObj = departments.find((d: any) => String(d.department_id || d.id) === String(deptId));
          if (deptObj) {
            enrichedProj.department = deptObj;
            enrichedProj.department_name = deptObj.name || deptObj.department_name || enrichedProj.department_name || '-';
            // resolve college id/name if available on department
            let cid: any = null;
            if (typeof deptObj.college === 'number') cid = deptObj.college;
            else if (deptObj.college && typeof deptObj.college === 'object') cid = deptObj.college.cid || deptObj.college.id;
            else if (deptObj.college_id) cid = deptObj.college_id;
            if (cid) enrichedProj.college = enrichedProj.college || cid;
              // attempt to resolve university name from department -> college -> branch -> university
              try {
                if (!enrichedProj.university_name) {
                  let uniName: any = null;
                  // if department has college object with nested university
                  const col = (typeof deptObj.college === 'object' && deptObj.college) ? deptObj.college : null;
                  if (col) {
                    if (col.uname_ar || col.name_ar) uniName = col.uname_ar || col.name_ar;
                    if (!uniName && col.branch_detail && col.branch_detail.university_detail) {
                      const ud = col.branch_detail.university_detail;
                      uniName = ud.uname_ar || ud.name_ar || ud.uname_en || ud.name || null;
                    }
                    if (!uniName && col.university && typeof col.university === 'object') {
                      uniName = col.university.uname_ar || col.university.name_ar || col.university.uname_en || col.university.name || null;
                    }
                  }
                  if (uniName) enrichedProj.university_name = uniName;
                }
              } catch (e) { /* ignore */ }
          }
        }

        // also try to resolve university from linkedGroup direct fields if not already set
        try {
          if (linkedGroup && !enrichedProj.university_name) {
            if (linkedGroup.university_name) enrichedProj.university_name = linkedGroup.university_name;
            else if (linkedGroup.university && typeof linkedGroup.university === 'object') {
              enrichedProj.university_name = linkedGroup.university.uname_ar || linkedGroup.university.name_ar || linkedGroup.university.uname_en || linkedGroup.university.name || enrichedProj.university_name;
            } else if (linkedGroup.branch_detail && linkedGroup.branch_detail.university_detail) {
              const ud = linkedGroup.branch_detail.university_detail;
              enrichedProj.university_name = ud.uname_ar || ud.name_ar || ud.uname_en || ud.name || enrichedProj.university_name;
            } else if (linkedGroup.program && typeof linkedGroup.program === 'object') {
              // try program -> department -> college -> university
              const pg = linkedGroup.program as any;
              const mgDept = (pg.department && (typeof pg.department === 'object' ? pg.department : null)) || null;
              const mgCol = mgDept && mgDept.college && typeof mgDept.college === 'object' ? mgDept.college : null;
              if (mgCol) {
                enrichedProj.university_name = mgCol.uname_ar || mgCol.name_ar || (mgCol.branch_detail && mgCol.branch_detail.university_detail && (mgCol.branch_detail.university_detail.uname_ar || mgCol.branch_detail.university_detail.name_ar)) || enrichedProj.university_name;
              }
            }
          }
        } catch (e) { /* ignore */ }

        // final fallback: try project.college nested university if still missing
        try {
          if (!enrichedProj.university_name && project.college && typeof project.college === 'object') {
            const col = project.college as any;
            if (col.uname_ar || col.name_ar) enrichedProj.university_name = col.uname_ar || col.name_ar;
            else if (col.branch_detail && col.branch_detail.university_detail) {
              const ud = col.branch_detail.university_detail;
              enrichedProj.university_name = ud.uname_ar || ud.name_ar || ud.uname_en || ud.name || enrichedProj.university_name;
            } else if (col.university && typeof col.university === 'object') {
              enrichedProj.university_name = col.university.uname_ar || col.university.name_ar || col.university.uname_en || col.university.name || enrichedProj.university_name;
            }
          }
        } catch (e) { /* ignore */ }
      }

      return enrichedProj;
    });

    // System managers see all projects; skip college filtering entirely.
    // the original code attempted to narrow results by systemManagerCollegeId,
    // which makes no sense for this role. keep enriched list as-is.
    console.log('System Manager Dashboard - returning all enriched projects (no college filter)');
    return enriched;
  }, [projects, groups, departments, users, systemManagerCollegeId]);

  const filteredUniversities = useMemo(() => universities, [universities]);
  const filteredColleges = useMemo(() => colleges, [colleges]);
  const filteredDepartments = useMemo(() => departments, [departments]);
  const filteredPrograms = useMemo(() => programs, [programs]);
  const filteredBranches = useMemo(() => branches, [branches]);

  const filteredGroups = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all groups');
      return groups;
    }

    console.log('System Manager Dashboard - filtering groups for college:', systemManagerCollegeId);

    const result = groups.filter((group: any) => {
      // Primary check: group's department college
      if (group.department) {
        const department = departments.find((d: any) => String(d.department_id) === String(group.department));
        if (department) {
          let departmentCollegeId = null;
          if (typeof department.college === 'number') {
            departmentCollegeId = department.college;
          } else if (typeof department.college === 'object' && department.college) {
            departmentCollegeId = department.college.id || department.college.cid;
          } else if (department.college_id) {
            departmentCollegeId = department.college_id;
          }

          if (departmentCollegeId && Number(departmentCollegeId) === Number(systemManagerCollegeId)) {
            console.log('Group matched by department:', group.group_id || group.id, departmentCollegeId);
            return true;
          }
        }
      }

      // Secondary check: group's project college
      if (group.project) {
        const project = projects.find((p: any) => String(p.project_id || p.id) === String(group.project));
        if (project) {
          let projectCollegeId = null;
          if (typeof project.college === 'number') {
            projectCollegeId = project.college;
          } else if (typeof project.college === 'object' && project.college) {
            projectCollegeId = project.college.id || project.college.cid;
          } else if (project.college_id) {
            projectCollegeId = project.college_id;
          }

          if (projectCollegeId && Number(projectCollegeId) === Number(systemManagerCollegeId)) {
            console.log('Group matched by project:', group.group_id || group.id, projectCollegeId);
            return true;
          }
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredGroups result:', result.length, 'from total:', groups.length);
    return result;
  }, [groups, departments, projects, systemManagerCollegeId]);

  /* ==========================
     Dashboard Cards
  ========================== */
  const dashboardCards = useMemo(() => {
    return [
      {
        id: 'users',
        title: 'المستخدمون',
        value: filteredUsers.length,
        icon: <FiUsers />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة حسابات المستخدمين وصلاحياتهم'
      },
      {
        id: 'roles',
        title: 'الأدوار',
        value: roles.length,
        icon: <FiDatabase />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'تحديد وتعديل أدوار النظام'
      },
      {
        id: 'projects',
        title: 'المشاريع',
        value: filteredProjects.length,
        icon: <FiLayers />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'متابعة مشاريع التخرج المقترحة'
      },
      {
        id: 'groups',
        title: 'المجموعات',
        value: filteredGroups.length,
        icon: <FiUsers />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة مجموعات الطلاب والفرق'
      },
       {
        id: 'universities',
        title: 'الجامعات',
        value: filteredUniversities.length,
        icon: <FiCompass />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الجامعات '
      },
       {
        id: 'colleges',
        title: 'الكليات ',
        value: filteredColleges.length,
        icon: <FiHome />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الكليات '
      },
       {
        id: 'departments',
        title: 'الأقسام',
        value: filteredDepartments.length,
        icon: <FiShield />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الأقسام '
      },
      {
        id: 'programs',
        title: 'التخصصات',
        value: filteredPrograms.length,
        icon: <FiShield />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الأقسام '
      },
       {
        id: 'branches',
        title: 'الفروع',
        value: filteredBranches.length,
        icon: <FiCompass />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الفروع '

      },
    ];
  }, [filteredUsers, roles, filteredProjects, filteredGroups, filteredColleges, filteredDepartments, filteredUniversities, filteredPrograms, filteredBranches]);

  /* ==========================
     Render Management Content
  ========================== */
  const renderManagementContent = () => {
    if (!activeCardPanel || !showManagementContent) return null;

    switch (activeCardPanel) {
      case 'المستخدمون':
        return <UsersTable filteredUsers={filteredUsers} />;
      case 'الأدوار':
        return <RolesTable />;
      case 'المجموعات':
        return <GroupsTable filteredGroups={filteredGroups} />;
      case 'المشاريع':
        return (
          <div className="mt-6">
            <ProjectsTable filteredProjects={filteredProjects} />
          </div>
        );
        case 'الجامعات':
          return <UniversitiesTable />;
        case 'الكليات':
          return <CollegesTable />;
        case 'الأقسام':
          return <DepartmentsTable />;
        case 'التخصصات':
          return <ProgramsTable />;
        case 'الفروع':
          return <Branches />;
      default:
        return null;
    }
  };

  /* ==========================
     Render Reports
  ========================== */
  const renderReport = () => {
    if (!activeReport) return null;
    switch (activeReport) {
      case 'users': return <UsersReport filteredUsers={filteredUsers} />;
      case 'projects': return <ProjectReport filteredProjects={filteredProjects} />;
      case 'groups': return <GroupsReport filteredGroups={filteredGroups} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-80 bg-[#0F172A] text-white z-[60] transition-transform duration-300 ease-out shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiActivity size={22} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">نظام الإدارة</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="mt-4 space-y-2">
              {[
            { id: 'home', label: 'الرئيسية', icon: <FiHome /> },
            { id: 'users', label: 'المستخدمون', icon: <FiUsers />, cardPanel: 'المستخدمون' },
            { id: 'projects', label: 'المشاريع', icon: <FiLayers />, cardPanel: 'المشاريع' },
            { id: 'groups', label: 'المجموعات', icon: <FiUsers />, cardPanel: 'المجموعات' },
            { id: 'approvals', label: 'الموافقات', icon: <FiFileText /> },
            { id: 'settings', label: 'الإعدادات', icon: <FiSettings /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'home') {
                  setActiveTab('home');
                      setActiveCardPanel(null);
                } else if (tab.cardPanel) {
                  setActiveTab('home');
                      setActiveCardPanel((tab.cardPanel as string).trim());
                } else {
                  setActiveTab(tab.id as any);
                  setActiveCardPanel(null);
                }
                setShowManagementContent(false);
                setActiveReport(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-white' : 'group-hover:text-white'}`}>
                {tab.icon}
              </span>
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">المسؤول الحالي</p>
            <p className="text-sm font-bold text-white">مدير النظام</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
 {/* Header (DESIGN ONLY - like DepartmentHead) */}
<header className="h-20 bg-white  border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
  {/* Left: menu + title */}
  <div className="flex items-center gap-4">
    <button
      onClick={() => setIsSidebarOpen(true)}
      className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
      aria-label="فتح القائمة"
    >
      <FiMenu size={20} />
    </button>

    <h2 className="text-xl font-black text-slate-800">نظام الإدارة</h2>
  </div>

  {/* Center: tabs */}
  <nav className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
    {[
      { id: 'home', label: 'الرئيسية' },
      { id: 'users', label: 'المستخدمون', cardPanel: 'المستخدمون' },
      { id: 'projects', label: 'المشاريع', cardPanel: 'المشاريع' },
      { id: 'groups', label: 'المجموعات', cardPanel: 'المجموعات' },
      { id: 'approvals', label: 'الموافقات' },
      { id: 'settings', label: 'الإعدادات' },
    ].map(item => {
      const active = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === 'home') {
              setActiveTab('home');
              setActiveCardPanel(null);
            } else if ((item as any).cardPanel) {
              setActiveTab('home');
              setActiveCardPanel(((item as any).cardPanel as string).trim());
            } else {
              setActiveTab(item.id as any);
              setActiveCardPanel(null);
            }
            setShowManagementContent(false);
            setActiveReport(null);
          }}
          className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
            active
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-600 hover:bg-white'
          }`}
        >
          {item.label}
        </button>
      );
    })}
  </nav>

  {/* Right: notifications + hello + avatar */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setIsNotifPanelOpen(true)}
      className="relative p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
      aria-label="فتح الإشعارات"
    >
      <FiBell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>

    <div className="hidden sm:block text-right">
      <p className="text-xs font-black text-slate-800 leading-none">مرحباً</p>
      <p className="text-[11px] text-slate-400 font-bold mt-1">
        {user?.name || 'مدير النظام'}
      </p>
    </div>

    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center text-white font-black">
      {(user?.name || 'م')?.charAt(0)?.toUpperCase()}
    </div>
  </div>
</header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="p-6 space-y-6">
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-[#0E4C92] to-[#0E4C92] rounded-3xl p-10 text-white overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h1 className="text-3xl font-black mb-3 flex items-center gap-2">
                    مرحباً بك مجدداً، مدير النظام 👋
                  </h1>
                  <p className="text-slate-100 text-base max-w-2xl leading-relaxed mb-4">
                    إليك نظرة سريعة على حالة النظام اليوم. يمكنك إدارة المستخدمين، المشاريع، والمجموعات من خلال البطاقات أدناه.
                  </p>
                  <div className="flex items-center gap-4 text-slate-200">
                    <FiUsers className="text-xl" />
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span>مدير النظام العام</span>
                  </div>
                </div>
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full " />
                <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full " />
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setActiveCardPanel(card.title.trim());
                      setShowManagementContent(true);
                      setActiveReport(null);
                    }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center mb-4 shadow-md`}>
                        {React.cloneElement(card.icon as React.ReactElement, { size: 24 })}
                      </div>
                      <p className="text-slate-400 text-xs font-medium mb-1">{card.title}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-[10px] font-bold">نظرة</span>
                        <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
                      </div>
                      <p className="text-slate-400 text-[10px]">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
<button
  onClick={() => navigate("/dashboard/system-manager/import-users")}
  className="px-4 py-2 rounded-xl bg-blue-600 text-white"
>
  استيراد مستخدمين (Excel)
</button>
          {/* Management Panel - Full screen when active */}
          {activeCardPanel && (
            <div className="relative mt-8">
              {/* Animated background waves */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {/* Reduced opacity decorative background to avoid hazy/blurry appearance */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/10 to-indigo-50/10 rounded-3xl"></div>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-200/10 rounded-full"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-indigo-200/10 rounded-full"></div>
                <div className="absolute top-[20px] right-[20px] w-16 h-16 bg-cyan-200/10 rounded-full"></div>
              </div>

              <div className="relative  rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                {/* Header with back button */}
                <div className="relative p-8 border-b border-slate-100/50 bg-gradient-to-r from-white to-blue-50/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
                  <div className="relative flex items-center justify-between">
                    <button
                      onClick={() => setActiveCardPanel(null)}
                      className="group flex items-center gap-3 px-4 py-2 bg-white/60 hover:bg-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/50"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiChevronLeft size={16} className="text-white" />
                      </div>
                      <span className="font-semibold text-slate-700">العودة</span>
                    </button>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-slate-800 mb-1">{activeCardPanel}</h3>
                      <p className="text-slate-500 text-sm">اختر نوع العملية المطلوبة</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer for centering */}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Management Card */}
                    <div
                      onClick={() => {
                        setShowManagementContent(true);
                        setActiveReport(null);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-full group-hover:bg-blue-200/40 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-100/30 rounded-full  group-hover:bg-indigo-200/40 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                          <FiDatabase size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                          إدارة {activeCardPanel}
                        </h4>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض وإدارة جميع {activeCardPanel.toLowerCase()} في النظام، إضافة، تعديل، وحذف البيانات مع إمكانية البحث والتصفية المتقدمة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            إدارة كاملة
                          </span>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <FiChevronLeft size={14} className="text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reports Card */}
                    <div
                      onClick={() => {
                        if (activeCardPanel === 'المجموعات') setActiveReport('groups');
                        else if (activeCardPanel === 'المشاريع') setActiveReport('projects');
                        else setActiveReport('users');
                        setShowManagementContent(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/30 rounded-full  group-hover:bg-indigo-200/40 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-100/30 rounded-full  group-hover:bg-blue-200/40 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                          <FiPieChart size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">
                          التقارير والإحصائيات
                        </h4>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض التقارير التفصيلية والإحصائيات المتقدمة لـ {activeCardPanel.toLowerCase()} مع إمكانية التصدير والطباعة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            تقارير متقدمة
                          </span>
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <FiChevronLeft size={14} className="text-indigo-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content below cards */}
              <div className="mt-8">
                {renderManagementContent()}
                {renderReport()}
              </div>
            </div>
          )}

          {activeTab !== 'home' && (
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'users' && <UsersTable filteredUsers={filteredUsers} />}
              {activeTab === 'groups' && <GroupsTable />}
              {activeTab === 'projects' && <ProjectsTable />}
              {activeTab === 'approvals' && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiFileText size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">قسم الموافقات</h3>
                  <p className="text-slate-500 max-w-md mx-auto">هذا القسم قيد التطوير حالياً وسيكون متاحاً قريباً لإدارة طلبات الموافقة.</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
                  <div className="w-24 h-24 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSettings size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">إعدادات النظام</h3>
                  <p className="text-slate-500 max-w-md mx-auto">تخصيص إعدادات النظام، التنبيهات، والخيارات العامة.</p>
                </div>
              )}
            </div>
          )}
        </main>

      </div>

      <NotificationsPanel
        isOpen={isNotifPanelOpen}
        onClose={() => setIsNotifPanelOpen(false)}
      />
    </div>
  );
};

export default SystemManagerDashboard;