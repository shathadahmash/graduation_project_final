import api, { API_ENDPOINTS } from "./api";

export const studentService = {
  getStudents: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.STUDENTS);
      console.log("Fetched students:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("Failed to fetch students", err.response || err.message);
      return [];
    }
  },

  deleteStudent: async (id: number) => {
    return api.delete(`${API_ENDPOINTS.STUDENTS}${id}/`);
  },

  updateStudent: async (id: number, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.STUDENTS}${id}/`, data);
    return res.data;
  },

  createStudent: async (data: any) => {
    const res = await api.post(API_ENDPOINTS.STUDENTS, data);
    return res.data;
  },

  // ✅ New function to get the total number of students
  getStudentCount: async (): Promise<number> => {
    try {
      const res = await api.get(`${API_ENDPOINTS.STUDENTS}count/`);
      return res.data.total_students;
    } catch (err: any) {
      console.error("Failed to fetch student count", err.response || err.message);
      return 0;
    }
  },
};