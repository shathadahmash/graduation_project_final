import React, { useEffect, useState } from 'react';
import { branchService, Branch } from '../../../services/branchService';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await branchService.getBranches();
      setBranches(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await branchService.deleteBranch(id);
      setBranches(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  return (
    <div className="bg-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">الفروع</h2>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">اسم الفرع</th>
              <th className="text-left">الكلية/القسم</th>
              <th className="text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.id} className="border-t">
                <td className="py-2">{b.id}</td>
                <td className="py-2">{b.branch_name}</td>
                <td className="py-2">{b.college ?? b.department ?? '-'}</td>
                <td className="py-2">
                  <button className="text-yellow-600 mr-2">تعديل</button>
                  <button className="text-rose-600" onClick={() => handleDelete(b.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">لا توجد فروع</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Branches;