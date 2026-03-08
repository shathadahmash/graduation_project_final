import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";

export default function Universities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/universities")
      .then(resp => {
        const data = resp.data;
        if (Array.isArray(data)) {
          setUniversities(data);
        } else if (data && Array.isArray(data.results)) {
          setUniversities(data.results);
        } else {
          console.warn("unexpected universities response", data);
          setUniversities([]);
        }
      })
      .catch(err => {
        console.error("Failed to load universities", err);
        setUniversities([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // تحديث عدد العناصر المرئية حسب حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(2);
      else if (window.innerWidth < 768) setItemsPerView(3);
      else if (window.innerWidth < 1024) setItemsPerView(4);
      else setItemsPerView(5);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (currentIndex < universities.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <section className="py-20 bg-[#F8FAFC] relative overflow-hidden">
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0B2B4F]/20 to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* عنوان أكاديمي */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2B4F] relative z-10">
              الجامعات المشاركة
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#0B2B4F] to-[#1E4A7A] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4 max-w-2xl mx-auto">
            نخبة من الجامعات اليمنية تتعاون معنا لتطوير مشاريع التخرج
          </p>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-3 border-[#0B2B4F]/20 border-t-[#0B2B4F] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* السلايدر */}
            <div className="relative">
              {/* أزرار التنقل */}
              {universities.length > itemsPerView && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className={`absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-lg ${
                      currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0B2B4F] hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentIndex >= universities.length - itemsPerView}
                    className={`absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-lg ${
                      currentIndex >= universities.length - itemsPerView ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0B2B4F] hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </>
              )}

              {/* السلايدر المحتوى */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out gap-4"
                  style={{ transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * 16}px))` }}
                >
                  {universities.map((uni, index) => (
                    <div 
                      key={uni.id || index} 
                      className="flex-shrink-0 group"
                      style={{ width: `calc(${100 / itemsPerView}% - 16px)` }}
                    >
                      <div className="relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                        {/* خلفية متدرجة عند التحويم */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B4F] to-[#1E4A7A] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        
                        {/* محتوى البطاقة */}
                        <div className="relative z-10 p-6 text-center h-full flex flex-col items-center justify-center">
                          {/* الشعار مع إطار دائري */}
                          <div className="relative mb-4 w-24 h-24 md:w-28 md:h-28">
                            <div className="absolute inset-0 rounded-full bg-[#0B2B4F]/5 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110"></div>
                            <img 
                              src={uni.logo || '/default-uni-logo.png'} 
                              alt={uni.uname || uni.name}
                              className="w-full h-full object-contain p-2 relative z-10 transition-all duration-300 group-hover:scale-105 group-hover:filter group-hover:brightness-0 group-hover:invert"
                              onError={(e) => {
                                e.target.src = '/default-uni-logo.png';
                              }}
                            />
                          </div>
                          
                          {/* اسم الجامعة */}
                          <h3 className="font-semibold text-sm md:text-base text-[#2C3E50] group-hover:text-white transition-all duration-300 mb-2">
                            {uni.uname || uni.name}
                          </h3>
                          
                          {/* إحصائية صغيرة */}
                          <span className="text-xs px-2 py-1 rounded-full bg-[#0B2B4F]/5 text-[#4A5568] group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                            {uni.projects_count || '١٥+'} مشروع
                          </span>
                          
                          {/* خط سفلي متحرك */}
                          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-white to-[#1E4A7A] transition-all duration-300 w-0 group-hover:w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* نقاط التصفح (Dots) */}
              {universities.length > itemsPerView && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(universities.length / itemsPerView) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * itemsPerView)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex / itemsPerView) === index
                          ? 'w-8 bg-[#0B2B4F]'
                          : 'w-2 bg-[#0B2B4F]/20 hover:bg-[#0B2B4F]/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* عرض رسالة إذا لم توجد جامعات */}
            {universities.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-[#4A5568]">لا توجد جامعات مشاركة حالياً</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}