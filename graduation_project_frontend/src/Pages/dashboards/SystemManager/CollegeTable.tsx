import React, { useEffect, useState, useMemo } from 'react';
import { collegeService } from '../../../services/collegeServices';
import { Program } from '../../../services/programService';

interface College {
  id?: number;
  cid: number;
  name_ar: string;
  branch_detail?: {
    city?: string;
    university_detail?: {
      uname_ar?: string;
    };
  };
  programs?: Program[];
}

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await collegeService.getColleges();
        const collegesWithPrograms = await Promise.all(
          data.map(async (college) => {
            const collegeId = college.id ?? college.cid;
            if (!collegeId) return college;

            const programs = await collegeService.getCollegePrograms(collegeId);
            return { ...college, programs };
          })
        );
        setColleges(collegesWithPrograms);
      } catch (err) {
        console.error('Failed to fetch colleges or programs:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await collegeService.deleteCollege(id);
      setColleges(prev => prev.filter(c => c.cid !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  // Filtered colleges using search & filters
  const filteredColleges = useMemo(() => {
    return colleges.filter(c => {
      const matchesName = c.name_ar.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter ? c.branch_detail?.city_detail?.bname_ar?.toLowerCase() === cityFilter.toLowerCase() : true;
      const matchesUniversity = universityFilter
        ? c.branch_detail?.university_detail?.uname_ar?.toLowerCase() === universityFilter.toLowerCase()
        : true;
      return matchesName && matchesCity && matchesUniversity;
    });
  }, [colleges, searchTerm, cityFilter, universityFilter]);

  // Helper arrays for filter dropdowns
  const cities = Array.from(new Set(colleges.map(c => c.branch_detail?.city_detail?.bname_ar).filter(Boolean)));
  const universities = Array.from(
    new Set(colleges.map(c => c.branch_detail?.university_detail?.uname_ar).filter(Boolean))
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">الكليات</h2>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">البحث بالاسم:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
            placeholder="ادخل اسم الكلية"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">تصفية بالمدينة:</label>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">تصفية بالجامعة:</label>
          <select
            value={universityFilter}
            onChange={e => setUniversityFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {universities.map(univ => (
              <option key={univ} value={univ}>{univ}</option>
            ))}
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
                <th className="border border-black px-4 py-2">اسم الكلية</th>
                <th className="border border-black px-4 py-2">الفرع (المدينة)</th>
                <th className="border border-black px-4 py-2">الجامعة</th>
                <th className="border border-black px-4 py-2">البرامج</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredColleges.length > 0 ? (
                filteredColleges.map((c, index) => (
                  <tr
                    key={c.cid}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{c.cid}</td>
                    <td className="border border-black px-4 py-2">{c.name_ar}</td>
                    <td className="border border-black px-4 py-2">{c.branch_detail?.city_detail?.bname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{c.branch_detail?.university_detail?.uname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">
                      {c.programs && c.programs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.programs.map(p => (
                            <span key={p.pid} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                              {p.p_name ?? '-'}
                            </span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100">
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(c.cid)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="empty">
                  <td colSpan={6} className="border border-black py-6 text-center text-gray-400">
                    لا توجد كليات
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

export default CollegeTable;