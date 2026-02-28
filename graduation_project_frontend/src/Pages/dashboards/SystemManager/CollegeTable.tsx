import React, { useEffect, useState } from 'react';
import { collegeService, College } from '../../../services/collegeServices';

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await collegeService.getColleges();
      try { console.debug('[CollegeTable] fetched rows count:', (data || []).length, 'sample:', (data || []).slice(0,3)); } catch (e) {}
      setColleges(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await collegeService.deleteCollege(id);
      setColleges(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  return (
    <div className="bg-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">كليات</h2>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">اسم الكلية</th>
              <th className="text-left">جامعة</th>
              <th className="text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map(c => (
              <tr key={c.id} className="border-t">
                <td className="py-2">{c.id}</td>
                <td className="py-2">{c.college_name}</td>
                <td className="py-2">{c.university ?? '-'}</td>
                <td className="py-2">
                  <button className="text-yellow-600 mr-2">تعديل</button>
                  <button className="text-rose-600" onClick={() => handleDelete(c.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {colleges.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">لا توجد كليات</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CollegeTable;
