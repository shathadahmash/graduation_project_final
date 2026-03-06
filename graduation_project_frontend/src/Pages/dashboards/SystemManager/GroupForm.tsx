import React, { useEffect, useState } from 'react';
import { groupService } from '../../../services/groupService';
import { projectService } from '../../../services/projectService';
import api from '../../../services/api';
import { FiX, FiCheck, FiUser, FiBook, FiCalendar, FiPlus, FiEdit3 } from 'react-icons/fi';

interface GroupFormProps {
  isOpen: boolean;
  initialData?: any;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
  // when true the form will skip showing browser alerts and will call
  // the "silent" update API variant when editing
  silent?: boolean;
} 

const GroupForm: React.FC<GroupFormProps> = ({ isOpen, initialData, mode, onClose, onSuccess, silent }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    group_name: '',
    academic_year: new Date().getFullYear().toString(),
    project: '',
    members: [] as number[],
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          group_name: initialData.group_name || '',
          academic_year: initialData.academic_year || new Date().getFullYear().toString(),
          project: initialData.project?.project_id || initialData.project || '',
          members: initialData.members?.map((m: any) => m.user) || [],
        });
      } else {
        setFormData({
          group_name: '',
          academic_year: new Date().getFullYear().toString(),
          project: '',
          members: [],
        });
      }
      fetchData();
    }
  }, [isOpen, mode, initialData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const usersRes = await api.get('/users');
      const studentList = usersRes.data.filter((u: any) => 
        u.roles?.some((r: any) => r.role__type === 'Student') || u.role === 'Student'
      );
      setStudents(studentList);

      // 2. Fetch Projects with state "Pending"
      const projectsData = await projectService.getProjects();
      const pending = projectsData.filter((p: any) => 
        p.state_name === 'Pending' || p.state === 1
      );
      setPendingProjects(pending);

    } catch (err) {
      console.error('Error fetching form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_name || !formData.academic_year) {
      if (!silent) alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        group_name: formData.group_name,
        academic_year: formData.academic_year,
        project: formData.project ? Number(formData.project) : null,
        members: formData.members.map(id => ({ user: id }))
      };

      if (mode === 'create') {
        await groupService.createGroup(payload);
        if (!silent) alert('تم إنشاء المجموعة بنجاح');
      } else {
        if (silent) {
          await groupService.updateGroupSilent(initialData.group_id, payload);
        } else {
          await groupService.updateGroup(initialData.group_id, payload);
        }
        if (!silent) alert('تم تحديث المجموعة بنجاح');
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving group:', err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (studentId: number) => {
    setFormData(prev => {
      const isSelected = prev.members.includes(studentId);
      if (isSelected) {
        return { ...prev, members: prev.members.filter(id => id !== studentId) };
      } else {
        return { ...prev, members: [...prev.members, studentId] };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {mode === 'create' ? <FiPlus className="text-blue-600" /> : <FiEdit3 className="text-yellow-600" />}
            {mode === 'create' ? 'إنشاء مجموعة جديدة' : 'تعديل المجموعة'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Name */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المجموعة *</label>
              <input
                type="text"
                value={formData.group_name}
                onChange={e => setFormData({ ...formData, group_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="أدخل اسم المجموعة"
                required
              />
            </div>

            {/* Academic Year */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiCalendar className="text-blue-500" /> السنة الأكاديمية *
              </label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="مثال: 2023-2024"
                required
              />
            </div>

            {/* Project Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiBook className="text-green-500" /> المشروع المرتبط (المشاريع المعلقة فقط)
              </label>
              <select
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
              >
                <option value="">-- اختر مشروعاً --</option>
                {pendingProjects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.title}</option>
                ))}
                {mode === 'edit' && initialData?.project_detail && !pendingProjects.some(p => p.project_id === initialData.project?.project_id) && (
                  <option value={initialData.project?.project_id}>{initialData.project_detail.title} (الحالي)</option>
                )}
              </select>
            </div>

            {/* Members Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiUser className="text-purple-500" /> أعضاء المجموعة (الطلاب)
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                {students.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => toggleMember(student.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition ${
                      formData.members.includes(student.id) 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-sm truncate">{student.name || student.username}</span>
                    {formData.members.includes(student.id) && <FiCheck className="text-blue-600" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">تم اختيار {formData.members.length} طلاب</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium">إلغاء</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'جاري الحفظ...' : mode === 'create' ? 'إنشاء المجموعة' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;
