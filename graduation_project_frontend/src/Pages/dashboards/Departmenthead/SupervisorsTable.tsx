import React, { useEffect, useState } from 'react';
import { userService, User } from '../../../services/userService';

interface SupervisorTableProps {
  departmentId: number | null;
}

interface Affiliation {
  id: number;
  user_id: number;
  college_id?: number | null;
  department_id?: number | null;
}

const SupervisorsTable = ({ departmentId }: SupervisorTableProps) => {

  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string; college: number }[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);

  const normalize = (s: string) =>
    (s || '').toLowerCase().replace(/[_-]/g, ' ').trim();

  const isSupervisorRole = (roleType: string) => {
    const t = normalize(roleType);
    if (t.includes('department head') || t.includes('head') || t.includes('chair'))
      return false;
    if (!t.includes('supervisor')) return false;
    if (/(^|\s)co(\s|$)/.test(t) || t.includes('co supervisor') || t.includes('cosupervisor'))
      return false;
    return true;
  };

  const filterByDepartment = (users: User[], affs: Affiliation[]) => {
    if (!departmentId) return users;

    return users.filter(user => {
      const aff = affs.find(a => a.user_id === user.id);
      if (!aff || !aff.department_id) return false;
      return Number(aff.department_id) === Number(departmentId);
    });
  };

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        setLoading(true);

        const [cols, deps, affs, users] = await Promise.all([
          userService.getColleges(),
          userService.getDepartments(),
          userService.getAffiliations(),
          userService.getAllUsers(),
        ]);

        setColleges(cols);
        setDepartments(deps);
        setAffiliations(affs);

        const supervisorsOnly = users.filter(u =>
          u.roles.some(r => isSupervisorRole(r.type))
        );

        setSupervisors(filterByDepartment(supervisorsOnly, affs));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, [departmentId]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
    try {
      await userService.deleteUser(userId);
      setSupervisors(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('فشل حذف المشرف');
    }
  };

  const filteredSupervisors = supervisors.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-4 text-center">جاري تحميل المشرفين...</div>;
  if (!loading && supervisors.length === 0)
    return <div className="p-4 text-center text-gray-500">لا يوجد مشرفون في هذا القسم</div>;

  return (
    <div className="theme-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">المشرفون</h3>
          <p className="text-sm text-slate-500">إدارة المشرفين</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث"
            className="border p-2 rounded w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-center">#</th>
              <th className="p-3 border text-center">الاسم</th>
              <th className="p-3 border text-center">اسم المستخدم</th>
              <th className="p-3 border text-center">البريد</th>
              <th className="p-3 border text-center">الهاتف</th>
              <th className="p-3 border text-center">الكلية</th>
              <th className="p-3 border text-center">القسم</th>
              <th className="p-3 border text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupervisors.map((u, i) => (
              <tr key={u.id} className="hover:bg-primary-50">
                <td className="p-2 border text-center">{i + 1}</td>
                <td className="p-2 border text-center">{u.name || '—'}</td>
                <td className="p-2 border text-center">{u.username || '—'}</td>
                <td className="p-2 border text-center">{u.email || '—'}</td>
                <td className="p-2 border text-center">{u.phone || '—'}</td>
                <td className="p-2 border text-center">
                  {(() => {
                    const a = affiliations.find(x => x.user_id === u.id);
                    if (!a) return '—';
                    const c = colleges.find(cc => cc.id === a.college_id);
                    return c?.name || '—';
                  })()}
                </td>
                <td className="p-2 border text-center">
                  {(() => {
                    const a = affiliations.find(x => x.user_id === u.id);
                    if (!a) return '—';
                    const d = departments.find(dd => dd.id === a.department_id);
                    return d?.name || '—';
                  })()}
                </td>
                <td className="p-2 border text-center">
                  <button
                    className="px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                    onClick={() => handleDelete(u.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorsTable;
