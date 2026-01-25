import { create } from "zustand";
import { User } from "./useStore"; // assuming userStore.ts exports User type

/* ==========================
   Types
   ========================== */

export interface ApiGroup {
  id?: number;
  name?: string;
  description?: string;
  members?: User[];
  created_by?: User;
  // any backend fields
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  members: User[];
  created_by?: User;
}

/* ==========================
   Group Store
   ========================== */

interface GroupStore {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (id: number) => void;
  setSelectedGroup: (group: Group | null) => void;
  addMember: (groupId: number, member: User) => void;
  removeMember: (groupId: number, memberId: number) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  selectedGroup: null,
  isLoading: false,

  setGroups: (groups) => set({ groups }),

  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),

  updateGroup: (group) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === group.id ? { ...g, ...group } : g)),
    })),

  removeGroup: (id) => set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  addMember: (groupId, member) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, members: [...g.members, member] } : g
      ),
    })),

  removeMember: (groupId, memberId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== memberId) } : g
      ),
    })),
}));
