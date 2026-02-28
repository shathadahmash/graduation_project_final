/// ------ collegeServices.ts ------//
import axios from 'axios';
import { bulkFetch } from './bulkService';

export interface College {
    id: number;
    college_name: string;
    cid?: number;
    name_ar?: string;
    name_en?: string | null;
    branch?: number | null;
    branch_detail?: any;
}

function normalizeItem(item: any): College {
    if (!item || typeof item !== 'object') return item;
    const cid = item.cid ?? item.id ?? item.pk ?? null;
    const name_ar = item.name_ar ?? item.college_name ?? item.name ?? null;
    return {
        id: cid ?? (item.id ?? null),
        cid: cid ?? undefined,
        college_name: name_ar || (item.name_en ?? item.college_name ?? ''),
        name_ar: name_ar ?? undefined,
        name_en: item.name_en ?? undefined,
        branch: item.branch ?? (item.branch_id ?? undefined),
        branch_detail: item.branch_detail ?? undefined,
    } as College;
}

function normalizeResponse(data: any): College[] {
    if (!data) return [];

    let arr: any[] = [];

    // Common patterns
    if (Array.isArray(data)) arr = data;
    else if (data.results && Array.isArray(data.results)) arr = data.results;
    else if (data.colleges && Array.isArray(data.colleges)) arr = data.colleges;
    else if (data.data && Array.isArray(data.data)) arr = data.data;
    else if (typeof data === 'object') {
        // Pick the first array value in the object
        arr = Object.values(data).find(v => Array.isArray(v)) ?? [];
    }

    return arr.map(normalizeItem).filter(Boolean) as College[];
}

export const collegeService = {
    async getColleges(params?: any) {
        try {
            const response = await axios.get('colleges/', { params });
            try { console.debug('[collegeService] raw response:', response.status, response.data); } catch (e) { }
            const normalized = normalizeResponse(response.data);
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
            const response = await axios.get(`colleges/${collegeId}/`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch college:', error);
            throw error;
        }
    },

    async getfilterOptions() {
        try {
            const response = await axios.get('colleges/filter-options/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return { universities: [] };
        }
    },

    async searchColleges(query: string, params?: any) {
        try {
            const response = await axios.get('colleges/search/', {
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
            const response = await axios.post('colleges/', collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to add college:', error);
            throw error;
        }
    },

    async updateCollege(collegeId: number, collegeData: Partial<Omit<College, 'id'>>) {
        try {
            const response = await axios.put(`colleges/${collegeId}/`, collegeData);
            return response.data;
        } catch (error) {
            console.error('Failed to update college:', error);
            throw error;
        }
    },

    async deleteCollege(collegeId: number) {
        try {
            await axios.delete(`/colleges/${collegeId}/`);
            return true;
        } catch (error) {
            console.error('Failed to delete college:', error);
            throw error;
        }
    },

    async downloadcollegesCSV(params?: any) {
        try {
            const response = await axios.get('/colleges/download-csv/', { params, responseType: 'blob' });
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
};
export default collegeService;