import api from "./api";

export const studentService = {
  getStudents: async () => {
    const res = await api.get("/students/");
    return res.data;
  },

  deleteStudent: async (id: number) => {
    return await api.delete(`/students/${id}/`);
  },
  updateStudent: async (id: number, data: any) => {
  const response = await api.put(`/students/${id}/`, data);
  return response.data;
},
};