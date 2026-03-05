import React, { useEffect, useState } from 'react';
import { collegeService } from '../../../services/collegeServices';

interface College {
  cid: number;
  name_ar: string;
  branch?: number;
}

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeName, setCollegeName] = useState('');
  const [branchId, setBranchId] = useState<number | undefined>();
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const data = await collegeService.getColleges();
        setColleges(data);
      } catch (err: any) {
        setErrorMsg('فشل تحميل الكليات: ' + (err.message ?? err));
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  // Open modal
  const openModal = (college?: College) => {
    setErrorMsg('');
    if (college) {
      setEditingCollege(college);
      setCollegeName(college.name_ar);
      setBranchId(college.branch);
    } else {
      setEditingCollege(null);
      setCollegeName('');
      setBranchId(undefined);
    }
    setModalVisible(true);
  };

  // Save college
  const handleSave = async () => {
    if (!collegeName || !branchId) {
      setErrorMsg('الرجاء إدخال اسم الكلية ورقم الفرع');
      return;
    }
    try {
      if (editingCollege) {
        const updated = await collegeService.updateCollege(editingCollege.cid, {
          name_ar: collegeName,
          branch: branchId,
        });
        setColleges((prev) => prev.map((c) => (c.cid === updated.cid ? updated : c)));
      } else {
        const newCollege = await collegeService.addcollege({
          name_ar: collegeName,
          branch: branchId,
        });
        setColleges((prev) => [...prev, newCollege]);
      }
      setModalVisible(false);
    } catch (err: any) {
      setErrorMsg('فشل الحفظ: ' + (err.response?.data ?? err.message ?? err));
    }
  };

  // Delete college
  const handleDelete = async (cid: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await collegeService.deleteCollege(cid);
      setColleges((prev) => prev.filter((c) => c.cid !== cid));
    } catch (err: any) {
      setErrorMsg('فشل الحذف: ' + (err.response?.data ?? err.message ?? err));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">الكليات</h2>

      {/* CREATE BUTTON */}
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => openModal()}
      >
        إضافة كلية جديدة
      </button>

      {/* Error Message */}
      {errorMsg && <div className="mb-4 text-red-600 font-medium">{errorMsg}</div>}

      {loading ? (
        <div className="text-center text-gray-500 py-6">جاري التحميل...</div>
      ) : (
        <table className="w-full border border-black">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">اسم الكلية</th>
              <th className="border px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {colleges.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  لا توجد كليات
                </td>
              </tr>
            )}
            {colleges.map((c) => (
              <tr key={c.cid}>
                <td className="border px-4 py-2">{c.cid}</td>
                <td className="border px-4 py-2">{c.name_ar}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-400 rounded"
                    onClick={() => openModal(c)}
                  >
                    تعديل
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(c.cid)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="text-xl font-bold mb-4">{editingCollege ? 'تعديل الكلية' : 'إضافة كلية جديدة'}</h3>
            {errorMsg && <div className="mb-2 text-red-600">{errorMsg}</div>}
            <label className="block mb-2">اسم الكلية:</label>
            <input
              className="border p-1 w-full mb-4"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
            <label className="block mb-2">رقم الفرع:</label>
            <input
              type="number"
              className="border p-1 w-full mb-4"
              value={branchId ?? ''}
              onChange={(e) => setBranchId(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setModalVisible(false)}>
                إلغاء
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSave}>
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeTable;