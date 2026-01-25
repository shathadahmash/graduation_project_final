import React, { useEffect, useState } from 'react';
import { userService, User } from '../services/userService';
import { exportToCSV } from './tableUtils';
import { containerClass, tableWrapperClass, tableClass, theadClass } from './tableStyles';

const SupervisorsTable: React.FC = () => {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | ''>('');
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
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [currentAffiliationId, setCurrentAffiliationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setLoading(true);
        const allUsers = await userService.getAllUsers();
        // فلتر فقط المشرفين (استبعاد المشرفين المساعدين)
        const normalize = (s: string) => (s || '').toString().toLowerCase().replace(/[_-]/g, ' ').trim();

        const isSupervisorRole = (roleType: string) => {
          const t = normalize(roleType);
          if (!t.includes('supervisor')) return false;
          // استبعد أي دور يحتوي على "co" كرمز منفصل أو صيغ co-supervisor
          if (/(^|\s)co(\s|$)/.test(t) || t.includes('co supervisor') || t.includes('cosupervisor')) return false;
          return true;
        };

        const filtered = allUsers.filter(u => u.roles.some(r => isSupervisorRole(r.type)));
        setSupervisors(filtered);
        // also keep all users for modal
        setAllUsers(allUsers);
        // load affiliation helpers so we can display college/department
        try {
          const [cols, deps, affs] = await Promise.all([userService.getColleges(), userService.getDepartments(), userService.getAffiliations()]);
          console.log('[SupervisorsTable] fetched colleges', cols?.length, 'departments', deps?.length, 'affiliations', affs?.length);
          setColleges(cols);
          setDepartments(deps);
          setAffiliations(affs);
        } catch (e) {
          console.warn('[SupervisorsTable] Failed load affiliation helpers', e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  const openModal = async () => {
    try {
      const us = await userService.getAllUsers();
      const rs = await userService.getAllRoles();
      setAllUsers(us);
      setRoles(rs);
      // pick supervisor role if exists
      const normalizeRole = (s: string) => (s || '').toString().toLowerCase().replace(/[_-]/g, ' ').trim();
      const supervisorRole = rs.find(r => normalizeRole(r.type) === 'supervisor') || rs.find(r => normalizeRole(r.type).includes('supervisor') && !/(^|\s)co(\s|$)/.test(normalizeRole(r.type)));
      setSelectedRoleId(supervisorRole ? supervisorRole.id : (rs[0] && rs[0].id) || null);
      // load colleges/departments
      try {
        const [cols, deps, affs] = await Promise.all([userService.getColleges(), userService.getDepartments(), userService.getAffiliations()]);
        console.log('[SupervisorsTable] modal fetched colleges', cols?.length, 'departments', deps?.length, 'affiliations', affs?.length);
        setColleges(cols);
        setDepartments(deps);
        setAffiliations(affs);
      } catch (e) {
        console.warn('[SupervisorsTable] Failed load affiliation helpers', e);
      }
      setSelectedUserId(null);
      setCreatingNew(false);
      setForm({ username: '', name: '', email: '', phone: '', password: '' });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to open modal', err);
      alert('فشل جلب البيانات');
    }
  };

  const closeModal = () => setShowModal(false);

  const submitModal = async () => {
    try {
      setIsCreating(true);
      let userId = selectedUserId;
      if (creatingNew) {
        // basic validation: username required
        if (!form.username || form.username.trim() === '') {
          alert('يرجى إدخال اسم مستخدم صالح');
          setIsCreating(false);
          return;
        }
        // create user (include password if provided)
        const createPayload: any = { username: form.username, name: form.name, email: form.email, phone: form.phone };
        if (form.password && form.password.trim() !== '') createPayload.password = form.password;
        const newUser = await userService.createUser(createPayload as any);
        userId = newUser.id;
      }
      if (!userId) throw new Error('No user selected or created');
      if (!selectedRoleId) throw new Error('No role selected');
      // If editing existing user, update their basic info as well
      if (!creatingNew && selectedUserId) {
        const payload: any = { name: form.name, email: form.email, phone: form.phone };
        await userService.updateUser(selectedUserId, payload);
      }
      await userService.assignRoleToUser(userId, selectedRoleId);
      // handle academic affiliation create/update
      try {
        if (selectedCollegeId && selectedDepartmentId) {
          const existing = affiliations.find(a => a.user_id === userId);
          const payload = { user: userId, college: selectedCollegeId, department: selectedDepartmentId, start_date: new Date().toISOString().slice(0,10) };
          console.log('[SupervisorsTable] affiliation submit', { userId, selectedCollegeId, selectedDepartmentId, existing });
          if (existing) {
            await userService.updateAffiliation(existing.id, { college: selectedCollegeId, department: selectedDepartmentId, start_date: payload.start_date });
            console.log('[SupervisorsTable] updated affiliation id', existing.id);
          } else {
            const created = await userService.createAffiliation(payload as any);
            console.log('[SupervisorsTable] created affiliation', created);
          }
        } else {
          console.log('[SupervisorsTable] no college/department selected, skipping affiliation');
        }
      } catch (e) {
        console.warn('[SupervisorsTable] Failed create/update affiliation', e);
      }
      // refresh supervisors list
      const us = await userService.getAllUsers();
      const normalize = (s: string) => (s || '').toString().toLowerCase().replace(/[_-]/g, ' ').trim();
      const isSupervisorRole = (roleType: string) => {
        const t = normalize(roleType);
        if (!t.includes('supervisor')) return false;
        if (/(^|\s)co(\s|$)/.test(t) || t.includes('co supervisor') || t.includes('cosupervisor')) return false;
        return true;
      };
      const filtered = us.filter(u => u.roles.some(r => isSupervisorRole(r.type)));
      setSupervisors(filtered);
      setShowModal(false);
    } catch (err: any) {
      console.error('Failed submit', err);
      alert(err?.response?.data?.detail || err.message || 'فشل الإضافة');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
    try {
      await userService.deleteUser(userId);
      setSupervisors(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('فشل حذف المشرف');
    }
  };

  const handleCreate = async () => {
    // open modal and preload roles/users so default role becomes Supervisor
    await openModal();
  };

  const filteredSupervisors = supervisors.filter(u => {
    const q = search.trim().toLowerCase();
    if (q) {
      if ((u.name || '').toLowerCase().includes(q)) return true;
      if ((u.email || '').toLowerCase().includes(q)) return true;
      if ((u.username || '').toLowerCase().includes(q)) return true;
      return false;
    }
    if (roleFilter) {
      return (u.roles || []).some(r => r.id === roleFilter);
    }
    return true;
  });

  const handleEdit = async (user: User) => {
    try {
      const us = await userService.getAllUsers();
      const rs = await userService.getAllRoles();
      setAllUsers(us);
      setRoles(rs);
      // prefill form with user data
      setSelectedUserId(user.id);
      setCreatingNew(false);
      setForm({ username: user.username, name: user.name || '', email: user.email || '', phone: user.phone || '', password: '' });
      // choose a supervisor role id if user has one, otherwise pick default supervisor role
      const normalizeRole = (s: string) => (s || '').toString().toLowerCase().replace(/[_-]/g, ' ').trim();
      const isSupervisorType = (t: string) => {
        const n = normalizeRole(t);
        if (!n.includes('supervisor')) return false;
        if (/(^|\s)co(\s|$)/.test(n) || n.includes('co supervisor') || n.includes('cosupervisor')) return false;
        return true;
      };
      const userSupervisorRole = (user.roles || []).find(r => isSupervisorType(r.type));
      if (userSupervisorRole) {
        setSelectedRoleId(userSupervisorRole.id);
      } else {
        const supervisorRole = rs.find(r => normalizeRole(r.type) === 'supervisor') || rs.find(r => normalizeRole(r.type).includes('supervisor') && !/(^|\s)co(\s|$)/.test(normalizeRole(r.type)));
        setSelectedRoleId(supervisorRole ? supervisorRole.id : (rs[0] && rs[0].id) || null);
      }
      setShowModal(true);
      // prefill affiliation if exists
      try {
        const affs = await userService.getAffiliations();
        console.log('[SupervisorsTable] edit modal loaded affiliations', affs?.length);
        setAffiliations(affs);
        const my = affs.find(a => a.user_id === user.id);
        if (my) {
          console.log('[SupervisorsTable] found affiliation for user', user.id, my);
          setCurrentAffiliationId(my.id);
          setSelectedCollegeId(my.college_id || null);
          setSelectedDepartmentId(my.department_id || null);
        } else {
          console.log('[SupervisorsTable] no affiliation for user', user.id);
          setCurrentAffiliationId(null);
          setSelectedCollegeId(null);
          setSelectedDepartmentId(null);
        }
      } catch (e) { console.warn('[SupervisorsTable] failed load user affiliation', e); }
    } catch (err) {
      console.error('Failed to open edit modal', err);
      alert('فشل جلب بيانات التعديل');
    }
  };

  if (loading) return <div className="p-4 text-center">جاري تحميل المشرفين...</div>;

  if (supervisors.length === 0) return <div className="p-4 text-center text-gray-500">لا يوجد مشرفون</div>;
  return (
    <div className={containerClass}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">المشرفين</h3>
          <p className="text-sm text-slate-500">إدارة المشرفين وإضافة/تعديل الأدوار</p>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="بحث باسم أو بريد" value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded" />
          <select value={roleFilter as any} onChange={e => setRoleFilter(e.target.value ? Number(e.target.value) : '')} className="border p-2 rounded">
            <option value="">كل الأدوار</option>
            {/* roles list if loaded in modal; use supervisors' roles to populate */}
            {Array.from(new Map(supervisors.flatMap(u => u.roles).map(r => [r.id, r])).values()).map(r => (
              <option key={r.id} value={r.id}>{r.type}</option>
            ))}
          </select>
          <button onClick={() => exportToCSV('supervisors.csv', filteredSupervisors)} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-600">تصدير</button>
          <button className="btn-blue" onClick={handleCreate}>إضافة مشرف</button>
        </div>
      </div>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
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
          {filteredSupervisors.map((u, i) => (
            <tr key={u.id} className="hover:bg-primary-50 last:border-b-0">
              <td className="p-2 border text-right">{i + 1}</td>
              <td className="p-2 border text-right">{u.name || '—'}</td>
              <td className="p-2 border text-right">{u.username || '—'}</td>
              <td className="p-2 border text-right">{u.email || '—'}</td>
              <td className="p-2 border text-right">{u.phone || '—'}</td>
              <td className="p-2 border text-right">
                {(() => {
                  const a = affiliations.find(x => x.user_id === u.id);
                  if (!a) return '—';
                  const c = colleges.find(cc => cc.id === a.college_id);
                  return c ? c.name : a.college_id || '—';
                })()}
              </td>
              <td className="p-2 border text-right">
                {(() => {
                  const a = affiliations.find(x => x.user_id === u.id);
                  if (!a) return '—';
                  const d = departments.find(dd => dd.id === a.department_id);
                  return d ? d.name : a.department_id || '—';
                })()}
              </td>
              <td className="p-2 border text-right">{(u.roles || []).map(r => r.type).join(', ') || '—'}</td>
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={closeModal} />
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">إضافة/اختيار مشرف</h3>

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
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitModal} disabled={isCreating}>{isCreating ? 'جاري الحفظ...' : 'حفظ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default SupervisorsTable;
