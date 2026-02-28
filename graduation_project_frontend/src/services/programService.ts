import api, { API_ENDPOINTS } from '../services/api';

export interface Program {
  id: number;
  program_name: string;
  department?: number | null;
}

export const programService = {
  async getPrograms(params?: Record<string, any>) {
    const resp = await api.get(API_ENDPOINTS.PROGRAMS, { params });
    return resp.data;
  },

  async getProgramById(id: number) {
    const resp = await api.get(`${API_ENDPOINTS.PROGRAMS}${id}/`);
    return resp.data;
  },

  async addProgram(data: Omit<Program, 'id'>) {
    const resp = await api.post(API_ENDPOINTS.PROGRAMS, data);
    return resp.data;
  },

  async updateProgram(id: number, data: Partial<Omit<Program, 'id'>>) {
    const resp = await api.patch(`${API_ENDPOINTS.PROGRAMS}${id}/`, data);
    return resp.data;
  },

  async deleteProgram(id: number) {
    await api.delete(`${API_ENDPOINTS.PROGRAMS}${id}/`);
  },
};