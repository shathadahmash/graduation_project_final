/// ------ collegeServices.ts ------//
import axios from 'axios';
import { bulkFetch } from './bulkService';
import api from './api';


export interface College {
    id: number;
    college_name: string;
    cid?: number;
    name_ar?: string;
    name_en?: string | null;
    branch?: number | null;
    branch_detail?: any;
}






export const collegeService = {
    async getColleges(params?: any) {
        try {
            const response = await axios.get('/api/colleges/', { params });
            try { console.debug('[collegeService] raw response:', response.status, response.data); } catch (e) { }
            const normalized = response.data;
            console.log('[collegeService] normalized colleges:', normalized);
            try { console.debug('[collegeService] normalized count:', normalized.length, 'sample:', normalized.slice(0, 3)); } catch (e) { }
            return normalized;
        } catch (error: any) {
            console.error('[collegeService] Failed to fetch colleges:', error?.response?.status, error?.response?.data ?? error?.message ?? error);
            return [];
        }
    },
    async getCollegeById(collegeId: number) {
        try {
            const response = await axios.get(`/api/colleges/${collegeId}/`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch college:', error);
            throw error;
        }
    },

    async getfilterOptions() {
        try {
            const response = await axios.get('/api/colleges/filter-options/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return { universities: [] };
        }
    },

    async searchColleges(query: string, params?: any) {
        try {
            const response = await axios.get('/api/colleges/search/', {
                params: { q: query, ...params },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search colleges:', error);
            return [];
        }
    },

    async addcollege(collegeData: Omit<College, 'id'>) {
        try {
            const response = await axios.post('/api/colleges/', collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to add college:', error);
            throw error;
        }
    },

    async updateCollege(collegeId: number, collegeData: Partial<Omit<College, 'id'>>) {
        try {
            const response = await axios.put(`/api/colleges/${collegeId}/`, collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to update college:', error);
            throw error;
        }
    },

    async deleteCollege(collegeId: number) {
        try {
            await axios.delete(`/api/colleges/${collegeId}/`);
            return true;
        } catch (error) {
            console.error('Failed to delete college:', error);
            throw error;
        }
    },

    async downloadcollegesCSV(params?: any) {
        try {
            const response = await axios.get('/api/colleges/download-csv/', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'colleges.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download colleges CSV:', error);
            throw error;
        }
    },

    async getCollegePrograms(collegeId: number) {
        try {
            const response = await api.get(`/programs/`, { params: { college: collegeId } });
            console.log(`[collegeService] Programs for collegeId ${collegeId}:`, response.data);
            return response.data; // array of programs
        } catch (err) {
            console.error('Failed to fetch programs:', err);
            return [];
        }
    }

   


};
export default collegeService;