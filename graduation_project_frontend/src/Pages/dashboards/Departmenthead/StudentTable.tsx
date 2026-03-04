import React, { useEffect, useState } from "react";
import { studentService } from "../../../services/studentService";
import { useAuthStore } from "../../../store/useStore";

interface Student {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  is_active: boolean;
  college_name: string;
  department_name: string;
}

const StudentsTable: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const data = await studentService.getStudents();
        console.log("طلاب جايين من الباك:", data);
        setStudents(data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // فلترة البحث فقط
  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (studentId: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;

    try {
      await studentService.deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      console.error("❌ Failed to delete student:", err);
      alert("فشل حذف الطالب");
    }
  };

  const startEditing = (student: Student) => {
    alert(`تعديل بيانات الطالب: ${student.name}`);
  };

  if (loading)
    return <div className="p-4 text-center">جاري تحميل الطلاب...</div>;

  if (students.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        لا يوجد طلاب في قسمك
      </div>
    );

  return (
    <div className="theme-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">الطلاب</h3>
          <p className="text-sm text-slate-500">إدارة بيانات الطلاب</p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث"
          className="border p-2 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border text-right">الاسم</th>
              <th className="p-2 border text-right">اسم المستخدم</th>
              <th className="p-2 border text-right">البريد</th>
              <th className="p-2 border text-right">الهاتف</th>
              <th className="p-2 border text-right">الكلية</th>
              <th className="p-2 border text-right">القسم</th>
              <th className="p-2 border text-right">الحالة</th>
              <th className="p-2 border">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-primary-50">
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border text-right">{s.name || "—"}</td>
                <td className="p-2 border text-right">{s.username || "—"}</td>
                <td className="p-2 border text-right">{s.email || "—"}</td>
                <td className="p-2 border text-right">{s.phone || "—"}</td>
                <td className="p-2 border text-right">{s.college_name || "—"}</td>
                <td className="p-2 border text-right">{s.department_name || "—"}</td>
                <td className="p-2 border text-right">
                  {s.status === "active" ? "نشط" :
                  s.status === "suspended" ? "موقوف" :
                  s.status === "graduated" ? "متخرج" :
                  s.status === "dropped" ? "منسحب" :
                  "—"}
                </td>
                <td className="p-2 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="btn-outline-blue"
                      onClick={() => startEditing(s)}
                    >
                      تعديل
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700"
                      onClick={() => handleDelete(s.id)}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;