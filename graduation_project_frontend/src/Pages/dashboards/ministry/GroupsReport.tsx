import React, { useEffect, useState } from "react";
import { groupService } from "../../../services/groupService";
import { projectService } from "../../../services/projectService";

const PRIMARY = "#4F46E5"; // Indigo
const ACCENT = "#10B981";  // Emerald
const MUTED = "#94A3B8";   // Slate

interface Group {
  id: number;
  group_name: string;
  project?: number | null;
  students?: any[];
  supervisors?: any[];
  co_supervisors?: any[];
  note?: string;
}

const GroupsReport: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [barWidths, setBarWidths] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [groupsData, projectsData] = await Promise.all([
        groupService.getGroups(),
        projectService.getProject(),
      ]);

      setGroups(Array.isArray(groupsData) ? groupsData : []);

      const map: Record<number, string> = {};
      (projectsData || []).forEach((p: any) => {
        if (p?.project_id) map[p.project_id] = p.title;
      });
      setProjectsMap(map);

      // Animate bars
      const maxCount = Math.max(
        ...(groupsData || []).map(
          (g: any) =>
            (g.students?.length || 0) + (g.supervisors?.length || 0)
        ),
        1
      );
      setTimeout(() => {
        setBarWidths(
          (groupsData || []).map(
            (g: any) =>
              ((g.students?.length || 0) + (g.supervisors?.length || 0)) /
              maxCount *
              100
          )
        );
      }, 300);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        جاري تحميل تقرير المجموعات...
      </div>
    );
  }

  // Stats
  const totalGroups = groups.length;
  const totalStudents = groups.reduce((sum, g) => sum + (g.students?.length || 0), 0);
  const totalSupervisors = groups.reduce((sum, g) => sum + (g.supervisors?.length || 0), 0);
  const totalCoSupervisors = groups.reduce((sum, g) => sum + (g.co_supervisors?.length || 0), 0);

  return (
    <div className="p-6 space-y-12 bg-slate-50">
      <h2 className="text-2xl font-black text-center">تقرير المجموعات</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard label="عدد المجموعات" value={totalGroups} />
        <StatCard label="عدد الطلاب" value={totalStudents} />
        <StatCard label="عدد المشرفين" value={totalSupervisors} />
        <StatCard label="عدد المشرفين المساعدين" value={totalCoSupervisors} />
      </div>

      {/* Groups Bar */}
      <Section title="عدد الطلاب والمشرفين لكل مجموعة">
        <div className="space-y-4">
          {groups.map((g, idx) => (
            <div key={g.id} className="space-y-1">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span>{g.group_name}</span>
                <span>{(g.students?.length || 0) + (g.supervisors?.length || 0)}</span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${barWidths[idx] || 0}%`,
                    backgroundColor: PRIMARY,
                    transition: "width 2s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Distribution Pie (simplified) */}
      <Section title="توزيع الأعضاء">
        <div className="flex gap-6 justify-around text-center">
          {[
            { label: "طلاب", value: totalStudents, color: PRIMARY },
            { label: "مشرفون", value: totalSupervisors, color: ACCENT },
            { label: "مساعدون", value: totalCoSupervisors, color: "#F59E0B" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div
                className="rounded-full flex items-center justify-center mb-2 shadow-lg"
                style={{
                  width: 80,
                  height: 80,
                  background: `conic-gradient(${item.color} 0% ${(item.value / (totalStudents + totalSupervisors + totalCoSupervisors)) * 100}%, #E5E7EB 0%)`,
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

      {/* Details Table */}
      <Section title="تفاصيل المجموعات">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">اسم المجموعة</th>
                <th className="p-3 border">المشروع</th>
                <th className="p-3 border">طلاب</th>
                <th className="p-3 border">مشرفون</th>
                <th className="p-3 border">مساعدون</th>
                <th className="p-3 border">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 text-center">
                  <td className="p-2 border">{g.id}</td>
                  <td className="p-2 border font-semibold">{g.group_name}</td>
                  <td className="p-2 border">{g.project ? projectsMap[g.project] || "غير مرتبط" : "—"}</td>
                  <td className="p-2 border">{g.students?.length || 0}</td>
                  <td className="p-2 border">{g.supervisors?.length || 0}</td>
                  <td className="p-2 border">{g.co_supervisors?.length || 0}</td>
                  <td className="p-2 border">{g.note || "—"}</td>
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

export default GroupsReport;
