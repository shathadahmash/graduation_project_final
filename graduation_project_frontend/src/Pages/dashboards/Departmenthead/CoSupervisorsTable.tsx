import React, { useEffect, useState } from 'react';
import { userService, User } from '../../../services/userService';
import { useAuthStore } from '../../../store/useStore';

const CoSupervisorsTable: React.FC = () => {
  const { user } = useAuthStore();
  const [coSupervisors, setCoSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ id: number; type: string }[]>([]);
  const [colleges, setColleges] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string; college: number }[]>([]);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [form, setForm] = useState({ username: '', name: '', email: '', phone: '', password: '' });
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  const isCoSupervisorRole = (roleType: string) => {
    return (roleType || '').toLowerCase().includes('co') && (roleType || '').toLowerCase().includes('supervisor');
  };

  // جلب المشرفين المساعدين
  useEffect(() => {
    const fetchCoSupervisors = async () => {
      setLoading(true);
      try {
        const [cols, deps, affs, users] = await Promise.all([
          userService.getColleges(),
          userService.getDepartments(),
          userService.getAffiliations(),
          userService.getAllUsers(),
        ]);
        setColleges(cols);
        setDepartments(deps);
        setAffiliations(affs);
        setAllUsers(users);

        const coSup = users.filter(u => (u.roles || []).some(r => isCoSupervisorRole(r.type)));

        // عرض كل المشرفين المساعدين حتى لو لم يكن لديهم affiliation
        setCoSupervisors(coSup);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoSupervisors();
  }, [user]);

  const openModal = async () => {
    try {
      const [us, rs, cols, deps, affs] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllRoles(),
        userService.getColleges(),
        userService.getDepartments(),
        userService.getAffiliations(),
      ]);
      setAllUsers(us);
      setRoles(rs);
      setColleges(cols);
      setDepartments(deps);
      setAffiliations(affs);

      const coRole = rs.find(r => isCoSupervisorRole(r.type)) || rs[0];
      setSelectedRoleId(coRole?.id || null);

      setSelectedUserId(null);
      setCreatingNew(false);
      setForm({ username: '', name: '', email: '', phone: '', password: '' });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('فشل جلب البيانات');
    }
  };

  const closeModal = () => setShowModal(false);

  const submitModal = async () => {
    try {
      setIsCreating(true);
      let userId = selectedUserId;
      if (creatingNew) {
        if (!form.username.trim()) { alert('يرجى إدخال اسم مستخدم صالح'); setIsCreating(false); return; }
        const payload: any = { username: form.username, name: form.name, email: form.email, phone: form.phone };
        if (form.password.trim()) payload.password = form.password;
        const newUser = await userService.createUser(payload);
        userId = newUser.id;
      }

      if (!userId || !selectedRoleId) throw new Error('يجب اختيار المستخدم والدور');

      if (!creatingNew && selectedUserId) {
        await userService.updateUser(selectedUserId, { name: form.name, email: form.email, phone: form.phone });
      }

      await userService.assignRoleToUser(userId, selectedRoleId);

      if (selectedCollegeId && selectedDepartmentId) {
        const existing = affiliations.find(a => a.user_id === userId && a.department_id === selectedDepartmentId);
        const payload = { user: userId, college: selectedCollegeId, department: selectedDepartmentId, start_date: new Date().toISOString().slice(0, 10) };
        if (existing) await userService.updateAffiliation(existing.id, payload);
        else await userService.createAffiliation(payload);
      }

      // تحديث القائمة بعد الحفظ
      const all = await userService.getAllUsers();
      const affs = await userService.getAffiliations();
      const coSup = all.filter(u => (u.roles || []).some(r => isCoSupervisorRole(r.type)));
      setCoSupervisors(coSup);
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || err.message || 'فشل الحفظ');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشرف المساعد؟')) return;
    try { await userService.deleteUser(userId); setCoSupervisors(prev => prev.filter(u => u.id !== userId)); }
    catch { alert('فشل حذف المشرف المساعد'); }
  };

  const filtered = coSupervisors.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="p-4 text-center">جاري تحميل المشرفين المساعدين...</div>;
  if (coSupervisors.length === 0) return <div className="p-4 text-center text-gray-500">لا يوجد مشرفون مساعدين</div>;

  return (
    <div className="theme-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">المشرفون المشاركون</h3>
          <p className="text-sm text-slate-500">إدارة المشرفين المشاركين (Co-supervisors)</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث" className="border p-2 rounded" />
          <button className="btn-blue" onClick={openModal}>إضافة</button>
        </div>
      </div>

      <div className="dean-table-container overflow-x-auto">
        <table className="dean-table w-full min-w-[900px] border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border text-right">الاسم</th>
              <th className="p-2 border text-right">اسم المستخدم</th>
              <th className="p-2 border text-right">البريد</th>
              <th className="p-2 border text-right">الهاتف</th>
              <th className="p-2 border text-right">الكلية</th>
              <th className="p-2 border text-right">القسم</th>
              <th className="p-2 border text-right">الأدوار</th>
              <th className="p-2 border">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const a = affiliations.filter(x => x.user_id === u.id && (!x.end_date || new Date(x.end_date) >= new Date()))[0];
              const collegeName = a ? colleges.find(c => c.id === a.college_id)?.name || '—' : '—';
              const deptName = a ? departments.find(d => d.id === a.department_id)?.name || '—' : '—';
              return (
                <tr key={u.id} className="hover:bg-primary-50">
                  <td className="p-2 border text-right">{i + 1}</td>
                  <td className="p-2 border text-right">{u.name || '—'}</td>
                  <td className="p-2 border text-right">{u.username || '—'}</td>
                  <td className="p-2 border text-right">{u.email || '—'}</td>
                  <td className="p-2 border text-right">{u.phone || '—'}</td>
                  <td className="p-2 border text-right">{collegeName}</td>
                  <td className="p-2 border text-right">{deptName}</td>
                  <td className="p-2 border text-right">{(u.roles || []).map(r => r.type).join(', ') || '—'}</td>
                  <td className="p-2 border">
                    <div className="flex items-center justify-center gap-2">
                      <button className="btn-outline-blue" onClick={() => openModal()}>تعديل</button>
                      <button className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700" onClick={() => handleDelete(u.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoSupervisorsTable;