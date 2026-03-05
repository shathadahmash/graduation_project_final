import axios from "axios";
import api from "./api";
import { fetchTableFields } from './bulkService';

/* ==========================
   Types
========================== */

export interface Role {
  id: number;
  type: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string | null;
}

export interface College {
  id: number;
  name: string;
  branch?: string;
}

export interface Department {
  id: number;
  name: string;
  college?: number;
}

export interface Affiliation {
  id: number;
  user_id: number;
  university_id?: number;
  college_id?: number;
  department_id?: number;
  start_date?: string;
  end_date?: string;
  college?: College;
  department?: Department;
  college_name?: string;
  department_name?: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  name?: string;
  email?: string;
  phone?: string | null;
  gender?: string | null;
  CID?: string | null;
  roles: Role[];
  permissions?: Permission[];
  department_id?: number;
  college_id?: number;
  is_active?: boolean;
  company_name?: string;
  date_joined?: string;
  affiliation?: Affiliation;
}

/* ==========================
   Normalizers
========================== */

const normalizeRoles = (roles: any[] = []): Role[] =>
  roles.map(r => ({
    id: r.id ?? r.role_ID ?? r.role__role_ID,
    type: r.type ?? r.role__type,
  }));

const normalizeUser = (user: any): User => ({
  ...user,
  first_name: user.first_name ?? '',
  last_name: user.last_name ?? '',
  name: user.name ?? `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  CID: user.CID ?? user.cid ?? null, // normalize CID
  roles: normalizeRoles(user.roles),
});
/* ==========================
   Service
========================== */

export const userService = {
  /* ---------- ROLES ---------- */
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get("/roles/");
    return response.data.map((r: any) => ({
      id: r.id ?? r.role_ID,
      type: r.type,
    }));
  },
  getStudentsByDepartment: async (departmentId: number | null) => {
    if (!departmentId) return [];
    const response = await axios.get(`/api/students-by-department/?department_id=${departmentId}`);
    return response.data; // تأكد أن API يرجع قائمة الطلاب
  },

  async createRole(type: string): Promise<Role> {
    const response = await api.post("/roles/", { type });
    const r = response.data;
    return { id: r.id ?? r.role_ID, type: r.type };
  },

  async updateRole(roleId: number, data: Partial<Role>): Promise<Role> {
    const payload: any = {};
    if (data.type !== undefined) payload.type = data.type;
    const response = await api.patch(`/roles/${roleId}/`, payload);
    const r = response.data;
    return { id: r.id ?? r.role_ID, type: r.type };
  },

  async deleteRole(roleId: number): Promise<void> {
    await api.delete(`/roles/${roleId}/`);
  },

  /* ---------- USERS ---------- */
  async getAllUsers(): Promise<User[]> {
    // 1. Fetch all users
    const usersResponse = await api.get("/users/");
    const usersData = usersResponse.data;

    // 2. Normalize users
    const userMap: Record<number, User> = {};
    for (const u of usersData) {
      userMap[u.id] = normalizeUser(u);
      // do not reset roles, merge later
      if (!userMap[u.id].roles) userMap[u.id].roles = [];
    }

    // 3. Fetch all user-roles
    const urResponse = await api.get("/user-roles/");
    const userRoles = urResponse.data;

    // 4. Merge roles safely
    for (const ur of userRoles) {
      const role = ur.role_detail || { role_ID: ur.role, type: "Unknown" };
      const user = userMap[ur.user];
      if (user) {
        if (!user.roles) user.roles = [];
        if (!user.roles.find(r => r.id === role.role_ID)) {
          user.roles.push({ id: role.role_ID, type: role.type });
        }
      }
    }

    return Object.values(userMap);
  },

  async getUserById(userId: number): Promise<User> {
    const response = await api.get(`/users/${userId}/`);
    return normalizeUser(response.data);
  },

  async createUser(data: Partial<User>): Promise<User> {
    const payload: any = {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      CID: data.CID,
      write_roles: data.roles?.map(r => r.id),
    };
    const response = await api.post("/users/", payload);
    return normalizeUser(response.data);
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const payload: any = {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      CID: data.CID,
      write_roles: data.roles?.map(r => r.id),
    };
    const response = await api.patch(`/users/${userId}/`, payload);
    return normalizeUser(response.data);
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}/`);
  },

  /* ---------- USER ROLES ---------- */
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await api.post("/user-roles/", { user: userId, role: roleId });
  },

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await api.delete(`/user-roles/?user=${userId}&role=${roleId}`);
  },

  async syncUserRoles(userId: number, selectedRoles: number[], currentRoles: number[]): Promise<void> {
    for (const roleId of currentRoles.filter(r => !selectedRoles.includes(r))) {
      await this.removeRoleFromUser(userId, roleId);
    }
    for (const roleId of selectedRoles.filter(r => !currentRoles.includes(r))) {
      await this.assignRoleToUser(userId, roleId);
    }
  },

  /* ---------- ACADEMIC AFFILIATIONS ---------- */
  async getColleges() {
    const rows = await fetchTableFields("colleges");
    return rows.map((r: any) => ({
      id: r.cid,
      name: r.name_ar,
      branch: r.branch,
    }));
  },

  async getDepartments() {
    const rows = await fetchTableFields("departments");
    return rows.map((r: any) => ({
      id: r.department_id,
      name: r.name,
      college: r.college,
    }));
  },

  async getAffiliations() {
    const rows: any = await fetchTableFields("academic_affiliations");
    if (!Array.isArray(rows)) return [];
    return rows.map((r: any) => ({
      id: r.affiliation_id ?? r.id,
      user_id: r.user_id,
      university_id: r.university_id,
      college_id: r.college_id,
      department_id: r.department_id,
      start_date: r.start_date,
      end_date: r.end_date,
    }));
  },

  async createAffiliation(data: { user: number; university?: number; college: number; department: number; start_date?: string; end_date?: string; }) {
    const payload: any = { ...data };
    const res = await api.post("/academic_affiliations/", payload);
    return res.data;
  },

  async updateAffiliation(id: number, data: Partial<{ university: number; college: number; department: number; start_date: string; end_date: string; }>) {
    const payload: any = { ...data };
    const res = await api.patch(`/academic_affiliations/${id}/`, payload);
    return res.data;
  },
};

export const getStudentsByDepartment = async (departmentId: number | null) => {
  if (!departmentId) return [];
  const response = await axios.get(`/api/students-by-department/?department_id=${departmentId}`);
  return response.data;
};
// جلب كل الطلاب
export const getAllStudents = async () => {
  const res = await api.get('/students/'); // تأكد أن المسار صحيح
  return res.data;
};

