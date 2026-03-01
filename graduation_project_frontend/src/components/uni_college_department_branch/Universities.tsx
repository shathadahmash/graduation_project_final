import React, { useEffect, useState } from "react";
import api from "../../services/api"; // correct relative path

export default function Universities() {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    // use shared axios instance so cookies/CSRF and auth headers are sent
    api
      .get("/universities")
      .then(resp => {
        const data = resp.data;
        if (Array.isArray(data)) {
          setUniversities(data);
        } else if (data && Array.isArray(data.results)) {
          // some paginated endpoints return {results: [...]}
          setUniversities(data.results);
        } else {
          console.warn("unexpected universities response", data);
          setUniversities([]);
        }
      })
      .catch(err => {
        console.error("Failed to load universities", err);
        setUniversities([]);
      });
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