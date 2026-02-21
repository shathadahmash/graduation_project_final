import React, { useEffect, useState, useMemo } from "react";
import { userService } from "../../../services/userService";
import api from "../../../services/api";
import { useAuthStore } from "../../../store/useStore";
import { exportToCSV } from "../../../components/tableUtils";
import {
  containerClass,
  tableWrapperClass,
  tableClass,
  theadClass,
} from "../../../components/tableStyles";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

type AcademicRole = "student" | "supervisor" | "co_supervisor";

/* =======================
   🔑 توحيد وتحليل الدور
======================= */
const normalizeRole = (role: string): AcademicRole | null => {
  const r = String(role || "").toLowerCase().replace(/[_-]/g, " ").trim();

  // ❌ استبعاد رئيس القسم نهائياً
  if (r.includes("department head") || r.includes("head") || r.includes("chair"))
    return null;

  if (r.includes("student") || r.includes("طالب")) return "student";

  if (
    (r.includes("supervisor") || r.includes("مشرف")) &&
    !r.includes("co") &&
    !r.includes("assistant") &&
    !r.includes("مساعد")
  )
    return "supervisor";

  if (r.includes("co") || r.includes("assistant") || r.includes("مساعد"))
    return "co_supervisor";

  return null;
};

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<AcademicRole | "">("");
  const [visibleRows, setVisibleRows] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const currentUser = useAuthStore.getState().user;
      let deptId = currentUser?.department_id
        ? Number(currentUser.department_id)
        : null;

      const [usersData, affResp] = await Promise.all([
        userService.getAllUsers(),
        api.post("bulk-fetch/", {
          requests: [
            {
              table: "academic_affiliations",
              fields: ["user_id", "department_id"],
            },
          ],
        }),
      ]);

      const affs = Array.isArray(affResp.data?.academic_affiliations)
        ? affResp.data.academic_affiliations
        : [];

      if (deptId === null && currentUser?.id) {
        const myAff = affs.find(
          (a: any) => Number(a.user_id) === Number(currentUser.id)
        );
        if (myAff) deptId = Number(myAff.department_id);
      }

      if (!deptId) {
        setUsers([]);
        return;
      }

      // مستخدمين القسم فقط
      const deptUserIds = new Set(
        affs
          .filter((a: any) => Number(a.department_id) === deptId)
          .map((a: any) => Number(a.user_id))
      );

      const finalUsers = usersData
        .filter(
          (u: any) =>
            deptUserIds.has(Number(u.id)) &&
            Number(u.id) !== Number(currentUser?.id)
        )
        .map((u: any) => {
          const rolesFromUser = (u.roles || [])
            .map((r: any) =>
              normalizeRole(r?.role__type || r?.type || r)
            )
            .filter(Boolean) as AcademicRole[];

          // ❌ إذا المستخدم رئيس قسم فقط → لا يظهر
          if (rolesFromUser.length === 0) return null;

          return { ...u, __academicRoles: rolesFromUser };
        })
        .filter(Boolean);

      setUsers(finalUsers);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRole =
        filterRole === "" || user.__academicRoles.includes(filterRole);

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const paginatedUsers = filteredUsers.slice(0, visibleRows);

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">
          مستخدمي القسم
        </h1>
        <button
          onClick={() =>
            exportToCSV("department_users.csv", filteredUsers)
          }
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          تصدير
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm"
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value as AcademicRole)
            }
          >
            <option value="">جميع الأدوار</option>
            <option value="student">طلاب</option>
            <option value="supervisor">مشرفين</option>
            <option value="co_supervisor">مشرفين مساعدين</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className="px-6 py-4 text-right">المستخدم</th>
              <th className="px-6 py-4 text-right">الدور الأكاديمي</th>
              <th className="px-6 py-4 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-12">
                  جاري التحميل...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12">
                  لا يوجد مستخدمين
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm">
                      {user.name || user.username}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {user.email}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {user.__academicRoles.map((r: AcademicRole, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold ml-1"
                      >
                        {r === "student" && "طالب"}
                        {r === "supervisor" && "مشرف"}
                        {r === "co_supervisor" && "مشرف مساعد"}
                      </span>
                    ))}
                  </td>

                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                        <FiCheckCircle /> نشط
                      </span>
                    ) : (
                      <span className="text-rose-600 text-[10px] font-bold flex items-center gap-1">
                        <FiXCircle /> غير نشط
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
