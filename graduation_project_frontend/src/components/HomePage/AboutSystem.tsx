import React from "react";

export default function AboutSystem() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* عناصر خلفية أكاديمية أنيقة */}
      <div className="absolute inset-0 bg-[#F8FAFC]"></div>
      
      {/* خطوط أكاديمية */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
      
      {/* عناصر زخرفية خلفية */}
      <div className="absolute top-40 right-20 w-64 h-64 border border-[#31257D]/5 rounded-full"></div>
      <div className="absolute bottom-40 left-20 w-96 h-96 border border-[#4937BF]/5 rounded-full"></div>
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* عنوان أكاديمي */}
          <div className="relative inline-block mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#31257D] relative z-10">
              عن النظام
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full"></div>
          </div>
          
          {/* نص أكاديمي رئيسي */}
          <p className="text-lg md:text-xl text-[#2C3E50] leading-relaxed max-w-3xl mx-auto mb-16">
            نظام إدارة مشاريع التخرج للجامعات اليمنية هو منصة متكاملة 
            لإدارة ومتابعة مشاريع التخرج، بدءاً من تقديم الفكرة، اعتمادها، 
            تشكيل اللجان، استعراض التقدم، تسليم المشروع، وصولاً إلى 
            التقييم النهائي.
          </p>
          
          {/* بطاقات الرؤية والرسالة والقيم - بدون أيقونات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              {
                title: "رؤيتنا",
                desc: "أن نكون المنصة الرائدة في إدارة مشاريع التخرج على مستوى الجامعات اليمنية والعربية.",
              },
              {
                title: "رسالتنا",
                desc: "توفير بيئة أكاديمية متكاملة تسهل عملية إدارة وتقييم مشاريع التخرج بمعايير دقيقة.",
              },
              {
                title: "قيمنا",
                desc: "الشفافية، الدقة، الابتكار، والتعاون المستمر مع جميع الأطراف الأكاديمية.",
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-[#31257D]/5 relative overflow-hidden"
              >
                {/* خلفية متدرجة عند التحويم */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#31257D] to-[#4937BF] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* المحتوى */}
                <div className="relative z-10">
                  {/* شريط علوي أكاديمي */}
                  <div className={`w-12 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mb-4 transition-all duration-300 group-hover:w-16 group-hover:bg-white`}></div>
                  
                  <h3 className="text-xl font-bold text-[#31257D] group-hover:text-white transition-colors duration-300 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4A5568] group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                    {item.desc}
                  </p>
                  
                  {/* خط فاصل */}
                  <div className={`w-full h-px my-4 transition-all duration-300 ${
                    index === 0 ? 'bg-[#31257D]/10 group-hover:bg-white/20' : 
                    index === 1 ? 'bg-[#4937BF]/10 group-hover:bg-white/20' : 
                    'bg-[#31257D]/10 group-hover:bg-white/20'
                  }`}></div>
                  
                  {/* نص أكاديمي إضافي */}
                  <p className="text-xs text-[#718096] group-hover:text-white/60 transition-colors duration-300">
                    {index === 0 && 'نسعى للريادة والتميز'}
                    {index === 1 && 'نلتزم بأعلى المعايير'}
                    {index === 2 && 'قيمنا أساس عملنا'}
                  </p>
                </div>
                
                {/* خط سفلي متحرك */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white to-[#4937BF] transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>
            ))}
          </div>
          
          {/* شريط سفلي بسيط */}
          <div className="mt-16 w-24 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mx-auto"></div>
        </div>
      </div>
    </section>
  );
}