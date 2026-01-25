import React, { useEffect, useState } from "react";
import { userService } from "../../../services/userService";
import { useAuthStore } from "../../../store/useStore";

const PRIMARY = "#4F46E5"; // Indigo
const ACCENT = "#10B981";  // Emerald
const MUTED = "#94A3B8";   // Slate

const StudentReportPage: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barWidths, setBarWidths] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [usersData, affiliationsData, collegesData, departmentsData] = await Promise.all([
        userService.getAllUsers(),
        userService.getAffiliations(),
        userService.getColleges(),
        userService.getDepartments()
      ]);

      console.log('StudentReportPage - Fetched data:', {
        users: usersData.length,
        affiliations: affiliationsData.length,
        colleges: collegesData.length,
        departments: departmentsData.length
      });

      console.log('Sample colleges:', collegesData.slice(0, 3));
      console.log('Sample departments:', departmentsData.slice(0, 3));
      console.log('Sample affiliations:', affiliationsData.slice(0, 3));

      setAffiliations(affiliationsData);

      // Create maps for colleges and departments
      const collegeMap = new Map<number, any>(collegesData.map((college: any) => [college.id, college]));
      const departmentMap = new Map<number, any>(departmentsData.map((dept: any) => [dept.id, dept]));

      // Create user-to-college mapping
      const userCollegeMap = new Map<number, number>();
      affiliationsData.forEach((affiliation: any) => {
        if (affiliation.college_id) {
          userCollegeMap.set(affiliation.user_id, affiliation.college_id);
        }
      });

      // Get dean's college ID from their AcademicAffiliation first, fallback to user.college_id
      let deanCollegeId = userCollegeMap.get(user?.id || 0);
      if (!deanCollegeId && user?.college_id) {
        deanCollegeId = user.college_id;
      }

      console.log('Student Report - Dean College ID:', deanCollegeId);

      // Filter users: must be students AND in the same college as the dean
      const collegeStudents = usersData.filter(user => {
        const userCollegeId = userCollegeMap.get(user.id);
        const isStudent = user.roles?.some(role => role.type.toLowerCase() === 'student');
        const isSameCollege = userCollegeId === deanCollegeId;

        return isStudent && isSameCollege && userCollegeId !== undefined;
      });

      // Add affiliation data to students with resolved college/department names
      const studentsWithAffiliation = collegeStudents.map(student => {
        const affiliation = affiliationsData.find((aff: any) => aff.user_id === student.id);
        const college = affiliation?.college_id ? collegeMap.get(affiliation.college_id) : null;
        const department = affiliation?.department_id ? departmentMap.get(affiliation.department_id) : null;

        const result = {
          ...student,
          affiliation: affiliation ? {
            ...affiliation,
            college: college,
            department: department,
            college_name: college?.name,
            department_name: department?.name
          } : null
        };

        // Debug logging for first few students
        if (student.id <= 3) {
          console.log(`Student ${student.id} (${student.name}):`, {
            affiliation: result.affiliation,
            college: college,
            department: department,
            college_name: college?.name,
            department_name: department?.name
          });
        }

        return result;
      });

      console.log('Students with affiliations:', studentsWithAffiliation.slice(0, 3));
      setStudents(studentsWithAffiliation);

      // Animate bars
      const maxCount = Math.max(
        ...studentsWithAffiliation.map((s: any) => s.roles?.length || 0),
        1
      );
      setTimeout(() => {
        setBarWidths(
          studentsWithAffiliation.map((s: any) => ((s.roles?.length || 0) / maxCount) * 100)
        );
      }, 300);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Filtered students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // More flexible gender matching
    const userGender = (student.gender || "").toLowerCase().trim();
    const filterGenderLower = filterGender.toLowerCase();
    const matchesGender = filterGender === "" || 
      (filterGenderLower === "male" && (userGender === "male" || userGender === "ذكر")) ||
      (filterGenderLower === "female" && (userGender === "female" || userGender === "أنثى")) ||
      (filterGenderLower === "other" && (userGender === "other" || userGender === "أخرى" || userGender === ""));
    
    const matchesStatus = filterStatus === "" || 
      (filterStatus === "Active" && student.is_active === true) || 
      (filterStatus === "Inactive" && student.is_active === false);

    return matchesSearch && matchesGender && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        جاري تحميل تقرير الطلاب...
      </div>
    );
  }

  // Stats
  const totalStudents = filteredStudents.length;
  const maleStudents = filteredStudents.filter(s => {
    const gender = (s.gender || "").toLowerCase().trim();
    return gender === 'male' || gender === 'ذكر';
  }).length;
  const femaleStudents = filteredStudents.filter(s => {
    const gender = (s.gender || "").toLowerCase().trim();
    return gender === 'female' || gender === 'أنثى';
  }).length;
  const activeStudents = filteredStudents.filter(s => s.is_active).length;

  return (
    <div className="p-6 space-y-12 bg-slate-50">
      <h2 className="text-2xl font-black text-center">تقرير الطلاب</h2>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">البحث</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الجنس</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">الكل</option>
              <option value="Male">ذكر</option>
              <option value="Female">أنثى</option>
              <option value="Other">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">الكل</option>
              <option value="Active">نشط</option>
              <option value="Inactive">غير نشط</option>
            </select>
          </div>
          <div className="flex items-end">
            {(searchTerm || filterGender || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterGender("");
                  setFilterStatus("");
                }}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                مسح المرشحات
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard label="عدد الطلاب" value={totalStudents} />
        <StatCard label="الطلاب الذكور" value={maleStudents} />
        <StatCard label="الطالبات" value={femaleStudents} />
        <StatCard label="الطلاب النشطين" value={activeStudents} />
      </div>

      {/* Gender Distribution */}
      <Section title="توزيع الطلاب حسب الجنس">
        <div className="flex gap-6 justify-around text-center">
          {[
            { label: "الذكور", value: maleStudents, color: PRIMARY },
            { label: "الإناث", value: femaleStudents, color: ACCENT },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div
                className="rounded-full flex items-center justify-center mb-2 shadow-lg"
                style={{
                  width: 100,
                  height: 100,
                  background: `conic-gradient(${item.color} 0% ${(item.value / (maleStudents + femaleStudents)) * 100}%, #E5E7EB 0%)`,
                  transition: "all 2s ease-in-out",
                }}
              >
                <span className="text-white font-semibold">{item.value}</span>
              </div>
              <span className="text-slate-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Activity Status */}
      <Section title="حالة النشاط">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>الطلاب النشطين</span>
              <span>{activeStudents}</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-4 rounded-full bg-green-500"
                style={{
                  width: `${(activeStudents / totalStudents) * 100}%`,
                  transition: "width 2s ease",
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>الطلاب غير النشطين</span>
              <span>{totalStudents - activeStudents}</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-4 rounded-full bg-red-500"
                style={{
                  width: `${((totalStudents - activeStudents) / totalStudents) * 100}%`,
                  transition: "width 2s ease",
                }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Details Table */}
      <Section title="تفاصيل الطلاب">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">الاسم</th>
                <th className="p-3 border">اسم المستخدم</th>
                <th className="p-3 border">البريد الإلكتروني</th>
                <th className="p-3 border">الهاتف</th>
                <th className="p-3 border">الجنس</th>
                <th className="p-3 border">تاريخ الميلاد</th>
                <th className="p-3 border">الحالة</th>
                <th className="p-3 border">تاريخ الانضمام</th>
                <th className="p-3 border">الكلية</th>
                <th className="p-3 border">القسم</th>
                <th className="p-3 border">تاريخ البداية</th>
                <th className="p-3 border">تاريخ النهاية</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, index) => (
                <tr key={s.id} className="hover:bg-slate-50 text-center">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border font-semibold">{s.name}</td>
                  <td className="p-2 border">{s.username}</td>
                  <td className="p-2 border">{s.email}</td>
                  <td className="p-2 border">{s.phone || '-'}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (s.gender || "").toLowerCase() === 'male' || (s.gender || "").toLowerCase() === 'ذكر' 
                        ? 'bg-blue-100 text-blue-800' 
                        : (s.gender || "").toLowerCase() === 'female' || (s.gender || "").toLowerCase() === 'أنثى'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {s.gender === 'male' || s.gender === 'ذكر' ? 'ذكر' : 
                       s.gender === 'female' || s.gender === 'أنثى' ? 'أنثى' : 
                       s.gender || 'غير محدد'}
                    </span>
                  </td>
                  <td className="p-2 border">{s.date_of_birth || '-'}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-2 border">{s.date_joined ? new Date(s.date_joined).toLocaleDateString('ar') : '-'}</td>
                  <td className="p-2 border">{s.affiliation?.college?.name || s.affiliation?.college_name || '-'}</td>
                  <td className="p-2 border">{s.affiliation?.department?.name || s.affiliation?.department_name || '-'}</td>
                  <td className="p-2 border">{s.affiliation?.start_date ? new Date(s.affiliation.start_date).toLocaleDateString('ar') : '-'}</td>
                  <td className="p-2 border">{s.affiliation?.end_date ? new Date(s.affiliation.end_date).toLocaleDateString('ar') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

/* ---------- UI ---------- */

const StatCard = ({ label, value }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-2xl font-extrabold text-slate-800">{value}</div>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    {children}
  </div>
);

export default StudentReportPage;