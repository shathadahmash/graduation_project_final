import api, { API_ENDPOINTS } from '../services/api';

// University nested structure
export interface UniversityDetail {
  uid: number;
  uname_ar: string;
  uname_en?: string | null;
  type: string;
  image?: string | null;
  description?: string | null;
}

// Branch nested structure
export interface BranchDetail {
  ubid: number;
  university: number;
  university_detail: UniversityDetail;
  city: number;
  city_detail: {
    bid: number;
    bname_ar: string;
    bname_en?: string | null;
  };
  location: string;
  address: string;
  contact: string;
}

// College nested structure
export interface CollegeDetail {
  cid: number;
  name_ar: string;
  name_en?: string | null;
  branch: number;
  branch_detail: BranchDetail;
  description?: string | null;
  image?: string | null;
}

// Department nested structure
export interface DepartmentDetail {
  department_id: number;
  name: string;
  description: string;
  college: number;
  college_detail?: CollegeDetail;
}

// Main Program interface
export interface Program {
  pid: number; // backend primary key
  p_name: string;
  department?: number | null;
  duration?: number | null;
  department_detail?: DepartmentDetail;
}

export const programService = {
  // Fetch all programs (optionally with query params)
  async getPrograms(params?: Record<string, any>) {
    try {
      const resp = await api.get(API_ENDPOINTS.PROGRAMS, { params });
      console.log('[programService] getPrograms response:', resp.data);
      return Array.isArray(resp.data) ? resp.data : resp.data.results ?? [];
    } catch (error) {
      console.error('[programService] getPrograms error:', error);
      throw error;
    }
  },

  // Fetch single program by pid
  async getProgramById(pid: number) {
    try {
      const resp = await api.get(`${API_ENDPOINTS.PROGRAMS}${pid}/`);
      return resp.data;
    } catch (error) {
      console.error(`[programService] getProgramById(${pid}) error:`, error);
      throw error;
    }
  },

  // Add a new program
  async addProgram(data: Omit<Program, 'pid'>) {
    try {
      const resp = await api.post(API_ENDPOINTS.PROGRAMS, data);
      return resp.data;
    } catch (error) {
      console.error('[programService] addProgram error:', error);
      throw error;
    }
  },

  // Update existing program by pid
  async updateProgram(pid: number, data: Partial<Omit<Program, 'pid'>>) {
    try {
      const resp = await api.patch(`${API_ENDPOINTS.PROGRAMS}${pid}/`, data);
      return resp.data;
    } catch (error) {
      console.error(`[programService] updateProgram(${pid}) error:`, error);
      throw error;
    }
  },

  // Delete program by pid
  async deleteProgram(pid: number) {
    try {
      await api.delete(`${API_ENDPOINTS.PROGRAMS}${pid}/`);
    } catch (error) {
      console.error(`[programService] deleteProgram(${pid}) error:`, error);
      throw error;
    }
  },
};