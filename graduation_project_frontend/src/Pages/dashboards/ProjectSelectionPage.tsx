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

  // 1. جلب بيانات المجموعة والتحقق من العضوية والارتباط
  const fetchUserGroup = useCallback(async () => {
    setIsGroupLoading(true);
    try {
      const groups = await groupService.getGroups();
      if (groups && groups.length > 0) {
        const group = groups[0];
        // التأكد من وجود مشروع حقيقي مرتبط
        const hasProject = !!(group.project && (group.project.project_id || group.project.title));
        setUserGroup({ ...group, hasProject });
      } else {
        setUserGroup(null);
      }
    } catch {
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

  useEffect(() => { fetchUserGroup(); }, [fetchUserGroup]);
  useEffect(() => { if (!isGroupLoading) fetchProjects(selectedOption); }, [selectedOption, fetchProjects, isGroupLoading]);

  const handleLinkProject = async (projectId: number) => {
    if (!userGroup?.group_id) return;
    try {
      await groupService.linkProjectToGroup(userGroup.group_id, projectId);
      setProjectLinked(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "فشل في عملية الارتباط");
    }
  };

  // شاشة النجاح
  if (projectLinked) return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 icon-circle text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
        <FiCheckCircle size={48} />
      </div>
      <h2 className="text-3xl font-black text-primary-700 tracking-tighter">تم اختيار المشروع بنجاح!</h2>
      <p className="text-slate-500 mt-2 mb-8 font-medium text-lg">أصبح المشروع الآن مرتبطاً بمجموعتكم الرسمية.</p>
      <button onClick={() => window.location.reload()} className="px-10 py-4 btn-blue rounded-2xl font-black transition-all">العودة للرئيسية</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="rtl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b primary-decor pb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-primary-700 tracking-tighter">بوابة المشاريع</h1>
          <p className="text-slate-500 font-medium mt-2 italic">اختر المسار الأمثل لمشروع تخرجك من القائمة أدناه</p>
        </div>

        {/* التبديل بين الأقسام - تدرجات زرقاء */}
        <div className="flex p-1.5 primary-decor rounded-2xl border shadow-inner">
          {[
            { id: 'Government', label: 'حكومي', icon: <FiGlobe /> },
            { id: 'PrivateCompany', label: 'شركات', icon: <FiBriefcase /> },
            { id: 'StudentProposed', label: 'اقتراح خاص', icon: <FiPlusCircle /> }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id as any)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${selectedOption === opt.id ? 'btn-blue shadow-lg' : 'chip-blue'}`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {selectedOption === 'StudentProposed' ? (
        <ProposeProjectForm groupId={userGroup?.group_id} onSuccess={() => setProjectLinked(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-right">
          {loading ? (
            <div className="col-span-full py-20 text-center text-blue-300 font-black text-xl animate-pulse">جاري تحميل المشاريع...</div>
          ) : projects.map((p) => {
            
            const isProjectAvailable = p.state?.toLowerCase() === 'available';
            const isUserInGroup = !!userGroup;
            const alreadyHasProject = userGroup?.hasProject;

            // منطق الألوان والنصوص الموحد (تدرجات الأزرق)
            let btnText = "اختيار المشروع";
            let btnStyle = "btn-blue";
            let btnDisabled = false;
            let btnIcon = <FiArrowLeft />;

            if (!isUserInGroup) {
              btnText = "يجب الانضمام لمجموعة";
              btnStyle = "btn-outline-blue";
              btnIcon = <FiUsers className="text-primary-700" />;
            } else if (alreadyHasProject) {
              btnText = "لديك مشروع حالي";
              btnStyle = "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed";
              btnDisabled = true;
              btnIcon = <FiLock />;
            } else if (!isProjectAvailable) {
              btnText = "مشروع محجوز";
              btnStyle = "bg-slate-50 text-slate-500 border border-slate-100 cursor-not-allowed opacity-70";
              btnDisabled = true;
              btnIcon = <FiAlertCircle className="text-slate-400" />;
            }

            return (
              <div key={p.project_id} className="group bg-white border rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 primary-decor text-primary-700 rounded-3xl transition-all duration-500">
                    <FiBriefcase size={24} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-tighter ${isProjectAvailable ? 'chip-blue' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {isProjectAvailable ? 'متاح للارتباط' : 'مرتبط بمجموعة'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-primary-700 mb-4 leading-snug min-h-[3.5rem] tracking-tight">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 italic">"{p.description}"</p>
                
                <div className="mt-auto pt-8 border-t">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-6">
                    <span className="w-8 h-8 rounded-full primary-decor flex items-center justify-center text-primary-700">🎓</span>
                    <span>المشرف: {p.supervisor?.name || 'قيد التعيين'}</span>
                  </div>

                  <button
                    disabled={btnDisabled}
                    onClick={() => handleLinkProject(p.project_id)}
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

      {/* نموذج المجموعات */}
      <GroupForm 
        isOpen={isGroupFormOpen} 
        onClose={() => setIsGroupFormOpen(false)} 
        onSuccess={() => { setIsGroupFormOpen(false); fetchUserGroup(); }} 
      />
    </div>
  );
};

export default ProjectSelectionPage;