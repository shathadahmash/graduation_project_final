import React, { useState } from "react";

export default function ConnectUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0 bg-[#F8FAFC]"></div>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
      
      {/* عناصر زخرفية خفيفة */}
      <div className="absolute top-20 right-20 w-64 h-64 border-2 border-[#31257D]/5 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 border-2 border-[#4937BF]/5 rounded-full"></div>
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* عنوان أكاديمي */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-[#31257D] relative z-10">
              تواصل معنا
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full"></div>
          </div>
          <p className="text-[#4A5568] mt-4 max-w-2xl mx-auto">
            نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت
          </p>
        </div>

        <div className="flex flex-col items-center">
          
          {/* معلومات الاتصال السريعة - في الأعلى */}
          {/* <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12 max-w-2xl">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto bg-[#31257D]/5 rounded-full flex items-center justify-center group-hover:bg-[#31257D] transition-all duration-300 mb-3">
                <svg className="w-5 h-5 text-[#31257D] group-hover:text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#4A5568] group-hover:text-[#31257D] transition-colors font-medium">info@yu.edu.ye</p>
              <p className="text-xs text-[#718096]">البريد الإلكتروني</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto bg-[#31257D]/5 rounded-full flex items-center justify-center group-hover:bg-[#31257D] transition-all duration-300 mb-3">
                <svg className="w-5 h-5 text-[#31257D] group-hover:text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-sm text-[#4A5568] group-hover:text-[#31257D] transition-colors font-medium" dir="ltr">+967 123 456 789</p>
              <p className="text-xs text-[#718096]">رقم الهاتف</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto bg-[#31257D]/5 rounded-full flex items-center justify-center group-hover:bg-[#31257D] transition-all duration-300 mb-3">
                <svg className="w-5 h-5 text-[#31257D] group-hover:text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#4A5568] group-hover:text-[#31257D] transition-colors font-medium">صنعاء، اليمن</p>
              <p className="text-xs text-[#718096]">العنوان</p>
            </div>
          </div> */}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 space-y-6">
            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white transition-all duration-300 outline-none ${
                    focusedField === 'firstName' 
                      ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                      : 'border-gray-200 hover:border-[#31257D]/30'
                  }`}
                  placeholder="الاسم الأول"
                  required
                />
                {focusedField === 'firstName' && (
                  <span className="absolute -top-2 right-3 text-xs bg-white px-2 text-[#31257D]">الاسم الأول</span>
                )}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white transition-all duration-300 outline-none ${
                    focusedField === 'lastName' 
                      ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                      : 'border-gray-200 hover:border-[#31257D]/30'
                  }`}
                  placeholder="الاسم الثاني"
                />
                {focusedField === 'lastName' && (
                  <span className="absolute -top-2 right-3 text-xs bg-white px-2 text-[#31257D]">الاسم الثاني</span>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border rounded-lg bg-white transition-all duration-300 outline-none ${
                  focusedField === 'email' 
                    ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                    : 'border-gray-200 hover:border-[#31257D]/30'
                }`}
                placeholder="البريد الإلكتروني"
                required
              />
              {focusedField === 'email' && (
                <span className="absolute -top-2 right-3 text-xs bg-white px-2 text-[#31257D]">البريد الإلكتروني</span>
              )}
            </div>

            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg bg-white transition-all duration-300 outline-none resize-none ${
                  focusedField === 'message' 
                    ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                    : 'border-gray-200 hover:border-[#31257D]/30'
                }`}
                placeholder="رسالتك..."
                required
              />
              {focusedField === 'message' && (
                <span className="absolute -top-2 right-3 text-xs bg-white px-2 text-[#31257D]">الرسالة</span>
              )}
            </div>

            <button
              type="submit"
              className="group relative w-full px-6 py-4 bg-gradient-to-r from-[#31257D] to-[#4937BF] text-white text-lg rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                إرسال الرسالة
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </button>

            <p className="text-xs text-center text-[#A0AEC0]">
              سنتواصل معك في أقرب وقت ممكن
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}