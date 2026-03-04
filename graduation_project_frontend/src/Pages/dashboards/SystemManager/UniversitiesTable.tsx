import React, { useEffect, useState, useMemo } from 'react';
import { universityService, University } from '../../../services/universityService';

const UniversitiesTable: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await universityService.getUniversities();
        setUniversities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch universities', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await universityService.deleteUniversity(id);
      setUniversities(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  // Filtered universities
  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      const matchesName = u.uname_ar.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType ? u.type === filterType : true;
      return matchesName && matchesType;
    });
  }, [universities, search, filterType]);

  // Unique types for dropdown
  const universityTypes = Array.from(new Set(universities.map(u => u.type).filter(Boolean)));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">الجامعات</h2>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن الجامعة..."
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">نوع الجامعة:</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {universityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
                <th className="border border-black px-4 py-2">اسم الجامعة</th>
                <th className="border border-black px-4 py-2">نوع الجامعة</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredUniversities.length > 0 ? (
                filteredUniversities.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{u.id}</td>
                    <td className="border border-black px-4 py-2">{u.uname_ar}</td>
                    <td className="border border-black px-4 py-2">{u.type}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100">
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(u.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black py-6 text-center text-gray-400">
                    لا توجد جامعات
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

export default UniversitiesTable;