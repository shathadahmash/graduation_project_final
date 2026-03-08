import React, { useEffect, useState, useMemo } from 'react';
import { userService, User, Role } from '../../../services/userService';

/* ========================== Role Constraints ========================== */
const ROLE_CONFLICTS: Record<string, string[]> = {
  Student: [
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean',
    'Admin',
    'System Manager',
    'University President',
    'External Company',
    'Ministry'
  ],

  Supervisor: [
    'Student',
    'External Company',
    'Ministry'
  ],

  'CO-Supervisor': [
    'Student',
    'External Company',
    'Ministry'
  ],

  'Department Head': [
    'Student',
    'External Company',
    'Ministry'
  ],

  Dean: [
    'Student',
    'External Company',
    'Ministry'
  ],

  'External Company': [
    'Student',
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean',
    'University President'
  ],

  Ministry: [
    'Student',
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean'
  ]
};

const UsersTable: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const [form, setForm] = useState<any>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    CID: '',
  });

  /* ========================== Role Validation ========================== */

  const isRoleAllowed = (roleType: string) => {

    const selectedTypes = roles
      .filter(r => selectedRoles.includes(r.id))
      .map(r => r.type);

    for (const selected of selectedTypes) {
      if (ROLE_CONFLICTS[selected]?.includes(roleType)) return false;
      if (ROLE_CONFLICTS[roleType]?.includes(selected)) return false;
    }

    return true;
  };

  /* ========================== Load Users & Roles ========================== */

  const loadAll = async () => {
    setLoading(true);
    try {

      const [u, r] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllRoles(),
      ]);

      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);

    } catch (e) {
      console.error('LoadAll error:', e);
      alert('فشل جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ========================== Filters ========================== */

  const filteredUsers = useMemo(() => {
    return users.filter(u => {

      const q = search.toLowerCase();

      const matchesSearch =
        (u.name?.toLowerCase().includes(q) ?? false) ||
        (u.username?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.phone?.toLowerCase().includes(q) ?? false) ||
        (u.CID?.toLowerCase().includes(q) ?? false);

      const matchesRole =
        filterRole ? u.roles?.some(r => r.type === filterRole) : true;

      return matchesSearch && matchesRole;

    });
  }, [users, search, filterRole]);

  /* ========================== Actions ========================== */

  const openCreate = () => {

    setEditingUser(null);

    setForm({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      gender: '',
      CID: ''
    });

    setSelectedRoles([]);

    setShowModal(true);
  };

  const openEdit = (u: User) => {

    setEditingUser(u);

    setForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      gender: u.gender || '',
      CID: u.CID || '',
    });

    setSelectedRoles(u.roles?.map(r => r.id) || []);

    setShowModal(true);
  };

  const handleDelete = async (u: User) => {

    if (!confirm(`هل أنت متأكد من حذف ${u.username}؟`)) return;

    try {

      await userService.deleteUser(u.id);
      await loadAll();

    } catch (e) {

      console.error('Delete error:', e);
      alert('فشل الحذف');

    }
  };

  const handleSave = async () => {

    try {

      const first_name = form.first_name.trim();
      const last_name = form.last_name.trim();

      const username = editingUser
        ? form.username
        : (first_name + "_" + last_name).toLowerCase() || "user";

      const payload: any = {

        first_name,
        last_name,
        name: `${first_name} ${last_name}`.trim(),
        username,
        email: form.email?.trim() || null,
        phone: form.phone || null,
        gender: form.gender || null,
        CID: form.CID || null,

      };

      let savedUser: User;

      if (editingUser) {

        savedUser = await userService.updateUser(editingUser.id, payload);

      } else {

        savedUser = await userService.createUser(payload);

      }

      await userService.syncUserRoles(
        savedUser.id,
        selectedRoles,
        editingUser?.roles?.map(r => r.id) || []
      );

      setShowModal(false);

      await loadAll();

    } catch (e: any) {

      console.error('Save error:', e.response?.data ?? e);
      alert('فشل الحفظ. تحقق من البيانات وأعد المحاولة.');

    }
  };

  /* ========================== Render ========================== */

  return (

    <div className="bg-white p-6 rounded-lg shadow text-right">

      <h2 className="text-2xl font-bold mb-4">المستخدمون</h2>

      {/* Search */}

      <div className="flex flex-wrap gap-4 mb-6">

        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن مستخدم..."
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">الدور:</label>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {roles.map(r => (
              <option key={r.id} value={r.type}>{r.type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={openCreate}
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            إضافة مستخدم
          </button>
        </div>

      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-6">جاري التحميل...</div>
      ) : (

        <div className="overflow-x-auto">

          <table className="w-full border-collapse border border-black text-right">

            <thead className="bg-gray-100">

              <tr>

                <th className="border border-black px-4 py-2">ID</th>
                <th className="border border-black px-4 py-2">الاسم الأول</th>
                <th className="border border-black px-4 py-2">اسم العائلة</th>
                <th className="border border-black px-4 py-2">اسم المستخدم</th>
                <th className="border border-black px-4 py-2">الرقم الوطني</th>
                <th className="border border-black px-4 py-2">البريد</th>
                <th className="border border-black px-4 py-2">الهاتف</th>
                <th className="border border-black px-4 py-2">النوع</th>
                <th className="border border-black px-4 py-2">الأدوار</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.length ? (

                filteredUsers.map((u, idx) => (

                  <tr
                    key={u.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >

                    <td className="border border-black px-4 py-2">{u.id}</td>
                    <td className="border border-black px-4 py-2">{u.first_name || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.last_name || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.username || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.CID || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.email || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.phone || '-'}</td>
                    <td className="border border-black px-4 py-2">{u.gender || '-'}</td>

                    <td className="border border-black px-4 py-2">
                      {u.roles?.map(r => r.type).join(', ') || '-'}
                    </td>

                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">

                      <button
                        onClick={() => openEdit(u)}
                        className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                      >
                        تعديل
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                      >
                        حذف
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan={10} className="border border-black py-6 text-center text-gray-400">
                    لا يوجد مستخدمون
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow">

            <h3 className="font-bold mb-4">
              {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم'}
            </h3>

            <div className="grid grid-cols-2 gap-3">

              <input
                className="border px-3 py-2 rounded"
                placeholder="الاسم الأول"
                value={form.first_name}
                onChange={e => setForm(s => ({ ...s, first_name: e.target.value }))}
              />

              <input
                className="border px-3 py-2 rounded"
                placeholder="اسم العائلة"
                value={form.last_name}
                onChange={e => setForm(s => ({ ...s, last_name: e.target.value }))}
              />

              <input
                className="border px-3 py-2 rounded col-span-2 bg-gray-100"
                placeholder="اسم المستخدم"
                value={form.username}
                readOnly
              />

              <input
                className="border px-3 py-2 rounded col-span-2"
                placeholder="CID"
                value={form.CID}
                onChange={e => setForm(s => ({ ...s, CID: e.target.value }))}
              />

              <input
                className="border px-3 py-2 rounded col-span-2"
                placeholder="البريد"
                value={form.email}
                onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
              />

              <input
                className="border px-3 py-2 rounded col-span-2"
                placeholder="الهاتف"
                value={form.phone}
                onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
              />

              <select
                className="border px-3 py-2 rounded col-span-2"
                value={form.gender}
                onChange={e => setForm(s => ({ ...s, gender: e.target.value }))}
              >

                <option value="">الجنس (اختياري)</option>
                <option value="ذكر">ذكر</option>
                <option value="انثى">أنثى</option>

              </select>

            </div>

            <div className="mt-4">

              <label className="block mb-1 font-medium">الأدوار</label>

              <div className="flex gap-3 flex-wrap">

                {roles.map(r => (

                  <label
                    key={r.id}
                    className={`flex gap-1 text-sm ${
                      !isRoleAllowed(r.type) ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r.id)}
                      disabled={!isRoleAllowed(r.type)}
                      onChange={e =>
                        setSelectedRoles(prev =>
                          e.target.checked
                            ? [...prev, r.id]
                            : prev.filter(x => x !== r.id)
                        )
                      }
                    />

                    {r.type}

                  </label>

                ))}

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-1 rounded"
              >
                إلغاء
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                حفظ
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default UsersTable;