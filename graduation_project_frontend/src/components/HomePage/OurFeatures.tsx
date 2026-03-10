import React, { useState } from "react";

const features = [
  { 
    title: "لوحات تحكم تفاعلية", 
    desc: "إحصائيات وإدارة فعّالة عبر لوحات التحكم والتقارير الذكية مع تحليلات آنية.", 
    icon: "/f1.png",
    stats: "تحليلات آنية"
  },
  { 
    title: "أتمتة تكوين المجموعات", 
    desc: "نظام ذكي لإنشاء مجموعات الطلاب بشكل تلقائي بناءً على التخصصات والمهارات.", 
    icon: "/f2.png",
    stats: "توزيع ذكي"
  },
  { 
    title: "سلاسل موافقة ذكية", 
    desc: "إدارة وموافقة المشاريع عبر مسارات اعتماد لكل قسم مع إشعارات آلية.", 
    icon: "/f3.png",
    stats: "اعتماد آلي"
  },
  { 
    title: "أرشيف بحث متقدم", 
    desc: "أرشيف بحث متقدم للوصول السريع لمشاريع السنوات السابقة مع فلترة ذكية.", 
    icon: "/f4.png",
    stats: "أكثر من ١٠٠٠ مشروع"
  },
];

export default function OurFeatures() {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <section className="py-20 bg-[#F8FAFC] relative overflow-hidden">
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
      </div>
      
      {/* عناصر زخرفية خلفية */}
      <div className="absolute top-40 left-20 w-64 h-64 border border-[#31257D]/5 rounded-full"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 border border-[#4937BF]/5 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* عنوان أكاديمي */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-[#31257D] relative z-10">
              مميزاتنا
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4 max-w-2xl mx-auto">
            نقدم حلولاً متكاملة لإدارة مشاريع التخرج بتقنيات ذكية ومعايير أكاديمية دقيقة
          </p>
        </div>

        {/* شبكة المميزات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#31257D]/5"
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              {/* خلفية متدرجة عند التحويم */}
              <div className={`absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF] opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              
              {/* المحتوى */}
              <div className="relative z-10 p-8">
                {/* رأس البطاقة */}
                <div className="flex items-start gap-4 mb-4">
                  {/* أيقونة بتصميم جديد */}
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-[#31257D]/10 to-[#4937BF]/10'
                  }`}>
                    <img 
                      src={feature.icon} 
                      alt="" 
                      className={`w-8 h-8 transition-all duration-300 ${
                        activeFeature === index ? 'filter brightness-0 invert' : 'opacity-80'
                      }`}
                    />
                  </div>
                  
                  {/* العنوان */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold transition-all duration-300 ${
                      activeFeature === index ? 'text-white' : 'text-[#31257D]'
                    }`}>
                      {feature.title}
                    </h3>
                    
                    {/* إحصائية صغيرة */}
                    <span className={`text-sm inline-block mt-1 px-3 py-1 rounded-full transition-all duration-300 ${
                      activeFeature === index 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#31257D]/5 text-[#4A5568]'
                    }`}>
                      {feature.stats}
                    </span>
                  </div>
                </div>
                
                {/* الوصف */}
                <p className={`leading-relaxed transition-all duration-300 ${
                  activeFeature === index ? 'text-white/90' : 'text-[#2C3E50]'
                }`}>
                  {feature.desc}
                </p>
                
                {/* خط سفلي متحرك */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#4937BF] transition-all duration-300 ${
                  activeFeature === index ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              
              {/* أيقونة صغيرة في الزاوية */}
              <div className={`absolute top-4 left-4 w-20 h-20 border border-white/10 rounded-full transition-all duration-500 ${
                activeFeature === index ? 'opacity-20 scale-150' : 'opacity-0'
              }`}></div>
            </div>
          ))}
        </div>

        {/* شريط سفلي بسيط */}
        <div className="mt-16 w-24 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mx-auto"></div>
      </div>
    </section>
  );
}