import api from './api';
import { bulkFetch } from './bulkService';
import { groupService } from './groupService';

export interface Project {
  project_id?: number;
  title: string;
  description: string;
  start_date?: number; // YEAR only
  end_date?: number;   // YEAR only
  field?: string;
  tools?: string;
  logo?: string;
  college?: string;
  university?: string;
  supervisor_name?: string;
  co_supervisor_name?: string | null;
  created_by?: { id: number; name: string } | null;
}

// Map backend project response to frontend Project type
function mapBackendProject(raw: any): Project {
  return {
    project_id: raw.project_id,
    title: raw.title,
    description: raw.description,
    start_date: raw.start_date ?? undefined, // use backend value directly
    end_date: raw.end_date ?? undefined,     // use backend value directly
    field: raw.field ?? '',
    tools: raw.tools ?? '',
    logo: raw.Logo ?? '',
    college: raw.college_name ?? '',
    university: raw.university_name ?? '',
    supervisor_name: raw.supervisor_name ?? 'لا يوجد مشرف',
    co_supervisor_name: raw.co_supervisor_name ?? null,
    created_by: raw.created_by
      ? { id: raw.created_by.id, name: raw.created_by.name }
      : null,
  };
}

export const projectService = {
  async getProjects(params?: any) {
    try {
      const response = await api.get('projects/', { params });
      console.log('[projectService] getProjects response:', response.data);
      return (response.data as any[]).map(mapBackendProject);
    } catch (error: any) {
      console.error(
        '[projectService] getProjects failed:',
        error?.response?.data ?? error
      );
      return [];
    }
  },

  async getProjectById(projectId: number) {
    try {
      const response = await api.get(`/projects/${projectId}/`);
      return mapBackendProject(response.data);
    } catch (error) {
      console.error('[projectService] getProjectById failed:', error);
      throw error;
    }
  },

  async getFilterOptions() {
    try {
      const response = await api.get('/projects/filter-options/');
      return response.data;
    } catch (error) {
      console.error('[projectService] getFilterOptions failed:', error);
      return { colleges: [], supervisors: [], years: [] };
    }
  },

  async searchProjects(query: string, params?: any) {
    try {
      const response = await api.get('/projects/search/', {
        params: { q: query, ...params },
      });
      return (response.data as any[]).map(mapBackendProject);
    } catch (error) {
      console.error('[projectService] searchProjects failed:', error);
      return [];
    }
  },

  async proposeProject(payload: Partial<Project>) {
    // Ensure start_date is set to current year if missing
    if (!payload.start_date) payload.start_date = new Date().getFullYear();

    try {
      const resp = await api.post('/projects/propose-project/', payload);
      return mapBackendProject(resp.data);
    } catch (err: any) {
      console.warn(
        '[projectService] propose-project failed, falling back to POST /projects/',
        err?.response?.data ?? err.message
      );
      const resp2 = await api.post('/projects/', payload);
      return mapBackendProject(resp2.data);
    }
  },

  async updateProject(projectId: number, payload: Partial<Project>) {
    try {
      const response = await api.patch(
        `/projects/${projectId}/update_project/`,
        payload
      );
      return mapBackendProject(response.data);
    } catch (error) {
      console.error('[projectService] updateProject failed:', error);
      throw error;
    }
  },

  async deleteProject(projectId: number) {
    try {
      const response = await api.delete(
        `/projects/${projectId}/delete_project/`
      );
      return response.data;
    } catch (error) {
      console.error('[projectService] deleteProject failed:', error);
      throw error;
    }
  },

  async downloadProjectFile(projectId: number) {
    try {
      const response = await api.get(`/projects/${projectId}/download-file/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project_${projectId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[projectService] downloadProjectFile failed:', error);
      throw error;
    }
  },

  async getProjectsWithGroups(fields?: string[]) {
    const req = [
      {
        table: 'projects',
        fields:
          fields ||
          [
            'project_id',
            'title',
            'description',
            'start_date',
            'end_date',
            'field',
            'tools',
            'created_by',
            'Logo',
            'Documentation_Path',
            'college',
            'department',
          ],
      },
      { table: 'groups', fields: ['group_id', 'group_name', 'project', 'department', 'program', 'academic_year'] },
      { table: 'group_members', fields: ['id', 'user', 'group'] },
      { table: 'group_supervisors', fields: ['id', 'user', 'group', 'type'] },
      { table: 'users', fields: ['id', 'first_name', 'last_name', 'name'] },
      { table: 'colleges', fields: ['cid', 'name_ar', 'branch'] },
      { table: 'departments', fields: ['department_id', 'name', 'college'] },
      { table: 'universities', fields: ['uid', 'uname_ar', 'uname_en', 'type'] },
      { table: 'groupprogram', fields: ['id', 'group', 'program', 'program_name', 'department_name', 'college_name', 'university_name', 'program_id'] },
      { table: 'program_groups', fields: ['id', 'program', 'group', 'program_id', 'program_name'] },
      { table: 'programs', fields: ['id', 'p_name', 'name', 'department_id'] },
    ];
    const data = await bulkFetch(req);
    return data;
  },
};