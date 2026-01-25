// src/store/useUniversityStore.ts
import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

interface University {
  id: number;
  name: string;
}

interface College {
  id: number;
  name: string;
  university_id: number;
}

interface Project {
  id: number;
  title: string;
  college_id: number;
}

interface Supervisor {
  id: number;
  name: string;
  college_id: number;
}

interface UniversityStore {
  universities: University[];
  colleges: College[];
  projects: Project[];
  supervisors: Supervisor[];
  isLoading: boolean;
  fetchUniversities: () => Promise<void>;
  fetchColleges: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchSupervisors: () => Promise<void>;
}

export const useUniversityStore = create<UniversityStore>((set) => ({
  universities: [],
  colleges: [],
  projects: [],
  supervisors: [],
  isLoading: false,

  fetchUniversities: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/universities`);
      set({ universities: res.data });
    } catch (err) {
      console.error("Failed to fetch universities:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchColleges: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/colleges`);
      set({ colleges: res.data });
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/projects`);
      set({ projects: res.data });
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSupervisors: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/supervisors`);
      set({ supervisors: res.data });
    } catch (err) {
      console.error("Failed to fetch supervisors:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
