import React, { useEffect, useState } from "react";
import { projectService } from "../../../services/projectService";

type AnyProject = any;

const SupervisorProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<AnyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await projectService.getProject();
        if (!mounted) return;
        const rows = Array.isArray(res) ? res : (res?.results ?? []);
        setProjects(rows);
      } catch {
        if (!mounted) return;
        setProjects([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-1">المشاريع</h3>
        <p className="text-slate-400 text-sm font-medium">المشاريع المرتبطة بمجموعاتك تحت إشرافك.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <p className="font-black text-slate-800">قائمة المشاريع</p>
          <span className="chip-blue text-sm">{loading ? "..." : `${projects.length} مشروع`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-right">
                <th className="p-4 font-black">العنوان</th>
                <th className="p-4 font-black">النوع</th>
                <th className="p-4 font-black">الحالة</th>
                <th className="p-4 font-black">تاريخ البدء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-slate-400" colSpan={4}>
                    جاري التحميل...
                  </td>
                </tr>
              ) : projects.length ? (
                projects.map((p) => (
                  <tr key={p.project_id || p.id} className="border-t border-slate-100">
                    <td className="p-4 font-bold text-slate-800">{p.title || "—"}</td>
                    <td className="p-4 text-slate-600">{p.type || "—"}</td>
                    <td className="p-4 text-slate-600">{p.state || "—"}</td>
                    <td className="p-4 text-slate-600">{p.start_date || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-10 text-center text-slate-500 font-bold" colSpan={4}>
                    لا توجد مشاريع حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupervisorProjectsView;