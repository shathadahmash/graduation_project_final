// ------ collegeServices.ts ------//

import api from './api';

/* ================================
   TYPES
================================ */

export interface College {
  id: number;
  college_name?: string;
  cid?: number;
  name_ar?: string;
  name_en?: string | null;
  branch?: number | null;
  branch_detail?: any;
}

export interface Branch {
  id: number;
  branch_name: string;
  university?: number | null;
  college?: number | null;
  department?: number | null;
  program?: number | null;
}


/* ================================
   COLLEGE SERVICE
================================ */

export const collegeService = {

  /* Get all colleges */
  async getColleges(params?: any): Promise<College[]> {
    try {
      const response = await api.get('/colleges/', { params });
      return response.data;
    } catch (error: any) {
      console.error('[collegeService] getColleges error:', error?.response?.data || error.message);
      return [];
    }
  },

  /* Get college by ID */
  async getCollegeById(collegeId: number): Promise<College> {
    try {
      const response = await api.get(`/colleges/${collegeId}/`);
      return response.data;
    } catch (error) {
      console.error('[collegeService] getCollegeById error:', error);
      throw error;
    }
  },

  /* Search colleges */
  async searchColleges(query: string, params?: any): Promise<College[]> {
    try {
      const response = await api.get('/colleges/search/', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('[collegeService] searchColleges error:', error);
      return [];
    }
  },

  /* Add college */
  async addCollege(collegeData: Omit<College, 'id'>): Promise<College> {
    try {
      const response = await api.post('/colleges/', collegeData);
      return response.data;
    } catch (error) {
      console.error('[collegeService] addCollege error:', error);
      throw error;
    }
  },

  /* Update college */
  async updateCollege(collegeId: number, collegeData: Partial<Omit<College, 'id'>>): Promise<College> {
    try {
      const response = await api.put(`/colleges/${collegeId}/`, collegeData);
      return response.data;
    } catch (error) {
      console.error('[collegeService] updateCollege error:', error);
      throw error;
    }
  },

  /* Delete college */
  async deleteCollege(collegeId: number): Promise<boolean> {
    try {
      await api.delete(`/colleges/${collegeId}/`);
      return true;
    } catch (error) {
      console.error('[collegeService] deleteCollege error:', error);
      throw error;
    }
  },

  /* Filter options */
  async getFilterOptions() {
    try {
      const response = await api.get('/colleges/filter-options/');
      return response.data;
    } catch (error) {
      console.error('[collegeService] getFilterOptions error:', error);
      return { universities: [] };
    }
  },

  /* Download CSV */
  async downloadCollegesCSV(params?: any) {
    try {
      const response = await api.get('/colleges/download-csv/', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.download = 'colleges.csv';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('[collegeService] downloadCollegesCSV error:', error);
      throw error;
    }
  },

  /* Get programs for a college */
  async getCollegePrograms(collegeId: number) {
    try {
      const response = await api.get(`/colleges/${collegeId}/programs/`);
      return response.data;
    } catch (error) {
      console.error('[collegeService] getCollegePrograms error:', error);
      return [];
    }
  }

};


/* ================================
   BRANCH SERVICE
================================ */

export const branchService = {

  /* Get all branches */
  async getBranches(params?: any): Promise<Branch[]> {
    try {
      const response = await api.get('/branches/', { params });
      return response.data;
    } catch (error) {
      console.error('[branchService] getBranches error:', error);
      return [];
    }
  },

  /* Get branch by ID */
  async getBranchById(id: number): Promise<Branch> {
    try {
      const response = await api.get(`/branches/${id}/`);
      return response.data;
    } catch (error) {
      console.error('[branchService] getBranchById error:', error);
      throw error;
    }
  },

  /* Add branch */
  async addBranch(data: Omit<Branch, 'id'>): Promise<Branch> {
    try {
      const response = await api.post('/branches/', data);
      return response.data;
    } catch (error) {
      console.error('[branchService] addBranch error:', error);
      throw error;
    }
  },

  /* Update branch */
  async updateBranch(id: number, data: Partial<Omit<Branch, 'id'>>): Promise<Branch> {
    try {
      const response = await api.put(`/branches/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('[branchService] updateBranch error:', error);
      throw error;
    }
  },

  /* Delete branch */
  async deleteBranch(id: number): Promise<boolean> {
    try {
      await api.delete(`/branches/${id}/`);
      return true;
    } catch (error) {
      console.error('[branchService] deleteBranch error:', error);
      throw error;
    }
  }

};


export default collegeService;