import React, { useEffect, useState } from "react";
import { collegeService, branchService } from "../../../services/collegeServices";

interface College {
  id: number;
  name_ar: string;
  branch?: number | null;
}

interface Branch {
  id: number;
  branch_name: string;
}

const CollegeTable: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeName, setCollegeName] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ============================
     Fetch Colleges + Branches
  ============================ */

  const fetchData = async () => {
    setLoading(true);

    try {
      const collegesData = await collegeService.getColleges();
      const branchesData = await branchService.getBranches();
      console.log("Fetched colleges:", collegesData);
      console.log("Fetched branches:", branchesData);

      setColleges(collegesData);
      setBranches(branchesData);
    } catch (err: any) {
      setErrorMsg("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ============================
     Open Modal
  ============================ */

  const openModal = (college?: College) => {
    setErrorMsg("");

    if (college) {
      setEditingCollege(college);
      setCollegeName(college.name_ar);
      setBranchId(college.branch ?? "");
    } else {
      setEditingCollege(null);
      setCollegeName("");
      setBranchId("");
    }

    setModalVisible(true);
  };

  /* ============================
     Save College
  ============================ */

  const handleSave = async () => {
    if (!collegeName || !branchId) {
      setErrorMsg("الرجاء إدخال اسم الكلية واختيار الفرع");
      return;
    }

    try {
      if (editingCollege) {
        const updated = await collegeService.updateCollege(editingCollege.id, {
          name_ar: collegeName,
          branch: branchId,
        });

        setColleges((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const newCollege = await collegeService.addCollege({
          name_ar: collegeName,
          branch: branchId,
        });

        setColleges((prev) => [...prev, newCollege]);
      }

      setModalVisible(false);
    } catch (err: any) {
      setErrorMsg("فشل الحفظ");
    }
  };

  /* ============================
     Delete College
  ============================ */

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      await collegeService.deleteCollege(id);
      setColleges((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setErrorMsg("فشل الحذف");
    }
  };

  /* ============================
     Get Branch Name
  ============================ */

  const getBranchName = (branchId?: number | null) => {
    const branch = branches.find((b) => b.id === branchId);

    return branch ? branch.branch_name : "-";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">

      <h2 className="text-2xl font-bold mb-4">الكليات</h2>

      {/* ADD BUTTON */}

      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => openModal()}
      >
        إضافة كلية جديدة
      </button>

      {errorMsg && (
        <div className="mb-4 text-red-600 font-medium">{errorMsg}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-6">جاري التحميل...</div>
      ) : (
        <table className="w-full border border-black">

          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">اسم الكلية</th>
              <th className="border px-4 py-2">الفرع</th>
              <th className="border px-4 py-2">الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {colleges.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  لا توجد كليات
                </td>
              </tr>
            )}

            {colleges.map((c) => (
              <tr key={c.cid ?? c.cid}>
                <td className="border px-4 py-2">{c.cid}</td>
                <td className="border px-4 py-2">{c.name_ar}</td>
                <td className="border px-4 py-2">
                  {getBranchName(c.branch)}
                </td>

                <td className="border px-4 py-2 flex gap-2">

                  <button
                    className="px-2 py-1 bg-yellow-400 rounded"
                    onClick={() => openModal(c)}
                  >
                    تعديل
                  </button>

                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(c.id)}
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

            <h3 className="text-xl font-bold mb-4">
              {editingCollege ? "تعديل الكلية" : "إضافة كلية جديدة"}
            </h3>

            {errorMsg && (
              <div className="mb-2 text-red-600">{errorMsg}</div>
            )}

            <label className="block mb-2">اسم الكلية</label>

            <input
              className="border p-1 w-full mb-4"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />

            <label className="block mb-2">الفرع</label>

            <select
              className="border p-1 w-full mb-4"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
            >
              <option value="">اختر الفرع</option>

              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name}
                </option>
              ))}

            </select>

            <div className="flex justify-end gap-2">

              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setModalVisible(false)}
              >
                إلغاء
              </button>

              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleSave}
              >
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