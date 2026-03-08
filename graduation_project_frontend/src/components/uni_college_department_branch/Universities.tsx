import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface University {
  id: number;
  name: string;
  type: string;
  location: string;
  logo: string;
}

const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await api.get("/universities");
      
      // التحقق من أن البيانات مصفوفة
      const uniData = Array.isArray(response.data) ? response.data : [];
      
      const processedData = uniData.map((uni: any) => ({
        id: uni.uid,
        name: uni.uname_ar || "جامعة",
        type: uni.type === "حكومي" ? "حكومية" : 
              uni.type === "اهلي" ? "أهلية" : 
              uni.type || "جامعة",
        location: "اليمن",
        logo: "/default-uni-logo.png"
      }));

      setUniversities(processedData);
    } catch (error) {
      console.error("خطأ في جلب الجامعات", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSlides = Math.ceil(universities.length / itemsPerView);

  const nextSlide = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getCurrentUniversities = () => {
    const start = currentIndex * itemsPerView;
    const end = start + itemsPerView;
    return universities.slice(start, end);
  };

  const handleUniversityClick = (id: number, name: string) => {
    navigate(`/university/${id}`, {
      state: { universityName: name }
    });
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFC]">
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-[#0B2B4F]/20 border-t-[#0B2B4F] rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  const currentUniversities = getCurrentUniversities();

  return (
    <section className="py-20 bg-[#F8FAFC] relative overflow-hidden">
      {/* خط أكاديمي علوي */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0B2B4F]/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2B4F] relative z-10">
              الجامعات المشاركة
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4">
            نخبة من الجامعات اليمنية المشاركة في مشاريع التخرج
          </p>
        </div>

        <div className="relative px-8">
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-lg ${
                  currentIndex === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#0B2B4F] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex === totalSlides - 1}
                className={`absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-lg ${
                  currentIndex === totalSlides - 1
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#0B2B4F] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentUniversities.map((uni) => (
              <div
                key={uni.id}
                onClick={() => handleUniversityClick(uni.id, uni.name)}
                className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-6 text-center border border-[#0B2B4F]/5 relative overflow-hidden"
              >
                {/* خلفية متدرجة عند التحويم */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B4F] to-[#1E4A7A] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-4 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-[#0B2B4F]/5 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105"></div>
                    <img
                      src={uni.logo}
                      alt={uni.name}
                      className="w-full h-full object-contain p-2 relative z-10 transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/default-uni-logo.png';
                      }}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-[#0B2B4F] group-hover:text-white transition-colors duration-300 mb-3">
                    {uni.name}
                  </h3>

                  <div className="flex justify-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0B2B4F]/5 text-[#4A5568] group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      {uni.location}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#1E4A7A]/5 text-[#4A5568] group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      {uni.type}
                    </span>
                  </div>

                  <button className="w-full bg-[#0B2B4F] text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:bg-white group-hover:text-[#0B2B4F]">
                    عرض التفاصيل
                  </button>
                </div>

                {/* خط سفلي متحرك */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#1E4A7A] transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>
            ))}
          </div>

          {/* نقاط التصفح */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'w-8 bg-[#0B2B4F]'
                      : 'w-2 bg-[#0B2B4F]/20 hover:bg-[#0B2B4F]/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Universities;