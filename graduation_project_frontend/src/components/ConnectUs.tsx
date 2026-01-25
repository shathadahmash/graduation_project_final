
import React from "react";

export default function ConnectUs() {
  return (
    <section className="py-20 bg-[#F7F8FA]">
      <h2 className="text-3xl font-bold text-center mb-10">تواصل معنا</h2>

      <div className="container mx-auto flex flex-col md:flex-row gap-10 px-6 items-center">

        <div className="md:w-1/2">
          <img 
            src="/contact-illustration.png"
            alt="contact"
            className="w-full h-auto"
          />
        </div>

        <form className="md:w-1/2 grid grid-cols-2 gap-6">
          <input type="text" placeholder="الاسم الأول" className="border rounded-lg p-3" />
          <input type="text" placeholder="الاسم الثاني" className="border rounded-lg p-3" />
          <input type="email" placeholder="الإيميل" className="col-span-2 border rounded-lg p-3" />
          <textarea placeholder="الرسالة" className="col-span-2 border rounded-lg p-3 h-32"></textarea>

          <button className="bg-[#0E4C92] text-white py-3 rounded-lg col-span-2">
            إرسال
          </button>
        </form>

      </div>
    </section>
  );
}
