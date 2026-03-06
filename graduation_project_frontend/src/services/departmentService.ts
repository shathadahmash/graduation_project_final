import api from './api';

export interface Department {
  id: number;                       // Primary key
  department_name: string;           // Name of the department
  college?: number | null;           // College ID
  programs?: any[];                  // Optional programs
}

export const departmentService = {
  // Fetch all departments, optionally with query params
  async getDepartments(params?: Record<string, any>): Promise<Department[]> {
    try {
      const resp = await api.get<Department[]>('/departments/', { params });
      console.log('[departmentService] getDepartments response:', resp.status, resp.data);
      return resp.data ?? [];
    } catch (error) {
      console.error('[departmentService] getDepartments error:', error);
      return [];
    }
  },

  // Fetch a single department by ID
  async getDepartmentById(id: number): Promise<Department> {
    try {
      const resp = await api.get<Department>(`/departments/${id}/`);
      return resp.data;
    } catch (error) {
      console.error('[departmentService] getDepartmentById error:', error);
      throw error;
    }
  },

async addDepartment(data: Omit<Department, 'id'>): Promise<Department> {
  try {
    const resp = await api.post<Department>('/departments/', data);
    return resp.data;
  } catch (error) {
    console.error('[departmentService] addDepartment error:', error);
    throw error;
  }
},

  // Update an existing department
  async updateDepartment(id: number, data: Partial<Omit<Department, 'id'>>): Promise<Department> {
    try {
      const resp = await api.put<Department>(`/departments/${id}/`, data);
      return resp.data;
    } catch (error) {
      console.error('[departmentService] updateDepartment error:', error);
      throw error;
    }
  },

  // Delete a department
  async deleteDepartment(id: number): Promise<boolean> {
    try {
      await api.delete(`/departments/${id}/`);
      return true;
    } catch (error) {
      console.error('[departmentService] deleteDepartment error:', error);
      throw error;
    }
  },
};