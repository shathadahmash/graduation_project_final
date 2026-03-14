import React, { useState } from "react";
import SearchBar from "../components/SearchBar";

const ProjectsPage = () => {

  const [search, setSearch] = useState("");

  const projects = [
    { id: 1, title: "Smart Hospital System" },
    { id: 2, title: "AI Chatbot" },
    { id: 3, title: "E-Learning Platform" },
  ];

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن مشروع..."
        />
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            {project.title}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProjectsPage;