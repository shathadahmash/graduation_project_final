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
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
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
  roles.map((r) => ({
    id: r.id ?? r.role_ID ?? r.role__role_ID,
    type: r.type ?? r.role__type,
  }));

const normalizeUser = (user: any): User => ({
  ...user,
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

  async createRole(type: string): Promise<Role> {
    const response = await api.post('/roles/', { type });
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
    const response = await api.get("/users/");
    return response.data.map(normalizeUser);
  },

  async getUsersFields(fields?: string[]) {
    // Use bulk fetch to get only requested user fields
    const rows = await fetchTableFields('users', fields);
    return rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      name: r.name,
      email: r.email,
      roles: r.roles || []
    }));
  },

  async getUserById(userId: number): Promise<User> {
    const response = await api.get(`/users/${userId}/`);
    return normalizeUser(response.data);
  },

  /* ---------- DROPDOWN ---------- */

  async getUsersForDropdown(): Promise<{ id: number; name: string }[]> {
    const response = await api.get("/dropdown-data/");
    return [
      ...(response.data.students || []),
      ...(response.data.supervisors || []),
      ...(response.data.assistants || []),
    ];
  },

  /* ---------- CRUD ---------- */

  async createUser(data: Partial<User>): Promise<User> {
    const response = await api.post("/users/", data);
    return normalizeUser(response.data);
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    // Only send writable fields expected by the backend UserSerializer
    const payload: any = {};
    if (data.username !== undefined) payload.username = data.username;
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.gender !== undefined) payload.gender = data.gender;

    // Use PATCH for partial updates
    const response = await api.patch(`/users/${userId}/`, payload);
    return normalizeUser(response.data);
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}/`);
  },

  /* ---------- USER ROLES ---------- */

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    // send both key variants to be compatible with backend (accepts user/user_id and role/role_id)
    await api.post("/user-roles/", {
      user: userId,
      role: roleId,
      user_id: userId,
      role_id: roleId,
    });
  },

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await api.delete(`/user-roles/?user_id=${userId}&role_id=${roleId}`);
  },
  /* ---------- ACADEMIC AFFILIATIONS ---------- */

  async getColleges() {
    try {
      const rows = await fetchTableFields('colleges');
      console.log('[userService] getColleges fetched', rows?.length, 'rows');
      return rows.map((r: any) => ({ id: r.cid, name: r.name_ar, branch: r.branch }));
    } catch (err) {
      console.error('[userService] getColleges error', err);
      throw err;
    }
  },

  async getDepartments() {
    try {
      const rows = await fetchTableFields('departments');
      console.log('[userService] getDepartments fetched', rows?.length, 'rows');
      return rows.map((r: any) => ({ id: r.department_id, name: r.name, college: r.college }));
    } catch (err) {
      console.error('[userService] getDepartments error', err);
      throw err;
    }
  },

  async getAffiliations() {
    try {
      const rows: any = await fetchTableFields('academic_affiliations');
      // defensive: bulk fetch may return an object (error) instead of an array
      if (!Array.isArray(rows)) {
        console.warn('[userService] getAffiliations unexpected payload (not array)', rows);
        // if it's an object with the table key (wrapped), try to extract
        if (rows && typeof rows === 'object' && Array.isArray((rows as any).results)) {
          const actual = (rows as any).results;
          console.log('[userService] getAffiliations extracted results length', actual.length);
          return actual.map((r: any) => ({ id: r.id, user_id: r.user_id, university_id: r.university_id, college_id: r.college_id, department_id: r.department_id, start_date: r.start_date, end_date: r.end_date }));
        }
        return [];
      }
      console.log('[userService] getAffiliations fetched', rows.length, 'rows');
      return rows.map((r: any) => ({ id: r.affiliation_id ?? r.id, user_id: r.user_id, university_id: r.university_id, college_id: r.college_id, department_id: r.department_id, start_date: r.start_date, end_date: r.end_date }));
    } catch (err) {
      console.error('[userService] getAffiliations error', err);
      throw err;
    }
  },

  async createAffiliation(data: { user: number; university?: number; college: number; department: number; start_date?: string; end_date?: string }) {
    try {
      const payload: any = {
        user: data.user,
        university: data.university,
        college: data.college,
        department: data.department,
      };
      if (data.start_date) payload.start_date = data.start_date;
      if (data.end_date) payload.end_date = data.end_date;
      console.log('[userService] createAffiliation payload', payload);
      const res = await api.post('/academic_affiliations/', payload);
      console.log('[userService] createAffiliation response', res?.data);
      return res.data;
    } catch (err) {
      console.error('[userService] createAffiliation error', err?.response?.data ?? err);
      throw err;
    }
  },

  async updateAffiliation(id: number, data: Partial<{ university: number; college: number; department: number; start_date: string; end_date: string }>) {
    try {
      const payload: any = {};
      if (data.university !== undefined) payload.university = data.university;
      if (data.college !== undefined) payload.college = data.college;
      if (data.department !== undefined) payload.department = data.department;
      if (data.start_date !== undefined) payload.start_date = data.start_date;
      if (data.end_date !== undefined) payload.end_date = data.end_date;
      console.log('[userService] updateAffiliation id', id, 'payload', payload);
      const res = await api.patch(`/academic_affiliations/${id}/`, payload);
      console.log('[userService] updateAffiliation response', res?.data);
      return res.data;
    } catch (err) {
      console.error('[userService] updateAffiliation error', err?.response?.data ?? err);
      throw err;
    }
  },
};