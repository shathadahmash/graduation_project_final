import React, { useEffect, useState } from "react";
import { projectService } from "../../services/projectService";
import { useLocation } from "react-router-dom";

const ExternalProjects = () => {
  const [projects, setProjects] = useState([]);
  const type = new URLSearchParams(useLocation().search).get("type");

  const load = async () => {
    const data = await projectService.getProjects({ type });
    setProjects(data);
  };

  useEffect(() => {
    load();
  }, [type]);

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">
        {type === "government" ? "مشاريع حكومية" : "شركات خارجية"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p: any) => (
          <div
            key={p.project_id}
            className="border p-5 rounded-xl bg-white shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold">{p.title}</h2>
            <p className="text-gray-600 mt-2">{p.description}</p>
            <p className="mt-4 text-sm text-blue-600">
              المشرف: {p.supervisor?.name || "غير محدد"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExternalProjects;
