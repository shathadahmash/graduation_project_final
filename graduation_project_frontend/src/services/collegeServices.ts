// ------ collegeServices.ts ------ //

import api from './api';

/* ================================
   TYPES
================================ */

export interface College {
  cid: number; // backend primary key
  name_ar: string;
  name_en?: string | null;
  branch?: number | null;
  branch_detail?: {
    ubid: number;
    location?: string | null;
    address?: string | null;
    contact?: string | null;
  };
  description?: string | null;
  image?: string | null;
  departments?: any[]; // optional, include if API returns departments
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
  async getColleges(params?: any): Promise<College[]> {
    try {
      const response = await api.get('/colleges/', { params });
      return response.data;
    } catch (error: any) {
      console.error('[collegeService] Failed to fetch colleges:', error);
      return [];
    }
  },

  async addCollege(collegeData: any): Promise<College> {
    try {
      const response = await api.post('/colleges/', collegeData);
      return response.data;
    } catch (error) {
      console.error('Failed to add college:', error);
      throw error;
    }
  },

  async updateCollege(collegeId: number, collegeData: any): Promise<College> {
    try {
      const response = await api.put(`/colleges/${collegeId}/`, collegeData);
      return response.data;
    } catch (error) {
      console.error('Failed to update college:', error);
      throw error;
    }
  },

  async deleteCollege(collegeId: number): Promise<boolean> {
    try {
      await api.delete(`/colleges/${collegeId}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete college:', error);
      throw error;
    }
  },
};

export default collegeService;