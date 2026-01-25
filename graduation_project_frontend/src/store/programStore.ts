import { create } from "zustand";

/* ==========================
   Types
   ========================== */

export interface ApiProgram {
  id?: number;
  name?: string;
  code?: string;
  department_id?: number;
  description?: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
  department_id?: number;
  description?: string;
}

/* ==========================
   Program Store
   ========================== */

interface ProgramStore {
  programs: Program[];
  isLoading: boolean;
  setPrograms: (programs: Program[]) => void;
  addProgram: (program: Program) => void;
  updateProgram: (program: Program) => void;
  removeProgram: (id: number) => void;
}

export const useProgramStore = create<ProgramStore>((set) => ({
  programs: [],
  isLoading: false,

  setPrograms: (programs) => set({ programs }),

  addProgram: (program) => set((state) => ({ programs: [program, ...state.programs] })),

  updateProgram: (program) =>
    set((state) => ({
      programs: state.programs.map((p) => (p.id === program.id ? { ...p, ...program } : p)),
    })),

  removeProgram: (id) => set((state) => ({ programs: state.programs.filter((p) => p.id !== id) })),
}));
