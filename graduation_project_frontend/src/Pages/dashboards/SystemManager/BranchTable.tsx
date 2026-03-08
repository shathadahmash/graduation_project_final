import React, { useEffect, useState, useMemo } from 'react';
import { branchService } from '../../../services/branchService';
import { universityService } from '../../../services/universityService';
import { cityService } from '../../../services/cityService';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [form, setForm] = useState({ 
    university: '', 
    city: '' 
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [branchesData, universitiesData, citiesData] = await Promise.all([
        branchService.getBranches(),
        universityService.getUniversities(),
        cityService.getCities()
      ]);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const openCreate = () => {
    setEditingBranch(null);
    setForm({ university: '', city: '' });
    setShowModal(true);
  };

  const openEdit = (b: any) => {
    setEditingBranch(b);
    setForm({ 
      university: b.university || b.university_detail?.uid || '',
      city: b.city || b.city_detail?.bid || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.university || !form.city) {
      alert("يرجى اختيار الجامعة والمدينة");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        university: Number(form.university),
        city: Number(form.city)
      };

      if (editingBranch) {
        await branchService.updateBranch(editingBranch.ubid, payload);
        alert('تم التحديث بنجاح');
      } else {
        await branchService.addBranch(payload);
        alert('تمت الإضافة بنجاح');
      }
      setShowModal(false);
      loadInitialData(); 
    } catch (e) {
      console.error("Save error:", e);
      alert('فشل الحفظ، يرجى التأكد من اختيار القيم بشكل صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id || !confirm('هل أنت متأكد من الحذف؟')) return;
    setLoading(true);
    try {
      await branchService.deleteBranch(id);
      setBranches(prev => prev.filter(b => b.ubid !== id));
      alert('تم الحذف بنجاح');
    } catch (e) {
      alert('فشل الحذف');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = useMemo(() => {
    const query = search.toLowerCase().trim();
    return branches.filter(b => {
      const cityName = (b.city_detail?.bname_ar || '').toLowerCase();
      const uniName = (b.university_detail?.uname_ar || '').toLowerCase();
      return cityName.includes(query) || uniName.includes(query);
    });
  }, [branches, search]);

  return (
    <div className="bg-white p-6 rounded-lg shadow text-right" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">إدارة الفروع</h2>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-sm">+ إضافة فرع جديد</button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث باسم المدينة أو الجامعة..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      {loading && <div className="text-blue-600 mb-2 font-bold animate-pulse">جاري المعالجة...</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black px-4 py-2">ID</th>
              <th className="border border-black px-4 py-2">المدينة</th>
              <th className="border border-black px-4 py-2">الجامعة</th>
              <th className="border border-black px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.map((b, idx) => (
              <tr key={b.ubid || idx} className="hover:bg-gray-50 transition">
                <td className="border border-black px-4 py-2">{b.ubid}</td>
                <td className="border border-black px-4 py-2 font-medium">{b.city_detail?.bname_ar || '-'}</td>
                <td className="border border-black px-4 py-2">{b.university_detail?.uname_ar || '-'}</td>
                <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                  <button onClick={() => openEdit(b)} className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-50">تعديل</button>
                  <button onClick={() => handleDelete(b.ubid)} className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-50">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl">
            <h3 className="font-bold mb-6 text-xl border-b pb-2">
              {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
            </h3>
            
            <div className="space-y-5 text-right">
              {/* اختيار الجامعة */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">الجامعة:</label>
                <select 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.university}
                  onChange={e => setForm({ ...form, university: e.target.value })}
                >
                  <option value="">اختر الجامعة</option>
                  {universities.map(u => (
                    <option key={u.uid} value={u.uid}>{u.uname_ar}</option>
                  ))}
                </select>
              </div>

              {/* اختيار المدينة */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">المدينة:</label>
                <select 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                >
                  <option value="">اختر المدينة</option>
                  {cities.map(city => (
                    <option key={city.bid} value={city.bid}>{city.bname_ar}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition"
              >
                {editingBranch ? 'حفظ التغييرات' : 'إضافة الفرع'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;