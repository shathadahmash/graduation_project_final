import React, { useEffect, useState, useMemo } from "react";
import { studentService } from "../../../services/studentService";
import { useAuthStore } from "../../../store/useStore";
import {
  FiX,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiLoader,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";

interface Student {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  college_name: string;
  department_name: string;
  status?: string;
}

interface EditingStudent extends Student {
  [key: string]: any;
}

interface FilterOptions {
  status: string;
  isActive: string;
  searchTerm: string;
}

const StudentsTable: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    isActive: "all",
    searchTerm: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditingStudent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const data = await studentService.getStudents();
        setStudents(data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  /* فلترة الطلاب + فلترة القسم */
  const filtered = useMemo(() => {
    return students.filter((s) => {
      // فلترة حسب القسم
      if (user?.department_name && s.department_name !== user.department_name) {
        return false;
      }

      const search = filters.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        (s.name || "").toLowerCase().includes(search) ||
        (s.username || "").toLowerCase().includes(search) ||
        (s.email || "").toLowerCase().includes(search) ||
        (s.phone || "").includes(search);

      const matchesStatus =
        filters.status === "all" || s.status === filters.status;

      const matchesActive =
        filters.isActive === "all" ||
        (filters.isActive === "active" && s.is_active) ||
        (filters.isActive === "inactive" && !s.is_active);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [students, filters, user]);


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
    setEditFormData({ ...student });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field: string, value: any) => {
    if (!editFormData) return;

    setEditFormData({
      ...editFormData,
      [field]: value,
    });

    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!editFormData?.name?.trim()) {
      errors.name = "الاسم مطلوب";
    }

    if (!editFormData?.email?.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!editFormData?.phone?.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !validateForm()) return;

    setIsSaving(true);

    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        status: editFormData.status || "active",
      };

      // هنا نفترض أن الخدمة تعيد الطالب المحدث
      const updatedStudent = await studentService.updateStudent(editFormData.id, updateData);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editFormData.id ? { ...s, ...updatedStudent } : s
        )
      );

      setIsEditModalOpen(false);
      setEditFormData(null);

      alert("تم تحديث بيانات الطالب ✓");
    } catch (err) {
      console.error("❌ Failed to update student:", err);
      alert("فشل تحديث بيانات الطالب.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800";
      case "suspended": return "bg-amber-100 text-amber-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      case "dropped": return "bg-rose-100 text-rose-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active": return "نشط";
      case "suspended": return "موقوف";
      case "graduated": return "متخرج";
      case "dropped": return "منسحب";
      default: return "—";
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <FiLoader className="animate-spin inline-block text-blue-600 mb-2" size={30} />
        <p>جاري تحميل الطلاب...</p>
      </div>
    );

  if (!loading && filtered.length === 0)
    return (
      <div className="p-8 text-center">
        <FiAlertCircle size={40} className="text-gray-400 mb-2 inline-block" />
        <p>لا يوجد طلاب لعرضهم في قسمك.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-bold">
          الطلاب ({filtered.length})
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white"
        >
          <FiFilter />
          الفلاتر
          <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="p-4 border-b">
            <div className="relative mb-4">
                <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="بحث بالاسم, البريد, الهاتف..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="w-full border-gray-300 rounded-lg p-2 pr-10"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-600">الحالة</label>
                    <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full mt-1 border-gray-300 rounded-lg p-2">
                        <option value="all">الكل</option>
                        <option value="active">نشط</option>
                        <option value="suspended">موقوف</option>
                        <option value="graduated">متخرج</option>
                        <option value="dropped">منسحب</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">حالة الحساب</label>
                    <select value={filters.isActive} onChange={e => setFilters({...filters, isActive: e.target.value})} className="w-full mt-1 border-gray-300 rounded-lg p-2">
                        <option value="all">الكل</option>
                        <option value="active">مفعل</option>
                        <option value="inactive">غير مفعل</option>
                    </select>
                </div>
            </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">الاسم</th>
              <th className="p-3 font-medium">اسم المستخدم</th>
              <th className="p-3 font-medium">البريد</th>
              <th className="p-3 font-medium">الهاتف</th>
              <th className="p-3 font-medium">القسم</th>
              <th className="p-3 font-medium">الحالة</th>
              <th className="p-3 font-medium text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-3 text-gray-500">{i + 1}</td>
                <td className="p-3 font-semibold">{s.name || "—"}</td>
                <td className="p-3">{s.username || "—"}</td>
                <td className="p-3">{s.email || "—"}</td>
                <td className="p-3">{s.phone || "—"}</td>
                <td className="p-3">{s.department_name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => startEditing(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================== */}
      {/*   نافذة التعديل - الجزء المضاف                  */}
      {/* ================================================== */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-xl">تعديل بيانات الطالب</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FiX />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={editFormData.name} 
                  onChange={(e) => handleEditInputChange('name', e.target.value)} 
                  className={`w-full border rounded-lg p-2 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={(e) => handleEditInputChange('email', e.target.value)} 
                  className={`w-full border rounded-lg p-2 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={editFormData.phone || ''} 
                  onChange={(e) => handleEditInputChange('phone', e.target.value)} 
                  className={`w-full border rounded-lg p-2 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100">
                إلغاء
              </button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:bg-blue-400 transition-colors">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                <span>حفظ التغييرات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
