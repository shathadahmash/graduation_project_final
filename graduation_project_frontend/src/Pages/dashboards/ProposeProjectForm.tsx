// src/components/student/ProposeProjectForm.tsx (النسخة المعدلة)

import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import { groupService } from '../../services/groupService';
import { FiSend, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

interface ProposeProjectFormProps {
  groupId: number | null; // 🔥 تعديل: الآن يقبل null
  onSuccess: () => void;
}

const ProposeProjectForm: React.FC<ProposeProjectFormProps> = ({ groupId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🔥 شرط جديد: هل الزر يجب أن يكون معطلاً؟
  const isSubmitDisabled = !groupId || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // التحقق مرة أخرى هنا كإجراء احترازي
    if (!groupId) {
      setError('لا يمكن إرسال الاقتراح لأنك لست عضواً في مجموعة.');
      return;
    }

    if (!title || !description) {
      setError('يرجى ملء جميع الحقول المطلوبة (العنوان والوصف).');
      return;
    }

    const proposePayload = {
      title,
      description,
      type: 'StudentProposed', 
    };

    try {
      setLoading(true);
      const projectResult = await projectService.proposeProject(proposePayload);
      const projectId = projectResult.project_id;
      
      await groupService.linkProjectToGroup(groupId, projectId);
      
      setSuccessMessage('تم اقتراح المشروع وربطه بالمجموعة بنجاح.');
      onSuccess(); 

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'حدث خطأ أثناء اقتراح المشروع.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        اقتراح مشروع خاص
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded flex items-center" role="alert">
            <FiCheckCircle className="ml-2" />
            {successMessage}
          </div>
        )}

        {/* 🔥 رسالة التنبيه إذا لم يكن الطالب في مجموعة */}
        {!groupId && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded flex items-center gap-3" role="alert">
            <FiAlertTriangle size={24} />
            <p className="font-semibold">يجب أن تكون عضواً في مجموعة لتتمكن من اقتراح مشروع.</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            عنوان المشروع المقترح *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="مثال: نظام ذكي لإدارة النفايات"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف المشروع المقترح *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="وصف تفصيلي للمشروع، أهدافه، والتقنيات المستخدمة"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled} // <-- استخدام الشرط هنا
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'جارٍ الإرسال...' : (
            <>
              <FiSend className="ml-2" />
              اقتراح وربط المشروع
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProposeProjectForm;
