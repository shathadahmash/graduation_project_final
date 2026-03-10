import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiDownload,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";

// Types for better data handling
type ImportError = {
  row: number;
  field?: string;
  message: string;
};

type ImportResult = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_projects?: number;
  updated_projects?: number;
  errors: ImportError[];
  valid_projects_names?: string[]; // Added to check duplicates
};

const SysManagerImport: React.FC = () => {
  const navigate = useNavigate();

  // --- Logic State ---
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // --- Design State (For UI feedback) ---
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const canCommit = useMemo(() => {
    if (!result) return false;
    return result.valid_rows > 0 && result.invalid_rows === 0;
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      if (!f.name.toLowerCase().endsWith(".xlsx")) {
        setStatusMessage({ text: "الرجاء اختيار ملف بصيغة .xlsx فقط", type: "error" });
        return;
      }
      setFile(f);
      setResult(null);
      setStatusMessage(null);
    }
  };

  // --- Check for duplicate project names ---
  const findDuplicateProjects = (projects: string[]): ImportError[] => {
    const seen = new Set<string>();
    const errors: ImportError[] = [];
    projects.forEach((name, idx) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      if (seen.has(trimmedName)) {
        errors.push({
          row: idx + 2, // Assuming Excel has header row
          field: "اسم المشروع",
          message: "اسم المشروع مكرر"
        });
      } else {
        seen.add(trimmedName);
      }
    });
    return errors;
  };

  const validateFile = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMessage(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/import_projects_validate/", formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          "Authorization": `Bearer ${token}`
        },
      });

      let validationResult: ImportResult = res.data;

      // --- Duplicate check ---
      if (validationResult.valid_projects_names) {
        const duplicateErrors = findDuplicateProjects(validationResult.valid_projects_names);
        if (duplicateErrors.length > 0) {
          validationResult.errors = [...validationResult.errors, ...duplicateErrors];
          validationResult.invalid_rows += duplicateErrors.length;
          validationResult.valid_rows -= duplicateErrors.length;
          setStatusMessage({ text: "يوجد أسماء مشاريع مكررة ❌", type: "error" });
        } else if (validationResult.invalid_rows > 0) {
          setStatusMessage({ text: "يوجد أخطاء في الملف ❌", type: "error" });
        } else {
          setStatusMessage({ text: "الملف صالح للاستيراد ✅", type: "success" });
        }
      } else {
        if (validationResult.invalid_rows > 0) {
          setStatusMessage({ text: "يوجد أخطاء في الملف ❌", type: "error" });
        } else {
          setStatusMessage({ text: "الملف صالح للاستيراد ✅", type: "success" });
        }
      }

      setResult(validationResult);

    } catch (err: any) {
      setStatusMessage({ text: "فشل التحقق من الملف", type: "error" });
      setResult(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const commitFile = async () => {
    if (!file) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/import_projects_commit/", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      setResult(res.data);
      setStatusMessage({ text: "تم الاستيراد بنجاح 🎉", type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: "فشل عملية الاستيراد", type: "error" });
      setResult(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await axios.get("/api/system/import/projects/template/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "projects_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      setShowTemplateModal(false);
    } catch (err) {
      alert("Failed to download template");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
              <FiArrowRight />
            </button>
            <h1 className="text-2xl font-black text-slate-800">استيراد المشاريع من Excel</h1>
          </div>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            <FiDownload />
            تحميل القالب
          </button>
        </div>

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">تحميل قالب المشاريع</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                يرجى استخدام القالب الرسمي لضمان توافق البيانات. تأكد من ملء جميع الحقول المطلوبة (اسم المشروع، أرقام الطلاب، المشرف).
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={downloadTemplate}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold"
                >
                  تحميل XLSX
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Action Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors border-2 border-dashed border-slate-300">
              <FiUploadCloud className="text-blue-600" />
              <span className="font-bold text-slate-700">اختيار ملف Excel</span>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={validateFile}
              disabled={!file || loading}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition-all shadow-md"
            >
              {loading && !result ? "جارٍ الفحص..." : "رفع وفحص الملف"}
            </button>

            <button
              onClick={commitFile}
              disabled={!canCommit || loading}
              className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-green-700 transition-all shadow-md"
            >
              {loading && result ? "جارٍ الحفظ..." : "تأكيد الاستيراد النهائي"}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-slate-500 italic">
             {file ? <span className="text-blue-700 font-medium tracking-wide">📄 {file.name}</span> : "لم يتم اختيار أي ملف بعد"}
          </div>

          {statusMessage && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 font-bold border ${
              statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 
              statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              {statusMessage.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Summary Stats Grid */}
        {result && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <StatCard label="إجمالي الصفوف" value={result.total_rows} color="text-slate-700" />
            <StatCard label="صالحة" value={result.valid_rows} color="text-green-600" />
            <StatCard label="غير صالحة" value={result.invalid_rows} color="text-red-600" />
            <StatCard label="سيتم إنشاؤها" value={result.created_projects ?? "-"} color="text-blue-600" />
            <StatCard label="سيتم تحديثها" value={result.updated_projects ?? "-"} color="text-orange-600" />
          </div>
        )}

        {/* Error Details Table */}
        {result?.errors && result.errors.length > 0 && (
          <div className="mt-8 bg-white shadow-sm border border-red-100 rounded-2xl overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 font-bold text-red-700">
              تفاصيل الأخطاء المكتشفة
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">الصف</th>
                    <th className="p-4">الحقل</th>
                    <th className="p-4">سبب الخطأ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.errors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{err.row}</td>
                      <td className="p-4 text-slate-600">{err.field || "عام"}</td>
                      <td className="p-4 text-red-600">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ label, value, color }: { label: string; value: any; color: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
    <span className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</span>
    <span className={`text-3xl font-black ${color}`}>{value}</span>
  </div>
);

export default SysManagerImport;