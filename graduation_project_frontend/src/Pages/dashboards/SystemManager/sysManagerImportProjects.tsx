import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../services/api';
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

  // template download form state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [importOpts, setImportOpts] = useState<any>({ universities: [], colleges: [], departments: [], programs: [] });
  const [importSelection, setImportSelection] = useState<any>({ university: '', college: '', department: '', program: '' });
  const [showAddUni, setShowAddUni] = useState(false);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddProg, setShowAddProg] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newProgName, setNewProgName] = useState('');

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

  // fetch option lists once
  React.useEffect(() => {
    const load = async () => {
      try {
        const [unis, cols, depts, progs] = await Promise.all([
          api.get('/universities/'),
          api.get('/colleges/'),
          api.get('/departments/'),
          api.get('/programs/'),
        ]);
        setImportOpts({
          universities: unis.data || [],
          colleges: cols.data || [],
          departments: depts.data || [],
          programs: progs.data || [],
        });
      } catch (err) {
        console.error('load import options', err);
      }
    };
    load();
  }, []);

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

  const downloadTemplate = () => {
    // create a simple excel-friendly CSV with blank first column and the
    // requested Arabic headers. ignore query params since the user asked only
    // for static header layout; we still close the modal afterwards.
    const rows: string[] = [];
    rows.push('');
    rows.push(
      'عنوان المشروع,نوع المشروع,الحالة,الملخص,المشرف,المشرف المشارك,الجامعة,الكلية,القسم,سنة البداية,سنه النهاية,المجال,الادوات,أنشىء بواسطة'
    );
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `projects_import_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    URL.revokeObjectURL(url);
    setShowTemplateModal(false);
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

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <FiDownload />
            تحميل القالب
          </button>
        </div>
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <h2 className="text-lg font-bold mb-4">تحميل قالب المشاريع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">الجامعة</label>
                  <div className="flex gap-2">
                    <select className="w-full border rounded px-2 py-2" value={importSelection.university} onChange={e => setImportSelection((s:any)=>({...s, university: e.target.value}))}>
                      <option value="">-- اختر جامعة --</option>
                      {importOpts.universities?.map((u: any) => (
                        <option key={u.uid || u.id} value={u.uid || u.id || u.uname_ar || u.name_ar}>{u.uname_ar || u.name_ar}</option>
                      ))}
                    </select>
                    <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddUni(s => !s)}>إضافة</button>
                  </div>
                  {showAddUni && (
                    <div className="mt-2 flex gap-2">
                      <input value={newUniName} onChange={e=>setNewUniName(e.target.value)} placeholder="اسم الجامعة" className="border px-2 py-1 rounded flex-1" />
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                        if(!newUniName) return alert('أدخل اسم الجامعة');
                        try{
                          const resp = await api.post('/universities/', { uname_ar: newUniName });
                          const created = resp.data;
                          setImportOpts((s:any)=>({ ...s, universities: [ ...(s.universities||[]), created ] }));
                          setImportSelection((s:any)=>({...s, university: created.uid || created.id || created.uname_ar }));
                          setNewUniName(''); setShowAddUni(false);
                        }catch(err){ console.error('create university failed', err); alert('فشل إنشاء الجامعة'); }
                      }}>حفظ</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">الكلية</label>
                  <div className="flex gap-2">
                    <select className="w-full border rounded px-2 py-2" value={importSelection.college} onChange={e => setImportSelection((s:any)=>({...s, college: e.target.value}))}>
                      <option value="">-- اختر كلية --</option>
                      {importOpts.colleges?.map((c: any) => (
                        <option key={c.cid || c.id} value={c.cid || c.id || c.name_ar || c.name}>{c.name_ar || c.name}</option>
                      ))}
                    </select>
                    <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddCollege(s => !s)}>إضافة</button>
                  </div>
                  {showAddCollege && (
                    <div className="mt-2 flex gap-2">
                      <input value={newCollegeName} onChange={e=>setNewCollegeName(e.target.value)} placeholder="اسم الكلية" className="border px-2 py-1 rounded flex-1" />
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                        if(!newCollegeName) return alert('أدخل اسم الكلية');
                        try{
                          const uniVal = importSelection.university;
                          let payload: any = { name_ar: newCollegeName };
                          if(uniVal) payload.branch = uniVal;
                          const resp = await api.post('/colleges/', payload);
                          const created = resp.data;
                          setImportOpts((s:any)=>({ ...s, colleges: [ ...(s.colleges||[]), created ] }));
                          setImportSelection((s:any)=>({...s, college: created.cid || created.id || created.name_ar }));
                          setNewCollegeName(''); setShowAddCollege(false);
                        }catch(err){ console.error('create college failed', err); alert('فشل إنشاء الكلية'); }
                      }}>حفظ</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">القسم</label>
                  <div className="flex gap-2">
                    <select className="w-full border rounded px-2 py-2" value={importSelection.department} onChange={e => setImportSelection((s:any)=>({...s, department: e.target.value}))}>
                      <option value="">-- اختر قسم --</option>
                      {importOpts.departments?.map((d: any) => (
                        <option key={d.department_id || d.id} value={d.department_id || d.id || d.name || d.department_name}>{d.name || d.department_name}</option>
                      ))}
                    </select>
                    <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddDept(s => !s)}>إضافة</button>
                  </div>
                  {showAddDept && (
                    <div className="mt-2 flex gap-2">
                      <input value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} placeholder="اسم القسم" className="border px-2 py-1 rounded flex-1" />
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                        if(!newDeptName) return alert('أدخل اسم القسم');
                        try{
                          const payload: any = { name: newDeptName };
                          if(importSelection.college) payload.college = importSelection.college;
                          const resp = await api.post('/departments/', payload);
                          const created = resp.data;
                          setImportOpts((s:any)=>({ ...s, departments: [ ...(s.departments||[]), created ] }));
                          setImportSelection((s:any)=>({...s, department: created.department_id || created.id || created.name }));
                          setNewDeptName(''); setShowAddDept(false);
                        }catch(err){ console.error('create department failed', err); alert('فشل إنشاء القسم'); }
                      }}>حفظ</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">التخصص</label>
                  <div className="flex gap-2">
                    <select className="w-full border rounded px-2 py-2" value={importSelection.program} onChange={e => setImportSelection((s:any)=>({...s, program: e.target.value}))}>
                      <option value="">-- اختر تخصص --</option>
                      {importOpts.programs?.map((p: any) => (
                        <option key={p.id || p.pid} value={p.id || p.pid || p.p_name || p.name}>{p.p_name || p.name}</option>
                      ))}
                    </select>
                    <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowAddProg(s => !s)}>إضافة</button>
                  </div>
                  {showAddProg && (
                    <div className="mt-2 flex gap-2">
                      <input value={newProgName} onChange={e=>setNewProgName(e.target.value)} placeholder="اسم التخصص" className="border px-2 py-1 rounded flex-1" />
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async ()=>{
                        if(!newProgName) return alert('أدخل اسم التخصص');
                        try{
                          const payload: any = { p_name: newProgName };
                          if(importSelection.department) payload.department = importSelection.department;
                          const resp = await api.post('/programs/', payload);
                          const created = resp.data;
                          setImportOpts((s:any)=>({ ...s, programs: [ ...(s.programs||[]), created ] }));
                          setImportSelection((s:any)=>({...s, program: created.id || created.pid || created.p_name }));
                          setNewProgName(''); setShowAddProg(false);
                        }catch(err){ console.error('create program failed', err); alert('فشل إنشاء التخصص'); }
                      }}>حفظ</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 border rounded">إلغاء</button>
                <button onClick={downloadTemplate} className="px-4 py-2 bg-green-600 text-white rounded">تحميل الملف</button>
              </div>
            </div>
          </div>
        )}

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