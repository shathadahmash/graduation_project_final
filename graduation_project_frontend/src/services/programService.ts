import api, { API_ENDPOINTS } from '../services/api';

export interface Program {
  pid: number; // backend primary key
  p_name: string;
  department?: number | null;
  duration?: number | null;
  department_detail?: {
    department_id: number;
    name: string;
    description: string;
    college: number;
    college_detail?: any;
  };
}

export const programService = {
  // Fetch all programs (optionally with query params)
  async getPrograms(params?: Record<string, any>) {
    const resp = await api.get(API_ENDPOINTS.PROGRAMS, { params });
    console.log('[programService] getPrograms response:', resp.data);
    return Array.isArray(resp.data) ? resp.data : resp.data.results ?? [];
  },

  // Fetch single program by pid
  async getProgramById(pid: number) {
    const resp = await api.get(`${API_ENDPOINTS.PROGRAMS}${pid}/`);
    return resp.data;
  },

  // Add a new program
  async addProgram(data: Omit<Program, 'pid'>) {
    // Backend expects fields like p_name, department, duration
    const resp = await api.post(API_ENDPOINTS.PROGRAMS, data);
    return resp.data;
  },

  // Update existing program by pid
  async updateProgram(
    pid: number,
    data: Partial<Omit<Program, 'pid'>>
  ) {
    const resp = await api.patch(`${API_ENDPOINTS.PROGRAMS}${pid}/`, data);
    return resp.data;
  },

  // Delete program by pid
  async deleteProgram(pid: number) {
    await api.delete(`${API_ENDPOINTS.PROGRAMS}${pid}/`);
  },
};