import { create } from "zustand";

/* ==========================
   Types
   ========================== */

export interface ApiDepartment {
  id?: number;
  name?: string;
  code?: string;
  college_id?: number;
  description?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  college_id?: number;
  description?: string;
}

/* ==========================
   Department Store
   ========================== */

interface DepartmentStore {
  departments: Department[];
  isLoading: boolean;
  setDepartments: (departments: Department[]) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (department: Department) => void;
  removeDepartment: (id: number) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: [],
  isLoading: false,

  setDepartments: (departments) => set({ departments }),

  addDepartment: (department) => set((state) => ({ departments: [department, ...state.departments] })),

  updateDepartment: (department) =>
    set((state) => ({
      departments: state.departments.map((d) => (d.id === department.id ? { ...d, ...department } : d)),
    })),

  removeDepartment: (id) => set((state) => ({ departments: state.departments.filter((d) => d.id !== id) })),
}));
