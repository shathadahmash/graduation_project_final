import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import collegeService from "../services/collegeServices";
import { departmentService, Department } from "../services/departmentService";

interface College {
  cid: number;
  name_ar?: string;
  name_en?: string;
  description?: string;
  image?: string;
}

export default function CollegeDetails() {
  const { id } = useParams<{ id: string }>();

  const [college, setCollege] = useState<College | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [collegeData, departmentData] = await Promise.all([
          collegeService.getColleges({ cid: Number(id) }),
          departmentService.getDepartments({ college: Number(id) }),
        ]);

        setCollege(collegeData?.[0] || null);
        setDepartments(departmentData || []);
      } catch (error) {
        console.error("Failed to load college details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!college) return <div className="error">College not found</div>;

  return (
    <div className="college-details">
      {/* College Header */}
      <div className="college-header">
        {college.image && (
          <img
            src={college.image}
            alt={college.name_en || college.name_ar}
            className="college-image"
          />
        )}

        <h1 className="college-title">
          {college.name_en || college.name_ar}
        </h1>
      </div>

      {/* Description */}
      {college.description && (
        <p className="college-description">{college.description}</p>
      )}

      {/* Departments */}
      <section className="departments">
        <h2>Departments</h2>

        {departments.map((dep) => (
          <div key={dep.id} className="department-card">
            <h3>{dep.department_name}</h3>

            {dep.programs?.length > 0 && (
              <ul className="program-list">
                {dep.programs.map((program) => (
                  <li key={program.id}>{program.program_name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}