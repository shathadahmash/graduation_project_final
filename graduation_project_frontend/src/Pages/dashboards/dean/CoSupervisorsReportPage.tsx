import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiDownload, FiSearch, FiPrinter, FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { userService } from '../../../services/userService';
import { useAuthStore } from '../../../store/useStore';

const CoSupervisorsReportPage: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [affiliations, setAffiliations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allUsers, affs] = await Promise.all([
          userService.getAllUsers(),
          userService.getAffiliations()
        ]);
        
        setAffiliations(affs);
        
        // Create user-to-college mapping
        const userCollegeMap = new Map<number, number>();
        affs.forEach((affiliation: any) => {
          if (affiliation.college_id) {
            userCollegeMap.set(affiliation.user_id, affiliation.college_id);
          }
        });

        // Get dean's college ID from their AcademicAffiliation first, fallback to user.college_id
        let deanCollegeId = userCollegeMap.get(user?.id || 0);
        if (!deanCollegeId && user?.college_id) {
          deanCollegeId = user.college_id;
        }

        console.log('CoSupervisors Report - Dean College ID:', deanCollegeId);
        console.log('CoSupervisors Report - All users:', allUsers.length);
        console.log('CoSupervisors Report - Affiliations:', affs.length);

        // Filter users who have the 'co_supervisor' role AND are from the same college
        const coSupervisors = allUsers.filter(u => {
          const userCollegeId = userCollegeMap.get(u.id);
          // Use the same role filtering logic as CoSupervisorsTable.tsx
          const isCoSupervisor = (u.roles || []).some(r => {
            const t = (r.type || '').toString().toLowerCase().replace(/[_-]/g, ' ');
            return t.includes('co') && t.includes('supervisor');
          });
          const isSameCollege = userCollegeId === deanCollegeId;
          
          console.log(`User ${u.id} (${u.name}): roles=${u.roles?.map(r => r.type)}, isCoSupervisor=${isCoSupervisor}, college=${userCollegeId}, isSameCollege=${isSameCollege}`);
          
          return isCoSupervisor && isSameCollege && userCollegeId !== undefined;
        });
        
        console.log('CoSupervisors Report - Filtered co-supervisors:', coSupervisors.length);
        
        setUsers(coSupervisors);
      } catch (error) {
        console.error('Error fetching co-supervisors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredCoSupervisors = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredCoSupervisors.length;
    const active = filteredCoSupervisors.filter(u => u.is_active !== false).length;
    const male = filteredCoSupervisors.filter(u => u.gender === 'Male').length;
    const female = filteredCoSupervisors.filter(u => u.gender === 'Female').length;
    
    return { total, active, male, female };
  }, [filteredCoSupervisors]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <FiUsers className="text-pink-600" /> تقارير المشرفين المشاركين
          </h2>
          <p className="text-slate-500 text-sm mt-1">إدارة وتحليل بيانات المشرفين المشاركين في الكلية</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            <FiPrinter /> طباعة
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-md">
            <FiDownload /> تصدير
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">إجمالي المشرفين المشاركين</p>
              <p className="text-3xl font-black">{stats.total}</p>
            </div>
            <FiUsers className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">المشرفون النشطون</p>
              <p className="text-3xl font-black">{stats.active}</p>
            </div>
            <FiTrendingUp className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">الذكور</p>
              <p className="text-3xl font-black">{stats.male}</p>
            </div>
            <FiBarChart className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">الإناث</p>
              <p className="text-3xl font-black">{stats.female}</p>
            </div>
            <FiBarChart className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو البريد..." 
            className="w-full pr-12 pl-4 py-2 bg-slate-50 border-none rounded-xl text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">المشرف المشارك</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">البريد الإلكتروني</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الهاتف</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الجنس</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-sm">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">جاري التحميل...</td></tr>
            ) : filteredCoSupervisors.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">لا توجد بيانات</td></tr>
            ) : (
              filteredCoSupervisors.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {u.gender === 'Male' ? 'ذكر' : u.gender === 'Female' ? 'أنثى' : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.is_active !== false ? 'نشط' : 'غير نشط'}
                    </span>
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

export default CoSupervisorsReportPage;