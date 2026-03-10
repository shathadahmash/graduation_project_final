// src/pages/UniversityDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../services/api";

interface University {
  id: number;
  name: string;
  type: string;
  location: string;
  logo: string;
  description?: string | null;
}

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await api.get(`/universities/${id}`);
        const data = response.data;
        setUniversity({
          id: data.uid,
          name: data.uname_ar || "جامعة",
          type: data.type === "حكومي" ? "حكومية" : data.type === "اهلي" ? "أهلية" : data.type || "جامعة",
          location: "اليمن",
          logo: data.image || "/default-uni-logo.png",
          description: data.description || "لا يوجد وصف متاح."
        });
      } catch (error) {
        console.error("خطأ في جلب تفاصيل الجامعة", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-[#31257D]/20 border-t-[#31257D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!university) {
    return <div className="text-center mt-20 text-red-500">الجامعة غير موجودة</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <img src={university.logo} alt={university.name} className="w-32 h-32 mx-auto rounded-full object-contain" />
        <h1 className="text-4xl font-bold mt-4 text-[#31257D]">{university.name}</h1>
        <p className="text-[#4A5568] mt-2">{university.type} - {university.location}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg text-[#4A5568]">
        <h2 className="text-2xl font-semibold mb-4">عن الجامعة</h2>
        <p>{university.description}</p>
      </div>
    </div>
  );
};

export default UniversityDetails;