import React, { useEffect, useState } from "react";
import { FiUsers, FiFolder, FiBell } from "react-icons/fi";
import { groupService } from "../../../services/groupService";
import { projectService } from "../../../services/projectService"; // ✅ make sure this exists
import { useNotificationsStore } from "../../../store/useStore";

const SupervisorStatCards: React.FC = () => {
  const { unreadCount } = useNotificationsStore();
  const [groupsCount, setGroupsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const groupsRes = await groupService.getGroups();
        const groupsArr = Array.isArray(groupsRes) ? groupsRes : groupsRes?.results || [];
        setGroupsCount(groupsArr.length);

        const projectsRes = await projectService.getProjects();
        const projectsArr = Array.isArray(projectsRes) ? projectsRes : projectsRes?.results || [];
        setProjectsCount(projectsArr.length);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Projects */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center mb-4 shadow-md">
            <FiFolder size={24} />
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">عدد المشاريع</p>
          <h3 className="text-2xl font-black text-slate-900">{projectsCount}</h3>
        </div>
      </div>

      {/* Groups */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center mb-4 shadow-md">
            <FiUsers size={24} />
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">عدد المجموعات</p>
          <h3 className="text-2xl font-black text-slate-900">{groupsCount}</h3>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center mb-4 shadow-md">
            <FiBell size={24} />
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">الإشعارات الجديدة</p>
          <h3 className="text-2xl font-black text-slate-900">{unreadCount}</h3>
        </div>
      </div>

    </div>
  );
};


export default SupervisorStatCards;
