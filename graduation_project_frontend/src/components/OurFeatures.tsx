import React from "react";

const features = [
  { title: "لوحات تحكم تفاعلية", desc: "إحصائيات وإدارة فعّالة عبر لوحات التحكم والتقارير.", icon: "/f1.png" },
  { title: "أتمتة تكوين المجموعات", desc: "نظام ذكي لإنشاء مجموعات الطلاب بشكل تلقائي.", icon: "/f2.png" },
  { title: "سلاسل موافقة ذكية", desc: "إدارة وموافقة المشاريع عبر مسارات اعتماد لكل قسم.", icon: "/f3.png" },
  { title: "أرشيف بحث متقدم", desc: "أرشيف بحث متقدم للوصول السريع لمشاريع السنوات السابقة.", icon: "/f4.png" },
];

export default function OurFeatures() {
  return (
    <section className="py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">مميزاتنا</h2>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">

        {features.map((f, i) => (
          <div key={i} className="bg-[#0E4C92] text-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <img src={f.icon} alt="" className="w-12 h-12" />
              <h3 className="text-xl font-bold">{f.title}</h3>
            </div>
            <p className="mt-4 leading-7">{f.desc}</p>
          </div>
        ))}

      </div>
    </section>
  );
}