
import React from "react";
const users = [
  {
    title: "الطلاب",
    desc: "يستفيد الطلاب من نظام متكامل لإدارة وتسليم مشاريع التخرج.",
    img: "/students.jpg"
  },
  {
    title: "المشرفون",
    desc: "يشرف المشرفون على تقدم المشاريع وتقييمها داخل النظام.",
    img: "/teachers.jpg"
  },
  {
    title: "رئيس الأقسام",
    desc: "إدارة المشاريع داخل الأقسام والموافقة على الفرق وموضوعات المشاريع.",
    img: "/heads.jpg"
  },
  {
    title: "مديرو النظام",
    desc: "إدارة إعدادات النظام والتحكم بالصلاحيات.",
    img: "/admins.jpg"
  },
  {
    title: "الشركات والجهات الخارجية",
    desc: "تقديم مشاكل حقيقية للطلاب لتطوير مشاريع تخدم سوق العمل.",
    img: "/companies.jpg"
  },
  {
    title: "رؤساء الجامعات",
    desc: "متابعة شاملة لأداء الجامعات والأقسام داخل النظام.",
    img: "/universities.jpg"
  }
];

export default function Users() {
  return (
    <section className="py-20 bg-[#0E4C92] text-white">
      <h2 className="text-3xl font-bold text-center mb-10">المستفيدين</h2>

      <div className="container mx-auto grid md:grid-cols-3 grid-cols-1 gap-10 px-6">

        {users.map((u, idx) => (
          <div key={idx} className="bg-white text-black rounded-xl shadow-lg overflow-hidden">
            <img src={u.img} alt="" className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{u.title}</h3>
              <p className="leading-7">{u.desc}</p>
            </div>
          </div>
        ))}

      </div>

      <div className="mt-10 text-center">
        <a href="#" className="underline text-white text-lg">عرض المزيد</a>
      </div>
    </section>
  );
}
