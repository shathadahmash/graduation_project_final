// projectApi.ts
import { projectService } from '../services/projectService';
import { Filters } from './projectFilter';

export const getFilteredProjects = async (filters: Filters) => {
  const params: any = { limit: 50 };
  if (filters.project_university) params.project_university = Number(filters.project_university);
  if (filters.college) params.college = Number(filters.college);
  if (filters.department) params.department = Number(filters.department);
  if (filters.year) params.year = filters.year;
  if (filters.field) params.field = filters.field;
  if (filters.tools) params.tools = filters.tools;
  if (filters.supervisor) params.supervisor = filters.supervisor;
  if (filters.co_supervisor) params.co_supervisor = filters.co_supervisor;
  if (filters.project_type) params.project_type = filters.project_type;
  if (filters.searchQuery) params.search = filters.searchQuery.trim();

  const response = await projectService.getPublicProjects(params);
  return Array.isArray(response) ? response : response?.results || response?.data || [];
};