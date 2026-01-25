import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectTypeSelect = () => {
  const navigate = useNavigate();

  const types = [
    {
      id: "private",
      title: "مشروع خاص",
      description: "قم بإضافة فكرة مشروعك الخاص وتقديمه للمراجعة",
      color: "chip-blue",
    },
    {
      id: "government",
      title: "مشاريع حكومية",
      description: "تصفح المشاريع الحكومية المتاحة للاختيار",
      color: "chip-blue",
    },
    {
      id: "external",
      title: "شركات خارجية",
      description: "مشاريع مقدمة من الشركات الخاصة",
      color: "chip-blue",
    },
  ];

  const openPage = (type: string) => {
    if (type === "private") navigate("/student/project/private");
    else navigate(`/student/project/external?type=${type}`);
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">اختيار نوع المشروع</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {types.map((item) => (
          <div
            key={item.id}
            onClick={() => openPage(item.id)}
            className={`cursor-pointer border-2 rounded-xl p-6 shadow hover:shadow-lg transition ${item.color} theme-card`}
          >
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTypeSelect;
