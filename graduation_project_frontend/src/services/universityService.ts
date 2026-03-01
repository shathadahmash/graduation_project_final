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


export const universityService = {
    async getUniversities(params?: any) {
        try {
            const response = await axios.get('/api/universities/', { params });
            try { console.debug('[universityService] raw response:', response.status, response.data); } catch (e) { }
            const normalized = response.data;
            console.log('[universityService] normalized universities:', normalized);
            try { console.debug('[universityService] normalized count:', normalized.length, 'sample:', normalized.slice(0, 3)); } catch (e) { }
            return normalized;
        } catch (error: any) {
            console.error('[universityService] Failed to fetch universities:', error?.response?.status, error?.response?.data ?? error?.message ?? error);
            return [];
        }
    },
    async getUniversityById(universityId: number) {
        try {
            const response = await axios.get(`/api/universities/${universityId}/`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch university:', error);
            throw error;
        }
    },

    async getfilterOptions() {
        try {
            const response = await axios.get('/api/universities/filter-options/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return { universities: [] };
        }
    },

    async searchUniversities(query: string, params?: any) {
        try {
            const response = await axios.get('/api/universities/search/', {
                params: { q: query, ...params },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search universities:', error);
            return [];
        }
    },

    async addUniversity(universityData: Omit<College, 'id'>) {
        try {
            const response = await axios.post('/api/universities/', universityData);
            return response.data;
        } catch (error) {
            console.error('Failed to add university:', error);
            throw error;
        }
    },

    async updateUniversity(universityId: number, universityData: Partial<Omit<College, 'id'>>) {
        try {
            const response = await axios.put(`/api/universities/${universityId}/`, universityData);
            return response.data;
        } catch (error) {
            console.error('Failed to update university:', error);
            throw error;
        }
    },

    async deleteUniversity(universityId: number) {
        try {
            await axios.delete(`/api/universities/${universityId}/`);
            return true;
        } catch (error) {
            console.error('Failed to delete university:', error);
            throw error;
        }
    },

    async downloadUniversitiesCSV(params?: any) {
        try {
            const response = await axios.get('/api/universities/download-csv/', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'universities.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download universities CSV:', error);
            throw error;
        }
    },

    async getUniversityPrograms(universityId: number) {
    try {
        const response = await axios.get(`/api/universities/${universityId}/programs/`);
        return response.data; // array of programs
    } catch (err) {
        return [];
    }
}
   


};
export default universityService;