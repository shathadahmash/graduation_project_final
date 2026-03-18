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
  FiDownload,
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
import collegeServices from '../../../services/collegeServices.ts';
import universityService from '../../../services/universityService.ts';

const SystemManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'home' | 'users' | 'projects' | 'groups' | 'approvals' | 'settings'
  >('home');
  console.log("user : ", user?.name)
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
  const [showImportProjects, setShowImportProjects] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
              keys: val && typeof val === 'object' ? Object.keys(val).slice(0, 10) : undefined,
              sample: (() => { try { return JSON.stringify(val).slice(0, 1000); } catch (e) { return String(val); } })(),
            });
          } catch (e) { console.warn('diag error', e); }
        };

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
        // Fetch universities reliably
        let normUniversities: any[] = [];
        try {
          const fetchedUniversities = await universityService.getUniversities(); // this should return an array
          if (Array.isArray(fetchedUniversities)) {
            normUniversities = fetchedUniversities;
          } else if (fetchedUniversities?.results && Array.isArray(fetchedUniversities.results)) {
            normUniversities = fetchedUniversities.results;
          }
        } catch (e) {
          console.warn('Failed to fetch universities', e);
          normUniversities = [];
        }
        setUniversities(normUniversities);
        let normColleges = normalizeBulk(fetchedColleges, 'colleges');
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
        setPrograms(Array.isArray(normPrograms) ? normPrograms : []);
        setBranches(Array.isArray(normBranches) ? normBranches : []);

        console.log('SystemManagerDashboard normalized samples:', {
          colleges: Array.isArray(normColleges) ? normColleges.slice(0, 5) : normColleges,
          universities: Array.isArray(normUniversities) ? normUniversities.slice(0, 5) : normUniversities,
          programs: Array.isArray(normPrograms) ? normPrograms.slice(0, 5) : normPrograms,
          branches: Array.isArray(normBranches) ? normBranches.slice(0, 5) : normBranches,
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
    if (!user) return null;
    if (typeof user.college === 'number') return user.college;
    if (typeof user.college === 'object' && user.college?.id) return user.college.id;
    if (typeof user.college === 'object' && user.college?.cid) return user.college.cid;
    return null;
  };

  const systemManagerCollegeId = useMemo(() => getSystemManagerCollegeId(), [user]);

  const filteredUsers = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all users');
      return users;
    }

    console.log('System Manager Dashboard - filtering users for college:', systemManagerCollegeId);

    const result = users.filter((user: any) => {
      // Primary check: user.college_id
      if (user.college_id && Number(user.college_id) === Number(systemManagerCollegeId)) {
        console.log('User matched by college_id:', user.user_id || user.id, user.college_id);
        return true;
      }

      // Secondary check: user.college (object)
      if (user.college && typeof user.college === 'object') {
        const userCollegeId = user.college.id || user.college.cid;
        if (Number(userCollegeId) === Number(systemManagerCollegeId)) {
          console.log('User matched by college object:', user.user_id || user.id, userCollegeId);
          return true;
        }
      }

      // Tertiary check: department affiliation
      if (user.department_id) {
        const department = departments.find((d: any) => String(d.department_id) === String(user.department_id));
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
            console.log('User matched by department college:', user.user_id || user.id, deptCollegeId);
            return true;
          }
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredUsers result:', result.length, 'from total:', users.length);
    return result;
  }, [users, departments, systemManagerCollegeId]);

  const filteredProjects = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all projects');
      return projects;
    }

    console.log('System Manager Dashboard - filtering projects for college:', systemManagerCollegeId);

    const result = projects.filter((project: any) => {
      // Primary check: project.college_id
      if (project.college_id && Number(project.college_id) === Number(systemManagerCollegeId)) {
        console.log('Project matched by college_id:', project.project_id || project.id, project.college_id);
        return true;
      }

      // Secondary check: project.college (object)
      if (project.college && typeof project.college === 'object') {
        const projectCollegeId = project.college.id || project.college.cid;
        if (Number(projectCollegeId) === Number(systemManagerCollegeId)) {
          console.log('Project matched by college object:', project.project_id || project.id, projectCollegeId);
          return true;
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredProjects result:', result.length, 'from total:', projects.length);
    return result;
  }, [projects, systemManagerCollegeId]);

  const filteredColleges = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all colleges');
      return colleges;
    }

    console.log('System Manager Dashboard - filtering colleges for college:', systemManagerCollegeId);

    const result = colleges.filter((college: any) => {
      // Primary check: college.college_id or college.id
      const collegeId = college.college_id || college.id;
      if (collegeId && Number(collegeId) === Number(systemManagerCollegeId)) {
        console.log('College matched:', collegeId);
        return true;
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredColleges result:', result.length, 'from total:', colleges.length);
    return result;
  }, [colleges, systemManagerCollegeId]);

  const filteredDepartments = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all departments');
      return departments;
    }

    console.log('System Manager Dashboard - filtering departments for college:', systemManagerCollegeId);

    const result = departments.filter((department: any) => {
      // Primary check: department.college_id
      if (department.college_id && Number(department.college_id) === Number(systemManagerCollegeId)) {
        console.log('Department matched by college_id:', department.department_id || department.id, department.college_id);
        return true;
      }

      // Secondary check: department.college (object)
      if (department.college && typeof department.college === 'object') {
        const deptCollegeId = department.college.id || department.college.cid;
        if (Number(deptCollegeId) === Number(systemManagerCollegeId)) {
          console.log('Department matched by college object:', department.department_id || department.id, deptCollegeId);
          return true;
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredDepartments result:', result.length, 'from total:', departments.length);
    return result;
  }, [departments, systemManagerCollegeId]);

  const filteredUniversities = useMemo(() => {
    console.log('System Manager Dashboard - showing all universities');
    return universities;
  }, [universities]);

  const filteredPrograms = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all programs');
      return programs;
    }

    console.log('System Manager Dashboard - filtering programs for college:', systemManagerCollegeId);

    const result = programs.filter((program: any) => {
      // Primary check: program.college_id
      if (program.college_id && Number(program.college_id) === Number(systemManagerCollegeId)) {
        console.log('Program matched by college_id:', program.program_id || program.id, program.college_id);
        return true;
      }

      // Secondary check: program.college (object)
      if (program.college && typeof program.college === 'object') {
        const progCollegeId = program.college.id || program.college.cid;
        if (Number(progCollegeId) === Number(systemManagerCollegeId)) {
          console.log('Program matched by college object:', program.program_id || program.id, progCollegeId);
          return true;
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredPrograms result:', result.length, 'from total:', programs.length);
    return result;
  }, [programs, systemManagerCollegeId]);

  const filteredBranches = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all branches');
      return branches;
    }

    console.log('System Manager Dashboard - filtering branches for college:', systemManagerCollegeId);

    const result = branches.filter((branch: any) => {
      // Primary check: branch.college_id
      if (branch.college_id && Number(branch.college_id) === Number(systemManagerCollegeId)) {
        console.log('Branch matched by college_id:', branch.branch_id || branch.id, branch.college_id);
        return true;
      }

      // Secondary check: branch.college (object)
      if (branch.college && typeof branch.college === 'object') {
        const branchCollegeId = branch.college.id || branch.college.cid;
        if (Number(branchCollegeId) === Number(systemManagerCollegeId)) {
          console.log('Branch matched by college object:', branch.branch_id || branch.id, branchCollegeId);
          return true;
        }
      }

      return false;
    });

    console.log('System Manager Dashboard - filteredBranches result:', result.length, 'from total:', branches.length);
    return result;
  }, [branches, systemManagerCollegeId]);

  const filteredGroups = useMemo(() => {
    if (!systemManagerCollegeId) {
      console.log('System Manager Dashboard - no college ID found, showing all groups');
      return groups;
    }

    console.log('System Manager Dashboard - filtering groups for college:', systemManagerCollegeId);

    const result = groups.filter((group: any) => {
      // Primary check: group.college_id
      if (group.college_id && Number(group.college_id) === Number(systemManagerCollegeId)) {
        console.log('Group matched by college_id:', group.group_id || group.id, group.college_id);
        return true;
      }

      // Secondary check: group.college (object)
      if (group.college && typeof group.college === 'object') {
        const groupCollegeId = group.college.id || group.college.cid;
        if (Number(groupCollegeId) === Number(systemManagerCollegeId)) {
          console.log('Group matched by college object:', group.group_id || group.id, groupCollegeId);
          return true;
        }
      }

      // Tertiary check: department affiliation
      if (group.department_id) {
        const department = departments.find((d: any) => String(d.department_id) === String(group.department_id));
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
            console.log('Group matched by department college:', group.group_id || group.id, deptCollegeId);
            return true;
          }
        }
      }

      // Quaternary check: project affiliation
      if (group.project) {
        const projectId = typeof group.project === 'number' || typeof group.project === 'string' ? group.project : (group.project.project_id || group.project.id);
        const project = projects.find((p: any) => String(p.project_id || p.id) === String(projectId));
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
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة حسابات المستخدمين وصلاحياتهم'
      },
      {
        id: 'roles',
        title: 'الأدوار',
        value: roles.length,
        icon: <FiDatabase />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'تحديد وتعديل أدوار النظام'
      },
      {
        id: 'projects',
        title: 'المشاريع',
        value: filteredProjects.length,
        icon: <FiLayers />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'متابعة مشاريع التخرج المقترحة'
      },
      {
        id: 'groups',
        title: 'المجموعات',
        value: filteredGroups.length,
        icon: <FiUsers />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة مجموعات الطلاب والفرق'
      },
      {
        id: 'universities',
        title: 'الجامعات',
        value: universities.length, // use the state directly
        icon: <FiCompass />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة الجامعات'
      },
      {
        id: 'colleges',
        title: 'الكليات ',
        value: filteredColleges.length,
        icon: <FiHome />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة الكليات '
      },
      {
        id: 'departments',
        title: 'الأقسام',
        value: filteredDepartments.length,
        icon: <FiShield />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة الأقسام '
      },
      {
        id: 'programs',
        title: 'التخصصات',
        value: filteredPrograms.length,
        icon: <FiShield />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
        description: 'إدارة الأقسام '
      },
      {
        id: 'branches',
        title: 'الفروع',
        value: filteredBranches.length,
        icon: <FiCompass />,
        gradient: 'from-[#312583] to-[#4a3fa0]',
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
    <div className="flex h-screen bg-gradient-to-br from-[#f5f3ff] to-[#f0ecff]" dir="rtl">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e] text-white z-[60] transition-transform duration-300 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#312583]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#312583] to-[#4a3fa0] rounded-xl flex items-center justify-center shadow-lg shadow-[#312583]/30">
              <FiActivity size={22} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">نظام الإدارة</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-[#312583]/20 rounded-lg transition-colors"
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
                  setActiveCardPanel(((tab as any).cardPanel as string).trim());
                } else {
                  setActiveTab(tab.id as any);
                  setActiveCardPanel(null);
                }
                setShowManagementContent(false);
                setActiveReport(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${activeTab === tab.id
                ? 'bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white shadow-lg shadow-[#312583]/20'
                : 'text-slate-400 hover:bg-[#312583]/10 hover:text-white'
                }`}
            >
              <span className={`text-lg transition-transform ${activeTab === tab.id ? 'text-white scale-110' : 'group-hover:text-white group-hover:scale-105'}`}>
                {tab.icon}
              </span>
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-gradient-to-r from-[#312583]/20 to-[#4a3fa0]/10 p-4 rounded-2xl border border-[#312583]/30">
            <p className="text-[10px] font-black text-[#312583] uppercase tracking-widest mb-1">المسؤول الحالي</p>
            <p className="text-sm font-bold text-white">مدير النظام</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#312583]/10 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          {/* Left: menu + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-gradient-to-br from-[#312583]/10 to-[#4a3fa0]/10 hover:from-[#312583]/20 hover:to-[#4a3fa0]/20 text-[#312583] rounded-xl transition-all border border-[#312583]/20"
              aria-label="فتح القائمة"
            >
              <FiMenu size={20} />
            </button>

            <h2 className="text-xl font-black text-[#312583]">نظام الإدارة</h2>
          </div>

          {/* Center: tabs */}
          <nav className="hidden lg:flex items-center gap-2 bg-white/50 border border-[#312583]/10 rounded-2xl p-1">
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
                  className={`px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white shadow-lg shadow-[#312583]/20'
                    : 'text-slate-600 hover:bg-white hover:text-[#312583]'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: notifications + menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
              className="relative p-2.5 bg-gradient-to-br from-[#312583]/10 to-[#4a3fa0]/10 hover:from-[#312583]/20 hover:to-[#4a3fa0]/20 text-[#312583] rounded-xl transition-all border border-[#312583]/20"
              aria-label="الإشعارات"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="p-6 space-y-6">
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-[#312583] via-[#4a3fa0] to-[#5d4db8] rounded-3xl p-10 text-white overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black mb-3 flex items-center gap-2">
                    مرحباً بك مجدداً، مدير النظام 
                  </h1>
                  <p className="text-white/90 text-base max-w-2xl leading-relaxed mb-4">
                    إليك نظرة سريعة على حالة النظام اليوم. يمكنك إدارة المستخدمين، المشاريع، والمجموعات من خلال البطاقات أدناه.
                  </p>
                  <div className="flex items-center gap-4 text-white/80">
                    <FiUsers className="text-xl" />
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-white/60">•</span>
                    <span>مدير النظام العام</span>
                  </div>
                </div>
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
                    className="bg-white p-6 rounded-2xl shadow-md border border-[#312583]/10 hover:shadow-xl hover:border-[#312583]/30 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}>
                        {React.cloneElement(card.icon as React.ReactElement, { size: 24 })}
                      </div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">{card.title}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-gradient-to-r from-[#312583]/10 to-[#4a3fa0]/10 text-[#312583] px-3 py-0.5 rounded-full text-[10px] font-bold">نظرة</span>
                        <h3 className="text-3xl font-black text-[#312583]">{card.value}</h3>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Management Panel - Full screen when active */}
          {activeCardPanel && (
            <div className="relative mt-8 p-6">
              {/* Animated background waves */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#312583]/5 to-[#4a3fa0]/5 rounded-3xl"></div>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-[#312583]/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-[#4a3fa0]/10 rounded-full blur-2xl"></div>
                <div className="absolute top-[20px] right-[20px] w-16 h-16 bg-[#312583]/5 rounded-full blur-2xl"></div>
              </div>

              <div className="relative rounded-3xl shadow-2xl border border-white/60 overflow-hidden bg-white">
                {/* Header with back button */}
                <div className="relative p-8 border-b border-[#312583]/10 bg-gradient-to-r from-white to-[#312583]/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#312583]/3 to-[#4a3fa0]/3"></div>
                  <div className="relative flex items-center justify-between">
                    <button
                      onClick={() => setActiveCardPanel(null)}
                      className="group flex items-center gap-3 px-4 py-2 bg-white/80 hover:bg-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-[#312583]/20"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#312583] to-[#4a3fa0] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiChevronLeft size={16} className="text-white" />
                      </div>
                      <span className="font-semibold text-[#312583]">العودة</span>
                    </button>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-[#312583] mb-1">{activeCardPanel}</h3>
                      <p className="text-slate-500 text-sm">اختر نوع العملية المطلوبة</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer for centering */}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Management Card */}
                    <div
                      onClick={() => {
                        setShowManagementContent(true);
                        setActiveReport(null);
                        setShowImportProjects(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-[#312583]/10 hover:shadow-2xl hover:border-[#312583]/30 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#312583]/0 to-[#4a3fa0]/0 group-hover:from-[#312583]/5 group-hover:to-[#4a3fa0]/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#312583]/10 rounded-full group-hover:bg-[#312583]/20 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#4a3fa0]/10 rounded-full group-hover:bg-[#4a3fa0]/20 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#312583] to-[#4a3fa0] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                          <FiDatabase size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-[#312583] mb-3 group-hover:text-[#4a3fa0] transition-colors">
                          إدارة {activeCardPanel}
                        </h4>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض وإدارة جميع {activeCardPanel.toLowerCase()} في النظام، إضافة، تعديل، وحذف البيانات مع إمكانية البحث والتصفية المتقدمة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#312583] bg-[#312583]/10 px-3 py-1 rounded-full">
                            إدارة كاملة
                          </span>
                          <div className="w-8 h-8 bg-[#312583]/10 rounded-full flex items-center justify-center group-hover:bg-[#312583]/20 transition-colors">
                            <FiChevronLeft size={14} className="text-[#312583]" />
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
                        setShowImportProjects(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-[#312583]/10 hover:shadow-2xl hover:border-[#312583]/30 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4a3fa0]/0 to-[#312583]/0 group-hover:from-[#4a3fa0]/5 group-hover:to-[#312583]/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#4a3fa0]/10 rounded-full group-hover:bg-[#4a3fa0]/20 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#312583]/10 rounded-full group-hover:bg-[#312583]/20 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#4a3fa0] to-[#312583] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                          <FiPieChart size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-[#312583] mb-3 group-hover:text-[#4a3fa0] transition-colors">
                          التقارير والإحصائيات
                        </h4>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض التقارير التفصيلية والإحصائيات المتقدمة لـ {activeCardPanel.toLowerCase()} مع إمكانية التصدير والطباعة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#4a3fa0] bg-[#4a3fa0]/10 px-3 py-1 rounded-full">
                            تقارير متقدمة
                          </span>
                          <div className="w-8 h-8 bg-[#4a3fa0]/10 rounded-full flex items-center justify-center group-hover:bg-[#4a3fa0]/20 transition-colors">
                            <FiChevronLeft size={14} className="text-[#4a3fa0]" />
                          </div>
                        </div>
                      </div>
                    </div>
                      {/* Import Users Card */}
                {activeCardPanel === 'المستخدمون' && (
                  <div
                    onClick={() => navigate('system/import/students')}
                    className="group relative bg-white rounded-2xl p-8 shadow-lg border border-[#312583]/10 hover:shadow-2xl hover:border-[#312583]/30 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                  >
                    {/* Background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#312583]/0 to-[#4a3fa0]/0 group-hover:from-[#312583]/5 group-hover:to-[#4a3fa0]/5 transition-all duration-500 rounded-2xl"></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[#312583] to-[#4a3fa0] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                        <FiDownload size={28} className="text-white" />
                      </div>

                      {/* Title */}
                      <h4 className="text-xl font-black text-[#312583] mb-3">
                        استيراد المستخدمين
                      </h4>

                      {/* Description */}
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        استيراد المستخدمين من ملفات Excel أو CSV وإضافتهم للنظام دفعة واحدة.
                      </p>

                      {/* Indicator */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#312583] bg-[#312583]/10 px-3 py-1 rounded-full">
                          استيراد دفعي
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                    {/* Import Projects Card - NEW */}
                    {activeCardPanel === 'المشاريع' && (
                      <div
                        onClick={() => {
                          setShowImportProjects(true);
                          setShowManagementContent(false);
                          setActiveReport(null);
                        }}
                        className="group relative bg-white rounded-2xl p-8 shadow-lg border border-[#312583]/10 hover:shadow-2xl hover:border-[#312583]/30 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                      >
                        {/* Card background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#312583]/0 to-[#4a3fa0]/0 group-hover:from-[#312583]/5 group-hover:to-[#4a3fa0]/5 transition-all duration-500 rounded-2xl"></div>

                        {/* Animated wave effect */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#312583]/10 rounded-full group-hover:bg-[#312583]/20 transition-all duration-700 transform group-hover:scale-150"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#4a3fa0]/10 rounded-full group-hover:bg-[#4a3fa0]/20 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                        <div className="relative z-10">
                          {/* Icon */}
                          <div className="w-16 h-16 bg-gradient-to-br from-[#312583] to-[#4a3fa0] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                            <FiDownload size={28} className="text-white" />
                          </div>

                          {/* Title */}
                          <h4 className="text-xl font-black text-[#312583] mb-3 group-hover:text-[#4a3fa0] transition-colors">
                            استيراد المشاريع
                          </h4>

                          {/* Description */}
                          <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            استيراد مشاريع جديدة من ملفات Excel أو CSV، مع التحقق من البيانات والتحديثات الدفعية.
                          </p>

                          {/* Action indicator */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#312583] bg-[#312583]/10 px-3 py-1 rounded-full">
                              استيراد دفعي
                            </span>
                            <div className="w-8 h-8 bg-[#312583]/10 rounded-full flex items-center justify-center group-hover:bg-[#312583]/20 transition-colors">
                              <FiChevronLeft size={14} className="text-[#312583]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            
            
    

              {/* Content below cards */}
              <div className="mt-8">
                {renderManagementContent()}
                {renderReport()}
                {showImportProjects && (
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#312583]/10">
                    <h3 className="text-2xl font-black text-[#312583] mb-4">استيراد المشاريع</h3>
                    <p className="text-slate-600 mb-6">قسم استيراد المشاريع قيد التطوير. سيتم إضافة واجهة لاستيراد المشاريع من ملفات Excel قريباً.</p>
                    <button
                      onClick={() => navigate("/dashboard/system-manager/import-projects")}
                      className="px-6 py-3 bg-gradient-to-r from-[#312583] to-[#4a3fa0] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#312583]/30 transition-all duration-200"
                    >
                      الذهاب إلى صفحة الاستيراد
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'home' && (
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'users' && <UsersTable filteredUsers={filteredUsers} />}
              {activeTab === 'groups' && <GroupsTable />}
              {activeTab === 'projects' && <ProjectsTable />}
              {activeTab === 'approvals' && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-[#312583]/10 shadow-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#312583]/10 to-[#4a3fa0]/10 text-[#312583] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiFileText size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-[#312583] mb-2">قسم الموافقات</h3>
                  <p className="text-slate-500 max-w-md mx-auto">هذا القسم قيد التطوير حالياً وسيكون متاحاً قريباً لإدارة طلبات الموافقة.</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-[#312583]/10 shadow-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSettings size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-[#312583] mb-2">إعدادات النظام</h3>
                  <p className="text-slate-500 max-w-md mx-auto">تخصيص إعدادات النظام، التنبيهات، والخيارات العامة.</p>
                </div>
              )}
            </div>
          )}
          {/* Import Projects Modal */}
{/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 w-80 shadow-2xl relative border border-[#312583]/10">
                <h3 className="text-lg font-black text-[#312583] mb-4 text-center">اختر نوع الاستيراد</h3>

                <div className="flex flex-col gap-4">
                  {/* Full Import */}
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      navigate('/sysmanager-import-projects'); // FULL import page
                    }}
                    className="w-full bg-gradient-to-r from-[#312583] to-[#4a3fa0] hover:shadow-lg hover:shadow-[#312583]/30 text-white py-2 rounded-xl font-semibold transition-all duration-200"
                  >
                    الذهاب إلى صفحة الاستيراد
                  </button>

                  {/* Single Row Import */}
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      navigate('/sysmanager-import-single-project'); // SINGLE row import page
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white py-2 rounded-xl font-semibold transition-all duration-200"
                  >
                    استيراد صف واحد
                  </button>
                </div>

                <button
                  onClick={() => setShowImportModal(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-[#312583] transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
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
