// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../../services/api";
// import {
//   FiUploadCloud,
//   FiDownload,
//   FiArrowRight,
//   FiCheckCircle,
//   FiAlertTriangle,
// } from "react-icons/fi";

// type ImportError = {
//   row: number;
//   field?: string;
//   message: string;
//   value?: any;
// };

// type ImportResult = {
//   total_rows: number;
//   valid_rows: number;
//   invalid_rows: number;
//   created_projects?: number;
//   updated_projects?: number;
//   errors: ImportError[];
// };

// type ImportOpts = {
//   universities: any[];
//   colleges: any[];
//   departments: any[];
//   programs: any[];
// };

// const API_VALIDATE = "http://127.0.0.1:8000/api/system/import/projects/validate/";
// const API_COMMIT = "http://127.0.0.1:8000/api/system/import/projects/commit/";

// // ✅ لازم يكون موجود في الباكند ويرجع XLSX حقيقي
// const API_TEMPLATE = "http://127.0.0.1:8000/api/system/import/projects/template/";

// const SysManagerImportProjects: React.FC = () => {
//   const navigate = useNavigate();

//   const [file, setFile] = useState<File | null>(null);
//   const [result, setResult] = useState<ImportResult | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null);

//   const [isValidating, setIsValidating] = useState(false);
//   const [isCommitting, setIsCommitting] = useState(false);
//   const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

//   // template modal state
//   const [showTemplateModal, setShowTemplateModal] = useState(false);

//   const [importOpts, setImportOpts] = useState<ImportOpts>({
//     universities: [],
//     colleges: [],
//     departments: [],
//     programs: [],
//   });

//   const [importSelection, setImportSelection] = useState({
//     university: "",
//     college: "",
//     department: "",
//     program: "",
//   });

//   // optional quick-add UI (keep it if you want)
//   const [showAddUni, setShowAddUni] = useState(false);
//   const [showAddCollege, setShowAddCollege] = useState(false);
//   const [showAddDept, setShowAddDept] = useState(false);
//   const [showAddProg, setShowAddProg] = useState(false);

//   const [newUniName, setNewUniName] = useState("");
//   const [newCollegeName, setNewCollegeName] = useState("");
//   const [newDeptName, setNewDeptName] = useState("");
//   const [newProgName, setNewProgName] = useState("");

//   const canCommit = useMemo(() => {
//     if (!result) return false;
//     return result.valid_rows > 0 && result.invalid_rows === 0;
//   }, [result]);

//   const resetMessages = () => {
//     setMessage(null);
//     setMessageType(null);
//   };

//   const setError = (msg: string) => {
//     setMessage(msg);
//     setMessageType("error");
//   };

//   const setSuccess = (msg: string) => {
//     setMessage(msg);
//     setMessageType("success");
//   };

//   const setInfo = (msg: string) => {
//     setMessage(msg);
//     setMessageType("info");
//   };

//   const getTokenHeaders = () => {
//     const token = localStorage.getItem("access_token");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   // ✅ helper: parse error from server safely (JSON or HTML)
//   const safeReadServerError = async (res: Response) => {
//     try {
//       const ct = res.headers.get("content-type") || "";
//       if (ct.includes("application/json")) {
//         const j = await res.json();
//         return j?.detail || j?.message || JSON.stringify(j);
//       }
//       const txt = await res.text();
//       // if it's HTML error page, keep it short
//       if (txt && txt.trim().startsWith("<!DOCTYPE")) {
//         return "حدث خطأ في السيرفر (تم إرجاع صفحة HTML). افتح Django console لمعرفة التفاصيل.";
//       }
//       return txt || "Server error";
//     } catch {
//       return "Server error";
//     }
//   };

//   // ✅ upload file with formdata and return JSON result
//   const postFile = async (url: string, f: File): Promise<ImportResult> => {
//     const form = new FormData();
//     form.append("file", f);

//     const res = await fetch(url, {
//       method: "POST",
//       body: form,
//       headers: {
//         ...getTokenHeaders(),
//       },
//     });

//     if (!res.ok) {
//       const errMsg = await safeReadServerError(res);
//       throw new Error(errMsg);
//     }

//     // must be json
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const txt = await res.text();
//       throw new Error(
//         txt?.trim().startsWith("<!DOCTYPE")
//           ? "السيرفر رجّع HTML بدل JSON. تأكد أن endpoint يرجع Response JSON."
//           : "استجابة غير متوقعة من السيرفر."
//       );
//     }

//     return res.json();
//   };

//   // ✅ pick file
//   const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     resetMessages();
//     setResult(null);

//     const f = e.target.files?.[0] || null;
//     if (!f) return;

//     // extension check
//     if (!f.name.toLowerCase().endsWith(".xlsx")) {
//       setError("الرجاء اختيار ملف بصيغة .xlsx فقط");
//       setFile(null);
//       return;
//     }

//     // mime check (not always reliable on Windows, but helpful)
//     const okMime =
//       !f.type ||
//       f.type.includes("spreadsheetml") ||
//       f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
//     if (!okMime) {
//       setInfo("تنبيه: نوع الملف غير واضح، لكن سنحاول التحقق منه.");
//     }

//     setFile(f);
//   };

//   // ✅ load dropdown options once
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [unis, cols, depts, progs] = await Promise.all([
//           api.get("/universities/"),
//           api.get("/colleges/"),
//           api.get("/departments/"),
//           api.get("/programs/"),
//         ]);

//         setImportOpts({
//           universities: unis.data || [],
//           colleges: cols.data || [],
//           departments: depts.data || [],
//           programs: progs.data || [],
//         });
//       } catch (err) {
//         console.error("load import options", err);
//       }
//     };
//     load();
//   }, []);

//   // ✅ validate
//   const handleValidate = async () => {
//     resetMessages();

//     if (!file) {
//       setError("اختر ملف Excel أولاً");
//       return;
//     }

//     setIsValidating(true);
//     try {
//       const data = await postFile(API_VALIDATE, file);
//       setResult(data);

//       if (data.invalid_rows > 0) {
//         setError("يوجد أخطاء في الملف ❌");
//       } else {
//         setSuccess("الملف صالح للاستيراد ✅");
//       }
//     } catch (e: any) {
//       setError(e?.message || "حدث خطأ أثناء التحقق");
//     } finally {
//       setIsValidating(false);
//     }
//   };

//   // ✅ commit
//   const handleCommit = async () => {
//     resetMessages();

//     if (!file) {
//       setError("اختر ملف Excel أولاً");
//       return;
//     }
//     if (!result || !canCommit) {
//       setError("لا يمكن الاستيراد بسبب وجود أخطاء أو لم يتم التحقق بعد");
//       return;
//     }

//     setIsCommitting(true);
//     try {
//       const data = await postFile(API_COMMIT, file);
//       setResult(data);
//       setSuccess("تم الاستيراد بنجاح 🎉");
//     } catch (e: any) {
//       setError(e?.message || "حدث خطأ أثناء الاستيراد");
//     } finally {
//       setIsCommitting(false);
//     }
//   };

//   // ✅ download xlsx template from backend as blob
//   const downloadTemplate = async () => {
//     resetMessages();
//     setIsDownloadingTemplate(true);

//     try {
//       const params = new URLSearchParams();
//       // optional filters (NOT required)
//       if (importSelection.university) params.set("university", importSelection.university);
//       if (importSelection.college) params.set("college", importSelection.college);
//       if (importSelection.department) params.set("department", importSelection.department);
//       if (importSelection.program) params.set("program", importSelection.program);

//       const url = `${API_TEMPLATE}${params.toString() ? `?${params.toString()}` : ""}`;

//       const res = await fetch(url, {
//         method: "GET",
//         headers: {
//           ...getTokenHeaders(),
//         },
//       });

//       if (!res.ok) {
//         const errMsg = await safeReadServerError(res);
//         throw new Error(errMsg);
//       }

//       const blob = await res.blob();

//       // ✅ sanity check: xlsx is a zip => starts with "PK"
//       const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
//       const isZipLike = head[0] === 0x50 && head[1] === 0x4b;
//       if (!isZipLike) {
//         throw new Error(
//           "القالب الذي تم تنزيله ليس ملف Excel XLSX صالح. تأكد أن Endpoint template يرجع XLSX (وليس JSON/HTML)."
//         );
//       }

//       const a = document.createElement("a");
//       const objectUrl = URL.createObjectURL(blob);
//       a.href = objectUrl;
//       a.download = "projects_import_template.xlsx";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(objectUrl);

//       setShowTemplateModal(false);
//       setSuccess("تم تنزيل القالب بنجاح ✅");
//     } catch (e: any) {
//       setError(e?.message || "فشل تنزيل القالب");
//     } finally {
//       setIsDownloadingTemplate(false);
//     }
//   };

//   // ✅ optional quick add handlers (keep or remove)
//   const createUniversity = async () => {
//     if (!newUniName.trim()) return setError("أدخل اسم الجامعة");
//     try {
//       const resp = await api.post("/universities/", { uname_ar: newUniName.trim() });
//       const created = resp.data;
//       setImportOpts((s) => ({ ...s, universities: [...(s.universities || []), created] }));
//       setImportSelection((s) => ({ ...s, university: created.uid || created.id || created.uname_ar || "" }));
//       setNewUniName("");
//       setShowAddUni(false);
//       setSuccess("تم إنشاء الجامعة ✅");
//     } catch (err) {
//       console.error("create university failed", err);
//       setError("فشل إنشاء الجامعة");
//     }
//   };

//   const createCollege = async () => {
//     if (!newCollegeName.trim()) return setError("أدخل اسم الكلية");
//     try {
//       const payload: any = { name_ar: newCollegeName.trim() };
//       if (importSelection.university) payload.branch = importSelection.university;
//       const resp = await api.post("/colleges/", payload);
//       const created = resp.data;
//       setImportOpts((s) => ({ ...s, colleges: [...(s.colleges || []), created] }));
//       setImportSelection((s) => ({ ...s, college: created.cid || created.id || created.name_ar || "" }));
//       setNewCollegeName("");
//       setShowAddCollege(false);
//       setSuccess("تم إنشاء الكلية ✅");
//     } catch (err) {
//       console.error("create college failed", err);
//       setError("فشل إنشاء الكلية");
//     }
//   };

//   const createDepartment = async () => {
//     if (!newDeptName.trim()) return setError("أدخل اسم القسم");
//     try {
//       const payload: any = { name: newDeptName.trim() };
//       if (importSelection.college) payload.college = importSelection.college;
//       const resp = await api.post("/departments/", payload);
//       const created = resp.data;
//       setImportOpts((s) => ({ ...s, departments: [...(s.departments || []), created] }));
//       setImportSelection((s) => ({ ...s, department: created.department_id || created.id || created.name || "" }));
//       setNewDeptName("");
//       setShowAddDept(false);
//       setSuccess("تم إنشاء القسم ✅");
//     } catch (err) {
//       console.error("create department failed", err);
//       setError("فشل إنشاء القسم");
//     }
//   };

//   const createProgram = async () => {
//     if (!newProgName.trim()) return setError("أدخل اسم التخصص");
//     try {
//       const payload: any = { p_name: newProgName.trim() };
//       if (importSelection.department) payload.department = importSelection.department;
//       const resp = await api.post("/programs/", payload);
//       const created = resp.data;
//       setImportOpts((s) => ({ ...s, programs: [...(s.programs || []), created] }));
//       setImportSelection((s) => ({ ...s, program: created.id || created.pid || created.p_name || "" }));
//       setNewProgName("");
//       setShowAddProg(false);
//       setSuccess("تم إنشاء التخصص ✅");
//     } catch (err) {
//       console.error("create program failed", err);
//       setError("فشل إنشاء التخصص");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50" dir="rtl">
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <button onClick={() => navigate(-1)} className="p-2 bg-slate-200 rounded-lg">
//               <FiArrowRight />
//             </button>
//             <h1 className="text-2xl font-black">استيراد المشاريع من Excel</h1>
//           </div>

//           <button
//             onClick={() => setShowTemplateModal(true)}
//             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
//           >
//             <FiDownload />
//             تحميل القالب
//           </button>
//         </div>

//         {/* Template Modal */}
//         {showTemplateModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
//               <h2 className="text-lg font-bold mb-2">تحميل قالب المشاريع (اختياري)</h2>
//               <p className="text-sm text-slate-600 mb-4">
//                 هذه الخيارات غير إلزامية. إذا اخترت جامعة/كلية/قسم/تخصص سيتم تعبئتها تلقائيًا في القالب لتقليل الأخطاء.
//               </p>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//                 {/* University */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">الجامعة</label>
//                   <div className="flex gap-2">
//                     <select
//                       className="w-full border rounded px-2 py-2"
//                       value={importSelection.university}
//                       onChange={(e) => setImportSelection((s) => ({ ...s, university: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.universities?.map((u: any) => (
//                         <option key={u.uid || u.id} value={u.uid || u.id}>
//                           {u.uname_ar || u.name_ar || u.name || "جامعة"}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddUni((s) => !s)}>
//                       إضافة
//                     </button>
//                   </div>

//                   {showAddUni && (
//                     <div className="mt-2 flex gap-2">
//                       <input
//                         value={newUniName}
//                         onChange={(e) => setNewUniName(e.target.value)}
//                         placeholder="اسم الجامعة"
//                         className="border px-2 py-1 rounded flex-1"
//                       />
//                       <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createUniversity}>
//                         حفظ
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* College */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">الكلية</label>
//                   <div className="flex gap-2">
//                     <select
//                       className="w-full border rounded px-2 py-2"
//                       value={importSelection.college}
//                       onChange={(e) => setImportSelection((s) => ({ ...s, college: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.colleges?.map((c: any) => (
//                         <option key={c.cid || c.id} value={c.cid || c.id}>
//                           {c.name_ar || c.name || "كلية"}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddCollege((s) => !s)}>
//                       إضافة
//                     </button>
//                   </div>

//                   {showAddCollege && (
//                     <div className="mt-2 flex gap-2">
//                       <input
//                         value={newCollegeName}
//                         onChange={(e) => setNewCollegeName(e.target.value)}
//                         placeholder="اسم الكلية"
//                         className="border px-2 py-1 rounded flex-1"
//                       />
//                       <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createCollege}>
//                         حفظ
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Department */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">القسم</label>
//                   <div className="flex gap-2">
//                     <select
//                       className="w-full border rounded px-2 py-2"
//                       value={importSelection.department}
//                       onChange={(e) => setImportSelection((s) => ({ ...s, department: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.departments?.map((d: any) => (
//                         <option key={d.department_id || d.id} value={d.department_id || d.id}>
//                           {d.name || d.department_name || "قسم"}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddDept((s) => !s)}>
//                       إضافة
//                     </button>
//                   </div>

//                   {showAddDept && (
//                     <div className="mt-2 flex gap-2">
//                       <input
//                         value={newDeptName}
//                         onChange={(e) => setNewDeptName(e.target.value)}
//                         placeholder="اسم القسم"
//                         className="border px-2 py-1 rounded flex-1"
//                       />
//                       <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createDepartment}>
//                         حفظ
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Program */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">التخصص</label>
//                   <div className="flex gap-2">
//                     <select
//                       className="w-full border rounded px-2 py-2"
//                       value={importSelection.program}
//                       onChange={(e) => setImportSelection((s) => ({ ...s, program: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.programs?.map((p: any) => (
//                         <option key={p.id || p.pid} value={p.id || p.pid}>
//                           {p.p_name || p.name || "تخصص"}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddProg((s) => !s)}>
//                       إضافة
//                     </button>
//                   </div>

//                   {showAddProg && (
//                     <div className="mt-2 flex gap-2">
//                       <input
//                         value={newProgName}
//                         onChange={(e) => setNewProgName(e.target.value)}
//                         placeholder="اسم التخصص"
//                         className="border px-2 py-1 rounded flex-1"
//                       />
//                       <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createProgram}>
//                         حفظ
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => setShowTemplateModal(false)}
//                   className="px-4 py-2 border rounded-lg"
//                   disabled={isDownloadingTemplate}
//                 >
//                   إلغاء
//                 </button>

//                 <button
//                   onClick={downloadTemplate}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg"
//                   disabled={isDownloadingTemplate}
//                 >
//                   {isDownloadingTemplate ? "جارٍ التحميل..." : "تحميل XLSX"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Upload Section */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <div className="flex flex-col sm:flex-row gap-4 items-center">
//             <label className="bg-slate-200 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2">
//               <FiUploadCloud />
//               اختيار ملف
//               <input
//                 type="file"
//                 accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                 onChange={handlePickFile}
//                 className="hidden"
//               />
//             </label>

//             <button
//               onClick={handleValidate}
//               disabled={isValidating}
//               className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
//             >
//               {isValidating ? "جارٍ التحقق..." : "رفع والتحقق"}
//             </button>

//             <button
//               onClick={handleCommit}
//               disabled={!canCommit || isCommitting}
//               className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
//             >
//               {isCommitting ? "جارٍ الاستيراد..." : "تأكيد الاستيراد"}
//             </button>
//           </div>

//           <div className="mt-3 text-sm text-slate-700 font-bold">
//             {file ? `📄 ${file.name}` : "لم يتم اختيار ملف"}
//           </div>

//           {message && (
//             <div
//               className={`mt-4 text-sm font-bold flex items-center gap-2 ${
//                 messageType === "success"
//                   ? "text-green-700"
//                   : messageType === "error"
//                   ? "text-red-700"
//                   : "text-slate-700"
//               }`}
//             >
//               {messageType === "success" ? <FiCheckCircle /> : messageType === "error" ? <FiAlertTriangle /> : null}
//               <span>{message}</span>
//             </div>
//           )}
//         </div>

//         {/* Summary */}
//         {result && (
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
//             <Stat label="إجمالي الصفوف" value={result.total_rows} />
//             <Stat label="صالحة" value={result.valid_rows} />
//             <Stat label="غير صالحة" value={result.invalid_rows} />
//             <Stat label="تم إنشاؤها" value={result.created_projects ?? "-"} />
//             <Stat label="تم تحديثها" value={result.updated_projects ?? "-"} />
//           </div>
//         )}

//         {/* Errors */}
//         {result?.errors?.length > 0 && (
//           <div className="mt-6 bg-white shadow rounded-xl overflow-hidden">
//             <div className="p-4 border-b font-bold text-red-700">تفاصيل الأخطاء</div>
//             <table className="w-full text-sm">
//               <thead className="bg-slate-100">
//                 <tr>
//                   <th className="p-2 text-right">الصف</th>
//                   <th className="p-2 text-right">الحقل</th>
//                   <th className="p-2 text-right">الرسالة</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {result.errors.map((e, i) => (
//                   <tr key={i} className="border-t">
//                     <td className="p-2">{e.row}</td>
//                     <td className="p-2">{e.field || "-"}</td>
//                     <td className="p-2 text-red-600">{e.message}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const Stat = ({ label, value }: { label: string; value: any }) => (
//   <div className="bg-white shadow rounded-xl p-4">
//     <div className="text-xs text-slate-500">{label}</div>
//     <div className="text-2xl font-black">{value}</div>
//   </div>
// );

// export default SysManagerImportProjects;
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../../services/api";
// import {
//   FiUploadCloud,
//   FiDownload,
//   FiArrowRight,
//   FiCheckCircle,
//   FiAlertTriangle,
// } from "react-icons/fi";

// type ImportError = {
//   row: number;
//   field?: string;
//   message: string;
//   value?: any;
// };

// type ImportResult = {
//   total_rows: number;
//   valid_rows: number;
//   invalid_rows: number;
//   created_projects?: number;
//   updated_projects?: number;
//   created_supervisor_users?: number;
//   errors: ImportError[];
// };

// type ImportOpts = {
//   universities: any[];
//   colleges: any[];
//   departments: any[];
//   programs: any[];
// };

// const API_VALIDATE = "http://127.0.0.1:8000/api/system/import/projects/validate/";
// const API_COMMIT = "http://127.0.0.1:8000/api/system/import/projects/commit/";
// const API_TEMPLATE = "http://127.0.0.1:8000/api/system/import/projects/template/";

// const SysManagerImportProjects: React.FC = () => {
//   const navigate = useNavigate();

//   const [file, setFile] = useState<File | null>(null);
//   const [result, setResult] = useState<ImportResult | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null);

//   const [isValidating, setIsValidating] = useState(false);
//   const [isCommitting, setIsCommitting] = useState(false);
//   const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

//   const [showTemplateModal, setShowTemplateModal] = useState(false);

//   const [importOpts, setImportOpts] = useState<ImportOpts>({
//     universities: [],
//     colleges: [],
//     departments: [],
//     programs: [],
//   });

//   const [importSelection, setImportSelection] = useState({
//     university: "",
//     college: "",
//     department: "",
//     program: "",
//   });

//   const [showAddUni, setShowAddUni] = useState(false);
//   const [showAddCollege, setShowAddCollege] = useState(false);
//   const [showAddDept, setShowAddDept] = useState(false);
//   const [showAddProg, setShowAddProg] = useState(false);

//   const [newUniName, setNewUniName] = useState("");
//   const [newCollegeName, setNewCollegeName] = useState("");
//   const [newDeptName, setNewDeptName] = useState("");
//   const [newProgName, setNewProgName] = useState("");

//   const canCommit = useMemo(() => {
//     if (!result) return false;
//     return result.valid_rows > 0 && result.invalid_rows === 0;
//   }, [result]);

//   const resetMessages = () => {
//     setMessage(null);
//     setMessageType(null);
//   };

//   const setError = (msg: string) => {
//     setMessage(msg);
//     setMessageType("error");
//   };

//   const setSuccess = (msg: string) => {
//     setMessage(msg);
//     setMessageType("success");
//   };

//   const getTokenHeaders = () => {
//     const token = localStorage.getItem("access_token");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   const safeReadServerError = async (res: Response) => {
//     try {
//       const ct = res.headers.get("content-type") || "";
//       if (ct.includes("application/json")) {
//         const j = await res.json();
//         return j?.detail || j?.message || JSON.stringify(j);
//       }
//       return "Server error";
//     } catch {
//       return "Server error";
//     }
//   };

//   const postFile = async (url: string, f: File): Promise<ImportResult> => {
//     const form = new FormData();
//     form.append("file", f);
//     const res = await fetch(url, {
//       method: "POST",
//       body: form,
//       headers: { ...getTokenHeaders() },
//     });
//     if (!res.ok) {
//       const errMsg = await safeReadServerError(res);
//       throw new Error(errMsg);
//     }
//     return res.json();
//   };

//   const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     resetMessages();
//     setResult(null);
//     const f = e.target.files?.[0] || null;
//     if (!f) return;
//     if (!f.name.toLowerCase().endsWith(".xlsx")) {
//       setError("الرجاء اختيار ملف بصيغة .xlsx فقط");
//       setFile(null);
//       return;
//     }
//     setFile(f);
//   };

//   // FETCH DATA FROM DB
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [unis, cols, depts, progs] = await Promise.all([
//           api.get("/universities/"),
//           api.get("/colleges/"),
//           api.get("/departments/"),
//           api.get("/programs/"),
//         ]);
//         setImportOpts({
//           universities: unis.data || [],
//           colleges: cols.data || [],
//           departments: depts.data || [],
//           programs: progs.data || [],
//         });
//       } catch (err) {
//         console.error("Failed to fetch dropdown data", err);
//       }
//     };
//     load();
//   }, []);

//   const handleValidate = async () => {
//     resetMessages();
//     if (!file) return setError("اختر ملف Excel أولاً");
//     setIsValidating(true);
//     try {
//       const data = await postFile(API_VALIDATE, file);
//       setResult(data);
//       if (data.invalid_rows > 0) setError("يوجد أخطاء في الملف ❌");
//       else setSuccess("الملف صالح للاستيراد ✅");
//     } catch (e: any) {
//       setError(e?.message || "حدث خطأ أثناء التحقق");
//     } finally {
//       setIsValidating(false);
//     }
//   };

//   const handleCommit = async () => {
//     resetMessages();
//     if (!file || !result || !canCommit) return setError("لا يمكن الاستيراد");
//     setIsCommitting(true);
//     try {
//       const data = await postFile(API_COMMIT, file);
//       setResult(data);
//       setSuccess("تم الاستيراد بنجاح 🎉");
//     } catch (e: any) {
//       setError(e?.message || "حدث خطأ أثناء الاستيراد");
//     } finally {
//       setIsCommitting(false);
//     }
//   };

//   const downloadTemplate = async () => {
//     resetMessages();
//     setIsDownloadingTemplate(true);
//     try {
//       const params = new URLSearchParams(importSelection);
//       const res = await fetch(`${API_TEMPLATE}?${params.toString()}`, {
//         method: "GET",
//         headers: { ...getTokenHeaders() },
//       });
//       if (!res.ok) throw new Error(await safeReadServerError(res));
//       const blob = await res.blob();
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(blob);
//       a.download = "projects_import_template.xlsx";
//       a.click();
//       setShowTemplateModal(false);
//       setSuccess("تم تنزيل القالب بنجاح ✅");
//     } catch (e: any) {
//       setError(e?.message || "فشل تنزيل القالب");
//     } finally {
//       setIsDownloadingTemplate(false);
//     }
//   };

//   // Quick Add Handlers
//   const createUniversity = async () => {
//     if (!newUniName.trim()) return setError("أدخل اسم الجامعة");
//     try {
//       const resp = await api.post("/universities/", { uname_ar: newUniName.trim() });
//       const newObj = resp.data;
//       setImportOpts(s => ({ ...s, universities: [...s.universities, newObj] }));
//       setImportSelection(s => ({ ...s, university: newObj.uid || newObj.id }));
//       setNewUniName(""); setShowAddUni(false);
//     } catch { setError("فشل الإضافة"); }
//   };

//   const createCollege = async () => {
//     if (!newCollegeName.trim()) return setError("أدخل اسم الكلية");
//     try {
//       const resp = await api.post("/colleges/", { name_ar: newCollegeName.trim(), branch: importSelection.university });
//       const newObj = resp.data;
//       setImportOpts(s => ({ ...s, colleges: [...s.colleges, newObj] }));
//       setImportSelection(s => ({ ...s, college: newObj.cid || newObj.id }));
//       setNewCollegeName(""); setShowAddCollege(false);
//     } catch { setError("فشل الإضافة"); }
//   };

//   const createDepartment = async () => {
//     if (!newDeptName.trim()) return setError("أدخل اسم القسم");
//     try {
//       const resp = await api.post("/departments/", { name: newDeptName.trim(), college: importSelection.college });
//       const newObj = resp.data;
//       setImportOpts(s => ({ ...s, departments: [...s.departments, newObj] }));
//       setImportSelection(s => ({ ...s, department: newObj.department_id || newObj.id }));
//       setNewDeptName(""); setShowAddDept(false);
//     } catch { setError("فشل الإضافة"); }
//   };

//   const createProgram = async () => {
//     if (!newProgName.trim()) return setError("أدخل اسم التخصص");
//     try {
//       const resp = await api.post("/programs/", { p_name: newProgName.trim(), department: importSelection.department });
//       const newObj = resp.data;
//       setImportOpts(s => ({ ...s, programs: [...s.programs, newObj] }));
//       setImportSelection(s => ({ ...s, program: newObj.id }));
//       setNewProgName(""); setShowAddProg(false);
//     } catch { setError("فشل الإضافة"); }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50" dir="rtl">
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <button onClick={() => navigate(-1)} className="p-2 bg-slate-200 rounded-lg">
//               <FiArrowRight />
//             </button>
//             <h1 className="text-2xl font-black">استيراد المشاريع من Excel</h1>
//           </div>
//           <button
//             onClick={() => setShowTemplateModal(true)}
//             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
//           >
//             <FiDownload />
//             تحميل القالب
//           </button>
//         </div>

//         {showTemplateModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
//               <h2 className="text-lg font-bold mb-2">تحميل قالب المشاريع (اختياري)</h2>
//               <p className="text-sm text-slate-600 mb-4">هذه الخيارات غير إلزامية لتقليل الأخطاء في القالب.</p>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//                 {/* University Dropdown */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">الجامعة</label>
//                   <div className="flex gap-2">
//                     <select 
//                       className="w-full border rounded px-2 py-2" 
//                       value={importSelection.university} 
//                       onChange={(e) => setImportSelection((s) => ({ ...s, university: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.universities?.map((u: any) => (
//                         <option key={u.uid || u.id} value={u.uid || u.id}>
//                           {u.uname_ar || u.name_ar || u.name}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddUni(!showAddUni)}>إضافة</button>
//                   </div>
//                   {showAddUni && <div className="mt-2 flex gap-2"><input value={newUniName} onChange={(e) => setNewUniName(e.target.value)} placeholder="اسم الجامعة" className="border px-2 py-1 rounded flex-1" /><button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createUniversity}>حفظ</button></div>}
//                 </div>

//                 {/* College Dropdown */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">الكلية</label>
//                   <div className="flex gap-2">
//                     <select 
//                       className="w-full border rounded px-2 py-2" 
//                       value={importSelection.college} 
//                       onChange={(e) => setImportSelection((s) => ({ ...s, college: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.colleges?.map((c: any) => (
//                         <option key={c.cid || c.id} value={c.cid || c.id}>
//                           {c.name_ar || c.name}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddCollege(!showAddCollege)}>إضافة</button>
//                   </div>
//                   {showAddCollege && <div className="mt-2 flex gap-2"><input value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} placeholder="اسم الكلية" className="border px-2 py-1 rounded flex-1" /><button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createCollege}>حفظ</button></div>}
//                 </div>

//                 {/* Department Dropdown */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">القسم</label>
//                   <div className="flex gap-2">
//                     <select 
//                       className="w-full border rounded px-2 py-2" 
//                       value={importSelection.department} 
//                       onChange={(e) => setImportSelection((s) => ({ ...s, department: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.departments?.map((d: any) => (
//                         <option key={d.department_id || d.id} value={d.department_id || d.id}>
//                           {d.name || d.name_ar}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddDept(!showAddDept)}>إضافة</button>
//                   </div>
//                   {showAddDept && <div className="mt-2 flex gap-2"><input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="اسم القسم" className="border px-2 py-1 rounded flex-1" /><button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createDepartment}>حفظ</button></div>}
//                 </div>

//                 {/* Program Dropdown */}
//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">التخصص</label>
//                   <div className="flex gap-2">
//                     <select 
//                       className="w-full border rounded px-2 py-2" 
//                       value={importSelection.program} 
//                       onChange={(e) => setImportSelection((s) => ({ ...s, program: e.target.value }))}
//                     >
//                       <option value="">-- اختياري --</option>
//                       {importOpts.programs?.map((p: any) => (
//                         <option key={p.id} value={p.id}>
//                           {p.p_name || p.name}
//                         </option>
//                       ))}
//                     </select>
//                     <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddProg(!showAddProg)}>إضافة</button>
//                   </div>
//                   {showAddProg && <div className="mt-2 flex gap-2"><input value={newProgName} onChange={(e) => setNewProgName(e.target.value)} placeholder="اسم التخصص" className="border px-2 py-1 rounded flex-1" /><button className="px-3 py-1 bg-green-600 text-white rounded" onClick={createProgram}>حفظ</button></div>}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 border rounded-lg">إلغاء</button>
//                 <button onClick={downloadTemplate} className="px-4 py-2 bg-green-600 text-white rounded-lg">تحميل XLSX</button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="bg-white p-6 rounded-2xl shadow">
//           <div className="flex flex-col sm:flex-row gap-4 items-center">
//             <label className="bg-slate-200 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2">
//               <FiUploadCloud />
//               اختيار ملف
//               <input type="file" accept=".xlsx" onChange={handlePickFile} className="hidden" />
//             </label>
//             <button onClick={handleValidate} disabled={isValidating} className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-60">
//               {isValidating ? "جارٍ التحقق..." : "رفع والتحقق"}
//             </button>
//             <button onClick={handleCommit} disabled={!canCommit || isCommitting} className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:opacity-60">
//               {isCommitting ? "جارٍ الاستيراد..." : "تأكيد الاستيراد"}
//             </button>
//           </div>
//           <div className="mt-3 text-sm text-slate-700 font-bold">{file ? `📄 ${file.name}` : "لم يتم اختيار ملف"}</div>
//           {message && (
//             <div className={`mt-4 text-sm font-bold flex items-center gap-2 ${messageType === "success" ? "text-green-700" : "text-red-700"}`}>
//               {messageType === "success" ? <FiCheckCircle /> : <FiAlertTriangle />}
//               <span>{message}</span>
//             </div>
//           )}
//         </div>

//         {result && (
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
//             <Stat label="إجمالي الصفوف" value={result.total_rows} />
//             <Stat label="صالحة" value={result.valid_rows} />
//             <Stat label="غير صالحة" value={result.invalid_rows} />
//             <Stat label="مشاريع منجزة" value={result.created_projects ?? "-"} />
//             <Stat label="مشرفين جدد" value={result.created_supervisor_users ?? "-"} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const Stat = ({ label, value }: { label: string; value: any }) => (
//   <div className="bg-white shadow rounded-xl p-4">
//     <div className="text-xs text-slate-500">{label}</div>
//     <div className="text-2xl font-black">{value}</div>
//   </div>
// );

// export default SysManagerImportProjects;
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
          "Authorization": `Bearer ${token}` // <--- THIS IS REQUIRED
         },
      });
      setResult(res.data);
      if (res.data.invalid_rows > 0) {
        setStatusMessage({ text: "يوجد أخطاء في الملف ❌", type: "error" });
      } else {
        setStatusMessage({ text: "الملف صالح للاستيراد ✅", type: "success" });
      }
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
          "Content-Type": "multipart/form-data" ,
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
