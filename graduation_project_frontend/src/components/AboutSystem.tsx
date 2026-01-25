
import React from "react";

export default function AboutSystem() {
  return (
    <section className="about-system py-20 bg-[#0E4C92] text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-10 px-6">

        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-bold">عن النظام</h2>
          <p className="leading-8 text-lg">
            نظام إدارة مشاريع التخرج للجامعات اليمنية هو منصة متكاملة 
            لإدارة ومتابعة مشاريع التخرج، بدءاً من تقديم الفكرة، اعتمادها، 
            تشكيل اللجان، استعراض التقدم، تسليم المشروع، وصولاً إلى 
            التقييم النهائي.
          </p>
        </div>

        <div className="md:w-1/2">
          <img 
            src="/about-system.jpg"
            alt="About system"
            className="rounded-lg w-full h-auto shadow-lg"
          />
        </div>

      </div>
    </section>
  );
}
