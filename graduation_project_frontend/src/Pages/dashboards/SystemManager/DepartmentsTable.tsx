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
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  return (
    <div className="bg-white p-4 rounded">
      <h2 className="text-xl font-bold mb-4">الأقسام</h2>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">اسم القسم</th>
              <th className="text-left">الكلية</th>
              <th className="text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} className="border-t">
                <td className="py-2">{d.id}</td>
                <td className="py-2">{d.department_name}</td>
                <td className="py-2">{d.college ?? '-'}</td>
                <td className="py-2">
                  <button className="text-yellow-600 mr-2">تعديل</button>
                  <button className="text-rose-600" onClick={() => handleDelete(d.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">لا توجد أقسام</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartmentsTable;