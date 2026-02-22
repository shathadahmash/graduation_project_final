// sysManagerImport.tsx
import React, { useMemo, useState } from "react";
import { importService } from "../../../services/importService";

import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiDownload,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/useStore";

/**
 * Simple Import v1 (Users)
 * - Upload Excel (.xlsx)
 * - Validate (dry-run): POST /api/system/import/users/validate/
 * - Commit import:      POST /api/system/import/users/commit/
 *
 * Expected backend response (suggested):
 * {
 *   total_rows: number,
 *   valid_rows: number,
 *   invalid_rows: number,
 *   created_users?: number,
 *   updated_users?: number,
 *   roles_assigned?: number,
 *   affiliations_created?: number,
 *   errors: Array<{ row: number; field?: string; message: string; value?: any }>
 * }
 *
 * NOTE: Adjust endpoints to match your Django URLs.
 */

type ImportError = {
  row: number;
  field?: string;
  message: string;
  value?: any;
};

type ValidateOrCommitResult = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_users?: number;
  updated_users?: number;
  roles_assigned?: number;
  affiliations_created?: number;
  errors: ImportError[];
};

const SysManagerImport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [result, setResult] = useState<ValidateOrCommitResult | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Change these if your backend URLs are different
const API_VALIDATE = "http://127.0.0.1:8000/api/system/import/users/validate/";
const API_COMMIT   = "http://127.0.0.1:8000/api/system/import/users/commit/";

  // Put your template file in: public/templates/users_import_template.xlsx
  const TEMPLATE_URL = "/templates/users_import_template.xlsx";

  const canCommit = useMemo(() => {
    if (!result) return false;
    return result.valid_rows > 0 && result.invalid_rows === 0;
  }, [result]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerMessage(null);
    setResult(null);

    const f = e.target.files?.[0] || null;
    if (!f) {
      setFile(null);
      return;
    }

    // Basic guard
    const isXlsx =
      f.name.toLowerCase().endsWith(".xlsx") ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isXlsx) {
      setFile(null);
      setServerMessage("الرجاء اختيار ملف Excel بصيغة .xlsx فقط.");
      return;
    }

    setFile(f);
  };

const postFile = async (url: string, f: File): Promise<ValidateOrCommitResult> => {
  const form = new FormData();
  form.append("file", f);

  // ✅ JWT token (your store uses localStorage key: access_token)
  const token =
    localStorage.getItem("access_token") ||
    (useAuthStore.getState() as any).access || // in case you store it
    (useAuthStore.getState() as any).token;

  const res = await fetch(url, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    // ❌ remove credentials include (not needed for JWT)
    // credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error (${res.status}). ${text}`);
  }

  return (await res.json()) as ValidateOrCommitResult;
};




  const handleValidate = async () => {
    setServerMessage(null);
    setResult(null);

    if (!file) {
      setServerMessage("اختر ملف Excel أولاً.");
      return;
    }

    setIsValidating(true);
    try {
      const data = await postFile(API_VALIDATE, file);
      setResult(data);
      if (data.invalid_rows > 0) {
        setServerMessage("تم التحقق. يوجد أخطاء يجب إصلاحها قبل الاستيراد.");
      } else if (data.valid_rows > 0) {
        setServerMessage("تم التحقق بنجاح. الملف جاهز للاستيراد.");
      } else {
        setServerMessage("لا توجد صفوف صالحة للاستيراد.");
      }
    } catch (err: any) {
      setServerMessage(err?.message || "حدث خطأ أثناء التحقق من الملف.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommit = async () => {
    setServerMessage(null);

    if (!file) {
      setServerMessage("اختر ملف Excel أولاً.");
      return;
    }
    if (!result) {
      setServerMessage("قم بعمل تحقق (Validate) أولاً.");
      return;
    }
    if (!canCommit) {
      setServerMessage("لا يمكن الاستيراد: يوجد أخطاء أو لا توجد صفوف صالحة.");
      return;
    }

    setIsCommitting(true);
    try {
      const data = await postFile(API_COMMIT, file);
      setResult(data);
      setServerMessage("تم الاستيراد بنجاح ✅");
    } catch (err: any) {
      setServerMessage(err?.message || "حدث خطأ أثناء الاستيراد.");
    } finally {
      setIsCommitting(false);
    }
  };

  const renderErrors = () => {
    if (!result?.errors?.length) return null;

    return (
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <FiAlertTriangle className="text-amber-500" />
            <h3 className="font-black">أخطاء الملف</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            عدد الأخطاء: {result.errors.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-right px-4 py-3 font-black">الصف</th>
                <th className="text-right px-4 py-3 font-black">الحقل</th>
                <th className="text-right px-4 py-3 font-black">الرسالة</th>
                <th className="text-right px-4 py-3 font-black">القيمة</th>
              </tr>
            </thead>
            <tbody>
              {result.errors.slice(0, 50).map((e, idx) => (
                <tr key={idx} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold text-slate-800">{e.row}</td>
                  <td className="px-4 py-3 text-slate-600">{e.field || "-"}</td>
                  <td className="px-4 py-3 text-slate-800">{e.message}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.value !== undefined && e.value !== null ? String(e.value) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.errors.length > 50 && (
          <div className="p-4 text-xs text-slate-500">
            تم عرض أول 50 خطأ فقط.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
              aria-label="رجوع"
            >
              <FiArrowRight size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800">
                استيراد المستخدمين من Excel
              </h1>
         
            </div>
          </div>

          <a
            href={TEMPLATE_URL}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-600/20 transition-all"
            download
          >
            <FiDownload />
            تحميل قالب Excel
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FiFileText size={22} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-800 mb-2">
                استيراد ملفات اكسل
              </h1>

            </div>
          </div>
        </div>

        {/* Upload card */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">رفع الملف</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                اختر ملف .xlsx ثم اضغط “رفع الملف والتحقق”
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-sm border border-slate-200 cursor-pointer transition-all">
                <FiUploadCloud />
                اختيار ملف Excel
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handlePickFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleValidate}
                disabled={!file || isValidating || isCommitting}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all border ${
                  !file || isValidating || isCommitting
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
                }`}
              >
                {isValidating ? "جارٍ التحقق..." : "رفع الملف والتحقق"}
              </button>

              <button
                onClick={handleCommit}
                disabled={!file || !result || !canCommit || isValidating || isCommitting}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                  !file || !result || !canCommit || isValidating || isCommitting
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                }`}
              >
                {isCommitting ? "جارٍ الاستيراد..." : "تأكيد الاستيراد"}
              </button>
            </div>
          </div>

          {/* Selected file */}
          <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-sm">
              <p className="font-black text-slate-700">الملف المختار:</p>
              <p className="text-slate-500 font-bold mt-1">
                {file ? file.name : "لم يتم اختيار ملف"}
              </p>
            </div>
            <div className="text-xs font-black text-slate-500">
              {file ? `${Math.round(file.size / 1024)} KB` : ""}
            </div>
          </div>

          {/* Message */}
          {serverMessage && (
            <div className="mt-4">
              <div
                className={`rounded-2xl p-4 border text-sm font-bold flex items-center gap-2 ${
                  serverMessage.includes("بنجاح")
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : serverMessage.includes("أخطاء")
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {serverMessage.includes("بنجاح") ? (
                  <FiCheckCircle />
                ) : serverMessage.includes("أخطاء") ? (
                  <FiAlertTriangle />
                ) : (
                  <FiFileText />
                )}
                <span>{serverMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {result && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الصفوف", value: result.total_rows },
              { label: "صفوف صالحة", value: result.valid_rows },
              { label: "صفوف غير صالحة", value: result.invalid_rows },
              {
                label: "مستخدمون تم إنشاؤهم",
                value: result.created_users ?? "-",
              },
              {
                label: "مستخدمون تم تحديثهم",
                value: result.updated_users ?? "-",
              },
              {
                label: "أدوار تم ربطها",
                value: result.roles_assigned ?? "-",
              },
              {
                label: "انتسابات أكاديمية",
                value: result.affiliations_created ?? "-",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <p className="text-xs text-slate-500 font-black mb-2">
                  {card.label}
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {card.value as any}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Errors table */}
        {renderErrors()}

        {/* Commit hint */}
        {result && !canCommit && result.invalid_rows > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-bold">
            لا يمكنك الضغط على “تأكيد الاستيراد” لأن هناك أخطاء. أصلح الملف ثم أعد رفعه.
          </div>
        )}
      </div>
    </div>
  );
};

export default SysManagerImport;
