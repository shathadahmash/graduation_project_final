import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import { groupService } from '../../services/groupService';
import { FiSend, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

interface ProposeProjectFormProps {
  groupId: number | null; 
  hasProject: boolean; // بروب جديد لمعرفة ما إذا كان للمجموعة مشروع حالي
  onSuccess: () => void;
}

const ProposeProjectForm: React.FC<ProposeProjectFormProps> = ({ groupId, hasProject, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🔥 منطق تفعيل الزر: يجب أن يكون هناك groupId و لا يوجد مشروع سابق (hasProject === false)
  const canSubmit = groupId !== null && hasProject === false;
  const isSubmitDisabled = !canSubmit || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // تحققات إضافية قبل الإرسال
    if (!groupId) {
      setError('خطأ: يجب أن تكون عضواً في مجموعة رسمية أولاً.');
      return;
    }

    if (hasProject) {
      setError('خطأ: مجموعتكم لديها مشروع بالفعل، لا يمكن اقتراح مشروع آخر.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('يرجى كتابة عنوان المشروع ووصفه بشكل كامل.');
      return;
    }

    // بناء البيانات بناءً على الموديل الخاص بك
    const proposePayload = {
      title,
      description,
      type: 'ProposedProject', // القيمة المطابقة للـ CHOICES في الموديل
      state: 'Pending',         // القيمة المطابقة للـ CHOICES في الموديل
    };

    try {
      setLoading(true);
      
      // 1. إنشاء المشروع في قاعدة البيانات
      const projectResult = await projectService.proposeAndLinkProject(proposePayload);
      const projectId = projectResult.project_id;
      
      // 2. ربط المشروع بالمجموعة مباشرة
      
      setSuccessMessage('تم إرسال مقترح المشروع  هو الآن في حالة (معلق) بانتظار مراجعة الإدارة.');
      
      // تفريغ الحقول بعد النجاح
      setTitle('');
      setDescription('');
      
      // تحديث البيانات في الصفحة الأب
      onSuccess(); 

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'حدث خطأ أثناء معالجة طلبك.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 transition-all" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
           💡
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800">اقتراح مشروع جديد</h2>
          <p className="text-slate-400 text-xs font-bold">بإمكانك اقتراح فكرة مشروعك الخاص لربطها بمجموعتك</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-right">
        
        {/* الحالات التنبيهية */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <FiAlertTriangle className="flex-shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-r-4 border-emerald-500 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
            <FiCheckCircle className="flex-shrink-0" />
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
        )}

        {/* تنبيه إذا كان الطالب لديه مشروع بالفعل */}
        {hasProject && (
          <div className="bg-blue-50 border-r-4 border-blue-500 text-blue-700 p-4 rounded-2xl flex items-center gap-3">
            <FiInfo className="flex-shrink-0" size={20} />
            <p className="text-sm font-bold">لدى مجموعتكم مشروع مسجل بالفعل. لا يتيح النظام اقتراح أكثر من مشروع للمجموعة الواحدة.</p>
          </div>
        )}

        {/* تنبيه إذا لم يكن في مجموعة */}
        {!groupId && (
          <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-700 p-4 rounded-2xl flex items-center gap-3">
            <FiAlertTriangle className="flex-shrink-0" size={20} />
            <p className="text-sm font-bold">يجب أن تكون في "مجموعة رسمية" لتتمكن من استخدام ميزة اقتراح المشاريع.</p>
          </div>
        )}

        <div className={!canSubmit ? 'opacity-40 pointer-events-none transition-opacity' : ''}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-black text-slate-700 mb-2 mr-2">
              عنوان المشروع *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              placeholder="مثلاً: تطوير تطبيق لإدارة الموارد الجامعية"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-black text-slate-700 mb-2 mr-2">
              وصف الفكرة والهدف *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 resize-none"
              placeholder="اشرح فكرة المشروع، التقنيات المتوقع استخدامها، وما هي المشكلة التي يحلها..."
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full flex items-center justify-center px-8 py-4 rounded-2xl font-black text-lg shadow-lg transition-all transform active:scale-95 ${
            isSubmitDisabled 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>جاري المعالجة...</span>
            </div>
          ) : (
            <>
              <FiSend className="ml-3" />
              إرسال الاقتراح للمراجعة
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProposeProjectForm;