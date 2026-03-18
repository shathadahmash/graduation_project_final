import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud, FiDownload, FiArrowRight,
  FiCheckCircle, FiAlertTriangle, FiX
} from "react-icons/fi";

type ImportError = { row: number; field?: string; message: string; };
type ImportResult = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_projects?: number;
  updated_projects?: number;
  users_created?: number;
  errors: ImportError[];
};

const SysManagerImport: React.FC = () => {
  const navigate = useNavigate();

  // --- Logic State ---
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // --- Data State ---
  const [universities, setUniversities] = useState([]);
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [pre, setPre] = useState({
    university_id: "",
    city_id: "",
    college_id: "",
    department_id: "",
    program_id: "",
  });

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // --- 1. Centralized Hierarchy Handler ---
  // This replaces multiple setPre calls and ensures child fields reset when a parent changes
  const handleHierarchyChange = (level: 'uni' | 'city' | 'coll' | 'dept' | 'prog', value: string) => {
    setPre(prev => {
      if (level === 'uni') return { ...prev, university_id: value, college_id: "", department_id: "", program_id: "" };
      if (level === 'city') return { ...prev, city_id: value };
      if (level === 'coll') return { ...prev, college_id: value, department_id: "", program_id: "" };
      if (level === 'dept') return { ...prev, department_id: value, program_id: "" };
      return { ...prev, program_id: value };
    });
  };

  // --- 2. Simplified Dependency Effects ---
  useEffect(() => {
    axios.get("/api/universities/").then(r => setUniversities(r.data));
    axios.get("/api/cities/").then(r => setCities(r.data));
  }, []);

  useEffect(() => {
    if (pre.university_id) axios.get(`/api/colleges/?university=${pre.university_id}`).then(r => setColleges(r.data));
    else setColleges([]);
  }, [pre.university_id]);

  useEffect(() => {
    if (pre.college_id) axios.get(`/api/departments/?college=${pre.college_id}`).then(r => setDepartments(r.data));
    else setDepartments([]);
  }, [pre.college_id]);

  useEffect(() => {
    if (pre.department_id) axios.get(`/api/programs/?department=${pre.department_id}`).then(r => setPrograms(r.data));
    else setPrograms([]);
  }, [pre.department_id]);

  // --- 3. Logic Functions ---
  const canCommit = useMemo(() => {
    if (!result) return false;
    // Strict mode: Only allow commit if NO errors exist
    return result.valid_rows > 0 && result.invalid_rows === 0;
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/import_projects_validate/", formData, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setResult(res.data);
      setStatusMessage({ 
        text: res.data.invalid_rows > 0 ? "يوجد أخطاء في تنسيق البيانات ❌" : "تم فحص الملف بنجاح ✅", 
        type: res.data.invalid_rows > 0 ? "error" : "success" 
      });
    } catch (err) {
      setStatusMessage({ text: "فشل التحقق من الملف", type: "error" });
    } finally { setLoading(false); }
  };

  const commitFile = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/import_projects_commit/", formData, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setResult(res.data);
      setStatusMessage({ 
        text: `تم استيراد ${res.data.created_projects} مشروع وتحديث ${res.data.updated_projects} بنجاح 🎉`, 
        type: "success" 
      });
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || "فشل عملية الحفظ النهائي", type: "error" });
    } finally { setLoading(false); }
  };

  const downloadTemplate = async () => {
    try {
      const params = new URLSearchParams();
      const findName = (arr: any[], id: string, idKey: string, nameKey: string) => 
        arr.find(i => String(i[idKey]) === id)?.[nameKey];

      const uName = findName(universities, pre.university_id, 'uid', 'uname_ar');
      const cName = findName(cities, pre.city_id, 'bid', 'bname_ar');
      const collName = findName(colleges, pre.college_id, 'cid', 'name_ar');
      const dName = findName(departments, pre.department_id, 'department_id', 'name');
      const pName = findName(programs, pre.program_id, 'pid', 'p_name');

      if (uName) params.append("pre_university_name", uName);
      if (cName) params.append("pre_city_name", cName);
      if (collName) params.append("pre_college_name", collName);
      if (dName) params.append("pre_department_name", dName);
      if (pName) params.append("pre_program_name", pName);

      const res = await axios.get(`/api/import_projects_template/`, { 
        params, responseType: "blob",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `قالب_استيراد_${uName || 'المشاريع'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      setShowTemplateModal(false);
    } catch (err) { alert("فشل تحميل القالب"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-right font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              <FiArrowRight size={20} className="text-slate-600"/>
            </button>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">استيراد المشاريع</h1>
                <p className="text-slate-500 text-sm">إدارة عمليات الرفع الجماعي للمشاريع والطلاب</p>
            </div>
          </div>
          <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 bg-[#312583] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#251b63] transition-all">
            <FiDownload /> تخصيص وتحميل القالب
          </button>
        </div>

        {/* Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowTemplateModal(false)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600"><FiX size={24} /></button>
              <h2 className="text-xl font-bold mb-1">تجهيز قالب الاستيراد</h2>
              <p className="text-sm text-slate-500 mb-6">سيتم تعبئة البيانات المختارة تلقائياً في ملف الـ Excel</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1.5 uppercase">المدينة</label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    value={pre.city_id} onChange={e => handleHierarchyChange('city', e.target.value)}>
                    <option value="">-- اختر المدينة --</option>
                    {cities.map((c: any) => <option key={c.bid} value={c.bid}>{c.bname_ar}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1.5 uppercase">الجامعة</label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={pre.university_id} onChange={e => handleHierarchyChange('uni', e.target.value)}>
                    <option value="">-- اختر جامعة --</option>
                    {universities.map((u: any) => <option key={u.uid} value={u.uid}>{u.uname_ar}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-1.5 uppercase">الكلية</label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 disabled:opacity-50" 
                      value={pre.college_id} onChange={e => handleHierarchyChange('coll', e.target.value)} disabled={!pre.university_id}>
                      <option value="">-- اختر الكلية --</option>
                      {colleges.map((c: any) => <option key={c.cid} value={c.cid}>{c.name_ar}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-1.5 uppercase">القسم</label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 disabled:opacity-50" 
                      value={pre.department_id} onChange={e => handleHierarchyChange('dept', e.target.value)} disabled={!pre.college_id}>
                      <option value="">-- اختر القسم --</option>
                      {departments.map((d: any) => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={downloadTemplate} className="flex-1 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100">
                  تحميل الملف الجاهز
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex-1 min-w-[200px] bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 p-4 rounded-2xl cursor-pointer flex items-center justify-center gap-3 transition-all">
              <FiUploadCloud className="text-indigo-600" size={24}/>
              <span className="font-bold text-slate-600">{file ? file.name : "اسحب أو اختر ملف Excel"}</span>
              <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
            </label>
            <button onClick={validateFile} disabled={!file || loading} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              {loading && !result ? "تحليل..." : "فحص البيانات"}
            </button>
            <button onClick={commitFile} disabled={!canCommit || loading} className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-green-700 shadow-lg shadow-green-100 transition-all">
              {loading && result ? "حفظ..." : "تأكيد الاستيراد"}
            </button>
          </div>

          {statusMessage && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-bold border animate-in slide-in-from-top-2 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {statusMessage.type === 'success' ? <FiCheckCircle size={20}/> : <FiAlertTriangle size={20}/>} {statusMessage.text}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {result && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <StatCard label="المجموع" value={result.total_rows} color="text-slate-800" />
            <StatCard label="سليم" value={result.valid_rows} color="text-green-600" />
            <StatCard label="أخطاء" value={result.invalid_rows} color="text-red-600" highlight={result.invalid_rows > 0} />
            <StatCard label="إضافة" value={result.created_projects ?? "-"} color="text-indigo-600" />
            <StatCard label="تحديث" value={result.updated_projects ?? "-"} color="text-orange-500" />
          </div>
        )}

        {/* Errors Table */}
        {result?.errors && result.errors.length > 0 && (
          <div className="mt-8 bg-white border border-red-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
              <h3 className="font-black text-red-800">تفاصيل الأخطاء المكتشفة</h3>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{result.errors.length} خطأ</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
                  <tr><th className="p-4">الصف</th><th className="p-4">الحقل</th><th className="p-4">المشكلة</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.errors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30 transition-colors text-sm">
                      <td className="p-4 font-bold text-slate-800">{err.row}</td>
                      <td className="p-4 text-slate-500 font-medium">{err.field || "بيانات عامة"}</td>
                      <td className="p-4 text-red-600 font-bold">{err.message}</td>
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

const StatCard = ({ label, value, color, highlight = false }: { label: string; value: any; color: string; highlight?: boolean }) => (
  <div className={`bg-white p-6 rounded-3xl border transition-all ${highlight ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
    <span className={`text-3xl font-black ${color}`}>{value}</span>
  </div>
);

export default SysManagerImport;