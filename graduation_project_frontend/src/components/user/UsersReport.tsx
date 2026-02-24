import React, { useEffect, useState } from "react";
import { userService, User, Role } from "../../services/userService";
import { FiUsers, FiDatabase, FiUserX } from "react-icons/fi";

const PRIMARY = "#4F46E5";   // indigo
const ACCENT = "#10B981";   // emerald
const MUTED = "#94A3B8";    // slate

const UsersReport: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [barWidths, setBarWidths] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [u, r] = await Promise.all([
        userService.getAllUsers(),
        userService.getAllRoles(),
      ]);

      setUsers(u);
      setRoles(r);
      setLoading(false);

      const max = Math.max(
        ...r.map(role => u.filter(user => user.roles?.some(rr => rr.type === role.type)).length),
        1
      );

      setTimeout(() => {
        setBarWidths(
          r.map(
            role =>
              (u.filter(user => user.roles?.some(rr => rr.type === role.type)).length / max) * 100
          )
        );
      }, 300);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">جاري تحميل التقرير...</div>;
  }

  const usersWithoutRoles = users.filter(u => !u.roles || u.roles.length === 0);

  const genderStats = [
    { label: "ذكر", value: users.filter(u => u.gender === "Male").length },
    { label: "أنثى", value: users.filter(u => u.gender === "Female").length },
    { label: "غير محدد", value: users.filter(u => !u.gender).length },
  ];

  const emailDomains: Record<string, number> = {};
  users.forEach(u => {
    const domain = u.email?.split("@")[1] || "غير محدد";
    emailDomains[domain] = (emailDomains[domain] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-16 bg-slate-50">

      {/* ===== Summary ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<FiUsers />} label="إجمالي المستخدمين" value={users.length} />
        <StatCard icon={<FiDatabase />} label="إجمالي الأدوار" value={roles.length} />
        <StatCard icon={<FiUserX />} label="مستخدمون بلا أدوار" value={usersWithoutRoles.length} />
      </div>

      {/* ===== Gender ===== */}
      <Section title="توزيع المستخدمين حسب الجنس">
        <div className="grid grid-cols-3 gap-8">
          {genderStats.map(g => (
            <div key={g.label} className="text-center space-y-3">
              <div className="text-3xl font-extrabold text-indigo-600">{g.value}</div>
              <div className="text-sm text-slate-600">{g.label}</div>
              <div className="h-1 w-12 mx-auto rounded-full bg-indigo-200" />
            </div>
          ))}
        </div>
      </Section>

      {/* ===== Roles ===== */}
      <Section title="عدد المستخدمين حسب الدور">
        <div className="space-y-6">
          {roles.map((role, idx) => {
            const count = users.filter(u => u.roles?.some(r => r.type === role.type)).length;

            return (
              <div key={role.type} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>{role.type}</span>
                  <span className="text-indigo-600">{count}</span>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${barWidths[idx] || 0}%`,
                      backgroundColor: PRIMARY,
                      transition: "width 2.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ===== Email Domains ===== */}
      <Section title="المستخدمون حسب نطاق البريد">
        <div className="space-y-6">
          {Object.entries(emailDomains).map(([domain, count]) => (
            <div key={domain} className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span>{domain}</span>
                <span className="text-emerald-600">{count}</span>
              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${(count / users.length) * 100}%`,
                    backgroundColor: ACCENT,
                    transition: "width 2.5s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

/* ---------- UI ---------- */

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
    <div className="flex items-center gap-4">
      <div className="text-indigo-600 text-xl">{icon}</div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-extrabold text-slate-800">{value}</div>
      </div>
    </div>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-8">
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    {children}
  </div>
);

export default UsersReport;
