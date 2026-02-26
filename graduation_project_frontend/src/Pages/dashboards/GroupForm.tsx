import React, { useState, useEffect } from 'react';
import { FiX, FiTrash, FiUsers, FiSave, FiInfo } from 'react-icons/fi';
import { groupService } from '../../services/groupService';
import { useAuthStore } from '../../store/useStore';

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: number) => void;
}

const MAX_STUDENTS = 5;
const MAX_SUPERVISORS = 3;
const MAX_CO_SUPERVISORS = 2;

interface DropdownUser {
  id: number;
  name: string;
}

const GroupForm: React.FC<GroupFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuthStore();

 // const [groupName, setGroupName] = useState('');
  const [note, setNote] = useState('');

  const [dropdownStudents, setDropdownStudents] = useState<DropdownUser[]>([]);
  const [dropdownSupervisors, setDropdownSupervisors] = useState<DropdownUser[]>([]);
  const [dropdownCoSupervisors, setDropdownCoSupervisors] = useState<DropdownUser[]>([]);

  const [selectedStudents, setSelectedStudents] = useState<DropdownUser[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<DropdownUser[]>([]);
  const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<DropdownUser[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // استخراج المعرفات من بيانات المستخدم الحالية
  const userDepartmentId = user?.department_id || 1;
  const userCollegeId = user?.college_id || 1;

  useEffect(() => {
    if (isOpen) {
      // إضافة المستخدم الحالي تلقائياً كعضو مؤسس في المجموعة
      if (user && user.id) {
        setSelectedStudents([{ id: user.id, name: user.name || user.username || 'أنت' }]);
      }
      loadDropdownData();
    }
  }, [isOpen, user]);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const data = await groupService.getDropdownData();
      
      setDropdownStudents(Array.isArray(data.students) ? data.students : []);
      setDropdownSupervisors(Array.isArray(data.supervisors) ? data.supervisors : []);
      setDropdownCoSupervisors(Array.isArray(data.assistants) ? data.assistants : []);
    } catch (error) {
      setError("فشل في تحميل قائمة الطلاب والمشرفين من النظام");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (
    u: DropdownUser,
    list: DropdownUser[],
    setter: React.Dispatch<React.SetStateAction<DropdownUser[]>>,
    max: number,
    roleName: string
  ) => {
    if (list.find(m => m.id === u.id)) {
      setter(list.filter(item => item.id !== u.id));
    } else {
      if (list.length >= max) {
        setError(`الحد الأقصى لـ ${roleName} هو ${max}`);
        return;
      }
      setter([...list, u]);
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق الأولي
    //if (!groupName.trim()) return setError('يرجى تحديد اسم للمجموعة');
    if (selectedStudents.length < 2) return setError('يجب اختيار زميل واحد على الأقل للمجموعة');

    // الـ Payload الجديد مطابق تماماً للـ GroupCreateSerializer المحدث
    // const payload = {
    //   group_name: groupName.trim(),
    //   department_id: Number(userDepartmentId),
    //   college_id: Number(userCollegeId),
    //   // إرسال المصفوفات كمعرفات فقط
    //   student_ids: selectedStudents.map(s => s.id),
    //   supervisor_ids: selectedSupervisors.map(s => s.id),
    //   co_supervisor_ids: selectedCoSupervisors.map(s => s.id),
    //   // ملاحظة: تم استبعاد بيانات المشروع بناءً على التعديل الجديد
    // };
        const payload = {
          department_id: Number(userDepartmentId),
          college_id: Number(userCollegeId),
          student_ids: selectedStudents.map(s => s.id),
          supervisor_ids: selectedSupervisors.map(s => s.id),
          co_supervisor_ids: selectedCoSupervisors.map(s => s.id),
          note: note.trim(),
        };
    try {
      setLoading(true);
      // إرسال الطلب للـ Backend
      const result = await groupService.createGroupForApproval(payload);
      
      // إبلاغ المكون الأب بالنجاح
      onSuccess(result.id); 
      onClose();
      alert("تم إرسال طلب إنشاء المجموعة بنجاح! سيتم إخطار الأعضاء والمشرفين للموافقة على الانضمام.");
    } catch (err: any) {
      // معالجة دقيقة لأخطاء السيرفر (Validation Errors)
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const errorMsg = Object.entries(serverData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        setError(errorMsg);
      } else {
        setError(err.message || 'حدث خطأ غير متوقع أثناء إنشاء المجموعة');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const MultiSelectSection = ({
    label, selectedList, maxCount, roleName, dropdownOptions, listSetter
  }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <label className="font-black text-slate-700 flex items-center justify-between mb-4">
        <span className="flex items-center gap-2"><FiUsers className="text-blue-500"/> {label}</span>
        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold uppercase tracking-tighter">الحد الأقصى {maxCount}</span>
      </label>

      <div className="space-y-2 mb-4">
        {selectedList.map((u: any) => (
          <div key={u.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-slate-600">
              {u.name} {u.id === user?.id && <span className="text-blue-500 text-xs mr-2">(أنت - منشئ الطلب)</span>}
            </span>
            {u.id !== user?.id && (
              <button type="button" onClick={() => toggleUser(u, selectedList, listSetter, maxCount, roleName)} className="text-slate-300 hover:text-red-500 transition-colors">
                <FiTrash size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedList.length < maxCount && (
        <select
          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          onChange={e => {
            const id = Number(e.target.value);
            const found = dropdownOptions.find((o: any) => o.id === id);
            if (found) toggleUser(found, selectedList, listSetter, maxCount, roleName);
            e.target.value = "";
          }}
          value=""
        >
          <option value="" disabled>اختر {roleName}...</option>
          {dropdownOptions
            .filter((u: any) => !selectedList.find((s: any) => s.id === u.id))
            .map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
        </select>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 z-[70] backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-black text-slate-800">تكوين فريق تخرج جديد</h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest italic">يركز هذا الطلب على تكوين الفريق فقط؛ اختيار المشروع يتم في خطوة لاحقة</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 text-sm font-bold rounded-xl flex items-center gap-3">
                <FiInfo className="flex-shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* القسم الأيمن: المعلومات الأساسية */}
              {/* <div className="lg:col-span-4 space-y-6">
                <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                   <h3 className="font-black text-lg mb-4 flex items-center gap-2">اسم المجموعة <FiSave className="opacity-50"/></h3>
                   <input
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 placeholder:text-white/40 outline-none focus:bg-white/20 transition-all font-bold"
                    placeholder="مثلاً: فريق رواد المستقبل"
                  />
                  <p className="text-[10px] mt-4 leading-relaxed opacity-80 font-medium italic">
                    * بمجرد إرسال الطلب، سيتم توجيهه للأعضاء للموافقة ثم للقسم للاعتماد النهائي.
                  </p>
                </div> */}

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <label className="block text-slate-700 font-black text-sm mb-3">ملاحظات للمدعوين</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                    placeholder="اكتب رسالة قصيرة لزملائك توضح فيها سبب دعوتهم لهذا الفريق..."
                  />
                </div>
              

              {/* القسم الأيسر: اختيار الأعضاء */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <MultiSelectSection
                    label="الطلاب المقترحون"
                    selectedList={selectedStudents}
                    maxCount={MAX_STUDENTS}
                    roleName="طالب"
                    dropdownOptions={dropdownStudents}
                    listSetter={setSelectedStudents}
                  />
                </div>
                
                <MultiSelectSection
                  label="المشرف الرئيسي"
                  selectedList={selectedSupervisors}
                  maxCount={MAX_SUPERVISORS}
                  roleName="مشرف"
                  dropdownOptions={dropdownSupervisors}
                  listSetter={setSelectedSupervisors}
                />

                <MultiSelectSection
                  label="المشرف المساعد"
                  selectedList={selectedCoSupervisors}
                  maxCount={MAX_CO_SUPERVISORS}
                  roleName="مساعد"
                  dropdownOptions={dropdownCoSupervisors}
                  listSetter={setSelectedCoSupervisors}
                />
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedStudents.length < 2}
              className={`px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg
                ${loading || selectedStudents.length < 2 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:scale-105 active:scale-95'}`}
            >
              {loading ? 'جاري إرسال الطلبات...' : (
                <>إنشاء المجموعة وإرسال الدعوات <FiSave size={18}/></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupForm;