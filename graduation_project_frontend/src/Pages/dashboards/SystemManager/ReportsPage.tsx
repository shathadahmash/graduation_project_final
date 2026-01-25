import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports');
        setReports(res.data ?? []);
      } catch (e) {
        console.error(e);
        setReports([]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">التقارير</h2>
      {loading ? (
        <div>جارٍ التحميل...</div>
      ) : (
        <div className="overflow-auto bg-white/5 p-3 rounded">
          <table className="min-w-full text-right">
            <thead>
              <tr className="text-sm text-slate-400">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">العنوان</th>
                <th className="px-3 py-2">المشروع</th>
                <th className="px-3 py-2">تاريخ</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id ?? r.report_id} className="border-t">
                  <td className="px-3 py-2">{r.id ?? r.report_id}</td>
                  <td className="px-3 py-2">{r.title ?? r.name ?? '-'}</td>
                  <td className="px-3 py-2">{r.project?.title ?? r.project ?? '-'}</td>
                  <td className="px-3 py-2">{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
