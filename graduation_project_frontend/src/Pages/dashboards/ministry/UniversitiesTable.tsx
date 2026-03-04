import React, { useEffect, useState } from 'react';
import { universityService, University } from '../../../services/universityService';

const UniversitiesTable: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await universityService.getUniversities();
      setUniversities(Array.isArray(data) ? data : []);
      setLoading(false);
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">الجامعات</h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          جاري التحميل...
        </div>
      ) : (
        <table className="w-full table-auto border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-100 border-2 border-black">
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                ID
              </th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                اسم الجامعة
              </th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                نوع الجامعة
              </th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                عدد الكليات
              </th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                المدينة
              </th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">
                إجراءات
              </th>
            </tr>
          </thead>

          <tbody>
            {universities.map(u => (
              <tr key={u.uid} className="border-b-2 border-black">
                <td className="py-3 px-6 border-r-2 border-black">
                  {u.uid}
                </td>
                <td className="py-3 px-6 border-r-2 border-black">
                  {u.uname_ar}
                </td>
                <td className="py-3 px-6 border-r-2 border-black">
                  {u.type}
                </td>
                <td className="py-3 px-6 border-r-2 border-black">
                  {u.colleges?.length ?? 0}
                </td>
                <td className="py-3 px-6 border-r-2 border-black">
                  {u.city || '-'}
                </td>
                <td className="py-3 px-6 border-r-2 border-black flex gap-2">
                  <button className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition">
                    تعديل
                  </button>
                  <button
                    className="bg-rose-600 text-white px-4 py-1 rounded-lg hover:bg-rose-700 transition"
                    onClick={() => handleDelete(u.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}

            {universities.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500 border-2 border-black"
                >
                  لا توجد جامعات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UniversitiesTable;