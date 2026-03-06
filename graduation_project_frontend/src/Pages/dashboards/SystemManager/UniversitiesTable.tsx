import React, { useEffect, useState, useMemo } from 'react';
import { universityService } from '../../../services/universityService';

const UniversitiesTable: React.FC = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  // حالات التعديل
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any | null>(null);
  const [form, setForm] = useState({ uname_ar: '', type: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await universityService.getUniversities();
      setUniversities(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch universities', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (u: any) => {
    // استخدام uid كما يظهر في الـ Console
    const targetId = u.uid;
    
    if (!targetId) {
      console.error("لم يتم العثور على معرف (uid) للجامعة:", u);
      alert("خطأ: معرف الجامعة (uid) غير موجود");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${u.uname_ar}؟`)) return;
    
    setLoading(true);
    try {
      await universityService.deleteUniversity(targetId);
      // تحديث الحالة محلياً باستخدام uid
      setUniversities(prev => prev.filter(item => item.uid !== targetId));
      alert('تم الحذف بنجاح');
    } catch (e) {
      console.error("Delete error:", e);
      alert('فشل الحذف، يرجى التحقق من الصلاحيات');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: any) => {
    setEditingUniversity(u);
    setForm({ 
      uname_ar: u.uname_ar || '', 
      type: u.type || '' 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const targetId = editingUniversity?.uid;
    
    if (!targetId) {
      alert("خطأ: معرف الجامعة (uid) غير موجود للتعديل");
      return;
    }
    
    setLoading(true);
    try {
      await universityService.updateUniversity(targetId, form);
      // تحديث القائمة محلياً باستخدام uid
      setUniversities(prev => 
        prev.map(u => u.uid === targetId ? { ...u, ...form } : u)
      );
      setShowModal(false);
      alert('تم التحديث بنجاح');
    } catch (e) {
      console.error("Update error:", e);
      alert('فشل التحديث');
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      const name = u.uname_ar || '';
      const type = u.type || '';
      const matchesName = name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType ? type === filterType : true;
      return matchesName && matchesType;
    });
  }, [universities, search, filterType]);

  const universityTypes = Array.from(new Set(universities.map(u => u.type).filter(Boolean)));

  return (
    <div className="bg-white p-6 rounded-lg shadow text-right" dir="rtl">
      <h2 className="text-2xl font-bold mb-4">الجامعات</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن الجامعة..."
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">نوع الجامعة:</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">الكل</option>
            {universityTypes.map((type: any) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-blue-600 mb-2 font-bold">جاري المعالجة...</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black px-4 py-2">ID</th>
              <th className="border border-black px-4 py-2">اسم الجامعة</th>
              <th className="border border-black px-4 py-2">نوع الجامعة</th>
              <th className="border border-black px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((u, idx) => {
                // استخدام uid للمفتاح (Key)
                const currentId = u.uid || `idx-${idx}`;
                return (
                  <tr key={currentId} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="border border-black px-4 py-2">{u.uid}</td>
                    <td className="border border-black px-4 py-2">{u.uname_ar}</td>
                    <td className="border border-black px-4 py-2">{u.type}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                      <button 
                        onClick={() => openEdit(u)}
                        className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                      >
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(u)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="border border-black py-6 text-center text-gray-400">
                  لا توجد جامعات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة التعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4 text-lg">تعديل بيانات الجامعة</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">اسم الجامعة (عربي):</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={form.uname_ar}
                  onChange={e => setForm({ ...form, uname_ar: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">النوع:</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border px-4 py-1 rounded">إلغاء</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1 rounded">حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitiesTable;
