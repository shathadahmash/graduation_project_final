import React, { useEffect, useState, useMemo } from 'react';
import { collegeService } from '../../../services/collegeServices';
import { branchService } from '../../../services/branchService';

interface College {
  cid: number;
  name_ar: string;
  branch?: number | null; // هذا هو ID الفرع
}

interface Branch {
  ubid: number;
  branch_name_ar?: string;
  branch_name?: string;
  city_detail?: { bname_ar?: string };
  university_detail?: { uname_ar?: string };
}

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeName, setCollegeName] = useState('');
  const [branchId, setBranchId] = useState<number | undefined>();
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  // جلب الكليات
  const fetchColleges = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await collegeService.getColleges();
      setColleges(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch colleges error:', err);
      setErrorMsg('فشل تحميل الكليات، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  // جلب الفروع
  const fetchBranches = async () => {
    try {
      const data = await branchService.getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch branches error:', err);
    }
  };

  useEffect(() => {
    fetchColleges();
    fetchBranches();
  }, []);

  // إنشاء خريطة للبحث السريع عن أسماء الفروع (المدينة + الجامعة)
  const branchesMap = useMemo(() => {
    const map = new Map<number, string>();
    branches.forEach(branch => {
      const cityName = branch.city_detail?.bname_ar ?? '';
      const uniName = branch.university_detail?.uname_ar ?? '';
      const displayName = `${cityName}${cityName && uniName ? ' - ' : ''}${uniName}`;
      map.set(branch.ubid, displayName || `فرع ${branch.ubid}`);
    });
    return map;
  }, [branches]);

  // فتح النافذة المنبثقة
  const openModal = (college?: College) => {
    setErrorMsg('');
    if (college) {
      setEditingCollege(college);
      setCollegeName(college.name_ar || '');
      setBranchId(college.branch ?? undefined);
    } else {
      setEditingCollege(null);
      setCollegeName('');
      setBranchId(undefined);
    }
    setModalVisible(true);
  };

  // حفظ البيانات (إضافة أو تعديل)
  const handleSave = async () => {
    if (!collegeName.trim()) {
      setErrorMsg('الرجاء إدخال اسم الكلية');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = { name_ar: collegeName, branch: branchId || null };

      if (editingCollege) {
        const updatedCollege = await collegeService.updateCollege(editingCollege.cid, payload);
        setColleges(prev => prev.map(c => (c.cid === editingCollege.cid ? updatedCollege : c)));
        alert('تم التحديث بنجاح');
      } else {
        const newCollege = await collegeService.addCollege(payload);
        setColleges(prev => [newCollege, ...prev]);
        alert('تمت إضافة الكلية بنجاح');
      }

      setModalVisible(false);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg('فشل الحفظ: ' + (err.response?.data?.message ?? 'خطأ في الخادم'));
    } finally {
      setLoading(false);
    }
  };

  // حذف كلية
  const handleDelete = async (cid: number) => {
    if (!cid) return;
    if (!confirm('هل أنت متأكد من حذف هذه الكلية؟')) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await collegeService.deleteCollege(cid);
      setColleges(prev => prev.filter(c => c.cid !== cid));
      alert('تم الحذف بنجاح');
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMsg('فشل الحذف: ' + (err.response?.data?.message ?? 'خطأ في الصلاحيات'));
    } finally {
      setLoading(false);
    }
  };

  // تصفية الكليات بناءً على البحث باسم الكلية أو الفرع
  const filteredColleges = useMemo(() => {
    return colleges.filter(c =>
      (c.name_ar || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.branch ? (branchesMap.get(c.branch) || '').toLowerCase().includes(search.toLowerCase()) : false)
    );
  }, [colleges, search, branchesMap]);

  return (
    <div className="bg-white p-6 rounded-lg shadow text-right" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">إدارة الكليات</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => openModal()}
        >
          + إضافة كلية جديدة
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن كلية أو فرع..."
          className="border border-gray-300 rounded px-3 py-1 w-full max-w-xs"
        />
      </div>

      {errorMsg && (
        <div className="mb-4 p-2 bg-red-100 text-red-600 rounded border border-red-200">{errorMsg}</div>
      )}

      {loading && <div className="text-blue-600 mb-2 font-bold">جاري المعالجة...</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black px-4 py-2">CID</th>
              <th className="border border-black px-4 py-2">اسم الكلية</th>
              <th className="border border-black px-4 py-2">الفرع (المدينة - الجامعة)</th>
              <th className="border border-black px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredColleges.length > 0 ? (
              filteredColleges.map((c, idx) => (
                <tr key={c.cid || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="border border-black px-4 py-2">{c.cid}</td>
                  <td className="border border-black px-4 py-2">{c.name_ar}</td>
                  <td className="border border-black px-4 py-2">
                    {c.branch ? branchesMap.get(c.branch) : '—'}
                  </td>
                  <td className="border border-black px-4 py-2 flex gap-2 justify-center">
                    <button
                      className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                      onClick={() => openModal(c)}
                    >
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
              <tr>
                <td colSpan={4} className="border border-black py-6 text-center text-gray-400">
                  لا توجد كليات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">
              {editingCollege ? 'تعديل بيانات الكلية' : 'إضافة كلية جديدة'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">اسم الكلية (عربي):</label>
                <input
                  className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  placeholder="مثال: كلية الهندسة"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">اختر الفرع:</label>
                <select
                  value={branchId ?? ''}
                  onChange={e => setBranchId(e.target.value ? Number(e.target.value) : undefined)}
                  className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">بدون فرع</option>
                  {branches.map(b => {
                    const cityName = b.city_detail?.bname_ar ?? '';
                    const uniName = b.university_detail?.uname_ar ?? '';
                    const displayName = `${cityName}${cityName && uniName ? ' - ' : ''}${uniName}`;
                    return (
                      <option key={b.ubid} value={b.ubid}>
                        {displayName || `فرع ${b.ubid}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setModalVisible(false)}
              >
                إلغاء
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleSave}
              >
                {editingCollege ? 'حفظ التغييرات' : 'إضافة الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeTable;