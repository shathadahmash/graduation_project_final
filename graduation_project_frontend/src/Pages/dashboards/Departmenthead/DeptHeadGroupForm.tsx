import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiTrash, FiUsers } from "react-icons/fi";
import { groupService } from "../../../services/groupService";
import { useAuthStore } from "../../../store/useStore";

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: number) => void;
  initialData?: any; // بيانات المجموعة للتعديل
  mode?: 'create' | 'edit'; // وضع الإنشاء أو التعديل
}

interface DropdownUser {
  id: number;
  name: string;
}

const MAX_STUDENTS = 5;
const MAX_SUPERVISORS = 3;
const MAX_CO_SUPERVISORS = 2;

const GroupForm: React.FC<GroupFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData,
  mode = 'create'
}) => {
  const { user } = useAuthStore();

  const [note, setNote] = useState("");

  const [dropdownStudents, setDropdownStudents] = useState<DropdownUser[]>([]);
  const [dropdownSupervisors, setDropdownSupervisors] = useState<DropdownUser[]>([]);
  const [dropdownCoSupervisors, setDropdownCoSupervisors] = useState<DropdownUser[]>([]);

  const [selectedStudents, setSelectedStudents] = useState<DropdownUser[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<DropdownUser[]>([]);
  const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<DropdownUser[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userDepartmentId = user?.department_id || 0;
  const userCollegeId = user?.college_id || 0;
  const isEditMode = mode === 'edit' && !!initialData;

  // دالة لتحميل البيانات المنسدلة
  const loadDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupService.getDropdownData();
      setDropdownStudents(Array.isArray(data.students) ? data.students : []);
      setDropdownSupervisors(Array.isArray(data.supervisors) ? data.supervisors : []);
      setDropdownCoSupervisors(Array.isArray(data.assistants) ? data.assistants : []);
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      setError("فشل في تحميل بيانات الاختيار");
    } finally {
      setLoading(false);
    }
  }, []);

  // معالجة فتح وإغلاق الفورم وتحميل البيانات
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      
      if (isEditMode && initialData) {
        console.log("[GroupForm] Loading initialData for edit (No Group Name):", initialData);
        
        // 1. تحميل الملاحظات فقط (تم حذف اسم المجموعة)
        setNote(initialData.note || "");
        
        // 2. تحميل الطلاب (الأعضاء)
        const members = initialData.members || [];
        const students = members.map((m: any) => ({
          id: m.user || m.user_id || m.id,
          name: m.user_detail?.name || m.user_detail?.username || m.name || `طالب #${m.user || m.user_id || m.id}`
        }));
        setSelectedStudents(students);
        
        // 3. تحميل المشرفين الرئيسيين
        const supervisorsData = initialData.supervisors || [];
        const supervisors = supervisorsData.map((s: any) => ({
          id: s.user || s.user_id || s.id,
          name: s.user_detail?.name || s.name || `مشرف #${s.user || s.user_id || s.id}`
        }));
        setSelectedSupervisors(supervisors);
        
        // 4. تحميل المشرفين المساعدين
        const coSupervisorsData = initialData.co_supervisors || [];
        const coSupervisors = coSupervisorsData.map((cs: any) => ({
          id: cs.user || cs.user_id || cs.id,
          name: cs.user_detail?.name || cs.name || `مساعد #${cs.user || cs.user_id || cs.id}`
        }));
        setSelectedCoSupervisors(coSupervisors);
        
      } else {
        // وضع الإنشاء: تصفير الحقول وإضافة المستخدم الحالي كطالب أول
        setNote("");
        if (user && user.id) {
          setSelectedStudents([{ id: user.id, name: user.name || user.username || "أنت" }]);
        } else {
          setSelectedStudents([]);
        }
        setSelectedSupervisors([]);
        setSelectedCoSupervisors([]);
      }
      setError("");
    }
  }, [isOpen, isEditMode, initialData, user, loadDropdownData]);

  const toggleUser = (
    u: DropdownUser,
    list: DropdownUser[],
    setter: React.Dispatch<React.SetStateAction<DropdownUser[]>>,
    max: number,
    roleName: string
  ) => {
    if (list.find((m) => m.id === u.id)) {
      setter(list.filter((item) => item.id !== u.id));
    } else {
      if (list.length >= max) {
        setError(`الحد الأقصى لـ ${roleName} هو ${max}`);
        return;
      }
      setter([...list, u]);
    }
    if (error) setError("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (selectedStudents.length < 1) return setError("يجب اختيار طالب واحد على الأقل للمجموعة");

    const payload = {
      // تم حذف group_name من الـ payload
      department_id: Number(userDepartmentId),
      college_id: Number(userCollegeId),
      student_ids: selectedStudents.map((s) => s.id),
      supervisor_ids: selectedSupervisors.map((s) => s.id),
      co_supervisor_ids: selectedCoSupervisors.map((s) => s.id),
      note: note || undefined,
    };

    try {
      setLoading(true);
      let result;
      
      if (isEditMode) {
        await groupService.updateGroup(initialData.group_id || initialData.id, payload);
        alert("تم تحديث المجموعة بنجاح.");
        onSuccess(initialData.group_id || initialData.id);
      } else {
        result = await groupService.createGroupAsSupervisor(payload);
        const newId = result?.id || result?.group_id || -1;
        alert("تم إنشاء المجموعة بنجاح.");
        onSuccess(Number(newId));
      }
      
      onClose();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      const serverData = err.response?.data;
      if (serverData && typeof serverData === "object") {
        const errorMsg = Object.entries(serverData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(errorMsg);
      } else {
        setError(err?.message || "حدث خطأ أثناء معالجة الطلب");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const MultiSelectSection = ({ label, selectedList, maxCount, roleName, dropdownOptions, listSetter }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <label className="font-black text-slate-700 flex items-center justify-between mb-3">
        <span className="flex items-center gap-2"><FiUsers className="text-blue-500" /> {label}</span>
        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold">
          {selectedList.length} / {maxCount}
        </span>
      </label>

      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {selectedList.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">لا يوجد {label} مختارين</p>
        )}
        {selectedList.map((u: any) => (
          <div key={u.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-sm font-bold text-slate-600 truncate flex-1 ml-2">
              {u.name} {u.id === user?.id && <span className="text-blue-500 text-xs mr-1">(أنت)</span>}
            </span>
            <button 
              type="button" 
              onClick={() => toggleUser(u, selectedList, listSetter, maxCount, roleName)} 
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <FiTrash size={16} />
            </button>
          </div>
        ))}
      </div>

      {selectedList.length < maxCount && (
        <select
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => {
            const id = Number(e.target.value);
            const found = dropdownOptions.find((o: any) => o.id === id);
            if (found) toggleUser(found, selectedList, listSetter, maxCount, roleName);
            e.target.value = "";
          }}
          value=""
        >
          <option value="" disabled>إضافة {roleName}...</option>
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
      <div className="fixed inset-0 bg-slate-900/60 z-[70] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto" dir="rtl">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {isEditMode ? `تعديل المجموعة #${initialData.group_id || initialData.id}` : "إنشاء مجموعة جديدة"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isEditMode ? "تحديث بيانات الأعضاء والمشرفين للمجموعة" : "إضافة مجموعة جديدة وتعيين الطلاب والمشرفين لها"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 animate-shake">
                <span className="text-xl">⚠️</span>
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="font-bold text-slate-700 block mb-2">ملاحظات إضافية</label>
                  <textarea 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[120px]" 
                    placeholder="أضف أي ملاحظات هنا..."
                  />
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelectSection 
                  label="الطلاب" 
                  selectedList={selectedStudents} 
                  maxCount={MAX_STUDENTS} 
                  roleName="طالب" 
                  dropdownOptions={dropdownStudents} 
                  listSetter={setSelectedStudents} 
                />
                <div className="space-y-4">
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
            </div>
          </form>

          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-white transition-all"
            >
              إلغاء
            </button>
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={loading || selectedStudents.length < 1} 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                isEditMode ? "حفظ التعديلات" : "إنشاء المجموعة"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupForm;