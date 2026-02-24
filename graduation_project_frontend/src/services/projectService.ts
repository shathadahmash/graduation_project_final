import api from './api';
import { bulkFetch } from './bulkService';
import { groupService } from './groupService';


export interface Project {
  project_id?: number; // optional when creating
  title: string;
  type: string; // must match backend choices
  state?: string;
  description: string;
  start_date?: string; // required, format: YYYY-MM-DD
  supervisor?: { name: string; id: number };
  supervisor_id?: number; // if backend expects an ID
  college?: string;
  year?: string;
  logo?: string;
}

export const projectService = {
  async getProjects(params?: any) {
    console.log('[projectService] getProjects called with params:', params);
    try {
      const response = await api.get('projects/', { params });
      console.log('[projectService] getProjects response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[projectService] Failed to fetch projects:', error?.response?.status, error?.response?.data ?? error?.message ?? error);
      return [];
    }
  },

  async getProject() {
    console.log('[projectService] getProject called');
    try {
      const response = await api.get('projects/');
      console.log('[projectService] getProject response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[projectService] Failed to fetch projects (getProject):', error?.response?.status, error?.response?.data ?? error?.message ?? error);
      return [];
    }
  },

  async getProjectById(projectId: number) {
    try {
      const response = await api.get(`/projects/${projectId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },

  async getFilterOptions() {
    try {
      const response = await api.get('/projects/filter-options/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      return { colleges: [], supervisors: [], years: [] };
    }
  },

  async searchProjects(query: string, params?: any) {
    try {
      const response = await api.get('/projects/search/', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search projects:', error);
      return [];
    }
  },

  async proposeProject(payload: Project) {
    // Provide sensible defaults for missing required fields
    if (!payload.start_date) {
      // default to today's date in YYYY-MM-DD
      payload.start_date = new Date().toISOString().slice(0, 10);
    }
    if (!payload.type) {
      payload.type = 'PrivateCompany';
    }

    // Prefer the custom 'propose' action if available on backend, fall back to standard create
    try {
      console.log('[projectService] proposeProject -> trying /projects/propose/ with payload:', payload);
      const resp = await api.post('/projects/propose/', payload);
      console.log('[projectService] proposeProject response (propose):', resp.status, resp.data);
      return resp.data;
    } catch (err: any) {
      console.warn('[projectService] /projects/propose/ failed, falling back to POST /projects/', err?.response?.status, err?.response?.data ?? err?.message ?? err);
      try {
        const resp2 = await api.post('/projects/', payload);
        console.log('[projectService] proposeProject response (create):', resp2.status, resp2.data);
        return resp2.data;
      } catch (err2: any) {
        console.error('[projectService] Failed to propose/create project:', err2?.response?.status, err2?.response?.data ?? err2?.message ?? err2);
        throw err2;
      }
    }
  },

  async updateProject(projectId: number, payload: Partial<Project>) {
    try {
      const response = await api.patch(`/projects/${projectId}/update_project/`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },

  async deleteProject(projectId: number) {
    try {
      const response = await api.delete(`/projects/${projectId}/delete_project/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete project:', error);
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
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  },


async proposeAndLinkProject(payload: Project) {
    // 1. ضمان وجود تاريخ البدء كما يطلبه الموديل (YYYY-MM-DD)
    if (!payload.start_date) {
      payload.start_date = new Date().toISOString().slice(0, 10);
    }

    // 2. تجهيز البيانات لتطابق خيارات الباك إيند (شغل نظيف)
    const cleanPayload = {
      ...payload,
      type: 'ProposedProject', // مطابقة لـ TYPE_CHOICES في Django
      state: 'Pending'         // مطابقة لـ STATE_CHOICES في Django
    };

    try {
      console.log('[projectService] Sending to -> /projects/propose-project/ :', cleanPayload);
      
      // 3. الطلب للرابط الجديد في الباك إيند
      const resp = await api.post('/projects/propose-project/', cleanPayload);
      
      console.log('[projectService] Success:', resp.data);
      return resp.data;
    } catch (err: any) {
      console.error('[projectService] Failed in proposeAndLinkProject:', err?.response?.data || err.message);
      throw err;
    }
  },


  async getProjectsWithGroups(fields?: string[]) {
    const req = [
      { table: 'projects', fields: fields || ['project_id', 'title', 'type', 'state', 'start_date', 'end_date', 'description', 'field', 'tools', 'created_by', 'Logo', 'Documentation_Path', 'college', 'department'] },
      { table: 'groups', fields: ['group_id', 'group_name', 'project', 'department'] },
      { table: 'group_members', fields: ['id', 'user', 'group'] },
      { table: 'group_supervisors', fields: ['id', 'user', 'group', 'type'] },
      { table: 'users', fields: ['id', 'first_name', 'last_name', 'name'] },
      { table: 'colleges', fields: ['cid', 'name_ar'] },
      { table: 'departments', fields: ['department_id', 'name', 'college'] },
    ];

    console.log('[projectService] getProjectsWithGroups request:', JSON.stringify(req));
    const data = await bulkFetch(req);
    console.log('[projectService] getProjectsWithGroups response keys:', Object.keys(data));
    return data;
  },
};


