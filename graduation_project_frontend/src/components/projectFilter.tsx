// projectFilter.ts
import { Project } from './types'; // optionally extract Project type to a shared file

export interface Filters {
  project_university?: string;
  college?: string;
  department?: string;
  year?: string;
  field?: string;
  tools?: string;
  supervisor?: string;
  co_supervisor?: string;
  project_type?: string;
  searchQuery?: string;
}

// Function to filter projects locally (if you already have projects loaded)
export const filterProjects = (projects: Project[], filters: Filters): Project[] => {
  return projects.filter(p => {
    if (filters.project_university && p.university_name !== filters.project_university) return false;
    if (filters.college && p.college_name !== filters.college) return false;
    if (filters.department && p.department_name !== filters.department) return false;
    if (filters.year && !p.start_date.toString().startsWith(filters.year)) return false;
    if (filters.field && p.field !== filters.field) return false;
    if (filters.tools && !p.tools.includes(filters.tools)) return false;
    if (filters.supervisor && p.supervisor_name !== filters.supervisor) return false;
    if (filters.co_supervisor && p.co_supervisor_name !== filters.co_supervisor) return false;
    if (filters.project_type && p.project_type !== filters.project_type) return false;
    if (filters.searchQuery && !p.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });
};