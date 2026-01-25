import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiBriefcase, FiGlobe, FiPlusCircle, FiCheckCircle, 
  FiUsers, FiLock, FiAlertCircle, FiArrowLeft 
} from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';
import { groupService } from '../../services/groupService';
import ProposeProjectForm from './ProposeProjectForm';
import GroupForm from './GroupForm';

const ProjectSelectionPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'Government' | 'PrivateCompany' | 'StudentProposed'>('Government');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [projectLinked, setProjectLinked] = useState(false);

  const fetchUserGroup = useCallback(async () => {
    setIsGroupLoading(true);
    try {
      const data = await groupService.getMyGroup(); 
      const groupInfo = Array.isArray(data) ? data[0] : data;

      if (groupInfo && !groupInfo.error) {
        // نتحقق إذا كان الطالب في مجموعة رسمية أو منشئ لطلب
        const hasOfficialGroup = groupInfo.is_official_group === true;
        const alreadyHasProject = !!(groupInfo.project_detail && groupInfo.project_detail.title !== "لم يحدد");

        setUserGroup({
          group_id: groupInfo.id || groupInfo.group_id,
          isOfficial: hasOfficialGroup,
          hasProject: alreadyHasProject,
          role: groupInfo.user_role_in_pending_request
        });
      } else {
        setUserGroup(null);
      }
    } catch (error) {
      console.error("Error fetching group status:", error);
      setUserGroup(null);
    } finally {
      setIsGroupLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async (type: string) => {
    if (type === 'StudentProposed') { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await projectService.getProjects({ type: type as any });
      setProjects(data);
    } catch {
      console.error("خطأ في جلب المشاريع");
    } finally {
      setLoading(false);
    }
  }, []);


// 1. تعريف الحالة للمجموعة
const [myGroup, setMyGroup] = React.useState<any>(null);

// 2. دالة جلب البيانات (سريعة ومباشرة)
const fetchMyGroupData = async () => {
  try {
    const res = await groupService.getMyGroup();
    // نأخذ أول عنصر لأن الباك إيند يرسل مصفوفة [ {} ]
    setMyGroup(res[0] || null);
  } catch (err) {
    console.error("Error loading group:", err);
  }
};

// 3. استدعاء الدالة عند فتح الصفحة
React.useEffect(() => {
  fetchMyGroupData();
}, []);


  useEffect(() => { fetchUserGroup(); }, [fetchUserGroup]);
  useEffect(() => { if (!isGroupLoading) fetchProjects(selectedOption); }, [selectedOption, fetchProjects, isGroupLoading]);

  const handleLinkProject = async (projectId: number) => {
    const idToUse = userGroup?.group_id || userGroup?.id; 

    if (!idToUse) {
      alert("خطأ: لم يتم العثور على بيانات مجموعتكم الرسمية.");
      return;
    }

    if (!window.confirm("هل أنت متأكد من اختيار هذا المشروع؟")) return;

    try {
      await groupService.linkProjectToGroup(idToUse, projectId);
      setProjectLinked(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "فشل الارتباط";
      alert(errorMsg);
    }
  };

  if (projectLinked) return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
        <FiCheckCircle size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter">تم اختيار المشروع بنجاح!</h2>
      <p className="text-slate-500 mt-2 mb-8 font-medium text-lg">أصبح المشروع الآن مرتبطاً بمجموعتكم الرسمية.</p>
      <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all hover:bg-blue-700">العودة للرئيسية</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b pb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">بوابة المشاريع</h1>
          <p className="text-slate-500 font-medium mt-2 italic">اختر المسار الأمثل لمشروع تخرجك</p>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl border shadow-inner">
          {[
            { id: 'Government', label: 'حكومي', icon: <FiGlobe /> },
            { id: 'PrivateCompany', label: 'شركات', icon: <FiBriefcase /> },
            { id: 'StudentProposed', label: 'اقتراح خاص', icon: <FiPlusCircle /> }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id as any)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${selectedOption === opt.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {selectedOption === 'StudentProposed' ? (
            <ProposeProjectForm 
              groupId={myGroup?.id} 
              hasProject={!!myGroup?.project_detail?.project_id} // ستكون true إذا وجد ID للمشروع
              onSuccess={fetchMyGroupData} 
            />      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-right">
          {loading ? (
            <div className="col-span-full py-20 text-center text-blue-500 font-black text-xl animate-pulse">جاري تحميل المشاريع...</div>
          ) : projects.map((p) => {
            
            // --- المنطق المحدث بناءً على حالات الموديل لديك ---
            const isProjectAvailable = p.state === 'Accepted'; // متاح في الموديل
            const isProjectReserved = p.state === 'Reserved'; // محجوز في الموديل
            const isEligibleToSelect = userGroup && userGroup.isOfficial; // يجب أن تكون مجموعة رسمية
            const alreadyHasProject = userGroup?.hasProject;

            let btnText = "اختيار المشروع";
            let btnStyle = "bg-blue-600 text-white hover:bg-blue-700";
            let btnDisabled = false;
            let btnIcon = <FiArrowLeft />;

            if (!isEligibleToSelect) {
              btnText = "يجب اعتماد مجموعتك";
              btnStyle = "border-2 border-blue-100 text-blue-400 cursor-not-allowed";
              btnIcon = <FiUsers />;
              btnDisabled = true;
            } else if (alreadyHasProject) {
              btnText = "لديك مشروع حالي";
              btnStyle = "bg-slate-100 text-slate-400 cursor-not-allowed";
              btnDisabled = true;
              btnIcon = <FiLock />;
            } else if (isProjectReserved) {
              btnText = "مشروع محجوز";
              btnStyle = "bg-red-50 text-red-300 border border-red-100 cursor-not-allowed";
              btnDisabled = true;
              btnIcon = <FiAlertCircle />;
            } else if (!isProjectAvailable) {
              btnText = "غير متاح للربط";
              btnStyle = "bg-slate-50 text-slate-300 cursor-not-allowed";
              btnDisabled = true;
            }

            return (
              <div key={p.project_id} className="group bg-white border rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                    <FiBriefcase size={24} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-tighter ${isProjectAvailable ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {isProjectAvailable ? 'متاح للارتباط' : p.state}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-4 leading-snug min-h-[3.5rem]">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 italic">"{p.description}"</p>
                
                <div className="mt-auto pt-8 border-t">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-6">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">🎓</span>
                    <span>المشرف: {p.supervisor?.name || 'قيد التعيين'}</span>
                  </div>

                  <button
                    disabled={btnDisabled}
                    onClick={() => p.project_id && handleLinkProject(p.project_id)}
                    className={`w-full py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-md ${btnStyle}`}
                  >
                    <span>{btnText}</span>
                    {btnIcon}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GroupForm 
        isOpen={isGroupFormOpen} 
        onClose={() => setIsGroupFormOpen(false)} 
        onSuccess={() => { setIsGroupFormOpen(false); fetchUserGroup(); }} 
      />
    </div>
  );
};

export default ProjectSelectionPage;