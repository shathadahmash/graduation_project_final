import React, { useEffect, useState, useMemo } from "react";
import { programService, Program } from '../../../services/programService';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await programService.getPrograms();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[Programs] fetch error', error);
        alert('فشل جلب البيانات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await programService.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesName = p.p_name.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = filterDepartment ? p.department_detail?.name === filterDepartment : true;
      const matchesCollege = filterCollege ? p.department_detail?.college_detail?.name_ar === filterCollege : true;
      const matchesCity = filterCity ? p.department_detail?.college_detail?.branch_detail?.city === filterCity : true;
      const matchesUniversity = filterUniversity ? p.department_detail?.college_detail?.branch_detail?.university_detail?.uname_ar === filterUniversity : true;
      return matchesName && matchesDepartment && matchesCollege && matchesCity && matchesUniversity;
    });
  }, [programs, search, filterDepartment, filterCollege, filterCity, filterUniversity]);

  // Unique filter options
  const departmentOptions = Array.from(new Set(programs.map(p => p.department_detail?.name).filter(Boolean)));
  const collegeOptions = Array.from(new Set(programs.map(p => p.department_detail?.college_detail?.name_ar).filter(Boolean)));
  const cityOptions = Array.from(new Set(programs.map(p => p.department_detail?.college_detail?.branch_detail?.city).filter(Boolean)));
  const universityOptions = Array.from(new Set(programs.map(p => p.department_detail?.college_detail?.branch_detail?.university_detail?.uname_ar).filter(Boolean)));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">البرامج</h2>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن البرنامج..."
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">القسم:</label>
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">الكلية:</label>
          <select
            value={filterCollege}
            onChange={e => setFilterCollege(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">المدينة:</label>
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">الجامعة:</label>
          <select
            value={filterUniversity}
            onChange={e => setFilterUniversity(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {universityOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
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
                <th className="border border-black px-4 py-2">اسم البرنامج</th>
                <th className="border border-black px-4 py-2">القسم</th>
                <th className="border border-black px-4 py-2">الكلية</th>
                <th className="border border-black px-4 py-2">الفرع</th>
                <th className="border border-black px-4 py-2">الجامعة</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{p.id}</td>
                    <td className="border border-black px-4 py-2">{p.p_name}</td>
                    <td className="border border-black px-4 py-2">{p.department_detail?.name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.department_detail?.college_detail?.name_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.department_detail?.college_detail?.branch_detail?.city ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.department_detail?.college_detail?.branch_detail?.university_detail?.uname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100">
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(p.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-black py-6 text-center text-gray-400">
                    لا توجد برامج
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

export default Programs;