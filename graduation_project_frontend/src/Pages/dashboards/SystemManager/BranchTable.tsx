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
      setBranches(prev => prev.filter(b => b.ubid !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">الفروع</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      ) : (
        <table className="w-full table-auto border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-100 border-2 border-black">
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">ID</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">المدينه</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">الجامعه</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.ubid} className="border-b-2 border-black">
                <td className="py-3 px-6 border-r-2 border-black">{b.ubid}</td>
                <td className="py-3 px-6 border-r-2 border-black">{b.city_detail?.bname_ar || '-'}</td>
                <td className="py-3 px-6 border-r-2 border-black">{b.university_detail?.uname_ar || '-'}</td>
                <td className="py-3 px-6 border-r-2 border-black flex gap-2">
                  <button className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition">
                    تعديل
                  </button>
                  <button
                    className="bg-rose-600 text-white px-4 py-1 rounded-lg hover:bg-rose-700 transition"
                    onClick={() => handleDelete(b.ubid)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Branches;