import React, { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const styles = {
  container: { maxWidth: "900px", margin: "40px auto", padding: "20px", fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif", direction: "rtl" as const },
  card: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "24px", marginBottom: "20px" },
  header: { borderBottom: "2px solid #f0f0f0", paddingBottom: "15px", marginBottom: "25px", color: "#2c3e50" },
  modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", padding: "30px", borderRadius: "15px", width: "500px", maxHeight: "90vh", overflowY: "auto" as const },
  inputGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" as const, fontSize: "0.9rem", color: "#555" },
  select: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "8px" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" as const },
  btnPrimary: { background: "#007bff", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" as const },
  btnSecondary: { background: "#6c757d", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", marginRight: "10px" },
  btnOutline: { background: "transparent", border: "1px solid #007bff", color: "#007bff", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" as const, marginTop: "15px" },
  th: { backgroundColor: "#8b8b8b", textAlign: "right" as const, padding: "12px", borderBottom: "2px solid #dee2e6" },
  td: { padding: "12px", borderBottom: "1px solid #eee" },
  badgeSuccess: { padding: "4px 12px", borderRadius: "20px", backgroundColor: "#d4edda", color: "#155724", fontSize: "0.85rem" },
  // Shared base for all summary cards
  summaryCardBase: {
    textAlign: "center" as const,
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
  },
  cardValue: { 
    fontSize: "1.2rem", 
    fontWeight: "bold" as const 
  },
  cardLabel: { 
    fontSize: "0.8rem", 
    color: "#666" 
  },
  // Add/Update these in your styles object at the top
//   summaryCard: { 
//     textAlign: "center" as const, 
//     flex: 1, 
//     padding: "15px", 
//     background: "#0116ff55", // Black background
//     borderRadius: "8px", 
//     border: "1px solid #33333300" 
//   },
  cardValue: { fontSize: "1.4rem", fontWeight: "bold" as const, marginBottom: "5px" },
  cardLabel: { fontSize: "0.8rem", color: "#bbb" }, // Grey label text
  badgeError: { padding: "4px 12px", borderRadius: "20px", backgroundColor: "#f8d7da", color: "#721c24", fontSize: "0.85rem" }
};

function ImportStudentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [pre, setPre] = useState({
    university_id: "",
    university_name: "",
    college_id: "",
    college_name: "",
    department_id: "",
    department_name: "",
    program_id: "",
    program_name: "",
    enrollment_year: "",
    graduation_year: "" // Initialized
  });

  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/universities/").then(r => setUniversities(r.data));
  }, []);

  useEffect(() => {
    if (pre.university_id) {
      axios.get(`/api/colleges/?university=${pre.university_id}`).then(r => setColleges(r.data));
    } else {
      setColleges([]);
    }
    setDepartments([]);
    setPrograms([]);
  }, [pre.university_id]);

  useEffect(() => {
    if (pre.college_id) {
      axios.get(`/api/departments/?college=${pre.college_id}`).then(r => setDepartments(r.data));
      axios.get(`/api/programs/?college=${pre.college_id}`).then(r => setPrograms(r.data));
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [pre.college_id]);

  function openModal() { setShowModal(true); }

  function downloadTemplate() {
    const params = {};
    if (pre.university_id) params.pre_university_id = pre.university_id;
    if (pre.university_name && !pre.university_id) params.pre_university_name = pre.university_name;
    if (pre.college_id) params.pre_college_id = pre.college_id;
    if (pre.college_name && !pre.college_id) params.pre_college_name = pre.college_name;
    if (pre.department_id) params.pre_department_id = pre.department_id;
    if (pre.department_name && !pre.department_id) params.pre_department_name = pre.department_name;
    if (pre.program_id) params.pre_program_id = pre.program_id;
    if (pre.program_name && !pre.program_id) params.pre_program_name = pre.program_name;
    if (pre.enrollment_year) params.pre_enrollment_year = pre.enrollment_year;
    if (pre.graduation_year) params.pre_graduation_year = pre.graduation_year; 

    const query = new URLSearchParams(params).toString();
    const url = `/api/import-students/template/?${query}`;
    window.location.href = url;
    setShowModal(false);
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setValidation(null);
    setCommitResult(null);
  }

  const appendPreData = (formData) => {
    if (pre.university_id) formData.append("pre_university_id", pre.university_id);
    if (pre.university_name && !pre.university_id) formData.append("pre_university_name", pre.university_name);
    if (pre.college_id) formData.append("pre_college_id", pre.college_id);
    if (pre.college_name && !pre.college_id) formData.append("pre_college_name", pre.college_name);
    if (pre.department_id) formData.append("pre_department_id", pre.department_id);
    if (pre.department_name && !pre.department_id) formData.append("pre_department_name", pre.department_name);
    if (pre.program_id) formData.append("pre_program_id", pre.program_id);
    if (pre.program_name && !pre.program_id) formData.append("pre_program_name", pre.program_name);
    if (pre.enrollment_year) formData.append("pre_enrollment_year", pre.enrollment_year);
   // if (pre.graduation_year) formData.append("pre_graduation_year", pre.graduation_year);
  };

  async function validateFile() {
    if (!file) return alert("اختر ملف Excel أولاً");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    appendPreData(fd);

    try {
      const res = await axios.post("/api/import-students/validate/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setValidation(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "خطأ أثناء التحقق");
    } finally {
      setLoading(false);
    }
  }

async function commitFile() {
    if (!file) return alert("اختر ملف Excel أولاً");
    if (validation && validation.invalid_rows > 0) {
      if (!confirm("الملف يحتوي أخطاء. هل تريد المتابعة ومحاولة الاستيراد؟")) return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    appendPreData(fd);

    try {
      const res = await axios.post("/api/import-students/commit/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCommitResult(res.data);
      
      // Update the cards to show final successful counts
      setValidation({
        ...validation,
        created_count: res.data.created_students || 0,
        updated_count: res.data.updated_students || 0,
        invalid_rows: res.data.row_errors?.length || 0,
        errors: res.data.row_errors
      });
    } catch (err) {
      alert(err.response?.data?.message || "خطأ أثناء الاستيراد");
      if (err.response?.data?.errors) setValidation({ ...validation, errors: err.response.data.errors });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>استيراد بيانات الطلاب</h2>
          <button style={styles.btnOutline} onClick={openModal}>
            تنزيل قالب Excel 📥
          </button>
        </div>
        <p style={{ color: "#777", marginTop: "10px" }}>رفع ملف Excel يحتوي على بيانات الطلاب لتسجيلهم بشكل جماعي.</p>
      </header>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>الخطوة 1: اختيار الملف</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "15px" }}>
          <div style={{ flex: 1 }}>
            <input type="file" accept=".xlsx" onChange={handleFileChange} style={styles.input} />
          </div>
          <button style={{ ...styles.btnPrimary, backgroundColor: loading ? "#ccc" : "#007bff" }} onClick={validateFile} disabled={loading}>
            {loading ? "جاري المعالجة..." : "فحص الملف"}
          </button>
          <button style={{ ...styles.btnSecondary, backgroundColor: (loading || !validation) ? "#ccc" : "#28a745" }} onClick={commitFile} disabled={loading || !validation}>
            بدء الاستيراد
          </button>
        </div>
      </div>

    {validation && (
    <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>نتائج التحقق من البيانات</h4>
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        
        {/* Total Rows - Grey */}
        <div style={{ ...styles.summaryCardBase, background: "#f8f9fa" }}>
            <div style={styles.cardValue}>{validation.total_rows || 0}</div>
            <div style={styles.cardLabel}>إجمالي الصفوف</div>
        </div>

        {/* Ready for Import - Green */}
        <div style={{ ...styles.summaryCardBase, background: "#e8f5e9" }}>
            <div style={{ ...styles.cardValue, color: "#2e7d32" }}>{validation.valid_rows || 0}</div>
            <div style={styles.cardLabel}>جاهز للاستيراد</div>
        </div>

        {/* Data Update - Blue (This is the one you wanted to fix) */}
        <div style={{ ...styles.summaryCardBase, background: "#e3f2fd" }}>
            <div style={{ ...styles.cardValue, color: "#1565c0" }}>{validation.updated_count || 0}</div>
            <div style={styles.cardLabel}>تحديث بيانات</div>
        </div>

        {/* Errors - Red */}
        <div style={{ ...styles.summaryCardBase, background: "#ffebee" }}>
            <div style={{ ...styles.cardValue, color: "#c62828" }}>{validation.invalid_rows || 0}</div>
            <div style={styles.cardLabel}>صفوف بها أخطاء</div>
        </div>

        </div>
          {validation.errors && validation.errors.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>الصف</th>
                    <th style={styles.th}>الحقل</th>
                    <th style={styles.th}>رسالة الخطأ</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.errors.map((e, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{e.row}</td>
                      <td style={styles.td}><span style={styles.badgeError}>{e.field}</span></td>
                      <td style={styles.td}>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {commitResult && (
        <div style={{ ...styles.card, borderLeft: "5px solid #28a745" }}>
          <h4 style={{ marginTop: 0, color: "#28a745" }}>النتيجة النهائية</h4>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>تم استيراد {commitResult.imported_count || 0} طالب بنجاح.</pre>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px" }}>تخصيص قالب الاستيراد</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>الجامعة</label>
              <select style={styles.select} value={pre.university_id} onChange={e => setPre({...pre, university_id: e.target.value, university_name: ""})}>
                <option value="">-- اختر من الموجود --</option>
                {universities.map(u => <option key={u.uid} value={u.uid}>{u.uname_ar}</option>)}
              </select>
              <input style={styles.input} placeholder="أو اكتب اسم جامعة جديدة" value={pre.university_name} onChange={e => setPre({...pre, university_name: e.target.value, university_id: ""})} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>الكلية</label>
              <select style={styles.select} value={pre.college_id} onChange={e => setPre({...pre, college_id: e.target.value, college_name: ""})} disabled={!pre.university_id && !pre.university_name}>
                <option value="">-- اختر من الموجود --</option>
                {colleges.map(c => <option key={c.cid} value={c.cid}>{c.name_ar}</option>)}
              </select>
              <input style={styles.input} placeholder="أو اكتب اسم كلية جديدة" value={pre.college_name} onChange={e => setPre({...pre, college_name: e.target.value, college_id: ""})} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>القسم</label>
              <select style={styles.select} value={pre.department_id} onChange={e => setPre({...pre, department_id: e.target.value, department_name: ""})} disabled={!pre.college_id && !pre.college_name}>
                <option value="">-- اختر من الموجود --</option>
                {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
              </select>
              <input style={styles.input} placeholder="أو اكتب اسم قسم جديد" value={pre.department_name} onChange={e => setPre({...pre, department_name: e.target.value, department_id: ""})} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>البرنامج</label>
              <select style={styles.select} value={pre.program_id} onChange={e => setPre({...pre, program_id: e.target.value, program_name: ""})} disabled={!pre.department_id && !pre.department_name}>
                <option value="">-- اختر من الموجود --</option>
                {programs.map(p => <option key={p.pid} value={p.pid}>{p.p_name}</option>)}
              </select>
              <input style={styles.input} placeholder="أو اكتب اسم برنامج جديد" value={pre.program_name} onChange={e => setPre({...pre, program_name: e.target.value, program_id: ""})} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>السنة الدراسية</label>
              <select style={styles.select} value={pre.enrollment_year} onChange={e => setPre({...pre, enrollment_year: e.target.value})}>
                <option value="">-- اختر السنة --</option>
                <option value="2021-2022">2021-2022</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px", gap: "10px" }}>
              <button style={styles.btnSecondary} onClick={() => setShowModal(false)}>إلغاء</button>
              <button style={styles.btnPrimary} onClick={downloadTemplate}>تنزيل القالب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportStudentsPage;