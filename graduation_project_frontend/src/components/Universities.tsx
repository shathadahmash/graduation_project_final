import React, { useEffect, useState } from "react";

export default function Universities() {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    // Replace this with your real backend API
    fetch("/api/universities")
      .then(res => res.json())
      .then(data => setUniversities(data))
      .catch(() => console.log("Failed to load universities"));
  }, []);

  return (
    <section className="py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-14">الجامعات المشاركة</h2>

      <div className="container mx-auto flex flex-wrap justify-center gap-12 px-6">
        {universities.map((u, idx) => (
          <div key={idx} className="text-center w-40">
            <img src={u.logo} alt={u.name} className="w-40 h-40 object-contain" />
            <p className="mt-3 font-semibold">{u.uname}</p>
          </div>
        ))}
      </div>
    </section>
  );
}