// src/services/groupService.ts
import api from './api';

// --- Interfaces ---

// Department interface
export interface Department {
  id: number;
  name: string;
}

// Basic student interface
export interface Student {
  id: number;
  name: string;
}

// Basic supervisor interface
export interface Supervisor {
  id: number;
  name: string;
}

// --- Normalized group-related interfaces ---

export interface GroupMember {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string;
  roles: string[];
  staff_profiles: {
    id: number;
    role: string;
    qualification: string;
    office_hours: string;
  }[];
}

export interface NormalizedGroupDetails {
  group_id: number;
  group_name: string;
  project_id: number;
  project_detail: {
    project_id: number;
    title: string;
    state: string;
    [key: string]: any;
  };
  members: GroupMember[];
  supervisors: GroupMember[];
  co_supervisors: GroupMember[];
  members_count: number;
  department: { id?: number; name?: string;[key: string]: any } | number | null;
  program: { pid?: number; p_name?: string; department_id?: number;[key: string]: any } | null;
  academic_year: string;
}

export interface GroupCreatePayload {
  group_name: string;
  department_id: number;
  college_id: number;
  student_ids: number[];
  supervisor_ids: number[];
  co_supervisor_ids: number[];
  note?: string;
}

export interface GroupDetailsResponse {
  id: number;
  students: any[];
}

// --- Normalization helper ---
function normalizeGroupMember(raw: any): GroupMember {
  const user = raw.user_detail || {};
  const roles = (user.roles || []).map((r: any) => r.role__type);
  const staff_profiles = (user.staff_profiles || []).map((sp: any) => ({
    id: sp.staff_id,
    role: sp.role,
    qualification: sp.Qualification,
    office_hours: sp.Office_Hours
  }));

  return {
    id: user.id,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    gender: user.gender || undefined,
    roles,
    staff_profiles
  };
}

