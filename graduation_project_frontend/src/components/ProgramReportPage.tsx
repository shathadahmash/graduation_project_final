import React, { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiDownload, FiSearch, FiPrinter, FiLayers } from 'react-icons/fi';
import { groupService } from '../services/groupService';

const ProgramReportPage: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming groupService has a method to get programs or we extract from groups
        const groups = await groupService.getGroups();
        const allPrograms = groups.flatMap((g: any) => g.programs || []);
        // Unique programs by ID
        const uniquePrograms = Array.from(new Map(allPrograms.map((p: any) => [p.id, p])).values());
        setPrograms(uniquePrograms);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [programs, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <FiLayers className="text-orange-600" /> تقارير البرامج
          </h2>
          <p className="text-slate-500 text-sm mt-1">إحصائيات البرامج الأكاديمية المسجلة</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"><FiPrinter /> طباعة</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md"><FiDownload /> تصدير</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="بحث في البرامج..." className="w-full pr-12 pl-4 py-2 bg-slate-50 border-none rounded-xl text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">اسم البرنامج</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الوصف</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm text-center">عدد المجموعات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">جاري التحميل...</td></tr>
            ) : filteredPrograms.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">لا توجد برامج مسجلة</td></tr>
            ) : (
              filteredPrograms.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{p.name}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{p.description || 'لا يوجد وصف'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-slate-700 text-xs">{p.groups_count || 0}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramReportPage;