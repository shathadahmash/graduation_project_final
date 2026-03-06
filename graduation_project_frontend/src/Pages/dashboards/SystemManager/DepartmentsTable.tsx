import React, { useEffect, useState, useMemo } from 'react';
import { departmentService, Department} from '../../../services/departmentService';
import { collegeService, College } from '../../../services/collegeServices';

const DepartmentsTable: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Fetch departments and colleges
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await departmentService.getDepartments();
        setDepartments(Array.isArray(data) ? data : []);

        const collegesData = await collegeService.getColleges();
        setColleges(Array.isArray(collegesData) ? collegesData : []);
      } catch (e) {
        console.error('Failed to fetch departments or colleges', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Delete department
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

  // Handle create/update success
  const handleFormSuccess = (dept: Department) => {
    setDepartments(prev => {
      const exists = prev.find(d => d.department_id === dept.department_id);
      if (exists) return prev.map(d => (d.department_id === dept.department_id ? dept : d));
      return [...prev, dept];
    });
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesName = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesCollege = filterCollege ? d.college_detail?.name_ar === filterCollege : true;
      const matchesCity = filterCity
        ? d.college_detail?.branch_detail?.city_detail?.bname_ar === filterCity
        : true;
      const matchesUniversity = filterUniversity
        ? d.college_detail?.branch_detail?.university_detail?.uname_ar === filterUniversity
        : true;
      return matchesName && matchesCollege && matchesCity && matchesUniversity;
    });
  }, [departments, search, filterCollege, filterCity, filterUniversity]);

  // Filter options
  const collegeOptions = Array.from(new Set(departments.map(d => d.college_detail?.name_ar).filter(Boolean)));
  const cityOptions = Array.from(new Set(departments.map(d => d.college_detail?.branch_detail?.city_detail?.bname_ar).filter(Boolean)));
  const universityOptions = Array.from(new Set(departments.map(d => d.college_detail?.branch_detail?.university_detail?.uname_ar).filter(Boolean)));

  // Department Form (Add/Edit)
  const DepartmentForm = () => {
    const [name, setName] = useState(editingDepartment?.name || '');
    const [description, setDescription] = useState(editingDepartment?.description || '');
    const [collegeId, setCollegeId] = useState(editingDepartment?.college || '');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        let res;
        if (editingDepartment) {
          res = await departmentService.updateDepartment(editingDepartment.department_id, {
            name, description, college: collegeId
          });
        } else {
          res = await departmentService.addDepartment({ name, description, college: collegeId });
        }
        handleFormSuccess(res);
        setShowForm(false);
      } catch (err) {
        console.error(err);
        alert('فشل العملية');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow w-96">
          <h3 className="text-xl font-bold mb-4">{editingDepartment ? 'تعديل القسم' : 'إضافة قسم'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="اسم القسم"
              className="border px-3 py-2 rounded"
              required
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف القسم"
              className="border px-3 py-2 rounded"
            />
            <select
              value={collegeId}
              onChange={e => setCollegeId(Number(e.target.value))}
              className="border px-3 py-2 rounded"
              required
            >
              <option value="">اختر الكلية</option>
              {colleges.map(c => (
                <option key={c.cid} value={c.cid}>{c.name_ar}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded border-gray-400 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">الأقسام</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => { setEditingDepartment(null); setShowForm(true); }}
        >
          إضافة قسم
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن القسم..."
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">الكلية:</label>
          <select
            value={filterCollege}
            onChange={e => setFilterCollege(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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
                <th className="border border-black px-4 py-2">اسم القسم</th>
                <th className="border border-black px-4 py-2">الكلية</th>
                <th className="border border-black px-4 py-2">المدينة</th>
                <th className="border border-black px-4 py-2">الجامعة</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((d, idx) => (
                  <tr
                    key={d.department_id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{d.department_id}</td>
                    <td className="border border-black px-4 py-2">{d.name}</td>
                    <td className="border border-black px-4 py-2">{d.college_detail?.name_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{d.college_detail?.branch_detail?.city_detail?.bname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{d.college_detail?.branch_detail?.university_detail?.uname_ar ?? '-'}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button
                        className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                        onClick={() => { setEditingDepartment(d); setShowForm(true); }}
                      >
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(d.department_id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-black py-6 text-center text-gray-400">
                    لا توجد أقسام
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && <DepartmentForm />}
    </div>
  );
};

export default DepartmentsTable;