import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiDownload,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";

type ImportError = {
  row: number;
  field?: string;
  message: string;
  value?: any;
};

type ImportResult = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_projects?: number;
  updated_projects?: number;
  errors: ImportError[];
};

const SysManagerImportProjects: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);

  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const API_VALIDATE =
    "http://127.0.0.1:8000/api/system/import/projects/validate/";
  const API_COMMIT =
    "http://127.0.0.1:8000/api/system/import/projects/commit/";

  const canCommit = useMemo(() => {
    if (!result) return false;
    return result.valid_rows > 0 && result.invalid_rows === 0;
  }, [result]);

  const postFile = async (url: string, f: File) => {
    const form = new FormData();
    form.append("file", f);

    const token = localStorage.getItem("access_token");

    const res = await fetch(url, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Server error");
    }

    return res.json();
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setResult(null);

    const f = e.target.files?.[0] || null;
    if (!f) return;

    if (!f.name.endsWith(".xlsx")) {
      setMessage("الرجاء اختيار ملف بصيغة .xlsx فقط");
      return;
    }

    setFile(f);
  };

  const handleValidate = async () => {
    if (!file) {
      setMessage("اختر ملف أولاً");
      return;
    }

    setIsValidating(true);
    setMessage(null);

    try {
      const data = await postFile(API_VALIDATE, file);
      setResult(data);

      if (data.invalid_rows > 0) {
        setMessage("يوجد أخطاء في الملف ❌");
      } else {
        setMessage("الملف صالح للاستيراد ✅");
      }
    } catch (e: any) {
      setMessage(e.message);
    }

    setIsValidating(false);
  };

  const handleCommit = async () => {
    if (!file || !result || !canCommit) {
      setMessage("لا يمكن الاستيراد بسبب وجود أخطاء");
      return;
    }

    setIsCommitting(true);
    setMessage(null);

    try {
      const data = await postFile(API_COMMIT, file);
      setResult(data);
      setMessage("تم الاستيراد بنجاح 🎉");
    } catch (e: any) {
      setMessage(e.message);
    }

    setIsCommitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-200 rounded-lg"
            >
              <FiArrowRight />
            </button>
            <h1 className="text-2xl font-black">
              استيراد المشاريع من Excel
            </h1>
          </div>

          <a
            href="/templates/projects_import_template.xlsx"
            download
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <FiDownload />
            تحميل القالب
          </a>
        </div>

{/* Upload Section */}
<div className="bg-white p-6 rounded-2xl shadow">
  <div className="flex flex-col sm:flex-row gap-4 items-center">
    
    <label className="bg-slate-200 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2">
      <FiUploadCloud />
      اختيار ملف
      <input
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handlePickFile}
        className="hidden"
      />
    </label>

    <button
      onClick={handleValidate}
      disabled={isValidating}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
    >
      {isValidating ? "جارٍ التحقق..." : "رفع والتحقق"}
    </button>

    <button
      onClick={handleCommit}
      disabled={!canCommit || isCommitting}
      className="bg-green-600 text-white px-4 py-2 rounded-xl"
    >
      {isCommitting ? "جارٍ الاستيراد..." : "تأكيد الاستيراد"}
    </button>
  </div>

  {/* ✅ Selected file name */}
  <div className="mt-3 text-sm text-slate-700 font-bold">
    {file ? `📄 ${file.name}` : "لم يتم اختيار ملف"}
  </div>

  {/* Message */}
  {message && (
    <div className="mt-4 font-bold text-sm">
      {message}
    </div>
  )}
</div>

        {/* Summary */}
        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Stat label="إجمالي الصفوف" value={result.total_rows} />
            <Stat label="صالحة" value={result.valid_rows} />
            <Stat label="غير صالحة" value={result.invalid_rows} />
            <Stat
              label="تم إنشاؤها"
              value={result.created_projects || "-"}
            />
            <Stat
              label="تم تحديثها"
              value={result.updated_projects || "-"}
            />
          </div>
        )}

        {/* Errors */}
        {result?.errors?.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-right">الصف</th>
                  <th className="p-2 text-right">الحقل</th>
                  <th className="p-2 text-right">الرسالة</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{e.row}</td>
                    <td className="p-2">{e.field}</td>
                    <td className="p-2 text-red-600">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: any) => (
  <div className="bg-white shadow rounded-xl p-4">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-2xl font-black">{value}</div>
  </div>
);

export default SysManagerImportProjects;