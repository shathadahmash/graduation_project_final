import axios from 'axios';

export interface Department {
  id: number;
  department_name: string;
  college?: number | null;
  programs?: any[];
}

export const departmentService = {
  async getDepartments(params?: any) {
    try {
      const resp = await axios.get('/departments/', { params });
      return resp.data;
    } catch (error) {
      console.error('[departmentService] getDepartments error', error);
      return [];
    }
  },
  async getDepartmentById(id: number) {
    try {
      const resp = await axios.get(`/departments/${id}/`);
      return resp.data;
    } catch (error) {
      console.error('[departmentService] getDepartmentById error', error);
      throw error;
    }
  },
  async addDepartment(data: Omit<Department, 'id'>) {
    try {
      const resp = await axios.post('/departments/', data);
      return resp.data;
    } catch (error) {
      console.error('[departmentService] addDepartment error', error);
      throw error;
    }
  },
  async updateDepartment(id: number, data: Partial<Omit<Department, 'id'>>) {
    try {
      const resp = await axios.put(`/departments/${id}/`, data);
      return resp.data;
    } catch (error) {
      console.error('[departmentService] updateDepartment error', error);
      throw error;
    }
  },
  async deleteDepartment(id: number) {
    try {
      await axios.delete(`/departments/${id}/`);
      return true;
    } catch (error) {
      console.error('[departmentService] deleteDepartment error', error);
      throw error;
    }
  }
};
