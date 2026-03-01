import React, { useEffect, useState } from 'react';
import { collegeService } from '../../../services/collegeServices';
import { Program } from '../../../services/programService';

interface College {
  id?: number;        // optional if backend uses cid only
  cid: number;        // college unique ID from backend
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

  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch all colleges
        const data = await collegeService.getColleges();
        console.log('Fetched colleges:', data);

        // 2️⃣ Fetch programs for each college
        const collegesWithPrograms = await Promise.all(
          data.map(async (college) => {
            // Use `id` if exists, otherwise fallback to `cid`
            const collegeId = college.id ?? college.cid;
            if (!collegeId) return college;

            console.log('Fetching programs for collegeId:', collegeId);
            const programs = await collegeService.getCollegePrograms(collegeId);
            console.log('Programs fetched:', programs);

            return {
              ...college,
              programs,
            };
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">الكليات</h2>

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
              {colleges.length > 0 ? (
                colleges.map((c, index) => (
                  <tr
                    key={c.cid} // unique key
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{c.cid}</td>
                    <td className="border border-black px-4 py-2">{c.name_ar}</td>
                    <td className="border border-black px-4 py-2">
                      {c.branch_detail?.city ?? '-'}
                    </td>
                    <td className="border border-black px-4 py-2">
                      {c.branch_detail?.university_detail?.uname_ar ?? '-'}
                    </td>
                    <td className="border border-black px-4 py-2">
                      {c.programs && c.programs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.programs.map((p) => (
                            <span
                              key={p.pid}
                              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
                            >
                              {p.p_name ?? '-'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
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