import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiDownload, FiSearch, FiPrinter } from 'react-icons/fi';
import { userService } from '../../../services/userService';

const CoSupervisorsReportPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allUsers = await userService.getAllUsers();
        // Filter users who have the 'co_supervisor' role
        const coSupervisors = allUsers.filter(u => 
          u.roles?.some(r => r.type?.toLowerCase() === 'co_supervisor')
        );
        setUsers(coSupervisors);
      } catch (error) {
        console.error('Error fetching co-supervisors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCoSupervisors = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <FiUsers className="text-pink-600" /> تقارير المشرفين المشاركين
          </h2>
          <p className="text-slate-500 text-sm mt-1">إدارة وتحليل بيانات المشرفين المشاركين</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"><FiPrinter /> طباعة</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-md"><FiDownload /> تصدير</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="بحث بالاسم أو البريد..." className="w-full pr-12 pl-4 py-2 bg-slate-50 border-none rounded-xl text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">المشرف المشارك</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">البريد الإلكتروني</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الهاتف</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الجنس</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">جاري التحميل...</td></tr>
            ) : filteredCoSupervisors.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">لا توجد بيانات</td></tr>
            ) : (
              filteredCoSupervisors.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">{u.name?.[0]}</div>
                      <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{u.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoSupervisorsReportPage;