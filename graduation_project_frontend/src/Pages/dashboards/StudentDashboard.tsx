import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore, useNotificationsStore } from '../../store/useStore';
import { 
  FiPlus, FiFileText, FiUsers, FiBox, FiSearch, 
  FiMenu, FiX, FiHome, FiLayers, FiBell, FiChevronLeft, FiGrid, FiLogOut,
  FiUserPlus, FiCheckCircle
} from 'react-icons/fi';
import { groupService } from '../../services/groupService';
import GroupForm from './GroupForm';
import ProjectSearch from './ProjectSearch';
import ProjectSelectionPage from './ProjectSelectionPage';

// --- المكونات المستوردة بالكامل ---
import NotificationsPanel from '../../components/NotificationsPanel'; 
import { useNotifications } from '../../hooks/useNotifications';
import AddMemberModal from '../../components/AddMemberModal'; 
import TeamStatusPage from '../../components/TeamStatusPage';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  
  // تفعيل جلب الإشعارات التلقائي
  useNotifications();

  // الحالة النشطة للتبويبات
  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'projects' | 'search' | 'team-status' | 'add-member'>('home');
  const [myGroup, setMyGroup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  // دالة جلب البيانات الأساسية كما هي في كودك
  // --- استبدل الدالة القديمة بهذا الكود ---
  const fetchMyGroupData = async () => {
  setLoading(true);
  try {
    const data = await groupService.getMyGroup();
    // استخراج الكائن الأول دائماً
    const groupInfo = Array.isArray(data) ? data[0] : data;
    
    // فحص ذكي للحالات:
    if (
      !groupInfo || 
      groupInfo.error || 
      (groupInfo.user_role_in_pending_request === "none" && !groupInfo.is_official_group)
    ) {
      // الطالب حر تماماً (لا في طلب معلق ولا في مجموعة رسمية)
      setMyGroup(null);
    } else {
      // الطالب محجوز (إما منشئ طلب، أو عضو في مجموعة رسمية، أو مدعو)
      setMyGroup(groupInfo);
    }
  } catch (error) {
    console.error("Error fetching group data:", error);
    setMyGroup(null);
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
    fetchMyGroupData();
  }, []);

  // مصفوفة التبويبات المحدثة
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: <FiHome /> },
    { id: 'team-status', label: 'حالة الدعوات', icon: <FiCheckCircle /> },
    { id: 'add-member', label: 'إرسال دعوة', icon: <FiUserPlus /> },
    { id: 'groups', label: 'بيانات المجموعة', icon: <FiUsers /> },
    { id: 'projects', label: 'المشاريع المقترحة', icon: <FiLayers /> },
    { id: 'search', label: 'البحث الشامل', icon: <FiSearch /> },
  ];

  // بطاقات الإحصائيات الأصلية باستخدام useMemo
  const dashboardCards = useMemo(() => [
    {
      title: 'حالة المشروع',
      value: myGroup?.project_detail?.state || 'لا يوجد مشروع',
      icon: <FiBox />,
      gradient: 'from-[#6366F1] to-[#4F46E5]',
      shadow: 'shadow-indigo-200'
    },
    {
      title: 'أعضاء الفريق',
      value: `${myGroup?.members_count || 0} أعضاء`,
      icon: <FiUsers />,
      gradient: 'from-[#EC4899] to-[#D946EF]',
      shadow: 'shadow-pink-200'
    },
    {
      title: 'نسبة الإنجاز',
      value: '15%',
      icon: <FiFileText />,
      gradient: 'from-[#10B981] to-[#059669]',
      shadow: 'shadow-emerald-200'
    }
  ], [myGroup]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" dir="rtl">
      
      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      
      {/* Sidebar - السايد بار الأصلي بتصميمه الكامل */}
      <aside className={`fixed inset-y-0 right-0 w-80 bg-[#0F172A] text-white z-[60] transition-transform duration-500 ease-in-out shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><FiGrid size={20} /></div>
            <span className="font-black text-lg italic">لوحة التحكم</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><FiX size={24}/></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar text-right">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-bold flex-1 text-right">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-2xl text-right">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl border-2 border-slate-700 shadow-lg">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">طالب معتمد</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header - الهيدر الأصلي بجميع عناصره */}
        <header className="h-24 bg-white shadow-sm border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm">
              <FiMenu size={24} />
            </button>
            <div className="hidden md:block text-right">
              <h1 className="text-lg font-black text-slate-800 leading-tight">البوابة الموحدة لمشاريع التخرج</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase italic tracking-[0.1em]">الجامعات اليمنية</p>
            </div>
          </div>

          {/* التبويبات العلوية للشاشات الكبيرة */}
          <nav className="hidden xl:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
              <button onClick={() => setIsNotifPanelOpen(true)} className="relative p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 transition-all">
                <FiBell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </button>

              {(!myGroup || myGroup.user_role_in_pending_request === 'invited') && !loading && (
                 <button 
                onClick={() => setShowGroupForm(true)} 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-sm shadow-lg hover:bg-blue-700 transition-all"
              >
                <FiPlus size={18}/> إنشاء مجموعة
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar text-right">
          
          {/* محتوى صفحة الرئيسية */}
          {activeTab === 'home' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {dashboardCards.map((card, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center text-center group">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-2xl mb-5 shadow-xl`}>
                      {card.icon}
                    </div>
                    <p className="text-slate-400 text-[10px] font-black mb-1 uppercase tracking-widest">{card.title}</p>
                    <h3 className="text-2xl font-black text-slate-800">{card.value}</h3>
                  </div>
                ))}
              </div>

              <div className="bg-[#1E293B] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="text-right">
                  <h2 className="text-3xl font-black mb-3 text-right">حالة مشروع التخرج الحالي <span className="text-blue-500">.</span></h2>
                  <p className="text-slate-400 font-medium max-w-lg">يمكنك من هنا متابعة تقدم فريقك، التواصل مع المشرف، ومراجعة حالة القبول للمشروع.</p>
                </div>

                {/* التعديل الجوهري هنا لضمان ظهور الصاروخ للمجموعة الرسمية */}
                {myGroup && (myGroup.is_official_group || myGroup.user_role_in_pending_request === 'creator') ? (
                  <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-[2rem] flex items-center justify-end gap-5">
                    <div className="text-right">
                      <h4 className="text-xl font-black">{myGroup.group_name}</h4>
                      <p className="text-blue-400 font-bold text-xs mt-1">
                        {myGroup.is_official_group ? 
                          (myGroup.project_detail?.title || 'مشروع معتمد') : 
                          'قيد انتظار موافقة الأعضاء...'}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg animate-bounce-slow">
                      🚀
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowGroupForm(true)} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                    سجل مجموعتك الآن
                  </button>
                )}
              </div>
            </div>
            </>
          )}

          {/* محتوى صفحة حالة الدعوات */}
          {activeTab === 'team-status' && (
            <div className="animate-in fade-in duration-500">
              <TeamStatusPage myGroup={myGroup} onNavigateToAdd={() => setActiveTab('add-member')} />
            </div>
          )}

          {/* محتوى صفحة إضافة عضو */}
                    {activeTab === 'add-member' && (
            <div className="animate-in fade-in duration-500">
              {/* نتحقق أولاً: هل نملك كائن مجموعة وهل له معرف؟ */}
              {myGroup && (Array.isArray(myGroup) ? myGroup[0]?.id : myGroup.id) ? (
                <AddMemberModal 
                  // نأخذ المعرف سواء كان من أول عنصر في المصفوفة أو من الكائن مباشرة
                  requestId={Array.isArray(myGroup) ? myGroup[0].id : myGroup.id} 
                />
              ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-black">
                    {loading ? "جاري تحميل البيانات..." : "يرجى إنشاء مجموعة أولاً لتتمكن من إضافة أعضاء."}
                  </p>
                </div>
              )}
            </div>
          )}
          {/* محتوى صفحة بيانات المجموعة الأصلية */}
          {activeTab === 'groups' && (
            <div className="animate-in fade-in duration-700">
              {myGroup ? (
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 max-w-5xl mx-auto text-right overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-50 pb-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 mb-2">{myGroup.group_name}</h2>
                      <p className="text-slate-400 font-bold uppercase text-xs">بيانات الفريق الرسمية</p>
                    </div>
                    <div className="bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
                      <p className="text-emerald-700 font-black text-xs">الحالة: نشط</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-12 text-right">
                    <div className="space-y-6">
                      <h5 className="font-black text-lg border-r-4 border-blue-600 pr-3">أعضاء المجموعة</h5>
                      <div className="space-y-3">
                        {myGroup.members?.map((m: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-end gap-2">
                            {m.user_detail?.name} 👤
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6 text-right">
                      <h5 className="font-black text-lg border-r-4 border-indigo-600 pr-3 text-right">الإشراف الأكاديمي</h5>
                      
                      <div className="space-y-4">
                        {/* 1. عرض المشرف الرئيسي مع أيقونة الكوفية */}
                        {myGroup.supervisors?.filter((s: any) => s.type === 'supervisor').map((mainSup: any, i: number) => (
                          <div key={i} className="p-8 bg-indigo-50/50 border-2 border-indigo-100 border-dashed rounded-[2.5rem] text-center relative overflow-hidden group">
                            {/* أيقونة كوفية التخرج */}
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎓</div>
                            
                            <p className="text-[10px] text-indigo-500 font-black uppercase mb-1 tracking-widest">المشرف الأكاديمي الرئيسي</p>
                            <p className="text-2xl font-black text-indigo-900 mb-1">
                              {mainSup.user_detail?.name || 'لم يحدد بعد'}
                            </p>
                            
                            {/* زخرفة خفيفة في الزاوية */}
                            <div className="absolute -left-2 -bottom-2 opacity-10 text-indigo-900 rotate-12">
                              <FiCheckCircle size={80} />
                            </div>
                          </div>
                        ))}

                        {/* 2. عرض المشرفين المشاركين */}
                        <div className="space-y-3 mt-6">
                          <p className="text-[10px] text-slate-400 font-black uppercase pr-2 tracking-tighter">هيئة الإشراف المساعدة</p>
                          
                          {myGroup.supervisors?.filter((s: any) => s.type === 'co_supervisor').length > 0 ? (
                            myGroup.supervisors?.filter((s: any) => s.type === 'co_supervisor').map((assistSup: any, i: number) => (
                              <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-blue-600 bg-blue-50 p-2 rounded-lg text-sm">👨‍🏫</span>
                                  <span className="font-bold text-slate-700">{assistSup.user_detail?.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">مشرف مشارك</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                              لا يوجد مشرفون مشاركون حالياً
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold">يرجى تسجيل مجموعة أولاً ليتم عرض البيانات</div>
              )}
            </div>
          )}

          {/* الصفحات الأخرى */}
          {activeTab === 'projects' && <ProjectSelectionPage />}
          {activeTab === 'search' && <ProjectSearch />}
          
        </main>
      </div>

      {/* النوافذ المنبثقة الأصلية */}
      {showGroupForm && <GroupForm isOpen={showGroupForm} onClose={() => setShowGroupForm(false)} onSuccess={fetchMyGroupData} />}
      <NotificationsPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default StudentDashboard;