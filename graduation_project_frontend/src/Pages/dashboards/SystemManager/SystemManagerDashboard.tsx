import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsStore, useAuthStore } from "../../../store/useStore";
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
} from "react-icons/fi";

import { userService } from "../../../services/userService";
import { roleService } from "../../../services/roleService";
import { projectService } from "../../../services/projectService";
import { groupService } from "../../../services/groupService";
import { fetchTableFields } from "../../../services/bulkService";
import { programService } from "../../../services/programService";
import { branchService } from "../../../services/branchService";

import NotificationsPanel from "../../../components/notifications/NotificationsPanel";

import UsersTable from "./UsersTable";
import RolesTable from "./RolesTable";
import GroupsTable from "./GroupsTable";
import UsersReport from "./UsersReport";
import ProjectReport from "./ProjectReport";
import GroupsReport from "./GroupsReport";
import ProjectsTable from "./ProjectTable";

import UniversitiesTable from "./UniversitiesTable.tsx";
import CollegesTable from "./CollegeTable.tsx";
import DepartmentsTable from "./DepartmentsTable.tsx";
import ProgramsTable from "./ProgramTable.tsx";
import Branches from "./BranchTable";

import collegeServices from "../../../services/collegeServices.ts";
import universityService from "../../../services/universityService.ts";

const SystemManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "home" | "users" | "projects" | "groups" | "approvals" | "settings"
  >("home");

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

  /* ==========================
     Fetch Data
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settled = await Promise.allSettled([
          userService.getAllUsers(),
          roleService.getAllRoles(),
          projectService.getProjects(),
          groupService.getGroups(),
          userService.getAffiliations(),
          fetchTableFields("departments"),
          collegeServices.getColleges(),
          fetchTableFields("universities"),
          fetchTableFields("programs"),
          fetchTableFields("branches"),
        ]);

        const results = settled.map((s) =>
          s.status === "fulfilled" ? (s as any).value : null
        );

        const [
          fetchedUsers,
          fetchedRoles,
          fetchedProjectsRaw,
          fetchedGroups,
          fetchedAffiliations,
          fetchedDepartments,
          fetchedColleges,
          fetchedUniversities,
          fetchedPrograms,
          fetchedBranches,
        ] = results;

        settled.forEach((s, idx) => {
          if (s.status === "rejected") console.warn("fetch failed idx", idx, (s as any).reason);
        });

        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
        setProjects(
          Array.isArray(fetchedProjectsRaw)
            ? fetchedProjectsRaw
            : fetchedProjectsRaw?.results || []
        );
        setGroups(
          Array.isArray(fetchedGroups) ? fetchedGroups : fetchedGroups?.results || []
        );
        setAffiliations(
          Array.isArray(fetchedAffiliations)
            ? fetchedAffiliations
            : fetchedAffiliations?.results || []
        );
        setDepartments(
          Array.isArray(fetchedDepartments)
            ? fetchedDepartments
            : fetchedDepartments?.results || []
        );

        const normalizeBulk = (v: any, preferredKey?: string) => {
          if (!v) return [];
          if (Array.isArray(v)) return v;
          if (typeof v !== "object") return [];

          if (preferredKey && v[preferredKey]) {
            if (Array.isArray(v[preferredKey])) return v[preferredKey];
            if (v[preferredKey].results && Array.isArray(v[preferredKey].results))
              return v[preferredKey].results;
          }

          if (Array.isArray(v.results)) return v.results;

          const arraysFound: any[] = [];
          const visit = (obj: any) => {
            if (!obj || typeof obj !== "object") return;
            if (Array.isArray(obj)) {
              arraysFound.push(obj);
              return;
            }
            for (const k of Object.keys(obj)) visit(obj[k]);
          };
          visit(v);

          if (arraysFound.length === 0) {
            const objVals = Object.values(v).filter(
              (x: any) => x && typeof x === "object" && !Array.isArray(x)
            );
            if (objVals.length > 0) return objVals;
            return [];
          }

          arraysFound.sort((a, b) => b.length - a.length);
          return arraysFound[0];
        };

        // Universities (direct service)
        let normUniversities: any[] = [];
        try {
          const fetched = await universityService.getUniversities();
          if (Array.isArray(fetched)) normUniversities = fetched;
          else if (fetched?.results && Array.isArray(fetched.results))
            normUniversities = fetched.results;
        } catch (e) {
          console.warn("Failed to fetch universities", e);
          normUniversities = [];
        }
        setUniversities(normUniversities);

        let normColleges = normalizeBulk(fetchedColleges, "colleges");
        let normPrograms = normalizeBulk(fetchedPrograms, "programs");
        let normBranches = normalizeBulk(fetchedBranches, "branches");

        // Fallback direct services
        try {
          if (!Array.isArray(normPrograms) || normPrograms.length === 0) {
            const ps = await programService.getPrograms();
            if (Array.isArray(ps) && ps.length) normPrograms = ps;
          }
        } catch (e) {
          console.warn("programService fallback failed", e);
        }

        try {
          if (!Array.isArray(normBranches) || normBranches.length === 0) {
            const bs = await branchService.getBranches();
            if (Array.isArray(bs) && bs.length) normBranches = bs;
          }
        } catch (e) {
          console.warn("branchService fallback failed", e);
        }

        setColleges(Array.isArray(normColleges) ? normColleges : []);
        setPrograms(Array.isArray(normPrograms) ? normPrograms : []);
        setBranches(Array.isArray(normBranches) ? normBranches : []);
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
    if (!user?.id || !affiliations.length) return (user as any)?.college_id || null;

    const smAffiliation = affiliations.find((aff: any) => String(aff.user_id) === String(user.id));
    if (smAffiliation) {
      if (typeof smAffiliation.college === "number") return smAffiliation.college;
      if (typeof smAffiliation.college === "object" && smAffiliation.college)
        return smAffiliation.college.id || smAffiliation.college.cid;
      if (smAffiliation.college_id) return smAffiliation.college_id;
    }

    const deptAffiliation = affiliations.find(
      (aff: any) => String(aff.user_id) === String(user.id) && aff.department_id
    );
    if (deptAffiliation?.department_id) {
      const department = departments.find(
        (d: any) => String(d.department_id) === String(deptAffiliation.department_id)
      );
      if (department) {
        if (typeof department.college === "number") return department.college;
        if (typeof department.college === "object" && department.college)
          return department.college.id || department.college.cid;
        if (department.college_id) return department.college_id;
      }
    }

    if ((user as any)?.college_id) return (user as any).college_id;
    return null;
  };

  /* ==========================
     Filtered Data
  ========================== */
  const systemManagerCollegeId = useMemo(
    () => getSystemManagerCollegeId(),
    [affiliations, departments, user]
  );

  const filteredUsers = useMemo(() => {
    if (!systemManagerCollegeId) return users;

    return users.filter((u: any) => {
      if (u.college_id && Number(u.college_id) === Number(systemManagerCollegeId)) return true;

      const userAffiliation = affiliations.find((aff: any) => String(aff.user_id) === String(u.id));
      if (userAffiliation) {
        let userCollegeId = null;
        if (typeof userAffiliation.college === "number") userCollegeId = userAffiliation.college;
        else if (typeof userAffiliation.college === "object" && userAffiliation.college)
          userCollegeId = userAffiliation.college.id || userAffiliation.college.cid;
        else if (userAffiliation.college_id) userCollegeId = userAffiliation.college_id;

        if (userCollegeId && Number(userCollegeId) === Number(systemManagerCollegeId)) return true;
      }

      const deptAffiliation = affiliations.find(
        (aff: any) => String(aff.user_id) === String(u.id) && aff.department_id
      );
      if (deptAffiliation?.department_id) {
        const department = departments.find(
          (d: any) => String(d.department_id) === String(deptAffiliation.department_id)
        );
        if (department) {
          let deptCollegeId: any = department.college || department.college_id;
          if (deptCollegeId && typeof deptCollegeId === "object")
            deptCollegeId = deptCollegeId.id || deptCollegeId.cid;

          if (deptCollegeId && Number(deptCollegeId) === Number(systemManagerCollegeId)) return true;
        }
      }

      return false;
    });
  }, [users, affiliations, departments, systemManagerCollegeId]);

  // ✅ FIXED VERSION (no crash)
  const filteredProjects = useMemo(() => {
    const usersById = new Map<any, any>(users.map((u: any) => [u.id, u]));

    const enriched = projects.map((project: any) => {
      const pid = project.project_id || project.id || null;

      const linkedGroup = groups.find((g: any) => {
        if (!g) return false;
        const gp =
          typeof g.project === "number" || typeof g.project === "string"
            ? g.project
            : g.project && (g.project.project_id || g.project.id);
        return gp != null && pid != null && String(gp) === String(pid);
      });

      let supervisorId = project.supervisor || project.supervisor_id;
      if (supervisorId && typeof supervisorId === "object") supervisorId = supervisorId.id || supervisorId.user_id;
      const supervisor = supervisorId ? usersById.get(supervisorId) : null;

      let coSupervisorId = project.co_supervisor || project.co_supervisor_id;
      if (coSupervisorId && typeof coSupervisorId === "object") coSupervisorId = coSupervisorId.id || coSupervisorId.user_id;
      const coSupervisor = coSupervisorId ? usersById.get(coSupervisorId) : null;

      let departmentId = project.department || project.department_id;
      if (departmentId && typeof departmentId === "object") departmentId = departmentId.id || departmentId.department_id;
      const department = departmentId
        ? departments.find((d: any) => String(d.id || d.department_id) === String(departmentId))
        : null;

      let collegeId = project.college || project.college_id;
      if (collegeId && typeof collegeId === "object") collegeId = collegeId.id || collegeId.cid;

      if (!collegeId && linkedGroup) {
        collegeId = linkedGroup.college || linkedGroup.college_id;
        if (collegeId && typeof collegeId === "object") collegeId = collegeId.id || collegeId.cid;
      }

      if (!collegeId && department) {
        collegeId = department.college || department.college_id;
        if (collegeId && typeof collegeId === "object") collegeId = collegeId.id || collegeId.cid;
      }

      const college = collegeId
        ? colleges.find((c: any) => String(c.id || c.cid) === String(collegeId))
        : null;

      return {
        ...project,
        supervisor,
        coSupervisor,
        department,
        college,
        _linkedGroup: linkedGroup, // ✅ keep for filtering
      };
    });

    if (!systemManagerCollegeId) return enriched;

    return enriched.filter((project: any) => {
      if (project.college && Number(project.college.id || project.college.cid) === Number(systemManagerCollegeId)) {
        return true;
      }

      if (project.department && project.department.college) {
        const deptCollegeId = project.department.college.id || project.department.college.cid;
        if (Number(deptCollegeId) === Number(systemManagerCollegeId)) return true;
      }

      const lg = project._linkedGroup;
      if (lg && (lg.college || lg.college_id)) {
        let groupCollegeId: any = lg.college || lg.college_id;
        if (groupCollegeId && typeof groupCollegeId === "object") groupCollegeId = groupCollegeId.id || groupCollegeId.cid;
        if (Number(groupCollegeId) === Number(systemManagerCollegeId)) return true;
      }

      return false;
    });
  }, [projects, groups, users, departments, colleges, systemManagerCollegeId]);

  const filteredColleges = useMemo(() => {
    if (!systemManagerCollegeId) return colleges;
    return colleges.filter((c: any) => Number(c.id || c.cid) === Number(systemManagerCollegeId));
  }, [colleges, systemManagerCollegeId]);

  const filteredDepartments = useMemo(() => {
    if (!systemManagerCollegeId) return departments;
    return departments.filter((d: any) => {
      let deptCollegeId: any = d.college || d.college_id;
      if (deptCollegeId && typeof deptCollegeId === "object") deptCollegeId = deptCollegeId.id || deptCollegeId.cid;
      return Number(deptCollegeId) === Number(systemManagerCollegeId);
    });
  }, [departments, systemManagerCollegeId]);

  const filteredUniversities = useMemo(() => universities, [universities]);

  const filteredPrograms = useMemo(() => {
    if (!systemManagerCollegeId) return programs;
    return programs.filter((p: any) => {
      let progCollegeId: any = p.college || p.college_id;
      if (progCollegeId && typeof progCollegeId === "object") progCollegeId = progCollegeId.id || progCollegeId.cid;
      return Number(progCollegeId) === Number(systemManagerCollegeId);
    });
  }, [programs, systemManagerCollegeId]);

  const filteredBranches = useMemo(() => {
    if (!systemManagerCollegeId) return branches;
    return branches.filter((b: any) => {
      let branchCollegeId: any = b.college || b.college_id;
      if (branchCollegeId && typeof branchCollegeId === "object") branchCollegeId = branchCollegeId.id || branchCollegeId.cid;
      return Number(branchCollegeId) === Number(systemManagerCollegeId);
    });
  }, [branches, systemManagerCollegeId]);

  const filteredGroups = useMemo(() => {
    if (!systemManagerCollegeId) return groups;

    return groups.filter((group: any) => {
      if (group.college_id && Number(group.college_id) === Number(systemManagerCollegeId)) return true;

      if (group.college && typeof group.college === "object") {
        const groupCollegeId = group.college.id || group.college.cid;
        if (Number(groupCollegeId) === Number(systemManagerCollegeId)) return true;
      }

      if (group.department_id) {
        const department = departments.find((d: any) => String(d.department_id) === String(group.department_id));
        if (department) {
          let deptCollegeId: any = department.college || department.college_id;
          if (deptCollegeId && typeof deptCollegeId === "object") deptCollegeId = deptCollegeId.id || deptCollegeId.cid;
          if (deptCollegeId && Number(deptCollegeId) === Number(systemManagerCollegeId)) return true;
        }
      }

      return false;
    });
  }, [groups, departments, systemManagerCollegeId]);

  /* ==========================
     Dashboard Cards
  ========================== */
  const dashboardCards = useMemo(() => {
    return [
      { id: "users", title: "المستخدمون", value: filteredUsers.length, icon: <FiUsers />, gradient: "from-blue-500 to-blue-700", description: "إدارة حسابات المستخدمين وصلاحياتهم" },
      { id: "roles", title: "الأدوار", value: roles.length, icon: <FiDatabase />, gradient: "from-blue-500 to-blue-700", description: "تحديد وتعديل أدوار النظام" },
      { id: "projects", title: "المشاريع", value: filteredProjects.length, icon: <FiLayers />, gradient: "from-blue-500 to-blue-700", description: "متابعة مشاريع التخرج المقترحة" },
      { id: "groups", title: "المجموعات", value: filteredGroups.length, icon: <FiUsers />, gradient: "from-blue-500 to-blue-700", description: "إدارة مجموعات الطلاب والفرق" },
      { id: "universities", title: "الجامعات", value: filteredUniversities.length, icon: <FiCompass />, gradient: "from-blue-500 to-blue-700", description: "إدارة الجامعات" },
      { id: "colleges", title: "الكليات", value: filteredColleges.length, icon: <FiHome />, gradient: "from-blue-500 to-blue-700", description: "إدارة الكليات" },
      { id: "departments", title: "الأقسام", value: filteredDepartments.length, icon: <FiShield />, gradient: "from-blue-500 to-blue-700", description: "إدارة الأقسام" },
      { id: "programs", title: "التخصصات", value: filteredPrograms.length, icon: <FiShield />, gradient: "from-blue-500 to-blue-700", description: "إدارة التخصصات" },
      { id: "branches", title: "الفروع", value: filteredBranches.length, icon: <FiCompass />, gradient: "from-blue-500 to-blue-700", description: "إدارة الفروع" },
    ];
  }, [
    filteredUsers,
    roles,
    filteredProjects,
    filteredGroups,
    filteredColleges,
    filteredDepartments,
    filteredUniversities,
    filteredPrograms,
    filteredBranches,
  ]);

  /* ==========================
     Render Management Content
  ========================== */
  const renderManagementContent = () => {
    if (!activeCardPanel || !showManagementContent) return null;

    switch (activeCardPanel) {
      case "المستخدمون":
        return <UsersTable filteredUsers={filteredUsers} />;
      case "الأدوار":
        return <RolesTable />;
      case "المجموعات":
        return <GroupsTable filteredGroups={filteredGroups} />;
      case "المشاريع":
        return (
          <div className="mt-6">
            <ProjectsTable filteredProjects={filteredProjects} />
          </div>
        );
      case "الجامعات":
        return <UniversitiesTable />;
      case "الكليات":
        return <CollegesTable />;
      case "الأقسام":
        return <DepartmentsTable />;
      case "التخصصات":
        return <ProgramsTable />;
      case "الفروع":
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
      case "users":
        return <UsersReport filteredUsers={filteredUsers} />;
      case "projects":
        return <ProjectReport filteredProjects={filteredProjects} />;
      case "groups":
        return <GroupsReport filteredGroups={filteredGroups} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-80 bg-[#0F172A] text-white z-[60] transition-transform duration-300 ease-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiActivity size={22} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">نظام الإدارة</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <nav className="mt-4 space-y-2">
          {[
            { id: "home", label: "الرئيسية", icon: <FiHome /> },
            { id: "users", label: "المستخدمون", icon: <FiUsers />, cardPanel: "المستخدمون" },
            { id: "projects", label: "المشاريع", icon: <FiLayers />, cardPanel: "المشاريع" },
            { id: "groups", label: "المجموعات", icon: <FiUsers />, cardPanel: "المجموعات" },
            { id: "approvals", label: "الموافقات", icon: <FiFileText /> },
            { id: "settings", label: "الإعدادات", icon: <FiSettings /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "home") {
                  setActiveTab("home");
                  setActiveCardPanel(null);
                } else if ((tab as any).cardPanel) {
                  setActiveTab("home");
                  setActiveCardPanel(((tab as any).cardPanel as string).trim());
                } else {
                  setActiveTab(tab.id as any);
                  setActiveCardPanel(null);
                }
                setShowManagementContent(false);
                setActiveReport(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className={`${activeTab === tab.id ? "text-white" : "group-hover:text-white"}`}>{tab.icon}</span>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
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

          {/* ✅ FIX: tabs text visible */}
          <nav className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
            {[
              { id: "home", label: "الرئيسية" },
              { id: "users", label: "المستخدمون", cardPanel: "المستخدمون" },
              { id: "projects", label: "المشاريع", cardPanel: "المشاريع" },
              { id: "groups", label: "المجموعات", cardPanel: "المجموعات" },
              { id: "approvals", label: "الموافقات" },
              { id: "settings", label: "الإعدادات" },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "home") {
                      setActiveTab("home");
                      setActiveCardPanel(null);
                    } else if ((item as any).cardPanel) {
                      setActiveTab("home");
                      setActiveCardPanel(((item as any).cardPanel as string).trim());
                    } else {
                      setActiveTab(item.id as any);
                      setActiveCardPanel(null);
                    }
                    setShowManagementContent(false);
                    setActiveReport(null);
                  }}
                  className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                    active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
              aria-label="الإشعارات"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "home" && (
            <div className="p-6 space-y-6">
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
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full" />
              </div>

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
                        <span className="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-[10px] font-bold">
                          نظرة
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
                      </div>
                      <p className="text-slate-400 text-[10px]">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCardPanel && (
            <div className="relative mt-8">
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/10 to-indigo-50/10 rounded-3xl"></div>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-200/10 rounded-full"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-indigo-200/10 rounded-full"></div>
                <div className="absolute top-[20px] right-[20px] w-16 h-16 bg-cyan-200/10 rounded-full"></div>
              </div>

              <div className="relative rounded-3xl shadow-xl border border-white/50 overflow-hidden">
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

                    <div className="w-20"></div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div
                      onClick={() => {
                        setShowManagementContent(true);
                        setActiveReport(null);
                        setShowImportProjects(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <FiDatabase size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-3">إدارة {activeCardPanel}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض وإدارة جميع {String(activeCardPanel)} في النظام.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        if (activeCardPanel === "المجموعات") setActiveReport("groups");
                        else if (activeCardPanel === "المشاريع") setActiveReport("projects");
                        else setActiveReport("users");
                        setShowManagementContent(false);
                        setShowImportProjects(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <FiPieChart size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-3">التقارير والإحصائيات</h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض التقارير التفصيلية والإحصائيات المتقدمة لـ {String(activeCardPanel)}.
                        </p>
                      </div>
                    </div>

                    {activeCardPanel === "المشاريع" && (
                      <div
                        onClick={() => {
                          setShowImportProjects(true);
                          setShowManagementContent(false);
                          setActiveReport(null);
                        }}
                        className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                      >
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <FiDownload size={28} className="text-white" />
                          </div>
                          <h4 className="text-xl font-black text-slate-800 mb-3">استيراد المشاريع</h4>
                          <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            الذهاب إلى صفحة الاستيراد الخاصة بالمشاريع.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {renderManagementContent()}
                {renderReport()}
                {showImportProjects && (
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-800 mb-4">استيراد المشاريع</h3>
                    <p className="text-slate-600 mb-6">
                      يمكنك الآن الذهاب لصفحة استيراد المشاريع من Excel.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/system-manager/import-projects")}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      الذهاب إلى صفحة الاستيراد
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== "home" && (
            <div className="p-6">
              {activeTab === "users" && <UsersTable filteredUsers={filteredUsers} />}
              {activeTab === "groups" && <GroupsTable filteredGroups={filteredGroups} />}
              {activeTab === "projects" && <ProjectsTable filteredProjects={filteredProjects} />}
              {activeTab === "approvals" && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiFileText size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">قسم الموافقات</h3>
                  <p className="text-slate-500 max-w-md mx-auto">هذا القسم قيد التطوير حالياً.</p>
                </div>
              )}
              {activeTab === "settings" && (
                <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
                  <div className="w-24 h-24 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSettings size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">إعدادات النظام</h3>
                  <p className="text-slate-500 max-w-md mx-auto">هذا القسم قيد التطوير حالياً.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <NotificationsPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default SystemManagerDashboard;