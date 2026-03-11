import api from './api';
import { bulkFetch } from './bulkService';
import { groupService } from './groupService';

// Basic supervisor interface
export interface Supervisor {
  id: number;
  name: string;
}

export interface Project {
  members?: { id: number; name?: string; CID?: string | null }[];
  project_id?: number;

  title: string;
  description: string;

  state?: number;
  state_name?: string;

  start_date?: number;
  end_date?: number;

  field?: string | null;
  tools?: string | null;

  logo?: string | null;
  documentation_path?: string | null;

  college_name?: string | null;
  university_name?: string | null;

  supervisor_name?: string | null;
  co_supervisor_name?: string | null;

  created_by?: {
    id: number;
    username?: string;

    first_name?: string;
    last_name?: string;
    name?: string;

    email?: string | null;
    phone?: string | null;
    gender?: string | null;
    CID?: string | null;

    roles?: {
      role__role_ID?: number;
      role__type?: string;
    }[];

    staff_profiles?: {
      staff_id?: number;

      role?: string;
      Qualification?: string;
      Office_Hours?: string;

      user?: {
        id?: number;
        name?: string;
      };
    }[];
  } | null;
}

function mapBackendProject(raw: any): Project {
  const creator = raw.created_by || null;

  const role =
    creator?.roles?.length > 0
      ? creator.roles[0]?.role__type
      : null;

  const qualification =
    creator?.staff_profiles?.length > 0
      ? creator.staff_profiles[0]?.Qualification
      : null;

  return {
    project_id: raw.project_id,
    title: raw.title,
    description: raw.description,
    project_type: raw.project_type,
    state: raw.state,
    state_name: raw.state_name,
    start_date: raw.start_date ?? undefined,
    end_date: raw.end_date ?? undefined,
    field: raw.field ?? null,
    tools: raw.tools ?? null,

    // 🔹 Use the correct backend keys
    logo: raw.logo_url ?? null,
    documentation_path: raw.documentation_url ?? null,

    college_name: raw.college_name ?? null,
    university_name: raw.university_name ?? null,
    branch_name: raw.branch_name ?? null,

    supervisor_name: raw.supervisor_name ?? 'لا يوجد مشرف',
    co_supervisor_name: raw.co_supervisor_name ?? 'لا يوجد مشرف مساعد',

    role: role,
    qualification: qualification,

    created_by: creator
      ? {
          id: creator.id,
          username: creator.username,
          first_name: creator.first_name,
          last_name: creator.last_name,
          name: creator.name,
          email: creator.email ?? null,
          phone: creator.phone ?? null,
          gender: creator.gender ?? null,
          CID: creator.CID ?? null,
          role: role,
          qualification: qualification,
        }
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
  async getProjectGroups(projectId: number) {
  try {
    const response = await api.get(`/groups/?project=${projectId}`);
    console.log("[projectService] project groups:", response.data);
    return response.data;
  } catch (error) {
    console.error("[projectService] getProjectGroups failed:", error);
    return [];
  }
},

  async getFilterOptions() {
    try {
      const response = await api.get('/projects/filter-options/');
      return response.data;
    } catch (error) {
      console.error('[projectService] getFilterOptions failed:', error);
      return { colleges: [], supervisors: [], years: [], states: [], tools: [], fields: [] };
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

  async getSupervisors(): Promise<Supervisor[]> {
    const res = await api.get('/users');

    const supervisors = res.data.filter((user: any) =>
      user.roles.some((role: any) => role.role__type === "Supervisor")
    );

    console.log("Fetched supervisors:", supervisors);
    return supervisors;
  },

  async getCoSupervisors(): Promise<Supervisor[]> {
    const res = await api.get('/users');

    const coSupervisors = res.data.filter((user: any) =>
      user.roles.some((role: any) => role.role__type === "Co-Supervisor")
    );

    console.log("Fetched co-supervisors:", coSupervisors);
    return coSupervisors;
  },


  async updateGroup(
    groupId: number,
    supervisors: { user: number; type: "supervisor" | "co_supervisor" }[]
  ) {
    const res = await api.put(`/groups/${groupId}/`, {
      supervisors: supervisors,
    });

    return res.data;
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
      const backendPayload: any = {
        title: payload.title,
        description: payload.description,
        start_date: payload.start_date ?? undefined,
        end_date: payload.end_date ?? undefined,
        field: payload.field ?? null,
        tools: payload.tools ?? null,
        Logo: payload.logo ?? null,
        Documentation_Path: payload.documentation_path ?? null,
        state: payload.state ?? undefined,
        created_by_id: payload.created_by?.id ?? undefined,
      };

      const response = await api.patch(
        `/projects/${projectId}/update_project/`,
        backendPayload
      );

      return mapBackendProject(response.data);
    } catch (error: any) {
      console.error('[projectService] updateProject failed:', error?.response?.data ?? error);
      throw error;
    }
  },

  async deleteProject(projectId: number) {
    try {
      await api.delete(`/projects/${projectId}/delete_project/`);
      return { success: true, message: "Project deleted successfully" };
    } catch (error: any) {
      console.error('[projectService] deleteProject failed:', error?.response?.data ?? error);
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
  // Add this inside projectService
 async getUniversityProjects(universityId: number) {
  try {
    const response = await api.get('/projects/', {
      params: { university: universityId }  // <-- filter by university
    });
    return (response.data as any[]).map(mapBackendProject);
  } catch (error) {
    console.error('[projectService] getUniversityProjects failed', error);
    return [];
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
      { table: 'groups', fields: ['group_id', 'project', 'department', 'program', 'academic_year'] },
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