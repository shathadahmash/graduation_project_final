// src/services/groupService.ts
import api from './api';



// --- أنواع البيانات بعد الاعتماد على الكود الثاني (الأحدث) ---
export interface Department {
  id: number;
  name: string;
}


export interface Student {
  id: number;
  name: string;
}

export interface Supervisor {
  id: number;
  name: string;
}
 
// واجهة إنشاء المجموعة (من الكود الثاني)
export interface GroupCreatePayload {
  group_name: string;

  department_id: number;
  college_id: number;
  student_ids: number[];
  supervisor_ids: number[];
  co_supervisor_ids: number[];
  note?: string;
}

// واجهة افتراضية لبيانات المجموعة
export interface GroupDetailsResponse {
  id: number;
  students: any[];
}

export const groupService = {
  // === من الكود الثاني ===
  async getDropdownData(): Promise<{ students: Student[], supervisors: Supervisor[], assistants: Supervisor[] }> {
    const res = await api.get('/dropdown-data/');
    return res.data;
  },

  // === من الكود الأول ===
  async getDepartments(): Promise<Department[]> {
    const res = await api.get('/dropdown-data/departments/');
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

  // --- إنشاء مجموعة ---
  async createGroupForApproval(payload: GroupCreatePayload): Promise<{ group_id: number }> {
    const res = await api.post('/groups/', payload);
    return res.data;
  },
  //fatima added this group creation since the supervisor group creation is different from the student
  // --- إنشاء مجموعة كمشرف (إنشاء مباشر) ---
  async createGroupAsSupervisor(payload: GroupCreatePayload): Promise<any> {
  // نفس endpoint /groups/ لكن نرسل flag يخلي الباكند يعرف أنه إنشاء مباشر
    const res = await api.post('/groups/', { ...payload, created_by_role: 'supervisor' });
    return res.data;
  },//till here


  async linkProjectToGroup(groupId: number, projectId: number) {
    // التأكد من أن المسار ينتهي بـ /link-project/ ليطابق الباك إيند
    const res = await api.post(`/groups/${groupId}/link-project/`, { 
        project_id: projectId 
    });
    return res.data;
},
//////////////////////////////////////////////
  // --- جلب المجموعات ---
  async getGroups() {
    const response = await api.get('/groups/');
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

  // --- الدالة الجديدة لصفحة مشروع التخرج ---
  async getGroupDetails(groupId: number): Promise<GroupDetailsResponse> {
    const data = await this.getGroupById(groupId);
    return data as GroupDetailsResponse;
  },

  async acceptInvitation(invitationId: number) {
    const response = await api.post(`/invitations/${invitationId}/accept/`);
    return response.data;
  },

  async rejectInvitation(invitationId: number) {
    const response = await api.post(`/invitations/${invitationId}/reject/`);
    return response.data;
  },

  // ================================
  //    🔥 الدوال الناقصة (مضافة الآن)
  // ================================

  // تحديث بيانات مجموعة
  async updateGroup(groupId: number, data: any) {
    const response = await api.put(`/groups/${groupId}/`, data);
    return response.data;
  },

  async getCollegeGroups(collegeId: number) {
   const res = await api.get(`/groups/?college_id=${collegeId}`);
   return res.data;
},


  // حذف عضو من مجموعة
  async deleteGroupMember(groupId: number, memberId: number) {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}/`);
    return response.data;
  },

  async getMyGroup(): Promise<any> {
    try {
      const response = await api.get('/groups/my-group/');
      return response.data;
    } catch (error: any) {
      // إذا كان السيرفر يعيد 404 فهذا يعني لا توجد مجموعة، وهو أمر طبيعي
      if (error.response && error.response.status === 404) {
        return null; 
      }
      throw error; // أي خطأ آخر (مثل 500) يتم رميه
    }
  },

  
async sendIndividualInvite(requestId: number, userId: number, role: string) {
  // منع إرسال الطلب إذا كان المعرف undefined أو NaN
  if (!requestId || isNaN(requestId)) {
    throw new Error("عذراً، لم يتم العثور على معرف صالح للمجموعة.");
  }

  const response = await api.post(`/groups/${requestId}/send-individual-invite/`, {
    user_id: userId,
    role: role
  });
  return response.data;
},
// --- جلب المجموعات للمشرف (باستخدام SupervisorGroupSerializer) --- 
async getSupervisorGroups() { 
  const response = await api.get('/supervisor/groups/'); 
  return response.data; 
},

// Given a project id, resolve the linked group -> programgroup(s) and
// return the program, department, college, branch and university plus the project.
async fetchProgramHierarchyByProject(projectId: number) {
  // 1) fetch project (we'll return it with the result)
  const projectRes = await api.get(`/projects/${projectId}/`);
  const project = projectRes.data;

  // 2) try to find the group linked to this project using several fallbacks
  // preferred: direct groups query by project_id
  let group: any = null;
  try {
    const groupsQueryRes = await api.get(`/groups/?project_id=${projectId}`);
    const groups = Array.isArray(groupsQueryRes.data) ? groupsQueryRes.data : (groupsQueryRes.data.results || []);
    if (groups.length > 0) group = groups[0];
  } catch (err) {
    // ignore and continue to other fallbacks
  }

  if (!group) {
    // try alternative query param name
    try {
      const groupsQueryRes = await api.get(`/groups/?project=${projectId}`);
      const groups = Array.isArray(groupsQueryRes.data) ? groupsQueryRes.data : (groupsQueryRes.data.results || []);
      if (groups.length > 0) group = groups[0];
    } catch (err) {
      // ignore
    }
  }

  if (!group) {
    // as a last resort, try to fetch the project and look for a group id on it
    const possibleGroupId = project.group || project.group_id || project.groupId || (project.group && (project.group.group_id || project.group.id));
    if (possibleGroupId) {
      const groupRes = await api.get(`/groups/${possibleGroupId}/`);
      group = groupRes.data;
    }
  }

  // If still no group found, return project only
  if (!group) {
    return { project, program: null, department: null, college: null, branch: null, university: null };
  }

  // 3) If the group payload already contains serialized program links (SupervisorGroupSerializer style), use it
  const programsFromGroup = group.programs || group.program_groups || group.programs_data || null;
  let programLink: any = null;
  if (programsFromGroup && programsFromGroup.length) {
    programLink = programsFromGroup[0];
  }

  // 4) Otherwise try endpoint that lists program-groups for a group
  if (!programLink) {
    try {
      const pgRes = await api.get(`/program-groups/?group_id=${group.group_id || group.id}`);
      const pgs = Array.isArray(pgRes.data) ? pgRes.data : (pgRes.data.results || []);
      if (pgs.length > 0) programLink = pgs[0];
    } catch (err) {
      // backend might not expose a list filter for program-groups; try fetching the group detail
      try {
        const groupDetailRes = await api.get(`/groups/${group.group_id || group.id}/`);
        const gd = groupDetailRes.data;
        const programsFromGroup2 = gd.programs || gd.program_groups || gd.programs_data || null;
        if (programsFromGroup2 && programsFromGroup2.length) programLink = programsFromGroup2[0];
      } catch (e2) {
        // ignore — we'll continue to other fallbacks
      }
    }
  }

  // 5) If programLink is still an id (number), fetch its detail
  if (programLink && typeof programLink === 'number') {
    try {
      const pgRes = await api.get(`/program-groups/${programLink}`);
      programLink = pgRes.data;
    } catch (err) {
      programLink = null;
    }
  }

  // If programLink exists but references the program by id (program: <id>), resolve it
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
    } catch (e) {
      // ignore and continue
    }
  }

  // 6) If we now have a programLink that contains nested program info (as GroupProgramSerializer), use it
  if (programLink && (programLink.program_name || programLink.program)) {
    const program = programLink.program || {
      p_name: programLink.program_name,
    };

    // safe fields coming from the serializer (may already be flat names)
    const department = programLink.department_name ? { name: programLink.department_name } : (program.department || null);
    const college = programLink.college_name ? { name_ar: programLink.college_name } : (program.department ? program.department.college : null);
    const branch = programLink.branch_name ? { name: programLink.branch_name } : (program.department && program.department.college ? program.department.college.branch : null);
    const university = programLink.university_name ? { name_ar: programLink.university_name } : (branch ? branch.university : null);

    return { project, program, department, college, branch, university };
  }

  // 7) final fallback: try to resolve using program_id on programLink object
  if (programLink && programLink.program_id) {
    // fetch program
    const programRes = await api.get(`/programs/${programLink.program_id}`);
    const program = programRes.data;
    // fetch department -> college -> university safely
    const departmentRes = await api.get(`/departments/${program.department_id}`);
    const department = departmentRes.data;
    const collegeRes = await api.get(`/colleges/${department.college_id}`);
    const college = collegeRes.data;
    const universityRes = await api.get(`/universities/${college.university_id}`);
    const university = universityRes.data;

    return { project, program, department, college, branch: college.branch || null, university };
  }

  // Give up: return project + found group for debugging
  return { project, group, program: null, department: null, college: null, branch: null, university: null };
}

};

// Backwards-compatible alias: allow callers to use `groupService.fetchProgramHierarchy(...)`
// Defaults to treating the id as a project id (most common). Pass mode='programGroup' to
// resolve from a program-group id instead.
export const fetchProgramHierarchy = async function(programGroupOrProjectId: number, mode: 'project' | 'programGroup' = 'project') {
  // prefer calling into the service if available
  if ((groupService as any) && typeof (groupService as any).fetchProgramHierarchyByProject === 'function') {
    if (mode === 'project') return (groupService as any).fetchProgramHierarchyByProject(programGroupOrProjectId);
    // programGroup mode: fall back to the original straightforward resolution
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

  // last-resort: attempt to replicate the original behaviour without groupService
  if (mode === 'project') {
    const projectRes = await api.get(`/projects/${programGroupOrProjectId}/`);
    const project = projectRes.data;
    // try to find group by project
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
