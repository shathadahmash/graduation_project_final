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

  // Helper function to get department head's department from AcademicAffiliation
  const getDepartmentHeadDepartmentId = async (userId: number): Promise<number | null> => {
    try {
      const affiliations = await userService.getAffiliations();
      
      // Find active affiliation for the logged-in department head user
      const activeAffiliations = affiliations.filter((aff: any) => {
        if (aff.user_id !== userId) return false;
        if (!aff.end_date) return true;
        const endDate = new Date(aff.end_date);
        return endDate >= new Date();
      });
      
      // Get the most recent active affiliation with a department
      const affiliationWithDepartment = activeAffiliations
        .filter((aff: any) => aff.department_id)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          return dateB.getTime() - dateA.getTime();
        })[0];
      
      let departmentId = affiliationWithDepartment?.department_id || null;
      
      // Fallback to user.department_id from auth store if no affiliation found
      if (!departmentId && user?.department_id) {
        departmentId = user.department_id;
      }
      
      return departmentId;
    } catch (err) {
      console.error('[CoSupervisorsTable] Failed to fetch department head department:', err);
      return user?.department_id || null;
    }
  };

  useEffect(() => {
    const fetchCoSupervisors = async () => {
      try {
        setLoading(true);
        // First fetch affiliations to get department head's department
        const [cols, deps, affs] = await Promise.all([userService.getColleges(), userService.getDepartments(), userService.getAffiliations()]);
        setColleges(cols);
        setDepartments(deps);
        setAffiliations(affs);

        // Get department head's department from AcademicAffiliation
        const deptHeadDepartmentId = user?.id ? await getDepartmentHeadDepartmentId(user.id) : null;

        const all = await userService.getAllUsers();
        const filtered = all.filter(u => (u.roles || []).some(r => {
          const t = (r.type || '').toString().toLowerCase().replace(/[_-]/g, ' ');
          return t.includes('co') && t.includes('supervisor');
        }));

        // Filter co-supervisors by department head's department using their affiliations
        if (deptHeadDepartmentId) {
          const filteredByDepartment = filtered.filter(sup => {
            // Find the co-supervisor's affiliation
            const supAff = affs.find((a: any) => a.user_id === sup.id);
            if (!supAff || !supAff.department_id) return false;
            return Number(supAff.department_id) === Number(deptHeadDepartmentId);
          });
          setCoSupervisors(filteredByDepartment);
        } else {
          setCoSupervisors(filtered);
        }
      } catch (err) {
        console.error(err);
        // Fallback
        try {
          const all = await userService.getAllUsers();
          const filtered = all.filter(u => (u.roles || []).some(r => {
            const t = (r.type || '').toString().toLowerCase().replace(/[_-]/g, ' ');
            return t.includes('co') && t.includes('supervisor');
          }));
          setCoSupervisors(filtered);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCoSupervisors();
  }, [user]);

  const openModal = async () => {
    try {
      const us = await userService.getAllUsers();
      const rs = await userService.getAllRoles();
      setAllUsers(us);
      setRoles(rs);
      // choose co-supervisor role if exists
      const r = rs.find(r => (r.type || '').toLowerCase().includes('co') && (r.type || '').toLowerCase().includes('supervisor')) || rs[0];
      setSelectedRoleId(r ? r.id : (rs[0] && rs[0].id) || null);
      setSelectedUserId(null);
      setCreatingNew(false);
      setForm({ username: '', name: '', email: '', phone: '', password: '' });
      try {
        const [cols, deps, affs] = await Promise.all([userService.getColleges(), userService.getDepartments(), userService.getAffiliations()]);
        console.log('[CoSupervisorsTable] modal fetched colleges', cols?.length, 'departments', deps?.length, 'affiliations', affs?.length);
        setColleges(cols);
        setDepartments(deps);
        setAffiliations(affs);
      } catch (e) { console.warn('[CoSupervisorsTable] failed load affiliations', e); }
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
        if (!form.username || form.username.trim() === '') { alert('يرجى إدخال اسم مستخدم صالح'); setIsCreating(false); return; }
        const payload: any = { username: form.username, name: form.name, email: form.email, phone: form.phone };
        if (form.password && form.password.trim()) payload.password = form.password;
        const newUser = await userService.createUser(payload as any);
        userId = newUser.id;
      }
      if (!userId) throw new Error('No user selected');
      if (!selectedRoleId) throw new Error('No role selected');
      if (!creatingNew && selectedUserId) {
        await userService.updateUser(selectedUserId, { name: form.name, email: form.email, phone: form.phone });
      }
      await userService.assignRoleToUser(userId, selectedRoleId);
      // affiliation create/update
      try {
        if (selectedCollegeId && selectedDepartmentId) {
          const existing = affiliations.find(a => a.user_id === userId);
          const payload = { user: userId, college: selectedCollegeId, department: selectedDepartmentId, start_date: new Date().toISOString().slice(0,10) };
          console.log('[CoSupervisorsTable] affiliation submit', { userId, selectedCollegeId, selectedDepartmentId, existing });
          if (existing) {
            await userService.updateAffiliation(existing.id, { college: selectedCollegeId, department: selectedDepartmentId, start_date: payload.start_date });
            console.log('[CoSupervisorsTable] updated affiliation id', existing.id);
          } else {
            const created = await userService.createAffiliation(payload as any);
            console.log('[CoSupervisorsTable] created affiliation', created);
          }
        } else {
          console.log('[CoSupervisorsTable] no college/department selected, skipping affiliation');
        }
      } catch (e) { console.warn('[CoSupervisorsTable] failed create/update affiliation', e); }
      const all = await userService.getAllUsers();
      const filtered = all.filter(u => (u.roles || []).some(r => ((r.type || '').toString().toLowerCase().replace(/[_-]/g,' ')).includes('co') && ((r.type || '').toString().toLowerCase().replace(/[_-]/g,' ')).includes('supervisor')));
      setCoSupervisors(filtered);
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || err.message || 'فشل الحفظ');
    } finally { setIsCreating(false); }
  };

  const handleEdit = async (u: User) => {
    try {
      const us = await userService.getAllUsers();
      const rs = await userService.getAllRoles();
      setAllUsers(us); setRoles(rs);
      setSelectedUserId(u.id); setCreatingNew(false);
      setForm({ username: u.username, name: u.name || '', email: u.email || '', phone: u.phone || '', password: '' });
      const coRole = (u.roles || []).find(r => ((r.type||'').toLowerCase().includes('co') && (r.type||'').toLowerCase().includes('supervisor')));
      if (coRole) setSelectedRoleId(coRole.id);
      else { const r = rs.find(r => (r.type||'').toLowerCase().includes('co') && (r.type||'').toLowerCase().includes('supervisor')); setSelectedRoleId(r ? r.id : (rs[0] && rs[0].id) || null); }
      setShowModal(true);
      try {
        const affs = await userService.getAffiliations();
        console.log('[CoSupervisorsTable] edit modal loaded affiliations', affs?.length);
        setAffiliations(affs);
        const my = affs.find(a => a.user_id === u.id);
        if (my) { console.log('[CoSupervisorsTable] found affiliation for user', u.id, my); setSelectedCollegeId(my.college_id || null); setSelectedDepartmentId(my.department_id || null); }
        else { console.log('[CoSupervisorsTable] no affiliation for user', u.id); setSelectedCollegeId(null); setSelectedDepartmentId(null); }
      } catch (e) { console.warn('[CoSupervisorsTable] failed load affiliation', e); }
    } catch (err) { console.error(err); alert('فشل جلب بيانات'); }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشرف المساعد؟')) return;
    try { await userService.deleteUser(userId); setCoSupervisors(prev => prev.filter(u => u.id !== userId)); }
    catch (err) { alert('فشل حذف المشرف المساعد'); }
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

      <div className="dean-table-container">
        <table className="dean-table w-full border-collapse text-center">
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
          {filtered.map((u, i) => (
            <tr key={u.id} className="hover:bg-primary-50">
              <td className="p-2 border text-right">{i+1}</td>
              <td className="p-2 border text-right">{u.name || '—'}</td>
              <td className="p-2 border text-right">{u.username || '—'}</td>
              <td className="p-2 border text-right">{u.email || '—'}</td>
              <td className="p-2 border text-right">{u.phone || '—'}</td>
              <td className="p-2 border text-right">{(() => {
                const a = affiliations.find(x => x.user_id === u.id);
                if (!a) return '—';
                const c = colleges.find(cc => cc.id === a.college_id);
                return c ? c.name : a.college_id || '—';
              })()}</td>
              <td className="p-2 border text-right">{(() => {
                const a = affiliations.find(x => x.user_id === u.id);
                if (!a) return '—';
                const d = departments.find(dd => dd.id === a.department_id);
                return d ? d.name : a.department_id || '—';
              })()}</td>
              <td className="p-2 border text-right">{(u.roles||[]).map(r=>r.type).join(', ') || '—'}</td>
              <td className="p-2 border">
                <div className="flex items-center justify-center gap-2">
                  <button className="btn-outline-blue" onClick={() => handleEdit(u)}>تعديل</button>
                  <button className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700" onClick={() => handleDelete(u.id)}>حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={closeModal} />
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">إضافة/اختيار مشرف مشارك</h3>

            <div className="mb-3">
              <label className="block mb-1">اختيار مستخدم موجود</label>
              <select className="w-full border p-2 rounded" value={selectedUserId ?? ''} onChange={e => { setSelectedUserId(e.target.value ? Number(e.target.value) : null); setCreatingNew(false); }}>
                <option value="">-- اختر مستخدماً --</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.username} ({u.email || '—'})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={creatingNew} onChange={e => { setCreatingNew(e.target.checked); if (e.target.checked) setSelectedUserId(null); }} />
                إنشاء مستخدم جديد
              </label>
            </div>

            {creatingNew && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input className="border p-2 rounded" placeholder="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                <input className="border p-2 rounded" placeholder="الاسم الكامل" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="border p-2 rounded" placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="border p-2 rounded" placeholder="الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <input type="password" className="border p-2 rounded" placeholder="كلمة المرور" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block mb-1">الكلية</label>
                <select className="w-full border p-2 rounded" value={selectedCollegeId ?? ''} onChange={e => { setSelectedCollegeId(e.target.value ? Number(e.target.value) : null); setSelectedDepartmentId(null); }}>
                  <option value="">-- اختر كلية --</option>
                  {colleges.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block mb-1">القسم</label>
                <select className="w-full border p-2 rounded" value={selectedDepartmentId ?? ''} onChange={e => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- اختر قسم --</option>
                  {departments.filter(d => !selectedCollegeId || d.college === selectedCollegeId).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1">دور</label>
              <select className="w-full border p-2 rounded" value={selectedRoleId ?? ''} onChange={e => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">-- اختر دوراً --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.type}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeModal} disabled={isCreating}>إلغاء</button>
              <button className="px-4 py-2 btn-blue text-white rounded" onClick={submitModal} disabled={isCreating}>{isCreating ? 'جاري الحفظ...' : 'حفظ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoSupervisorsTable;
