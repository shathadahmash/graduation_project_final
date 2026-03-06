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
  phone: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<EditingStudent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<EditingStudent | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    isActive: "all",
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Advanced filtering with memoization
  const filtered = useMemo(() => {
    return students.filter((s) => {
      // Search filter
      const searchTerm = filters.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm) ||
        s.username.toLowerCase().includes(searchTerm) ||
        s.email.toLowerCase().includes(searchTerm) ||
        s.phone.includes(searchTerm);

      // Status filter
      const matchesStatus =
        filters.status === "all" || s.status === filters.status;

      // Active status filter
      const matchesActive =
        filters.isActive === "all" ||
        (filters.isActive === "active" && s.is_active) ||
        (filters.isActive === "inactive" && !s.is_active);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [students, filters]);

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
    setEditingStudent(student);
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
    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!editFormData?.name || editFormData.name.trim() === "") {
      errors.name = "الاسم مطلوب";
    }

    if (!editFormData?.email || editFormData.email.trim() === "") {
      errors.email = "البريد الإلكتروني مطلوب";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        errors.email = "صيغة البريد الإلكتروني غير صحيحة";
      }
    }

    if (!editFormData?.phone || editFormData.phone.trim() === "") {
      errors.phone = "رقم الهاتف مطلوب";
    } else {
      const phoneDigits = editFormData.phone.replace(/\D/g, "");
      if (!/^\d{7,15}$/.test(phoneDigits)) {
        errors.phone = "رقم الهاتف يجب أن يكون بين 7-15 أرقام";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !validateForm()) return;

    setIsSaving(true);
    try {
      const updateData = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        status: editFormData.status || "active",
      };

      await studentService.updateStudent(editFormData.id, updateData);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === editFormData.id ? { ...s, ...updateData } : s
        )
      );

      setIsEditModalOpen(false);
      setEditingStudent(null);
      setEditFormData(null);
      setValidationErrors({});

      alert("تم تحديث بيانات الطالب بنجاح ✓");
    } catch (err) {
      console.error("❌ Failed to update student:", err);
      alert("فشل تحديث بيانات الطالب");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
    setEditFormData(null);
    setValidationErrors({});
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      isActive: "all",
      searchTerm: "",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "suspended":
        return "bg-amber-100 text-amber-800";
      case "graduated":
        return "bg-blue-100 text-blue-800";
      case "dropped":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "suspended":
        return "موقوف";
      case "graduated":
        return "متخرج";
      case "dropped":
        return "منسحب";
      default:
        return "—";
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <FiLoader className="animate-spin inline-block text-blue-600 mb-2" size={32} />
        <p className="text-slate-600">جاري تحميل الطلاب...</p>
      </div>
    );

  if (students.length === 0)
    return (
      <div className="p-8 text-center">
        <FiAlertCircle className="inline-block text-slate-400 mb-2" size={40} />
        <p className="text-slate-500 text-lg">لا يوجد طلاب في قسمك</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">الطلاب</h3>
            <p className="text-sm text-slate-500 mt-1">إدارة بيانات الطلاب ({filtered.length} من {students.length})</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FiFilter size={18} />
            <span className="text-sm font-semibold">الفلاتر</span>
            <FiChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters({ ...filters, searchTerm: e.target.value })
            }
            placeholder="ابحث بالاسم أو اسم المستخدم أو البريد أو الهاتف..."
            className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                حالة الطالب
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                <option value="active">نشط</option>
                <option value="suspended">موقوف</option>
                <option value="graduated">متخرج</option>
                <option value="dropped">منسحب</option>
              </select>
            </div>

            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                حالة الحساب
              </label>
              <select
                value={filters.isActive}
                onChange={(e) =>
                  setFilters({ ...filters, isActive: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                <option value="active">نشط</option>
                <option value="inactive">معطل</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">#</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">اسم المستخدم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">البريد</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الهاتف</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">القسم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.name || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.username || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.email || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.phone || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{s.department_name || "—"}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => startEditing(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                    >
                      <FiEdit2 size={14} />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-xs font-semibold"
                    >
                      <FiTrash2 size={14} />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {filtered.length === 0 && (
        <div className="p-8 text-center">
          <FiSearch className="inline-block text-slate-300 mb-2" size={40} />
          <p className="text-slate-500 text-lg">لا توجد نتائج للبحث</p>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">تعديل بيانات الطالب</h2>
                <p className="text-sm text-slate-500 mt-1">{editFormData.name}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    validationErrors.name
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-200"
                  }`}
                  placeholder="أدخل الاسم الكامل"
                />
                {validationErrors.name && (
                  <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Username Field (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">لا يمكن تعديل اسم المستخدم</p>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    validationErrors.email
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-200"
                  }`}
                  placeholder="أدخل البريد الإلكتروني"
                />
                {validationErrors.email && (
                  <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    validationErrors.phone
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-200"
                  }`}
                  placeholder="أدخل رقم الهاتف"
                />
                {validationErrors.phone && (
                  <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  حالة الطالب
                </label>
                <select
                  value={editFormData.status || "active"}
                  onChange={(e) => handleEditInputChange("status", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="active">نشط</option>
                  <option value="suspended">موقوف</option>
                  <option value="graduated">متخرج</option>
                  <option value="dropped">منسحب</option>
                </select>
              </div>

              {/* Active Status Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={editFormData.is_active}
                  onChange={(e) => handleEditInputChange("is_active", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label className="text-sm font-semibold text-slate-700 cursor-pointer flex-1">
                  تفعيل الحساب
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
              >
                {isSaving ? (
                  <>
                    <FiLoader size={18} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;