// --- Group Service ---
export const groupService = {

  // --- Dropdowns / Basic Data ---
  async getDropdownData(): Promise<{ students: Student[]; supervisors: Supervisor[]; assistants: Supervisor[] }> {
    const res = await api.get('/dropdown-data/');
    return res.data;
  },

  async getDepartments(): Promise<Department[]> {
    const res = await api.get('/dropdown-data/departments/');
    console.log('Fetched departments:', res.data);
    return res.data;
  },

  async getStudents(departmentId: number): Promise<Student[]> {
    const res = await api.get(`/students/?department_id=${departmentId}`);
    return res.data;
  },

  async getSupervisors(): Promise<Supervisor[]> {
    const res = await api.get('/supervisors/');
    return res.data;
  },

  async getCoSupervisors(): Promise<Supervisor[]> {
    const res = await api.get('/co-supervisors/');
    return res.data;
  },

  // --- Group CRUD ---
  async createGroupForApproval(payload: GroupCreatePayload): Promise<{ group_id: number }> {
    const res = await api.post('/groups/', payload);
    return res.data;
  },

  async createGroupAsSupervisor(payload: GroupCreatePayload): Promise<any> {
    const res = await api.post('/groups/', { ...payload, created_by_role: 'supervisor' });
    return res.data;
  },

  async updateGroup(groupId: number, data: any) {
    const response = await api.put(`/groups/${groupId}/`, data);
    return response.data;
  },

  async deleteGroupMember(groupId: number, memberId: number) {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}/`);
    return response.data;
  },

  async linkProjectToGroup(groupId: number, projectId: number) {
    const res = await api.post(`/groups/${groupId}/link-project/`, { project_id: projectId });
    return res.data;
  },

  // --- Fetch Groups ---
  async getGroups() {
    const response = await api.get('/groups/');
    console.log('Fetched groups:', response.data);
    return response.data;
  },

  async getGroupsFields(fields?: string[]) {
    const { fetchTableFields } = await import('./bulkService');
    const rows = await fetchTableFields('groups', fields);
    return rows;
  },

  async getGroupById(groupId: number) {
    const response = await api.get(`/groups/${groupId}/`);
    return response.data;
  },

  async getGroupDetails(groupId: number): Promise<NormalizedGroupDetails | null> {
    const raw = await this.getGroupById(groupId);

    if (!raw) return null;

    const normalized: NormalizedGroupDetails = {
      group_id: raw.group_id || raw.id,
      group_name: raw.group_name,
      project_id: raw.project || raw.project_id,
      project_detail: raw.project_detail || { project_id: raw.project || raw.project_id, title: '', state: '' },
      members: (raw.members || []).map(normalizeGroupMember),
      supervisors: (raw.supervisors || []).filter((s: any) => s.type !== 'co_supervisor').map(normalizeGroupMember),
      co_supervisors: (raw.supervisors || []).filter((s: any) => s.type === 'co_supervisor').map(normalizeGroupMember),
      members_count: raw.members_count || (raw.members || []).length,
      department: raw.department || null,
      program: raw.program || null,
      academic_year: raw.academic_year || ''
    };

    return normalized;
  },

  async getMyGroup(): Promise<NormalizedGroupDetails | null> {
    try {
      const raw = await api.get('/groups/my-group/');
      if (!raw.data) return null;
      return this.getGroupDetails(raw.data.group_id);
    } catch (error: any) {
      if (error.response && error.response.status === 404) return null;
      throw error;
    }
  },

  async getCollegeGroups(collegeId: number): Promise<NormalizedGroupDetails[]> {
    const res = await api.get(`/groups/?college_id=${collegeId}`);
    const groups = Array.isArray(res.data) ? res.data : (res.data.results || []);
    return Promise.all(groups.map((g: any) => this.getGroupDetails(g.group_id)));
  },

  // --- Invitations ---
  async acceptInvitation(invitationId: number) {
    const response = await api.post(`/invitations/${invitationId}/accept/`);
    return response.data;
  },

  async rejectInvitation(invitationId: number) {
    const response = await api.post(`/invitations/${invitationId}/reject/`);
    return response.data;
  },

  async sendIndividualInvite(requestId: number, userId: number, role: string) {
    if (!requestId || isNaN(requestId)) throw new Error("عذراً، لم يتم العثور على معرف صالح للمجموعة.");
    const response = await api.post(`/groups/${requestId}/send-individual-invite/`, { user_id: userId, role });
    return response.data;
  },

  // --- Supervisor-specific ---
  async getSupervisorGroups() {
    const response = await api.get('/supervisor/groups/');
    return response.data;
  },

  // --- Program/Hierarchy resolution ---
  async fetchProgramHierarchyByProject(projectId: number) {
    const projectRes = await api.get(`/projects/${projectId}/`);
    const project = projectRes.data;

    let group: any = null;

    // Try several fallbacks to find the linked group
    const tryGroupQuery = async (query: string) => {
      try {
        const res = await api.get(query);
        const groups = Array.isArray(res.data) ? res.data : (res.data.results || []);
        if (groups.length > 0) group = groups[0];
      } catch (err) { }
    };

    await tryGroupQuery(`/groups/?project_id=${projectId}`);
    if (!group) await tryGroupQuery(`/groups/?project=${projectId}`);

    if (!group) {
      const possibleGroupId = project.group || project.group_id || project.groupId || (project.group && (project.group.group_id || project.group.id));
      if (possibleGroupId) {
        const groupRes = await api.get(`/groups/${possibleGroupId}/`);
        group = groupRes.data;
      }
    }

    if (!group) return { project, program: null, department: null, college: null, branch: null, university: null };

    let programLink: any = group.programs || group.program_groups || group.programs_data || null;

    if (programLink && programLink.length) programLink = programLink[0];
    else {
      try {
        const pgRes = await api.get(`/program-groups/?group_id=${group.group_id || group.id}`);
        const pgs = Array.isArray(pgRes.data) ? pgRes.data : (pgRes.data.results || []);
        if (pgs.length > 0) programLink = pgs[0];
      } catch (err) {
        try {
          const groupDetailRes = await api.get(`/groups/${group.group_id || group.id}/`);
          const gd = groupDetailRes.data;
          const programsFromGroup2 = gd.programs || gd.program_groups || gd.programs_data || null;
          if (programsFromGroup2 && programsFromGroup2.length) programLink = programsFromGroup2[0];
        } catch (e2) { }
      }
    }

    if (programLink && typeof programLink === 'number') {
      try { const pgRes = await api.get(`/program-groups/${programLink}`); programLink = pgRes.data; } catch { programLink = null; }
    }

    if (programLink && programLink.program && typeof programLink.program === 'number') {
      try {
        const programRes = await api.get(`/programs/${programLink.program}`);
        const program = programRes.data;
        const departmentRes = await api.get(`/departments/${program.department_id}`);
        const department = departmentRes.data;
        const collegeRes = await api.get(`/colleges/${department.college_id}`);
        const college = collegeRes.data;
        const universityRes = await api.get(`/universities/${college.university_id}`);
        const university = universityRes.data;
        return { project, program, department, college, branch: college.branch || null, university };
      } catch { }
    }

    if (programLink && (programLink.program_name || programLink.program)) {
      const program = programLink.program || { p_name: programLink.program_name };
      const department = programLink.department_name ? { name: programLink.department_name } : (program.department || null);
      const college = programLink.college_name ? { name_ar: programLink.college_name } : (program.department ? program.department.college : null);
      const branch = programLink.branch_name ? { name: programLink.branch_name } : (program.department?.college?.branch || null);
      const university = programLink.university_name ? { name_ar: programLink.university_name } : (branch?.university || null);
      return { project, program, department, college, branch, university };
    }

    if (programLink && programLink.program_id) {
      const programRes = await api.get(`/programs/${programLink.program_id}`);
      const program = programRes.data;
      const departmentRes = await api.get(`/departments/${program.department_id}`);
      const department = departmentRes.data;
      const collegeRes = await api.get(`/colleges/${department.college_id}`);
      const college = collegeRes.data;
      const universityRes = await api.get(`/universities/${college.university_id}`);
      const university = universityRes.data;
      return { project, program, department, college, branch: college.branch || null, university };
    }

    return { project, group, program: null, department: null, college: null, branch: null, university: null };
  }

};

// --- Backwards-compatible alias ---
export const fetchProgramHierarchy = async function (programGroupOrProjectId: number, mode: 'project' | 'programGroup' = 'project') {
  if ((groupService as any)?.fetchProgramHierarchyByProject) {
    if (mode === 'project') return (groupService as any).fetchProgramHierarchyByProject(programGroupOrProjectId);

    // programGroup mode fallback
    const programRes = await api.get(`/program-groups/${programGroupOrProjectId}`);
    const program = programRes.data;
    const departmentId = program.department_id || program.program?.department_id || (program.program && program.program.department) || null;
    if (!departmentId) return { program, department: null, college: null, university: null };
    const departmentRes = await api.get(`/departments/${departmentId}`);
    const department = departmentRes.data;
    const collegeRes = await api.get(`/colleges/${department.college_id}`);
    const college = collegeRes.data;
    const universityRes = await api.get(`/universities/${college.university_id}`);
    const university = universityRes.data;
    return { program, department, college, university };
  }

  if (mode === 'project') {
    const projectRes = await api.get(`/projects/${programGroupOrProjectId}/`);
    const project = projectRes.data;
    const groupsRes = await api.get(`/groups/?project_id=${programGroupOrProjectId}`);
    const group = Array.isArray(groupsRes.data) ? groupsRes.data[0] : (groupsRes.data.results && groupsRes.data.results[0]);
    if (!group) return { project, program: null, department: null, college: null, branch: null, university: null };
    const pgRes = await api.get(`/program-groups/?group_id=${group.group_id || group.id}`);
    const programLink = Array.isArray(pgRes.data) ? pgRes.data[0] : (pgRes.data.results && pgRes.data.results[0]);
    if (!programLink) return { project, program: null, department: null, college: null, branch: null, university: null };
    const programRes2 = await api.get(`/programs/${programLink.program_id || programLink.program}`);
    const program = programRes2.data;
    const departmentRes = await api.get(`/departments/${program.department_id}`);
    const department = departmentRes.data;
    const collegeRes = await api.get(`/colleges/${department.college_id}`);
    const college = collegeRes.data;
    const universityRes = await api.get(`/universities/${college.university_id}`);
    const university = universityRes.data;
    return { project, program, department, college, branch: college.branch || null, university };
  }

  return { program: null, department: null, college: null, university: null };
};