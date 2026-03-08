import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, useNotificationsStore } from '../../../store/useStore';
import {
  FiFileText, FiUsers, FiLayers, FiMenu, FiX, FiHome,
  FiChevronRight, FiActivity, FiSettings, FiChevronLeft, FiPieChart, FiDatabase, FiBell
} from 'react-icons/fi';
import { userService } from '../../../services/userService';
import { projectService } from '../../../services/projectService';
import { groupService } from '../../../services/groupService';
import { fetchTableFields } from '../../../services/bulkService';
import NotificationsPanel from '../../../components/notifications/NotificationsPanel';
import { useNotifications } from '../../../hooks/useNotifications';
import UsersTable from './StudentTable';
import RolesTable from '../ministry/RolesTable';
import GroupsTable from './GroupsTable';
import UsersReport from './StudentReportPage';
import ProjectReport from './ProjectReport';
import GroupsReport from './GroupsReport';
import ProjectsTable from './ProjectTable';
import SupervisorTable from './SupervisorsTable'
import COSupervisorTable from './CoSupervisorsTable'
import Supervisorreports from './SupervisorsReportPage'
import CoSupervisorreports from './CoSupervisorsReportPage'
const DepartmentHeadDashboard: React.FC = () => {
  try {
    const { user } = useAuthStore();
    const { notifications } = useNotificationsStore();
    useNotifications();

  const [activeTab, setActiveTab] = useState<'home' | 'users' | 'projects' | 'groups' | 'approvals' | 'settings'>('home');
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCardPanel, setActiveCardPanel] = useState<string | null>(null);
  const [showManagementContent, setShowManagementContent] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  /* ==========================
     Fetch Data (like Dean)
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
  fetchedStudents,
  fetchedProjects,
  fetchedGroups,
  fetchedAffiliations,
  fetchedDepartments
] = await Promise.all([
  fetchTableFields('students').catch(err => {
    console.error('Error fetching students:', err);
    return [];
  }),

  projectService.getProject().catch(err => {
    console.error('Error fetching projects:', err);
    return [];
  }),

  groupService.getGroups().catch(err => {
    console.error('Error fetching groups:', err);
    return [];
  }),

  fetchTableFields('affiliations').catch(err => {
    console.error('Error fetching affiliations:', err);
    return [];
  }),

  fetchTableFields('departments').catch(err => {
    console.error('Error fetching departments:', err);
    return [];
  })
]);

setUsers(Array.isArray(fetchedStudents) ? fetchedStudents : []);
setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
setAffiliations(Array.isArray(fetchedAffiliations) ? fetchedAffiliations : []);
setDepartments(Array.isArray(fetchedDepartments) ? fetchedDepartments : []);

        setUsers(Array.isArray(fetchedStudents) ? fetchedStudents : []);
        setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
        setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
        setAffiliations(Array.isArray(fetchedAffiliations) ? fetchedAffiliations : []);
        setDepartments(Array.isArray(fetchedDepartments) ? fetchedDepartments : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set empty arrays as fallback
        setUsers([]);
        setProjects([]);
        setGroups([]);
        setAffiliations([]);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ==========================
     Helper Functions (department-based instead of college-based)
  ========================== */
  const getDepartmentHeadDepartmentId = (): number | null => {
    try {
      if (!user?.id || !Array.isArray(affiliations) || affiliations.length === 0) return null;

      // Find department head's affiliation
      const deptHeadAffiliation = affiliations.find((aff: any) => aff && typeof aff === 'object' && aff.user_id === user.id);
      if (deptHeadAffiliation && typeof deptHeadAffiliation === 'object' && deptHeadAffiliation.department_id) {
        return deptHeadAffiliation.department_id;
      }

      return null;
    } catch (error) {
      console.error('Error in getDepartmentHeadDepartmentId:', error);
      return null;
    }
  };

  /* ==========================
     Filtered Data (department-based filtering)
  ========================== */
  const departmentHeadDepartmentId = getDepartmentHeadDepartmentId();

  console.log('Department Head Dashboard - departmentHeadDepartmentId:', departmentHeadDepartmentId);
  console.log('Department Head Dashboard - affiliations sample:', affiliations.slice(0, 3));
  console.log('Department Head Dashboard - users sample:', users.slice(0, 3));
  console.log('Department Head Dashboard - projects sample:', projects.slice(0, 3));
  console.log('Department Head Dashboard - groups sample:', groups.slice(0, 3));

  const filteredStudents = useMemo(() => {
  if (!departmentHeadDepartmentId || !users.length || !affiliations.length) return [];

  const result = users.filter((u: any) => {
    if (!u?.roles) return false;

    const aff = affiliations.find((a: any) => a.user_id === u.id);

    const isStudent = u.roles.some(
      (r: any) => r?.type?.toLowerCase() === "student"
    );

    return isStudent && aff?.department_id === departmentHeadDepartmentId;
  });

  return result;
}, [users, affiliations, departmentHeadDepartmentId]);

  const filteredProjects = useMemo(() => {
    if (!departmentHeadDepartmentId) return [];
    const result = projects.filter((project: any) => {
      if (!project) return false;

      // Check if project belongs to department head's department
      let projectDepartmentId = null;

      if (typeof project.department === 'number') {
        // Department is serialized as primary key (integer)
        projectDepartmentId = project.department;
      } else if (typeof project.department === 'object' && project.department) {
        // Department is serialized as object
        projectDepartmentId = project.department.id || project.department.department_id;
      } else if (project.department_id) {
        // Direct department_id field
        projectDepartmentId = project.department_id;
      }

      console.log('Project department check:', project.project_id || project.id, 'department field:', project.department, 'extracted ID:', projectDepartmentId, 'dept head department:', departmentHeadDepartmentId);
      return projectDepartmentId === departmentHeadDepartmentId;
    });
    console.log('Department Head Dashboard - filteredProjects count:', result.length);
    return result;
  }, [projects, departmentHeadDepartmentId]);

  const filteredSupervisors = useMemo(() => {
    if (!departmentHeadDepartmentId) return [];
    const result = users.filter((user: any) => {
      if (!user || !user.roles || !Array.isArray(user.roles)) return false;

      const userAffiliation = affiliations.find((aff: any) => aff && aff.user_id === user.id);
      if (!userAffiliation || !userAffiliation.department_id) return false;

      const hasSupervisorRole = user.roles.some((role: any) =>
        role && role.type && (role.type.toLowerCase() === 'supervisor' || role.type.toLowerCase() === 'مشرف')
      );
      return hasSupervisorRole && userAffiliation.department_id === departmentHeadDepartmentId;
    });
    console.log('Department Head Dashboard - filteredSupervisors count:', result.length);
    return result;
  }, [users, affiliations, departmentHeadDepartmentId]);

  const filteredCoSupervisors = useMemo(() => {
    if (!departmentHeadDepartmentId) return [];
    const result = users.filter((user: any) => {
      if (!user || !user.roles || !Array.isArray(user.roles)) return false;

      const userAffiliation = affiliations.find((aff: any) => aff && aff.user_id === user.id);
      if (!userAffiliation || !userAffiliation.department_id) return false;

      const hasCoSupervisorRole = user.roles.some((role: any) =>
        role && role.type && (
          role.type.toLowerCase() === 'co_supervisor' ||
          role.type.toLowerCase() === 'co-supervisor' ||
          role.type.toLowerCase() === 'مشرف مشارك'
        )
      );
      console.log('Co-supervisor check:', user.id, user.roles, hasCoSupervisorRole, userAffiliation?.department_id);
      return hasCoSupervisorRole && userAffiliation.department_id === departmentHeadDepartmentId;
    });
    console.log('Department Head Dashboard - filteredCoSupervisors count:', result.length);
    return result;
  }, [users, affiliations, departmentHeadDepartmentId]);

  const filteredGroups = useMemo(() => {
    if (!departmentHeadDepartmentId) return [];
    const result = groups.filter((group: any) => {
      if (!group) return false;

      // Check if group's department matches department head's department
      if (group.department) {
        const groupDepartmentId = typeof group.department === 'object' ?
          (group.department.id || group.department.department_id) :
          group.department;

        console.log('Group department check:', group.group_id || group.id, 'department:', groupDepartmentId, 'dept head department:', departmentHeadDepartmentId);
        return groupDepartmentId === departmentHeadDepartmentId;
      }

      // Fallback: check if group's project belongs to department head's department
      if (group.project) {
        const relatedProject = projects.find((p: any) => p && (p.project_id === group.project || p.id === group.project));
        if (relatedProject) {
          let projectDepartmentId = null;
          if (typeof relatedProject.department === 'number') {
            projectDepartmentId = relatedProject.department;
          } else if (typeof relatedProject.department === 'object' && relatedProject.department) {
            projectDepartmentId = relatedProject.department.id || relatedProject.department.department_id;
          } else if (relatedProject.department_id) {
            projectDepartmentId = relatedProject.department_id;
          }
          return projectDepartmentId === departmentHeadDepartmentId;
        }
      }

      return false;
    });
    console.log('Department Head Dashboard - filteredGroups count:', result.length);
    return result;
  }, [groups, projects, departmentHeadDepartmentId]);

  /* ==========================
     Dashboard Cards
  ========================== */
  const dashboardCards = useMemo(() => {
    return [
      {
        id: 'users',
        title: 'الطلاب',
        value: filteredStudents.length,
        icon: <FiUsers />,
        gradient: 'from-blue-500 to-blue-700',
        description: 'إدارة الطلاب في القسم'
      },
      {
        id: 'supervisors',
        title: 'المشرفون',
        value: filteredSupervisors.length,
        icon: <FiUsers />,
        gradient: 'from-green-500 to-green-700',
        description: 'المشرفون في القسم'
      },
      {
        id: 'co-supervisors',
        title: 'المشرفون المساعدون',
        value: filteredCoSupervisors.length,
        icon: <FiUsers />,
        gradient: 'from-teal-500 to-teal-700',
        description: 'المشرفون المساعدون في القسم'
      },
      {
        id: 'projects',
        title: 'المشاريع',
        value: filteredProjects.length,
        icon: <FiLayers />,
        gradient: 'from-purple-500 to-purple-700',
        description: 'مشاريع القسم'
      },
      {
        id: 'groups',
        title: 'المجموعات',
        value: filteredGroups.length,
        icon: <FiUsers />,
        gradient: 'from-orange-500 to-orange-700',
        description: 'مجموعات القسم'
      }
    ];
  }, [filteredStudents, filteredSupervisors, filteredCoSupervisors, filteredProjects, filteredGroups]);

  /* ==========================
     Render Management Content
  ========================== */
  const renderManagementContent = () => {
    if (!activeCardPanel || !showManagementContent) return null;

    switch (activeCardPanel) {
      case 'الطلاب':
        return <UsersTable />;
      case 'المشرفون':
        return <SupervisorTable departmentId={departmentHeadDepartmentId} />;

      case 'المشرفون المساعدون':
       return <COSupervisorTable departmentId={departmentHeadDepartmentId} />;

      case 'المجموعات':
        return <GroupsTable departmentId={departmentHeadDepartmentId} />;
      case 'المشاريع':
        return (
          <div className="mt-6">
            <ProjectsTable departmentId={departmentHeadDepartmentId} />
          </div>
        );
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
      case 'users': return <UsersReport />;
      case 'supervisors': return <Supervisorreports />;
      case 'co-supervisors': return <CoSupervisorreports />;
      case 'projects': return <ProjectReport />;
      case 'groups': return <GroupsReport />;
      default: return null;
    }
  };
  

  if (loading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#0E4C92] rounded-full flex items-center justify-center mb-4 mx-auto">
            <FiActivity size={32} className="text-white animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#0E4C92] mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">يتم تحميل بيانات لوحة رئيس القسم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white" dir="rtl">
      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-80 bg-white text-[#0E4C92] z-[60] transition-transform duration-300 ease-out shadow-lg border-l border-gray-200 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0E4C92] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiActivity size={22} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-[#0E4C92]">لوحة رئيس القسم</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <nav className="mt-4 space-y-2">
          {[
            { id: 'home', label: 'الرئيسية', icon: <FiHome /> },
            { id: 'users', label: 'المستخدمون', icon: <FiUsers />, cardPanel: 'الطلاب' },
            { id: 'projects', label: 'المشاريع', icon: <FiLayers />, cardPanel: 'المشاريع' },
            { id: 'groups', label: 'المجموعات', icon: <FiUsers />, cardPanel: 'المجموعات' },
            { id: 'approvals', label: 'الموافقات', icon: <FiFileText />, cardPanel: 'الموافقات' },
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
                  setActiveCardPanel(tab.cardPanel);
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
                  ? 'bg-[#0E4C92] text-white'
                  : 'text-gray-700 hover:bg-[#0E4C92]/10 hover:text-[#0E4C92]'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-white' : 'group-hover:text-[#0E4C92]'}`}>
                {tab.icon}
              </span>
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab === tab.id && <FiChevronLeft className="mr-auto" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">رئيس القسم الحالي</p>
            <p className="text-sm font-bold text-[#0E4C92]">{user?.name || 'رئيس القسم'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white text-[#0E4C92] p-4 shadow-lg border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Left Side - Menu Button & Title */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#0E4C92]">
                <FiMenu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <FiActivity size={20} className="text-[#0E4C92]" />
                <span className="font-bold text-lg text-[#0E4C92]">لوحة رئيس القسم</span>
              </div>
            </div>

            {/* Center - Navigation Buttons */}
            <div className="hidden lg:flex gap-4 absolute left-1/2 transform -translate-x-1/2">
              {[
                { id: 'home', label: 'الرئيسية' },
                { id: 'users', label: 'المستخدمون', cardPanel: 'الطلاب' },
                { id: 'projects', label: 'المشاريع', cardPanel: 'المشاريع' },
                { id: 'groups', label: 'المجموعات', cardPanel: 'المجموعات' },
                { id: 'approvals', label: 'الموافقات', cardPanel: 'الموافقات' },
                { id: 'settings', label: 'الإعدادات' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home') {
                      setActiveTab('home');
                      setActiveCardPanel(null);
                    } else if (item.cardPanel) {
                      setActiveTab('home');
                      setActiveCardPanel(item.cardPanel);
                    } else {
                      setActiveTab(item.id as any);
                      setActiveCardPanel(null);
                    }
                    setShowManagementContent(false);
                    setActiveReport(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 text-[#0E4C92] hover:bg-[#0E4C92]/10 ${
                    activeTab === item.id ? 'bg-[#0E4C92] text-white shadow-md' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Side - Notification Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsNotifPanelOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all text-[#0E4C92]"
              >
                <FiBell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="p-6 space-y-6">
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-[#0E4C92] to-[#0E4C92]  rounded-3xl p-10 text-white overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h1 className="text-3xl font-black mb-3 flex items-center gap-2">
                    مرحباً بك مجدداً، رئيس القسم {user?.name || 'المحترم'}!
                  </h1>
                  <p className="text-blue-100 text-base max-w-2xl leading-relaxed mb-4">
                    إليك نظرة سريعة على حالة القسم اليوم. يمكنك إدارة الطلاب، المشرفين، والمجموعات من خلال البطاقات أدناه.
                  </p>
                  <div className="flex items-center gap-4 text-[#0E4C92]/70">
                    <FiUsers className="text-xl" />
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-[#0E4C92]/50">•</span>
                    <span>رئيس {departments.find(d => d.id === departmentHeadDepartmentId)?.name || 'القسم'}</span>
                  </div>
                </div>
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-xl" />
              </div>

              {/* Stats Cards Grid - 5 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {dashboardCards.map((card, i) => (
                  <div key={i} onClick={() => { setActiveCardPanel(card.title); setShowManagementContent(false); setActiveReport(null); }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all cursor-pointer group">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-xl bg-[#0E4C92] text-white flex items-center justify-center mb-4 shadow-md`}>
                        {React.cloneElement(card.icon as React.ReactElement, { size: 24 })}
                      </div>
                      <p className="text-gray-600 text-xs font-medium mb-1">{card.title}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#0E4C92]/10 text-[#0E4C92] px-3 py-0.5 rounded-full text-[10px] font-bold">نظرة</span>
                        <h3 className="text-2xl font-black text-[#0E4C92]">{card.value}</h3>
                      </div>
                      <p className="text-gray-500 text-[10px]">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Management Panel - Full screen when active */}
          {activeCardPanel && (
            <div className="relative mt-8">
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[#0E4C92]/5 rounded-3xl"></div>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-[#0E4C92]/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-[#0E4C92]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-[20px] right-[20px] w-16 h-16 bg-[#0E4C92]/10 rounded-full blur-xl animate-pulse delay-500"></div>
              </div>

              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header with back button */}
                <div className="relative p-8 border-b border-gray-200 bg-gradient-to-r from-white to-[#0E4C92]/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0E4C92]/5 to-white"></div>
                  <div className="relative flex items-center justify-between">
                    <button
                      onClick={() => setActiveCardPanel(null)}
                      className="group flex items-center gap-3 px-4 py-2 bg-white/60 hover:bg-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200"
                    >
                      <div className="w-8 h-8 bg-[#0E4C92] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiChevronLeft size={16} className="text-white" />
                      </div>
                      <span className="font-semibold text-gray-700">العودة</span>
                    </button>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-[#0E4C92] mb-1">{activeCardPanel}</h3>
                      <p className="text-gray-600 text-sm">اختر نوع العملية المطلوبة</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer for centering */}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Management Card */}
                    <div
                      onClick={() => setShowManagementContent(true)}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0E4C92]/0 to-[#0E4C92]/0 group-hover:from-[#0E4C92]/5 group-hover:to-[#0E4C92]/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#0E4C92]/10 rounded-full blur-xl group-hover:bg-[#0E4C92]/20 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#0E4C92]/10 rounded-full blur-lg group-hover:bg-[#0E4C92]/20 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-[#0E4C92] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                          <FiDatabase size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-gray-800 mb-3 group-hover:text-[#0E4C92] transition-colors">
                          إدارة {activeCardPanel}
                        </h4>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                          عرض وإدارة جميع {activeCardPanel.toLowerCase()} في القسم، إضافة، تعديل، وحذف البيانات مع إمكانية البحث والتصفية المتقدمة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#0E4C92] bg-[#0E4C92]/10 px-3 py-1 rounded-full">
                            إدارة كاملة
                          </span>
                          <div className="w-8 h-8 bg-[#0E4C92]/10 rounded-full flex items-center justify-center group-hover:bg-[#0E4C92]/20 transition-colors">
                            <FiChevronLeft size={14} className="text-[#0E4C92]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reports Card */}
                    <div
                      onClick={() => {
                        if (activeCardPanel === 'الطلاب') setActiveReport('users');
                        else if (activeCardPanel === 'المشرفون') setActiveReport('supervisors');
                        else if (activeCardPanel === 'المشرفون المساعدون') setActiveReport('co-supervisors');
                        else if (activeCardPanel === 'المجموعات') setActiveReport('groups');
                        else if (activeCardPanel === 'المشاريع') setActiveReport('projects');
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Card background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0E4C92]/0 to-[#0E4C92]/0 group-hover:from-[#0E4C92]/5 group-hover:to-[#0E4C92]/5 transition-all duration-500 rounded-2xl"></div>

                      {/* Animated wave effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#0E4C92]/10 rounded-full blur-xl group-hover:bg-[#0E4C92]/20 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#0E4C92]/10 rounded-full blur-lg group-hover:bg-[#0E4C92]/20 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-[#0E4C92] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                          <FiPieChart size={28} className="text-white" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-black text-gray-800 mb-3 group-hover:text-[#0E4C92] transition-colors">
                          التقارير والإحصائيات
                        </h4>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                          عرض التقارير التفصيلية والإحصائيات المتقدمة لـ {activeCardPanel.toLowerCase()} مع إمكانية التصدير والطباعة.
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#0E4C92] bg-[#0E4C92]/10 px-3 py-1 rounded-full">
                            تقارير متقدمة
                          </span>
                          <div className="w-8 h-8 bg-[#0E4C92]/10 rounded-full flex items-center justify-center group-hover:bg-[#0E4C92]/20 transition-colors">
                            <FiChevronLeft size={14} className="text-[#0E4C92]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content below cards */}
          <div className="mt-8">
            {renderManagementContent()}
            {renderReport()}
          </div>
        </main>
      </div>

      <NotificationsPanel
        isOpen={isNotifPanelOpen}
        onClose={() => setIsNotifPanelOpen(false)}
      />
    </div>
  );
  } catch (error) {
    console.error('Error in DepartmentHeadDashboard:', error);
    return (
      <div className="flex h-screen bg-white items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-[#0E4C92] rounded-full flex items-center justify-center mb-4 mx-auto">
            <FiX size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#0E4C92] mb-2">خطأ في لوحة رئيس القسم</h2>
          <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل الصفحة</p>
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-600">تفاصيل الخطأ</summary>
            <pre className="text-xs text-gray-800 mt-2 p-2 bg-gray-100 rounded overflow-auto max-w-md">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
};

export default DepartmentHeadDashboard;
