import React from "react";
import { FiUsers, FiLayers } from "react-icons/fi";

type Props = {
  onOpenGroups: () => void;
  onOpenProjects: () => void;
};

const SupervisorHomeCTA: React.FC<Props> = ({ onOpenGroups, onOpenProjects }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Groups Card */}
      <button
        onClick={onOpenGroups}
        className="bg-white rounded-[1.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all text-right relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center">
            <FiUsers size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">المجموعات</p>
            <p className="text-sm text-slate-400 font-medium">عرض مجموعاتك وأعضاء كل مجموعة</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed relative z-10">
          افتح جدول المجموعات لعرض اسم المجموعة، وأسماء الأعضاء، والمشروع المرتبط (إن وجد).
        </p>
        <div
          style={{ background: "var(--primary-blue-50)" }}
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-70 blur-2xl transition-opacity duration-500"
        />
      </button>

      {/* Projects Card */}
      <button
        onClick={onOpenProjects}
        className="bg-white rounded-[1.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all text-right relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center">
            <FiLayers size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">المشاريع</p>
            <p className="text-sm text-slate-400 font-medium">المشاريع التي تشرف عليها</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed relative z-10">
          افتح المشاريع لعرض المشاريع المرتبطة بمجموعاتك تحت إشرافك.
        </p>
        <div
          style={{ background: "var(--primary-blue-50)" }}
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-70 blur-2xl transition-opacity duration-500"
        />
      </button>
    </div>
  );
};

export default SupervisorHomeCTA;