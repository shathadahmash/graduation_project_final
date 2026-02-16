import React from "react";
import { FiUsers } from "react-icons/fi";

type Props = {
  onOpenGroupsProjects: () => void;
};

const SupervisorHomeCTA: React.FC<Props> = ({ onOpenGroupsProjects }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Unified Groups & Projects Card */}
      <button
        onClick={onOpenGroupsProjects}
        className="bg-white rounded-[1.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all text-right relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center">
            <FiUsers size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">المجموعات والمشاريع</p>
            <p className="text-sm text-slate-400 font-medium">
              عرض جميع المجموعات والمشاريع المرتبطة تحت إشرافك
            </p>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed relative z-10">
          افتح الجدول الموحد لعرض اسم المجموعة، المشروع المرتبط، وأعضاء كل مجموعة في مكان واحد.
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
