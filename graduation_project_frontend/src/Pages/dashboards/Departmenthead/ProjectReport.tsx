import React, { useEffect, useState } from "react";
import { projectService, Project } from "../../../services/projectService";
import { userService } from "../../../services/userService";
import { useAuthStore } from "../../../store/useStore";

const ProjectReport: React.FC = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Get department head's department from AcademicAffiliation first, fallback to user.department_id
      const [projectsData, affiliationsData] = await Promise.all([
        projectService.getProject(),
        userService.getAffiliations()
      ]);

      // Create user-to-department mapping
      const userDepartmentMap = new Map<number, number>();
      affiliationsData.forEach((affiliation: any) => {
        if (affiliation.department_id) {
          userDepartmentMap.set(affiliation.user_id, affiliation.department_id);
        }
      });

      let departmentHeadDepartmentId = userDepartmentMap.get(user?.id || 0);
      if (!departmentHeadDepartmentId && user?.department_id) {
        departmentHeadDepartmentId = user.department_id;
      }

      console.log('Projects Report - Department Head Department ID:', departmentHeadDepartmentId);

      // Filter projects by department head's department
      const filteredProjects = departmentHeadDepartmentId ? (projectsData || []).filter((p: any) => {
        // Get department ID from project (direct department field)
        let projectDepartmentId: number | null = null;

        if (p.department) {
          if (typeof p.department === 'number') {
            projectDepartmentId = p.department;
          } else if (typeof p.department === 'object' && p.department) {
            projectDepartmentId = p.department.id || p.department.department_id;
          }
        }

        return projectDepartmentId && Number(projectDepartmentId) === Number(departmentHeadDepartmentId);
      }) : (projectsData || []);

      setProjects(filteredProjects);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center">جاري تحميل التقرير...</div>;
  }

  const total = projects.length;

  const stateCounts: Record<string, number> = {};
  projects.forEach(p => {
    stateCounts[p.state] = (stateCounts[p.state] || 0) + 1;
  });

  const maxValue = Math.max(...Object.values(stateCounts), 1);

  return (
    <div className="p-6 space-y-10">

      {/* Title */}
      <h2 className="text-2xl font-black text-center">
        تقرير المشاريع
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="عدد المشاريع" value={total} />
        <StatCard title="أنواع الحالات" value={Object.keys(stateCounts).length} />
        <StatCard title="أكثر حالة" value={Object.keys(stateCounts)[0] || "-"} />
      </div>

      {/* Animated Bars */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-6">
        <h3 className="text-lg font-bold text-center">
          توزيع المشاريع حسب الحالة
        </h3>

        <div className="space-y-6">
          {Object.entries(stateCounts).map(([state, count]) => (
            <div key={state} className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>{state}</span>
                <span>{count}</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 rounded-full animate-grow"
                  style={{
                    width: `${(count / maxValue) * 100}%`,
                    animationDuration: "1.8s"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-lg font-bold mb-4 text-center">
          تفاصيل المشاريع
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-3">العنوان</th>
                <th className="border p-3">الحالة</th>
                <th className="border p-3">النوع</th>
                <th className="border p-3">المشرف</th>
                <th className="border p-3">السنة</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.project_id} className="hover:bg-slate-50">
                  <td className="border p-3">{p.title}</td>
                  <td className="border p-3">{p.state}</td>
                  <td className="border p-3">{p.type}</td>
                  <td className="border p-3">{p.supervisor?.name || "-"}</td>
                  <td className="border p-3">{p.year || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-blue-600 text-white p-6 rounded-2xl text-center shadow">
    <p className="text-sm opacity-90">{title}</p>
    <h3 className="text-2xl font-black mt-2">{value}</h3>
  </div>
);

export default ProjectReport;
