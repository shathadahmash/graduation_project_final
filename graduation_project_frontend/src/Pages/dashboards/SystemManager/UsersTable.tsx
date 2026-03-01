import React, { useEffect, useState, useMemo } from 'react';
import { userService, User, Role } from '../../../services/userService';
import { exportToCSV } from '../../../components/tableUtils';
import { containerClass, tableWrapperClass, tableClass } from '../../../components/tableStyles';
import { FiSearch, FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiChevronDown } from 'react-icons/fi';

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const [u, r] = await Promise.all([userService.getAllUsers(), userService.getAllRoles()]);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
      } catch (e) {
        console.error('Failed to load users/roles', e);
      }
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((usr) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (usr.name || '').toLowerCase().includes(q) || (usr.username || '').toLowerCase().includes(q) || (usr.email || '').toLowerCase().includes(q);
      const matchesRole = !filterRole || usr.roles?.some(r => r.type === filterRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const paginated = filteredUsers.slice(0, visibleRows);

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString() : 'N/A';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">إدارة المستخدمين</h2>
          <p className="text-sm text-slate-500">قائمة المستخدمين</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV('users.csv', filteredUsers)} className="bg-blue-600 text-white px-3 py-1 rounded">تصدير</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <input placeholder="بحث" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">جميع الأدوار</option>
              {roles.map(r => <option key={r.id} value={r.type}>{r.type}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>معلومات التواصل</th>
              <th>الشركة / الدور</th>
              <th>تاريخ الانضمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">{(u.name || u.username || '?')[0]?.toUpperCase()}</div>
                    <div>
                      <div className="font-black">{u.name || 'بدون اسم'}</div>
                      <div className="text-xs text-slate-500">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm">{u.email}</div>
                  <div className="text-xs text-slate-500">{u.phone || '-'}</div>
                </td>
                <td>
                  <div className="text-sm">{u.company_name || '-'}</div>
                  <div className="text-xs text-slate-500">{u.roles?.[0]?.type || '-'}</div>
                </td>
                <td>{formatDate(u.date_joined)}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="text-xs text-yellow-600">تعديل</button>
                    <button className="text-xs text-rose-600">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">لا يوجد مستخدمون</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > visibleRows && (
        <div className="flex justify-center mt-4">
          <button onClick={() => setVisibleRows(v => v + 10)} className="px-4 py-2 border rounded">عرض المزيد</button>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
