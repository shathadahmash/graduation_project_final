import axios from 'axios';

export interface Branch {
  id: number;
  branch_name: string;
  university?: number | null;
  college?: number | null;
  department?: number | null;
  program?: number | null;
}

export const branchService = {
  async getBranches(params?: any) {
    try {
      const resp = await axios.get('/branches/', { params });
      return resp.data;
    } catch (error) {
      console.error('[branchService] getBranches error', error);
      return [];
    }
  },
  async getBranchById(id: number) {
    try {
      const resp = await axios.get(`/branches/${id}/`);
      return resp.data;
    } catch (error) {
      console.error('[branchService] getBranchById error', error);
      throw error;
    }
  },
  async addBranch(data: Omit<Branch, 'id'>) {
    try {
      const resp = await axios.post('/branches/', data);
      return resp.data;
    } catch (error) {
      console.error('[branchService] addBranch error', error);
      throw error;
    }
  },
  async updateBranch(id: number, data: Partial<Omit<Branch, 'id'>>) {
    try {
      const resp = await axios.put(`/branches/${id}/`, data);
      return resp.data;
    } catch (error) {
      console.error('[branchService] updateBranch error', error);
      throw error;
    }
  },
  async deleteBranch(id: number) {
    try {
      await axios.delete(`/branches/${id}/`);
      return true;
    } catch (error) {
      console.error('[branchService] deleteBranch error', error);
      throw error;
    }
  }
};
