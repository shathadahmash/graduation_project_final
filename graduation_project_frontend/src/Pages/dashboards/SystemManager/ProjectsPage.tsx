import React from 'react';
import ProjectTable from '../../../components/ProjectTable';

const ProjectsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">المشاريع</h2>
      <ProjectTable />
    </div>
  );
};

export default ProjectsPage;
