import React, { useEffect, useState, useMemo } from "react";
import { programService, Program } from "../../../services/programService";
import { departmentService } from "../../../services/departmentService";

interface Department {
  id: number;
  name: string;
}

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const [programName, setProgramName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await programService.getPrograms();
      setPrograms(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error(error);
      alert("فشل جلب البرامج");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error(error);
      alert("فشل جلب الأقسام");
    }
  };

  const openCreateModal = () => {
    setEditingProgram(null);
    setProgramName("");
    setDepartmentId(null);
    setDuration(null);
    setModalVisible(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setProgramName(program.p_name);
    setDepartmentId(program.department ?? null);
    setDuration(program.duration ?? null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Convert departmentId to number safely
    const deptId = departmentId !== null ? Number(departmentId) : null;

    if (!programName || deptId === null || duration === null) {
      alert("الرجاء إدخال جميع الحقول");
      return;
    }

    try {
      if (editingProgram) {
        const updated = await programService.updateProgram(editingProgram.pid, {
          p_name: programName,
          department: deptId,
          duration,
        });
        setPrograms((prev) =>
          prev.map((p) => (p.pid === updated.pid ? updated : p))
        );
      } else {
        const created = await programService.addProgram({
          p_name: programName,
          department: deptId,
          duration,
        });
        setPrograms((prev) => [...prev, created]);
      }
      setModalVisible(false);
    } catch (error: any) {
      console.error("Error saving program:", error);
      alert("فشل الحفظ: " + (error?.message || ""));
    }
  };

  const handleDelete = async (pid: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await programService.deleteProgram(pid);
      setPrograms((prev) => prev.filter((p) => p.pid !== pid));
    } catch (error) {
      console.error(error);
      alert("فشل الحذف");
    }
  };

  const filteredPrograms = useMemo(
    () =>
      programs.filter((p) =>
        p.p_name?.toLowerCase().includes(search.toLowerCase())
      ),
    [programs, search]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">البرامج</h2>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          إضافة برنامج
        </button>
      </div>

      <input
        type="text"
        placeholder="بحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-1 mb-4 rounded"
      />

      {loading ? (
        <div className="text-center py-6">جاري التحميل...</div>
      ) : (
        <table className="w-full border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">اسم البرنامج</th>
              <th className="border px-4 py-2">القسم</th>
              <th className="border px-4 py-2">المدة (سنة)</th>
              <th className="border px-4 py-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length ? (
              filteredPrograms.map((p) => (
                <tr key={p.pid}>
                  <td className="border px-4 py-2">{p.pid}</td>
                  <td className="border px-4 py-2">{p.p_name}</td>
                  <td className="border px-4 py-2">
                    {p.department_detail?.name ?? "-"}
                  </td>
                  <td className="border px-4 py-2">{p.duration ?? "-"}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 bg-yellow-400 rounded"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p.pid)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  لا توجد برامج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingProgram ? "تعديل برنامج" : "إضافة برنامج"}
            </h3>

            <label className="block mb-2">اسم البرنامج</label>
            <input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="border w-full p-2 mb-4"
            />

            <label className="block mb-2">القسم</label>
            <select
              value={departmentId ?? ""}
              onChange={(e) =>
                setDepartmentId(e.target.value ? Number(e.target.value) : null)
              }
              className="border w-full p-2 mb-4"
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.name}
                </option>
              ))}
            </select>

            <label className="block mb-2">المدة (سنة)</label>
            <input
              type="number"
              value={duration !== null && !isNaN(duration) ? duration : ""}
              onChange={(e) =>
                setDuration(e.target.value ? Number(e.target.value) : null)
              }
              className="border w-full p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded"
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

export default Programs;