import React, { useEffect, useState } from "react";
import { groupService } from "../../../services/groupService";

type AnyGroup = any;

const SupervisorGroupsView: React.FC = () => {
  const [groups, setGroups] = useState<AnyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await groupService.getSupervisorGroups(); // ✅ استخدم الدالة الجديدة
        if (!mounted) return;
        const rows = Array.isArray(res) ? res : (res?.results ?? []);
        setGroups(rows);
      } catch {
        if (!mounted) return;
        setGroups([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderMembers = (g: AnyGroup) => {
    const members = g.members || [];
    if (!Array.isArray(members) || !members.length) return "—";
    return members.join("، "); // لأن الـ serializer يرجّع قائمة أسماء مباشرة
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-1">المشاريع والأعضاء</h3>
        <p className="text-slate-400 text-sm font-medium">عرض المشاريع والأعضاء المرتبطين.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <p className="font-black text-slate-800">قائمة المشاريع</p>
          <span className="chip-blue text-sm">{loading ? "..." : `${groups.length} مشروع`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-right">
                <th className="p-4 font-black">المشروع</th>
                <th className="p-4 font-black">الأعضاء</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-slate-400" colSpan={2}>
                    جاري التحميل...
                  </td>
                </tr>
              ) : groups.length ? (
                groups.map((g, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="p-4 text-slate-600 font-bold">
                      {g.project?.title || g.project_title || "—"}
                    </td>
                    <td className="p-4 text-slate-600">{renderMembers(g)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-10 text-center text-slate-500 font-bold" colSpan={2}>
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

export default SupervisorGroupsView;
