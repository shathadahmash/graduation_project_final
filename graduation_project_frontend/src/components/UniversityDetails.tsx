import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import universityService from "../services/collegeServices";

interface University {
  id: number;
  name_ar?: string;
  name_en?: string;
  description?: string;
  logo?: string;
}

interface Program {
  id: number;
  program_name: string;
}

export default function UniversityDetails() {
  const { id } = useParams<{ id: string }>();

  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [uniData, programsData] = await Promise.all([
          universityService.getUniversityById(Number(id)),
          universityService.getUniversityPrograms(Number(id)),
        ]);

        setUniversity(uniData);
        setPrograms(programsData || []);
      } catch (error) {
        console.error("Failed to fetch university details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!university) return <div>University not found</div>;

  return (
    <div className="university-details">
      
      {/* Header */}
      <div className="university-header">
        {university.logo && (
          <img
            src={university.logo}
            alt={university.name_en || university.name_ar}
            className="university-logo"
          />
        )}

        <h1>{university.name_en || university.name_ar}</h1>
      </div>

      {/* Description */}
      {university.description && (
        <p className="university-description">
          {university.description}
        </p>
      )}

      {/* Programs */}
      <section className="programs">
        <h2>Programs</h2>

        {programs.length === 0 ? (
          <p>No programs available</p>
        ) : (
          <ul className="program-list">
            {programs.map((program) => (
              <li key={program.id}>{program.program_name}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}