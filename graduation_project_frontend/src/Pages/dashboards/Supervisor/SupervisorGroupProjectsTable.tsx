import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import { groupService } from "../../../services/groupService";

type AnyObj = Record<string, any>;

function safeArray(x: any): any[] {
  return Array.isArray(x) ? x : [];
}

function groupId(g: AnyObj): string | number {
  return g.group_id ?? g.id ?? g.pk ?? Math.random();
}

function groupName(g: AnyObj): string {
  return g.group_name ?? g.name ?? "—";
}

function projectTitle(g: AnyObj): string {
  const p = g.project;
  if (!p) return "—";
  if (typeof p === "object") return p.title ?? p.name ?? "—";
  return String(p);
}

function memberNames(g: AnyObj): string[] {
  const buckets = [g.students, g.members, g.group_members, g.groupMembers];
  const names: string[] = [];

  buckets.forEach((b) => {
    safeArray(b).forEach((m: AnyObj) => {
      if (typeof m === "string") {
        names.push(m);
        return;
      }
      const u = m.user ?? m.student ?? m;
      const n =
        u?.name ||
        `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
        u?.username ||
        m?.name ||
        m?.username;

      if (n) names.push(n);
    });
  });

  return Array.from(new Set(names));
}

const SupervisorGroupsProjectsTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<AnyObj[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getGroups();
      const arr = Array.isArray(res) ? res : (res?.results || []);
      setGroups(arr);
    } catch {
      setError("تعذر جلب البيانات حالياً.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(() => groups, [groups]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
            <FiUsers size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Groups & Projects</h3>
            <p className="text-slate-400 text-xs font-bold">Total: {rows.length}</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition flex items-center gap-2"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 text-xs font-black uppercase tracking-widest">
                <th className="p-4">Group Name</th>
                <th className="p-4">Project</th>
                <th className="p-4">Members</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-slate-500 font-bold" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((g) => {
                  const members = memberNames(g);

                  return (
                    <tr key={String(groupId(g))} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="p-4 font-black text-slate-800">{groupName(g)}</td>
                      <td className="p-4 text-slate-600 font-bold">{projectTitle(g)}</td>
                      <td className="p-4">

{members.length ? (
                          <div className="flex flex-wrap gap-2">
                            {members.slice(0, 8).map((m, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black"
                              >
                                {m}
                              </span>
                            ))}
                            {members.length > 8 && (
                              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                                +{members.length - 8}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm font-bold">غير متاح من الـ API</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-8 text-slate-500 font-bold text-center" colSpan={3}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-slate-400 text-[11px] font-bold">
        إذا لم تظهر الأعضاء: هذا يعني أن endpoint /groups لا يرجّع members داخل نفس الـ response. وقتها نضيف endpoint أو bulk fetch لاحقاً بدون تغيير الواجهة.
      </p>
    </div>
  );
};

export default SupervisorGroupsProjectsTable;