import React, { useEffect, useState } from "react";
import { programService, Program } from '../../../services/programService';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await programService.getPrograms();
        console.log('[Programs] fetched data:', data);
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">البرامج</h2>
      {loading ? (
        <div className="text-center py-6 text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border border-black">ID</th>
                <th className="px-4 py-2 border border-black">اسم البرنامج</th>
                <th className="px-4 py-2 border border-black">القسم اسم</th>
                <th className="px-4 py-2 border border-black">الكلية اسم</th>
                <th className="px-4 py-2 border border-black">اسم الفرع</th>
                <th className="px-4 py-2 border border-black">الجامعة اسم</th>
                <th className="px-4 py-2 border border-black">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p, index) => (
                <tr
                  key={p.pid}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 border border-black">{p.pid}</td>
                  <td className="px-4 py-2 border border-black">{p.p_name}</td>
                  <td className="px-4 py-2 border border-black">{p.department_detail?.name ?? '-'}</td>
                  <td className="px-4 py-2 border border-black">{p.department_detail?.college_detail?.name_ar ?? '-'}</td>
                  <td className="px-4 py-2 border border-black">{p.department_detail?.college_detail?.branch_detail?.city ?? '-'}</td>
                  <td className="px-4 py-2 border border-black">{p.department_detail?.college_detail?.branch_detail?.university_detail?.uname_ar ?? '-'}</td>
                  <td className="px-4 py-2 border border-black flex gap-2">
                    <button className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100 transition">
                      تعديل
                    </button>
                    <button
                      className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100 transition"
                      onClick={() => handleDelete(p.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 border border-black text-center text-gray-400">
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