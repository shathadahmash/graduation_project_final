import api from './api';
import { bulkFetch } from './bulkService';
import { groupService } from './groupService';

// Basic supervisor interface
export interface Supervisor {
  id: number;
  name: string;
}

export interface GroupMember {
  user: number;
  user_detail?: {
    id?: number;
    name?: string;
    username?: string;
  };
}

export interface Group {
  group_id: number;
  members: GroupMember[];
  supervisors?: any[];
  members_count?: number;
}
export interface Project {
  project_id?: number;

  title: string;
  description: string;
  project_type?: string;

  groups?: Group[];

  members?: { id: number; name?: string }[];

  state?: number;
  state_name?: string;

  start_date?: number;
  end_date?: number;

  field?: string | null;
  tools?: string | null;

  logo?: string | null;
  documentation_path?: string | null;

  // 🔹 IDs (used for filtering & grouping)
  university_id?: number | null;
  college_id?: number | null;
  department_id?: number | null;
  program_id?: number | null;

  // 🔹 Names (used for display)
  university_name?: string | null;
  college_name?: string | null;
  department_name?: string | null;
  program_name?: string | null;
  branch_name?: string | null;

  supervisor_name?: string | null;
  co_supervisor_name?: string | null;

  created_by?: any;
}

function mapBackendProject(raw: any): Project {
  const creator = raw.created_by || null;

  const groups = raw.groups || [];

  const members =
    groups.flatMap((g: any) =>
      (g.members || []).map((m: any) => ({
        id: m.user,
        name: m.user_detail?.name || m.user_detail?.username,
      }))
    ) || [];

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

    logo: raw.logo_url ?? null,
    documentation_path: raw.documentation_url ?? null,

    // 🔹 IDs (important for filtering and grouping)
    university_id: raw.university_id ?? null,
    college_id: raw.college_id ?? null,
    department_id: raw.department_id ?? null,
    program_id: raw.program_id ?? null,

    // 🔹 Display names
    university_name: raw.university_name ?? null,
    college_name: raw.college_name ?? null,
    department_name: raw.department_name ?? null,
    program_name: raw.program_name ?? null,
    branch_name: raw.branch_name ?? null,

    supervisor_name: raw.supervisor_name ?? "لا يوجد مشرف",
    co_supervisor_name: raw.co_supervisor_name ?? "لا يوجد مشرف مساعد",

    groups: groups,
    members: members,

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

//   async getProjectGroups(projectId: number) {
//   try {
//     const response = await api.get(`/groups/?project=${projectId}`);
//     console.log("[projectService] project groups:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("[projectService] getProjectGroups failed:", error);
//     return [];
//   }
// },

  async getFilterOptions() {
    try {
      const response = await api.get('/projects/filter-options/');
      return response.data;
    } catch (error) {
      console.error('[projectService] getFilterOptions failed:', error);
      return { colleges: [], supervisors: [], years: [], states: [], tools: [], fields: [] };
    }
  },
// داخل projectService
async getProjectGroups(projectId: number) {
  try {
    // المسار الصحيح: /groups/?project=projectId
    // هذا سيجلب فقط المجموعات المرتبطة بهذا المشروع المحدد
    const response = await api.get('/groups/', {
      params: { project: projectId }  // التأكد من استخدام 'project' كمفتاح params
    });
    
    console.log(`[projectService] جلب مجموعات المشروع ${projectId}:`, response.data);
    
    // التعامل مع هيكل البيانات
    // قد يكون response.data مباشرة أو response.data.results
    const groupsData = response.data?.results || response.data;
    
    // التحقق من أن البيانات مصفوفة
    if (Array.isArray(groupsData)) {
      return groupsData;
    }
    
    console.warn('[projectService] البيانات المستلمة ليست مصفوفة:', groupsData);
    return [];
  } catch (error: any) {
    console.error(`[projectService] فشل جلب مجموعات المشروع ${projectId}:`, error?.response?.data || error);
    
    // محاولة مسار بديل إذا فشل الأول
    try {
      console.log('[projectService] محاولة مسار بديل...');
      const fallbackResponse = await api.get(`/projects/${projectId}/groups/`);
      const fallbackData = fallbackResponse.data?.results || fallbackResponse.data;
      return Array.isArray(fallbackData) ? fallbackData : [];
    } catch (fallbackError) {
      console.error('[projectService] فشل المسار البديل:', fallbackError);
      return [];
    }
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

async getCollegeProjects(collegeId: number) {
  try {
    const response = await api.get('/projects/', {
      params: { college_id: collegeId }
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return data.map(mapBackendProject);
  } catch (error) {
    console.error('getCollegeProjects failed', error);
    return [];
  }
},

async getDepartmentProjects(departmentId: number) {
  try {
    const response = await api.get('/projects/', {
      params: { department_id: departmentId }
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return data.map(mapBackendProject);
  } catch (error) {
    console.error('getDepartmentProjects failed', error);
    return [];
  }
},

async getProgramProjects(programId: number) {
  try {
    const response = await api.get('/projects/', {
      params: { program_id: programId }
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return data.map(mapBackendProject);
  } catch (error) {
    console.error('getProgramProjects failed', error);
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