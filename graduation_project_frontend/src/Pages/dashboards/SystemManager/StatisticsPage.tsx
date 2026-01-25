import React, { useEffect, useState } from 'react';
import api, { API_ENDPOINTS } from '../../../services/api';

const StatisticsPage: React.FC = () => {
  const [projects, setProjects] = useState(0);
  const [groups, setGroups] = useState(0);
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pRes, gRes, uRes] = await Promise.all([
          api.get(API_ENDPOINTS.PROJECTS.LIST).catch(() => ({ data: [] })),
          api.get(API_ENDPOINTS.GROUPS.LIST).catch(() => ({ data: [] })),
          api.get(API_ENDPOINTS.USERS.LIST).catch(() => ({ data: [] })),
        ]);
        setProjects((pRes.data ?? []).length);
        setGroups((gRes.data ?? []).length);
        setUsers((uRes.data ?? []).length);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">الإحصائيات</h2>
      {loading ? (
        <div>جارٍ التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded">
            <div className="text-sm text-slate-400">إجمالي المشاريع</div>
            <div className="text-2xl font-bold">{projects}</div>
          </div>
          <div className="p-4 bg-white/5 rounded">
            <div className="text-sm text-slate-400">إجمالي المجموعات</div>
            <div className="text-2xl font-bold">{groups}</div>
          </div>
          <div className="p-4 bg-white/5 rounded">
            <div className="text-sm text-slate-400">إجمالي المستخدمين</div>
            <div className="text-2xl font-bold">{users}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
