// ------ collegeServices.ts ------//

import api from './api';

/* ================================
   TYPES
================================ */

export interface College {
  id: number;
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

import api from './api';

export interface College {
    cid: number; // المعرف الأساسي للكليات
    college_name: string;
    name_ar?: string;
    name_en?: string | null;
    branch?: number | null;
}

export const collegeService = {
    async getColleges(params?: any) {
        try {
            const response = await api.get('/colleges/', { params });
            return response.data;
        } catch (error: any) {
            console.error('[collegeService] Failed to fetch colleges:', error);
            return [];
        }
    },

    async addCollege(collegeData: any) {
        try {
            const response = await api.post('/colleges/', collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to add college:', error);
            throw error;
        }
    },

    async updateCollege(collegeId: number, collegeData: any) {
        try {
            const response = await api.put(`/colleges/${collegeId}/`, collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to update college:', error);
            throw error;
        }
    },

    async deleteCollege(collegeId: number) {
        try {
            await api.delete(`/colleges/${collegeId}/`);
            return true;
        } catch (error) {
            console.error('Failed to delete college:', error);
            throw error;
        }
    }
};
export default collegeService;
