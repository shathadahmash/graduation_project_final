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
    // جلب الجامعات (يمكن استخدام axios أو api)
    async getUniversities(params?: any) {
        try {
            const response = await api.get('/universities/', { params });
            return response.data;
        } catch (error: any) {
            console.error('[universityService] Failed to fetch universities:', error);
            return [];
        }
    },

    async getUniversityById(universityId: number) {
        try {
            const response = await api.get(`/universities/${universityId}/`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch university:', error);
            throw error;
        }
    },

    // إضافة جامعة جديدة - استخدام api لإرسال التوكن
    async addUniversity(universityData: Omit<College, 'id'>) {
        try {
            const response = await api.post('/universities/', universityData);
            return response.data;
        } catch (error) {
            console.error('Failed to add university:', error);
            throw error;
        }
    },

    // تعديل جامعة - تم إصلاح الرابط واستخدام api
    async updateUniversity(universityId: number, universityData: Partial<Omit<College, 'id'>>) {
        if (!universityId) throw new Error("University ID is required for update");
        try {
            const response = await api.put(`/universities/${universityId}/`, universityData);
            return response.data;
        } catch (error) {
            console.error('Failed to update university:', error);
            throw error;
        }
    },

    // حذف جامعة - تم إصلاح الرابط واستخدام api لحل مشكلة 403
    async deleteUniversity(universityId: number) {
        if (!universityId) throw new Error("University ID is required for deletion");
        try {
            await api.delete(`/universities/${universityId}/`);
            return true;
        } catch (error) {
            console.error('Failed to delete university:', error);
            throw error;
        }
    },

    async getfilterOptions() {
        try {
            const response = await api.get('/universities/filter-options/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            return { universities: [] };
        }
    },

    async searchUniversities(query: string, params?: any) {
        try {
            const response = await api.get('/universities/search/', {
                params: { q: query, ...params },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search universities:', error);
            return [];
        }
    },

    async downloadUniversitiesCSV(params?: any) {
        try {
            const response = await api.get('/universities/download-csv/', { params, responseType: 'blob' });
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
            const response = await api.get(`/universities/${universityId}/programs/`);
            return response.data;
        } catch (err) {
            return [];
        }
    }
};

export default universityService;