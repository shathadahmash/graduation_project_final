import React, { useState } from "react";

const users = [
  {
    title: "الطلاب",
    desc: "يستفيد الطلاب من نظام متكامل لإدارة وتسليم مشاريع التخرج مع إمكانية متابعة التقييمات والملاحظات.",
    stats: "أكثر من ٥٠٠٠ طالب"
  },
  {
    title: "المشرفون",
    desc: "يشرف المشرفون على تقدم المشاريع وتقييمها داخل النظام مع تقارير دورية عن أداء الطلاب.",
    stats: "٢٠٠+ مشرف"
  },
  {
    title: "رؤساء الأقسام",
    desc: "إدارة المشاريع داخل الأقسام والموافقة على الفرق وموضوعات المشاريع وجداول التقييم.",
    stats: "٥٠+ قسم"
  },
  {
    title: "مديرو النظام",
    desc: "إدارة إعدادات النظام والتحكم بالصلاحيات ومتابعة سير العمل بشكل كامل.",
    stats: "تحكم كامل"
  },
  {
    title: "الشركات والجهات الخارجية",
    desc: "تقديم مشاكل حقيقية للطلاب لتطوير مشاريع تخدم سوق العمل وتبني شراكات استراتيجية.",
    stats: "١٥+ شريك"
  },
  {
    title: "رؤساء الجامعات",
    desc: "متابعة شاملة لأداء الجامعات والأقسام داخل النظام مع تقارير وإحصائيات دقيقة.",
    stats: "٢٥+ جامعة"
  }
];

export default function Users() {
  const [activeUser, setActiveUser] = useState(null);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0 bg-[#F8FAFC]"></div>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
      
      {/* عناصر زخرفية خلفية */}
      <div className="absolute top-40 right-20 w-64 h-64 border border-[#31257D]/5 rounded-full"></div>
      <div className="absolute bottom-40 left-20 w-96 h-96 border border-[#4937BF]/5 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* عنوان أكاديمي */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-[#31257D] relative z-10">
              المستفيدون
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4 max-w-2xl mx-auto">
            نخدم جميع أطراف العملية التعليمية في الجامعات اليمنية
          </p>
        </div>

        {/* شبكة المستفيدين - بدون صور ولا أيقونات */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {users.map((user, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#31257D]/5"
              onMouseEnter={() => setActiveUser(index)}
              onMouseLeave={() => setActiveUser(null)}
            >
              {/* خلفية متدرجة عند التحويم */}
              <div className={`absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF] opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              
              {/* محتوى البطاقة - بدون أيقونات */}
              <div className="relative z-10 p-8">
                {/* شريط علوي أكاديمي */}
                <div className={`w-12 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mb-4 transition-all duration-300 ${
                  activeUser === index ? 'w-16' : 'group-hover:w-16'
                }`}></div>
                
                {/* العنوان مع إحصائية */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold transition-all duration-300 ${
                    activeUser === index ? 'text-white' : 'text-[#31257D]'
                  }`}>
                    {user.title}
                  </h3>
                  
                  {/* إحصائية مصغرة */}
                  <span className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                    activeUser === index 
                      ? 'bg-white/20 text-white border border-white/10' 
                      : 'bg-[#31257D]/5 text-[#4A5568] border border-[#31257D]/10'
                  }`}>
                    {user.stats}
                  </span>
                </div>
                
                {/* الوصف */}
                <p className={`leading-relaxed text-sm transition-all duration-300 ${
                  activeUser === index ? 'text-white/90' : 'text-[#2C3E50]'
                }`}>
                  {user.desc}
                </p>
                
                {/* خط أفقي فاصل */}
                <div className={`w-full h-px my-4 transition-all duration-300 ${
                  activeUser === index ? 'bg-white/20' : 'bg-[#31257D]/10'
                }`}></div>
                
                {/* نص أكاديمي إضافي */}
                <p className={`text-xs transition-all duration-300 ${
                  activeUser === index ? 'text-white/60' : 'text-[#718096]'
                }`}>
                  {user.stats} مسجل في النظام
                </p>
                
                {/* خط سفلي متحرك */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#4937BF] transition-all duration-300 ${
                  activeUser === index ? 'w-full' : 'w-0'
                }`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* رابط عرض المزيد */}
        <div className="mt-16 text-center">
          <a 
            href="#" 
            className="group inline-flex items-center gap-3 text-[#31257D] hover:text-[#4937BF] transition-colors duration-300 border-b border-[#31257D]/20 hover:border-[#31257D] pb-1"
          >
            <span className="text-lg font-medium">عرض جميع المستفيدين</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          
          {/* إحصائيات إجمالية */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 pt-8 border-t border-[#31257D]/10">
            <div className="text-center group">
              <div className="text-2xl font-bold text-[#31257D] group-hover:text-[#4937BF] transition-colors">٦</div>
              <div className="text-sm text-[#4A5568]">فئات المستفيدين</div>
              <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-[#31257D] to-[#4937BF] mx-auto mt-1 transition-all"></div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-[#31257D] group-hover:text-[#4937BF] transition-colors">٢٥+</div>
              <div className="text-sm text-[#4A5568]">جامعة</div>
              <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-[#31257D] to-[#4937BF] mx-auto mt-1 transition-all"></div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-[#31257D] group-hover:text-[#4937BF] transition-colors">١٠٠٠+</div>
              <div className="text-sm text-[#4A5568]">مستفيد نشط</div>
              <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-[#31257D] to-[#4937BF] mx-auto mt-1 transition-all"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}