import React, { useState, useEffect } from "react";
import { FiX, FiTrash, FiUsers } from "react-icons/fi";
import { groupService } from "../../../services/groupService";
import { useAuthStore } from "../../../store/useStore";

interface DeptHeadGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: number) => void;
}

interface DropdownUser {
  id: number;
  name: string;
}

const MAX_STUDENTS = 5;
const MAX_SUPERVISORS = 3;
const MAX_CO_SUPERVISORS = 2;

const DeptHeadGroupForm: React.FC<DeptHeadGroupFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuthStore();

  const [groupName, setGroupName] = useState("");
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

  useEffect(() => {
    if (isOpen) {
      if (user && user.id) {
        setSelectedStudents([{ id: user.id, name: user.name || user.username || "أنت" }]);
      }
      loadDropdownData();
    } else {
      setGroupName("");
      setNote("");
      setSelectedStudents(user && user.id ? [{ id: user.id, name: user.name || user.username || "أنت" }] : []);
      setSelectedSupervisors([]);
      setSelectedCoSupervisors([]);
      setError("");
    }
  }, [isOpen, user]);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const data = await groupService.getDropdownData();
      setDropdownStudents(Array.isArray(data.students) ? data.students : []);
      setDropdownSupervisors(Array.isArray(data.supervisors) ? data.supervisors : []);
      setDropdownCoSupervisors(Array.isArray(data.assistants) ? data.assistants : []);
    } catch {
      setError("فشل في تحميل بيانات الاختيار");
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

    if (!groupName.trim()) return setError("يرجى تحديد اسم للمجموعة");
    if (selectedStudents.length < 2) return setError("يجب اختيار زميل واحد على الأقل للمجموعة");

    const payload = {
      group_name: groupName.trim(),
      department_id: Number(userDepartmentId),
      college_id: Number(userCollegeId),
      student_ids: selectedStudents.map((s) => s.id),
      supervisor_ids: selectedSupervisors.map((s) => s.id),
      co_supervisor_ids: selectedCoSupervisors.map((s) => s.id),
      note: note || undefined,
    };

    try {
      setLoading(true);
      const result = await groupService.createGroupAsSupervisor(payload);
      const newId = result?.id || result?.group_id || -1;
      onSuccess(Number(newId));
      onClose();
      alert("تم إنشاء المجموعة بنجاح.");
    } catch (err: any) {
      const serverData = err.response?.data;
      if (serverData && typeof serverData === "object") {
        const errorMsg = Object.entries(serverData).map(([k, v]) => `${k}: ${v}`).join(" | ");
        setError(errorMsg);
      } else {
        setError(err?.message || "حدث خطأ أثناء إنشاء المجموعة");
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
        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold">الحد الأقصى {maxCount}</span>
      </label>

      <div className="space-y-2 mb-3">
        {selectedList.map((u: any) => (
          <div key={u.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-sm font-bold text-slate-600">
              {u.name} {u.id === user?.id && <span className="text-blue-500 text-xs mr-2">(أنت)</span>}
            </span>
            {u.id !== user?.id && (
              <button type="button" onClick={() => toggleUser(u, selectedList, listSetter, maxCount, roleName)} className="text-slate-300 hover:text-red-500">
                <FiTrash size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedList.length < maxCount && (
        <select
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
          onChange={(e) => {
            const id = Number((e.currentTarget as HTMLSelectElement).value);
            const found = dropdownOptions.find((o: any) => o.id === id);
            if (found) toggleUser(found, selectedList, listSetter, maxCount, roleName);
            (e.currentTarget as HTMLSelectElement).value = "";
          }}
          value=""
        >
          <option value="" disabled>اختر {roleName}...</option>
          {dropdownOptions.filter((u: any) => !selectedList.find((s: any) => s.id === u.id)).map((u: any) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black">إنشاء مجموعة (رئيس القسم)</h2>
              <p className="text-xs text-slate-500">ينشأ مباشرةً كمجموعة معتمدة بواسطة القسم</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400"><FiX /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-4">
                <div className="p-4 bg-blue-600 text-white rounded-lg">
                  <label className="font-black">اسم المجموعة</label>
                  <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="mt-2 w-full p-2 rounded bg-white/10" placeholder="مثلاً: فريق التطبيقات" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <label className="font-bold text-sm">ملاحظات</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 mt-2 rounded border" rows={4} />
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelectSection label="الطلاب" selectedList={selectedStudents} maxCount={MAX_STUDENTS} roleName="طالب" dropdownOptions={dropdownStudents} listSetter={setSelectedStudents} />
                <MultiSelectSection label="المشرف الرئيسي" selectedList={selectedSupervisors} maxCount={MAX_SUPERVISORS} roleName="مشرف" dropdownOptions={dropdownSupervisors} listSetter={setSelectedSupervisors} />
                <MultiSelectSection label="المشرف المساعد" selectedList={selectedCoSupervisors} maxCount={MAX_CO_SUPERVISORS} roleName="مساعد" dropdownOptions={dropdownCoSupervisors} listSetter={setSelectedCoSupervisors} />
              </div>
            </div>
          </form>

          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">إلغاء</button>
            <button onClick={handleSubmit} disabled={loading || selectedStudents.length < 2} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? "جاري الإنشاء..." : "إنشاء مجموعة مباشرة"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeptHeadGroupForm;