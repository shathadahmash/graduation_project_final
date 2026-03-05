import React, { useEffect, useState, useMemo } from 'react';
import { userService, Role } from '../../../services/userService';

const RolesTable: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [newRoleName, setNewRoleName] = useState('');

  // Inline edit state
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Fetch roles
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await userService.getAllRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
        alert('فشل جلب الأدوار');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Add new role
  const handleCreate = async () => {
    const name = newRoleName.trim();
    if (!name) return alert('الرجاء إدخال اسم الدور');
    if (roles.some(r => r.type.toLowerCase() === name.toLowerCase())) return alert('هذا الدور موجود بالفعل');
    try {
      await userService.createRole(name);
      setNewRoleName('');
      const data = await userService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
      alert('فشل إنشاء الدور');
    }
  };

  // Delete role
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
    try {
      await userService.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('فشل حذف الدور');
    }
  };

  // Update role
  const handleUpdate = async (id: number) => {
    const name = editingName.trim();
    if (!name) return alert('الرجاء إدخال اسم الدور');
    if (roles.some(r => r.type.toLowerCase() === name.toLowerCase() && r.id !== id))
      return alert('هذا الدور موجود بالفعل');
    try {
      await userService.updateRole(id, { type: name });
      const data = await userService.getAllRoles();
      setRoles(data);
      setEditingRoleId(null);
      setEditingName('');
    } catch (err) {
      console.error(err);
      alert('فشل تحديث الدور');
    }
  };

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(r => r.type.toLowerCase().includes(search.toLowerCase()) || r.id.toString().includes(search));
  }, [roles, search]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">الأدوار</h2>

      {/* Add Role */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={newRoleName}
          onChange={e => setNewRoleName(e.target.value)}
          placeholder="اسم الدور الجديد..."
          className="border border-gray-300 rounded px-3 py-1"
        />
        <button
          onClick={handleCreate}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          إضافة
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">بحث:</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن دور..."
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-6">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-4 py-2">ID</th>
                <th className="border border-black px-4 py-2">اسم الدور</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, idx) => (
                  <tr
                    key={role.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{role.id}</td>
                    <td className="border border-black px-4 py-2">
                      {editingRoleId === role.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="border border-gray-400 px-2 py-1 rounded w-full"
                        />
                      ) : (
                        role.type
                      )}
                    </td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      {editingRoleId === role.id ? (
                        <>
                          <button
                            className="px-3 py-1 text-emerald-700 border border-emerald-700 rounded hover:bg-emerald-100"
                            onClick={() => handleUpdate(role.id)}
                          >
                            حفظ
                          </button>
                          <button
                            className="px-3 py-1 text-gray-700 border border-gray-400 rounded hover:bg-gray-100"
                            onClick={() => setEditingRoleId(null)}
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                            onClick={() => {
                              setEditingRoleId(role.id);
                              setEditingName(role.type);
                            }}
                          >
                            تعديل
                          </button>
                          <button
                            className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                            onClick={() => handleDelete(role.id)}
                          >
                            حذف
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-black py-6 text-center text-gray-400">
                    لا توجد أدوار
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RolesTable;