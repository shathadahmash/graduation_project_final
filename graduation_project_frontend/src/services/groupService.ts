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
    const res = await api.post(`/groups/${groupId}/link-project/`, { project_id: projectId });
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
}



};
