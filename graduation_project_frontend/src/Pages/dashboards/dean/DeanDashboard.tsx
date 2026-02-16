import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, useNotificationsStore } from '../../../store/useStore';
import {
  FiFileText, FiUsers, FiLayers, FiMenu, FiX, FiHome,
  FiChevronRight, FiActivity, FiSettings, FiChevronLeft, FiPieChart, FiDatabase
} from 'react-icons/fi';
import { userService } from '../../../services/userService';
import { projectService } from '../../../services/projectService';
import { groupService } from '../../../services/groupService';
import { fetchTableFields } from '../../../services/bulkService';
import ProjectSearch from '../ProjectSearch';
import NotificationsPanel from '../../../components/NotificationsPanel';
import { useNotifications } from '../../../hooks/useNotifications';
import SupervisorsTable from './SupervisorsTable';
import CoSupervisorsTable from './CoSupervisorsTable';
import ProjectTable from './ProjectTable';
import GroupsTable from './GroupsTable';
import Studenttable from './StudentTable';
import GroupsReport from './GroupsReport';
import ProjectReport from './ProjectReport';
import SupervisorsReportPage from './SupervisorsReportPage';
import CoSupervisorsReportPage from './CoSupervisorsReportPage';
import StudentReportPage from './StudentReportPage';


const DeanDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { notifications } = useNotificationsStore();
  useNotifications();

  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'projects' | 'approvals' | 'search' | 'notifications'>('home');
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
       Fetch Data (like System Manager)
    ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedUsers, fetchedProjects, fetchedGroups, fetchedAffiliations, fetchedDepartments] =
          await Promise.all([
            userService.getAllUsers(),
            projectService.getProject(),
            groupService.getGroups(),
            userService.getAffiliations(),
            fetchTableFields('departments')
          ]);

        setUsers(fetchedUsers);
        setProjects(fetchedProjects);
        setGroups(fetchedGroups);
        setAffiliations(fetchedAffiliations);
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: <FiHome /> },
    { id: 'users', label: 'الطلاب', icon: <FiUsers />, cardPanel: 'الطلاب' },
    { id: 'projects', label: 'المشاريع', icon: <FiLayers />, cardPanel: 'المشاريع' },
    { id: 'groups', label: 'المجموعات', icon: <FiUsers />, cardPanel: 'المجموعات' },
    { id: 'supervisors', label: 'المشرفون', icon: <FiUsers />, cardPanel: 'المشرفون' },
    { id: 'settings', label: 'الإعدادات', icon: <FiSettings /> }
  ];

  /* ==========================
     Helper Functions (like System Manager tables)
  ========================== */
  const getDeanCollegeId = (): number | null => {
    if (!user?.id || !affiliations.length) return null;

    // Find dean's affiliation
    const deanAffiliation = affiliations.find((aff: any) => aff.user_id === user.id);
    if (deanAffiliation?.college_id) {
      return deanAffiliation.college_id;
    }

    // Try to get from department affiliation
    const deptAffiliation = affiliations.find((aff: any) =>
      aff.user_id === user.id && aff.department_id
    );
    if (deptAffiliation?.department_id) {
      // Find the department and get its college
      // This is a simplified approach - in real implementation you'd need department data
      return null; // For now, return null
    }

    return null;
  };

  /* ==========================
     Filtered Data (like System Manager tables)
  ========================== */
  const deanCollegeId = getDeanCollegeId();

  console.log('Dean Dashboard - deanCollegeId:', deanCollegeId);
  console.log('Dean Dashboard - affiliations sample:', affiliations.slice(0, 3));
  console.log('Dean Dashboard - users sample:', users.slice(0, 3));
  console.log('Dean Dashboard - projects sample:', projects.slice(0, 3));
  console.log('Dean Dashboard - groups sample:', groups.slice(0, 3));

  const filteredStudents = useMemo(() => {
    if (!deanCollegeId) return [];
    const result = users.filter((user: any) => {
      const userAffiliation = affiliations.find((aff: any) => aff.user_id === user.id);
      const hasStudentRole = user.roles?.some((role: any) =>
        role.type?.toLowerCase() === 'student'
      );
      return hasStudentRole && userAffiliation?.college_id === deanCollegeId;
    });
    console.log('Dean Dashboard - filteredStudents count:', result.length);
    return result;
  }, [users, affiliations, deanCollegeId]);

  const filteredProjects = useMemo(() => {
    if (!deanCollegeId) return [];
    const result = projects.filter((project: any) => {
      // Check different possible college field structures
      let projectCollegeId = null;

      if (typeof project.college === 'number') {
        // College is serialized as primary key (integer)
        projectCollegeId = project.college;
      } else if (typeof project.college === 'object' && project.college) {
        // College is serialized as object
        projectCollegeId = project.college.id || project.college.cid;
      } else if (project.college_id) {
        // Direct college_id field
        projectCollegeId = project.college_id;
      }

      console.log('Project college check:', project.project_id || project.id, 'college field:', project.college, 'extracted ID:', projectCollegeId, 'dean college:', deanCollegeId);
      return projectCollegeId === deanCollegeId;
    });
    console.log('Dean Dashboard - filteredProjects count:', result.length);
    return result;
  }, [projects, deanCollegeId]);

  const filteredSupervisors = useMemo(() => {
    if (!deanCollegeId) return [];
    const result = users.filter((user: any) => {
      const userAffiliation = affiliations.find((aff: any) => aff.user_id === user.id);
      const hasSupervisorRole = user.roles?.some((role: any) =>
        role.type?.toLowerCase() === 'supervisor' || role.type?.toLowerCase() === 'مشرف'
      );
      return hasSupervisorRole && userAffiliation?.college_id === deanCollegeId;
    });
    console.log('Dean Dashboard - filteredSupervisors count:', result.length);
    return result;
  }, [users, affiliations, deanCollegeId]);

  const filteredCoSupervisors = useMemo(() => {
    if (!deanCollegeId) return [];
    const result = users.filter((user: any) => {
      const userAffiliation = affiliations.find((aff: any) => aff.user_id === user.id);
      const hasCoSupervisorRole = user.roles?.some((role: any) =>
        role.type?.toLowerCase() === 'co_supervisor' ||
        role.type?.toLowerCase() === 'co-supervisor' ||
        role.type?.toLowerCase() === 'مشرف مشارك'
      );
      console.log('Co-supervisor check:', user.id, user.roles, hasCoSupervisorRole, userAffiliation?.college_id);
      return hasCoSupervisorRole && userAffiliation?.college_id === deanCollegeId;
    });
    console.log('Dean Dashboard - filteredCoSupervisors count:', result.length);
    return result;
  }, [users, affiliations, deanCollegeId]);

  const filteredGroups = useMemo(() => {
    if (!deanCollegeId) return [];
    const result = groups.filter((group: any) => {
      // Check if group's department belongs to dean's college
      if (group.department) {
        const department = departments.find((d: any) => d.department_id === group.department);
        if (department) {
          const departmentCollegeId = department.college; // assuming college is the id
          console.log('Group department college check:', group.group_id || group.id, 'department:', group.department, 'department college:', departmentCollegeId, 'dean college:', deanCollegeId);
          return departmentCollegeId === deanCollegeId;
        }
      }

      // Fallback: check if group's project belongs to dean's college
      if (group.project) {
        const project = projects.find((p: any) => p.project_id === group.project || p.id === group.project);
        if (project) {
          let projectCollegeId = null;
          if (typeof project.college === 'number') {
            projectCollegeId = project.college;
          } else if (typeof project.college === 'object' && project.college) {
            projectCollegeId = project.college.id || project.college.cid;
          } else if (project.college_id) {
            projectCollegeId = project.college_id;
          }
          console.log('Group project college check:', group.group_id || group.id, 'project:', group.project, 'project college:', projectCollegeId, 'dean college:', deanCollegeId);
          return projectCollegeId === deanCollegeId;
        }
      }

      // Fallback: check if any group member belongs to dean's college
      return group.members?.some((member: any) => {
        const memberAffiliation = affiliations.find((aff: any) => aff.user_id === member.user?.id || aff.user_id === member.id);
        return memberAffiliation?.college_id === deanCollegeId;
      });
    });
    console.log('Dean Dashboard - filteredGroups count:', result.length);
    return result;
  }, [groups, departments, projects, affiliations, deanCollegeId]);

  const dashboardCards = [
    {
      title: 'الطلاب',
      value: filteredStudents.length,
      icon: <FiUsers />,
      gradient: 'from-blue-500 to-blue-700',
      description: 'إجمالي الطلاب في الكلية'
    },
    {
      title: 'المشاريع',
      value: filteredProjects.length,
      icon: <FiLayers />,
      gradient: 'from-blue-500 to-blue-700',
      description: 'إجمالي المشاريع المسجلة'
    },
    {
      title: 'المشرفون',
      value: filteredSupervisors.length,
      icon: <FiUsers />,
      gradient: 'from-blue-500 to-blue-700',
      description: 'المشرفون الرئيسيون'
    },
    {
      title: 'المشرفون المساعدون',
      value: filteredCoSupervisors.length,
      icon: <FiUsers />,
      gradient: 'from-blue-500 to-blue-700',
      description: 'المشرفون المشاركون'
    },
    {
      title: 'المجموعات',
      value: filteredGroups.length,
      icon: <FiUsers />,
      gradient: 'from-blue-500 to-blue-700',
      description: 'مجموعات الطلاب'
    }
  ];

  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-sm mb-6">
      <span className="text-slate-600 hover:text-blue-600 cursor-pointer transition-colors font-semibold">
        الرئيسية
      </span>
      {activeCardPanel && (
        <>
          <FiChevronRight className="text-slate-400" size={16} />
          <span className="text-slate-600 hover:text-blue-600 cursor-pointer transition-colors font-semibold">
            {activeCardPanel}
          </span>
        </>
      )}
      {showManagementContent && (
        <>
          <FiChevronRight className="text-slate-400" size={16} />
          <span className="text-blue-600 font-bold">
            الإدارة
          </span>
        </>
      )}
      {activeReport && (
        <>
          <FiChevronRight className="text-slate-400" size={16} />
          <span className="text-blue-600 font-bold">
            التقارير
          </span>
        </>
      )}
    </div>
  );

  const renderManagementContent = () => {
    if (!activeCardPanel || !showManagementContent) return null;
    switch (activeCardPanel) {
      case 'الطلاب':
        return <Studenttable />;
      case 'المشاريع':
        return <ProjectTable />;
      case 'المشرفون':
        return <SupervisorsTable />;
      case 'المشرفون المساعدون':
        return <CoSupervisorsTable />;
      case 'المجموعات':
        return <GroupsTable />;
      default:
        return null;
    }
  };

  const renderReport = () => {
    if (!activeReport) return null;
    switch (activeReport) {
      case 'users':
        return <StudentReportPage />;
      case 'projects':
        return <ProjectReport />;
      case 'groups':
        return <GroupsReport />;
      case 'supervisors':
        return <SupervisorsReportPage />;
      case 'cosupervisors':
        return <CoSupervisorsReportPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-80 bg-[#0F172A] text-white z-[60] transition-transform duration-300 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiActivity size={22} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">لوحة العميد</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="mt-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'home') {
                  setActiveTab('home');
                  setActiveCardPanel(null);
                } else if ((tab as any).cardPanel) {
                  setActiveTab('home');
                  setActiveCardPanel((tab as any).cardPanel);
                } else {
                  setActiveTab(tab.id as any);
                  setActiveCardPanel(null);
                }
                setIsSidebarOpen(false);
                setShowManagementContent(false);
                setActiveReport(null);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors group ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className={`${activeTab === tab.id ? 'text-white' : 'group-hover:text-white'}`}>
                {tab.icon}
              </span>
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab === tab.id && <FiChevronLeft className="mr-auto" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">العميد الحالي</p>
            <p className="text-sm font-bold text-white">عميد الكلية</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (NEW DESIGN ONLY) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          {/* Left: menu + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
              aria-label="فتح القائمة"
            >
              <FiMenu size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-800">لوحة العميد</h2>
          </div>

          {/* Center: tabs pill (same data: tabs array) */}
          <nav className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
            {tabs.map((t: any) => {
              const active = activeTab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === 'home') {
                      setActiveTab('home');
                      setActiveCardPanel(null);
                    } else if (t.cardPanel) {
                      setActiveTab('home');
                      setActiveCardPanel(t.cardPanel);
                    } else {
                      setActiveTab(t.id as any);
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
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Right: hello + avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-800 leading-none">مرحباً</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                {user?.name || user?.username || 'عميد الكلية'}
              </p>
            </div>

            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md flex items-center justify-center text-white font-black">
              {(user?.name || user?.username || 'ع')?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div>
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#0E4C92] to-[#0E4C92] rounded-3xl p-10 text-white shadow-2xl">
                  <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-3 flex items-center gap-2">
                      مرحباً بك مجدداً، عميد الكلية 👋
                    </h1>
                    <p className="text-blue-100 text-base max-w-2xl leading-relaxed mb-4">
                      إليك نظرة سريعة على حالة الكلية اليوم. يمكنك إدارة المشاريع، المشرفين، والمجموعات من خلال البطاقات أدناه.
                    </p>
                    <div className="flex items-center gap-4 text-blue-200">
                      <FiUsers className="text-xl" />
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-blue-300">•</span>
                      <span>عميد الكلية</span>
                    </div>
                  </div>
                  <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-xl" />
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-xl bg-slate-200 mb-4"></div>
                          <div className="w-16 h-3 bg-slate-200 rounded mb-2"></div>
                          <div className="w-12 h-6 bg-slate-200 rounded mb-2"></div>
                          <div className="w-20 h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    dashboardCards.map((card, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setActiveCardPanel(card.title);
                          setShowManagementContent(false);
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeCardPanel && (
            <div className="relative mt-8">
              {/* Animated background waves */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-3xl"></div>
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-[20px] right-[20px] w-16 h-16 bg-cyan-200/20 rounded-full blur-xl animate-pulse delay-500"></div>
              </div>

              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
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
                      onClick={() => setShowManagementContent(true)}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-full blur-xl group-hover:bg-blue-200/40 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-100/30 rounded-full blur-lg group-hover:bg-indigo-200/40 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                          <FiDatabase size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                          إدارة {activeCardPanel}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض وإدارة جميع {activeCardPanel.toLowerCase()} في الكلية، إضافة، تعديل، وحذف البيانات مع إمكانية البحث والتصفية المتقدمة.
                        </p>
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
                        if (activeCardPanel === 'الطلاب') setActiveReport('users');
                        else if (activeCardPanel === 'المجموعات') setActiveReport('groups');
                        else if (activeCardPanel === 'المشاريع') setActiveReport('projects');
                        else if (activeCardPanel === 'المشرفون') setActiveReport('supervisors');
                        else if (activeCardPanel === 'المشرفون المساعدون') setActiveReport('cosupervisors');
                        setShowManagementContent(false);
                      }}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/30 rounded-full blur-xl group-hover:bg-indigo-200/40 transition-all duration-700 transform group-hover:scale-150"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-100/30 rounded-full blur-lg group-hover:bg-blue-200/40 transition-all duration-700 delay-200 transform group-hover:scale-125"></div>

                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                          <FiPieChart size={28} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">
                          التقارير والإحصائيات
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          عرض التقارير التفصيلية والإحصائيات المتقدمة لـ {activeCardPanel.toLowerCase()} مع إمكانية التصدير والطباعة.
                        </p>
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
            </div>
          )}

          {(showManagementContent && activeCardPanel) && renderManagementContent()}
          {activeReport && renderReport()}

          {/* Other Tabs */}
          {activeTab === 'groups' && <GroupsTable />}
          {activeTab === 'projects' && <ProjectTable />}
          {activeTab === 'approvals' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
              <h2 className="text-xl font-black mb-6">الموافقات المعلقة</h2>
              <p className="text-slate-400 text-center py-10">لا توجد طلبات معلقة حالياً</p>
            </div>
          )}
          {activeTab === 'search' && <ProjectSearch />}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
              <h2 className="text-xl font-black mb-6">الإشعارات</h2>
              <p className="text-slate-400 text-center py-10">لا توجد إشعارات جديدة</p>
            </div>
          )}
        </main>

        <NotificationsPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
      </div>
    </div>
  );
};

export default DeanDashboard;
