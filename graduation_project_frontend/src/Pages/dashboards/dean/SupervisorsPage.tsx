import React, { useEffect, useState } from 'react';
import api, { API_ENDPOINTS } from '../../../services/api';

const SupervisorsPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(API_ENDPOINTS.USERS.LIST, { params: { role: 'Supervisor' } });
        setSupervisors(res.data ?? []);
      } catch (e) {
        console.error(e);
        setSupervisors([]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">المشرفون</h2>
      {loading ? (
        <div>جارٍ التحميل...</div>
      ) : (
        <div className="overflow-auto bg-white/5 p-3 rounded">
          <table className="min-w-full text-right">
            <thead>
              <tr className="text-sm text-slate-400">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">الاسم</th>
                <th className="px-3 py-2">البريد</th>
                <th className="px-3 py-2">دور</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.id}</td>
                  <td className="px-3 py-2">{s.name ?? s.username}</td>
                  <td className="px-3 py-2">{s.email ?? '-'}</td>
                  <td className="px-3 py-2">{s.role ?? s.roles?.join(', ') ?? 'Supervisor'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupervisorsPage;
