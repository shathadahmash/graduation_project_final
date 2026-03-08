import api from './api';

export interface Branch {
  ubid: number; // المعرف الصحيح للفروع
  branch_name: string;
  university?: number | null;
  city_detail?: { bname_ar: string };
  university_detail?: { uname_ar: string };
}

export const branchService = {
  async getBranches(params?: any) {
    try {
      const resp = await api.get('/branches/', { params });
      return resp.data;
    } catch (error) {
      console.error('[branchService] getBranches error', error);
      return [];
    }
  },
  async addBranch(data: any) {
    try {
      const resp = await api.post('/branches/', data)
      return resp.data;
    } catch (error) {
      console.error('[branchService] addBranch error', error);
      throw error;
    }
  },
  async updateBranch(id: number, data: any) {
    try {
      const resp = await api.put(`/branches/${id}/`, data);
      return resp.data;
    } catch (error) {
      console.error('[branchService] updateBranch error', error);
      throw error;
    }
  },
  async deleteBranch(id: number) {
    try {
      await api.delete(`/branches/${id}/`);
      return true;
    } catch (error) {
      console.error('[branchService] deleteBranch error', error);
      throw error;
    }
  }
};
