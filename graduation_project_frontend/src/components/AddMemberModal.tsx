import React, { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import { FiUserPlus, FiSend, FiLoader } from 'react-icons/fi';

const AddMemberPage = ({ requestId, onSuccess }: { requestId: number, onSuccess?: () => void }) => {
  const [role, setRole] = useState('student');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // تحميل قائمة المستخدمين عند تغيير الدور (طالب/مشرف/مساعد)
  useEffect(() => {
    const loadUsers = async () => {
      setFetching(true);
      try {
        const data = await groupService.getDropdownData();
        if (role === 'student') setUsers(data.students || []);
        else if (role === 'supervisor') setUsers(data.supervisors || []);
        else setUsers(data.assistants || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setFetching(false);
      }
    };
    loadUsers();
  }, [role]);

  const handleSendInvite = async () => {
    if (!selectedUser) {
      alert("الرجاء اختيار مستخدم من القائمة");
      return;
    }

    setLoading(true);
    try {
      // استدعاء الدالة المحدثة في الباك إيند
      await groupService.sendIndividualInvite(requestId, parseInt(selectedUser), role);
      
      alert("تم إرسال الدعوة الرسمية بنجاح");
      setSelectedUser('');
      
      // إذا تم تمرير دالة onSuccess، نقوم بتنفيذها لتحديث قائمة الحالة
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "حدث خطأ أثناء إرسال الدعوة";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 text-right animate-in slide-in-from-left duration-500">
      {/* العنوان */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-100">
          <FiUserPlus />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">إرسال دعوة انضمام</h2>
          <p className="text-slate-400 font-bold text-xs">إضافة أعضاء جدد لطلب إنشاء المجموعة #{requestId}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* اختيار الدور */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-4">حدد نوع العضو المراد إضافته</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'student', label: 'طالب' },
              { id: 'supervisor', label: 'مشرف' },
              { id: 'co_supervisor', label: 'أستاذ مساعد' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setSelectedUser(''); }}
                className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${
                  role === r.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* اختيار الاسم */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-4">اختر الاسم من القائمة</label>
          <div className="relative">
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={fetching}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50"
            >
              <option value="">{fetching ? "جاري تحميل الأسماء..." : "-- ابحث عن الاسم هنا --"}</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.username ? `(${u.username})` : ''}
                </option>
              ))}
            </select>
            {fetching && <FiLoader className="absolute left-5 top-6 animate-spin text-blue-600" />}
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          onClick={handleSendInvite}
          disabled={loading || !selectedUser || fetching}
          className="w-full py-5 bg-[#0F172A] text-white rounded-2xl font-black shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري معالجة الطلب...' : <><FiSend /> إرسال الدعوة الرسمية</>}
        </button>
      </div>
    </div>
  );
};

export default AddMemberPage;