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

      // Create user-to-department mapping
      const userDepartmentMap = new Map<number, number>();
      affiliationsData.forEach((affiliation: any) => {
        if (affiliation.department_id) {
          userDepartmentMap.set(affiliation.user_id, affiliation.department_id);
        }
      });

      // Get department head's department ID from their AcademicAffiliation first, fallback to user.department_id
      let deptHeadDepartmentId = userDepartmentMap.get(user?.id || 0);
      if (!deptHeadDepartmentId && user?.department_id) {
        deptHeadDepartmentId = user.department_id;
      }

      console.log('Student Report - Department Head Department ID:', deptHeadDepartmentId);

      // Filter users: must be students AND in the same department as the department head
      const departmentStudents = usersData.filter(user => {
        const userDepartmentId = userDepartmentMap.get(user.id);
        const isStudent = user.roles?.some(role => role.type.toLowerCase() === 'student');
        const isSameDepartment = userDepartmentId === deptHeadDepartmentId;

        return isStudent && isSameDepartment && userDepartmentId !== undefined;
      });

      // Add affiliation data to students with resolved college/department names
      const studentsWithAffiliation = departmentStudents.map(student => {
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

  // Enhanced Stats
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
  const inactiveStudents = totalStudents - activeStudents;

  // Academic Level Distribution (assuming levels 1-4 for bachelor's)
  const level1Students = filteredStudents.filter(s => s.affiliation?.academic_level === 1 || s.affiliation?.level === 1).length;
  const level2Students = filteredStudents.filter(s => s.affiliation?.academic_level === 2 || s.affiliation?.level === 2).length;
  const level3Students = filteredStudents.filter(s => s.affiliation?.academic_level === 3 || s.affiliation?.level === 3).length;
  const level4Students = filteredStudents.filter(s => s.affiliation?.academic_level === 4 || s.affiliation?.level === 4).length;

  // Enrollment Status
  const enrolledStudents = filteredStudents.filter(s => s.affiliation?.enrollment_status === 'enrolled' || s.affiliation?.is_enrolled).length;
  const graduatedStudents = filteredStudents.filter(s => s.affiliation?.enrollment_status === 'graduated').length;
  const withdrawnStudents = filteredStudents.filter(s => s.affiliation?.enrollment_status === 'withdrawn').length;

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">تقرير طلاب القسم</h2>
        <p className="text-slate-600">إحصائيات وتحليلات مفصلة لطلاب القسم</p>
      </div>

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="إجمالي الطلاب" value={totalStudents} icon="👥" color="indigo" />
        <StatCard label="الطلاب النشطين" value={activeStudents} icon="✅" color="green" />
        <StatCard label="الطلاب الذكور" value={maleStudents} icon="👨" color="blue" />
        <StatCard label="الطالبات" value={femaleStudents} icon="👩" color="pink" />
      </div>

      {/* Academic Level Distribution */}
      <Section title="توزيع الطلاب حسب المستوى الدراسي">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { level: "المستوى الأول", count: level1Students, color: PRIMARY },
            { level: "المستوى الثاني", count: level2Students, color: ACCENT },
            { level: "المستوى الثالث", count: level3Students, color: "#F59E0B" },
            { level: "المستوى الرابع", count: level4Students, color: "#EF4444" }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</div>
              <div className="text-sm text-slate-600">{item.level}</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${totalStudents > 0 ? (item.count / totalStudents) * 100 : 0}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Enrollment Status */}
      <Section title="حالة التسجيل">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard title="مسجلين" count={enrolledStudents} total={totalStudents} color="green" />
            <StatusCard title="متخرجين" count={graduatedStudents} total={totalStudents} color="blue" />
            <StatusCard title="منسحبين" count={withdrawnStudents} total={totalStudents} color="red" />
          </div>
        </div>
      </Section>

      {/* Gender & Activity Combined Chart */}
      <Section title="توزيع شامل">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-800">توزيع حسب الجنس</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">ذكور</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${totalStudents > 0 ? (maleStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{maleStudents}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">إناث</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-pink-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${totalStudents > 0 ? (femaleStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{femaleStudents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Status */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-800">حالة النشاط</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">نشط</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{activeStudents}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">غير نشط</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${totalStudents > 0 ? (inactiveStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{inactiveStudents}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Department Performance Indicators */}
      <Section title="مؤشرات أداء القسم">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">معدل النشاط</div>
                <div className="text-2xl font-bold text-blue-800">
                  {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-600">
              نسبة الطلاب النشطين في القسم
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎓</span>
              </div>
              <div>
                <div className="text-sm text-green-700 font-medium">متوسط المستوى</div>
                <div className="text-2xl font-bold text-green-800">
                  {totalStudents > 0 ? ((level1Students * 1 + level2Students * 2 + level3Students * 3 + level4Students * 4) / totalStudents).toFixed(1) : 0}
                </div>
              </div>
            </div>
            <div className="text-xs text-green-600">
              متوسط المستوى الدراسي للطلاب
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📈</span>
              </div>
              <div>
                <div className="text-sm text-purple-700 font-medium">نمو القسم</div>
                <div className="text-2xl font-bold text-purple-800">
                  {totalStudents > 0 ? Math.round((enrolledStudents / totalStudents) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-600">
              نسبة الطلاب المسجلين النشطين
            </div>
          </div>
        </div>
      </Section>

      {/* Student Details Table */}
      <Section title="قائمة الطلاب">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 border text-right">#</th>
                <th className="p-3 border text-right">الاسم</th>
                <th className="p-3 border text-right">اسم المستخدم</th>
                <th className="p-3 border text-right">البريد الإلكتروني</th>
                <th className="p-3 border text-right">الجنس</th>
                <th className="p-3 border text-right">المستوى</th>
                <th className="p-3 border text-right">الحالة</th>
                <th className="p-3 border text-right">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 50).map((s, index) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 border text-center">{index + 1}</td>
                  <td className="p-3 border font-semibold">{s.name}</td>
                  <td className="p-3 border text-slate-600">{s.username}</td>
                  <td className="p-3 border text-slate-600">{s.email}</td>
                  <td className="p-3 border">
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
                  <td className="p-3 border text-center">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                      {s.affiliation?.academic_level || s.affiliation?.level || 'غير محدد'}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-3 border text-slate-600">
                    {s.date_joined ? new Date(s.date_joined).toLocaleDateString('ar') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length > 50 && (
            <div className="text-center text-slate-500 text-sm mt-4">
              عرض أول 50 طالب من أصل {filteredStudents.length}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

/* ---------- UI ---------- */

const StatCard = ({ label, value, icon, color }: any) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.indigo} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/80 text-sm font-medium">{label}</div>
          <div className="text-3xl font-black mt-1">{value}</div>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, count, total, color }: any) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500"
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
      <div className="text-lg font-bold text-slate-800">{count}</div>
      <div className="text-sm text-slate-600 mb-2">{title}</div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1">{percentage}%</div>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    {children}
  </div>
);

export default StudentReportPage;