import React, { useEffect, useState } from 'react';
import { departmentService, Department } from '../../../services/departmentService';

const DepartmentsTable: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await departmentService.getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await departmentService.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.department_id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">الأقسام</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      ) : (
        <table className="w-full table-auto border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-100 border-2 border-black">
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">ID</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">اسم القسم</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">الكلية</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">المدينه</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">الجامعه</th>
              <th className="py-3 px-6 border-r-2 border-black text-left !text-black font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.department_id} className="border-b-2 border-black">
                <td className="py-3 px-6 border-r-2 border-black">{d.department_id}</td>
                <td className="py-3 px-6 border-r-2 border-black">{d.name}</td>
                <td className="py-3 px-6 border-r-2 border-black">{d.college_detail?.name_ar ?? '-'}</td>
                <td className="py-3 px-6 border-r-2 border-black">{d.college_detail?.branch_detail?.city_detail?.bname_ar ?? '-'}</td>
                <td className="py-3 px-6 border-r-2 border-black">{d.college_detail?.branch_detail?.university_detail?.uname_ar ?? '-'}</td>
                <td className="py-3 px-6 border-r-2 border-black flex gap-2">
                  <button className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition">
                    تعديل
                  </button>
                  <button
                    className="bg-rose-600 text-white px-4 py-1 rounded-lg hover:bg-rose-700 transition"
                    onClick={() => handleDelete(d.department_id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">لا توجد أقسام</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartmentsTable;