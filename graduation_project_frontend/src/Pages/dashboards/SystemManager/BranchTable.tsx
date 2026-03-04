import React, { useEffect, useState, useMemo } from 'react';
import { branchService, Branch } from '../../../services/branchService';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  // New states for search and filters
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await branchService.getBranches();
        setBranches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        alert('فشل جلب البيانات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await branchService.deleteBranch(id);
      setBranches(prev => prev.filter(b => b.ubid !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  // Filtered branches using search & filters
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const matchesSearch = b.city_detail?.bname_ar?.toLowerCase().includes(search.toLowerCase()) ||
                            b.university_detail?.uname_ar?.toLowerCase().includes(search.toLowerCase());
      const matchesCity = filterCity ? b.city_detail?.bname_ar === filterCity : true;
      const matchesUniversity = filterUniversity ? b.university_detail?.uname_ar === filterUniversity : true;
      return matchesSearch && matchesCity && matchesUniversity;
    });
  }, [branches, search, filterCity, filterUniversity]);

  // Helper arrays for filter dropdowns
  const cityOptions = Array.from(new Set(branches.map(b => b.city_detail?.bname_ar).filter(Boolean)));
  const universityOptions = Array.from(new Set(branches.map(b => b.university_detail?.uname_ar).filter(Boolean)));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">الفروع</h2>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن الفرع..."
            className="border border-gray-300 rounded px-3 py-1"
          />
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
                <th className="border border-black px-4 py-2">المدينة</th>
                <th className="border border-black px-4 py-2">الجامعة</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredBranches.length > 0 ? (
                filteredBranches.map((b, idx) => (
                  <tr
                    key={b.ubid}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{b.ubid}</td>
                    <td className="border border-black px-4 py-2">{b.city_detail?.bname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{b.university_detail?.uname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100">
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(b.ubid)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black py-6 text-center text-gray-400">
                    لا توجد فروع
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

/// City name → branch.city_detail?.bname_ar

// University name → branch.university_detail?.uname_ar

// So when the user types anything in the search box, the table will show branches where either the city or the university name includes the search term (case-insensitive).

export default Branches;