import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#31257D] to-[#4937BF] text-white relative overflow-hidden">
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      {/* عناصر زخرفية */}
      <div className="absolute top-10 right-10 w-32 h-32 border border-white/5 rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 border border-white/5 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-16">
        
        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
          
          {/* القسم الأول - الشعار والوصف */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">YCIT</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">البوابة الموحدة</h3>
                <p className="text-xs text-white/60">لإدارة مشاريع التخرج</p>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed max-w-md">
              منصّة إلكترونية موحدة لإدارة ومتابعة مشاريع التخرج في الجامعات اليمنية، 
              بتقنيات ذكية ومعايير أكاديمية دقيقة.
            </p>
            
            {/* أيقونات التواصل الاجتماعي */}
            <div className="flex gap-3 pt-4">
              {[
                { icon: 'f', href: '#' },
                { icon: 't', href: '#' },
                { icon: 'l', href: '#' },
                { icon: 'y', href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
                >
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* القسم الثاني - روابط سريعة */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-8 h-0.5 bg-white/30 rounded-full"></span>
            </h4>
            
            <ul className="space-y-2">
              {['الرئيسية', 'عن النظام', 'المميزات', 'المستفيدون'].map((item, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* القسم الثالث - تواصل معنا */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-8 h-0.5 bg-white/30 rounded-full"></span>
            </h4>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span dir="ltr">info@yu.edu.ye</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span dir="ltr">+967 123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>صنعاء، اليمن</span>
              </li>
            </ul>
          </div>
        </div>

        {/* خط فاصل */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

        {/* السطر الأخير */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
          <p>© جميع الحقوق محفوظة 2025 | بوابة إدارة مشاريع التخرج</p>
          <p className="mt-2 md:mt-0">
            تصميم وتطوير | 
            <a href="#" className="text-white/80 hover:text-white transition-colors mr-1">
              Y-CIT-HIE
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}