// src/store/useAffiliationStore.ts
import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api';

export interface Affiliation {
  affiliation_id: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
  university: {
    uid: number;
    uname_ar: string;
    uname_en?: string;
  };
  college?: {
    cid: number;
    name_ar: string;
    name_en?: string;
  } | null;
  department?: {
    department_id: number;
    name: string;
  } | null;
  start_date: string;
  end_date?: string | null;
}

interface AffiliationState {
  affiliations: Affiliation[];
  collegeIds: number[];
  loading: boolean;
  error: string | null;
  fetchAffiliations: (userId: number) => Promise<void>;
}

export const useAffiliationStore = create<AffiliationState>((set) => ({
  affiliations: [],
  collegeIds: [],
  loading: false,
  error: null,

  fetchAffiliations: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`${API_ENDPOINTS.UNIVERSITIES.LIST}`, {
        params: { user: userId }, // افترضنا API endpoint يمكن تمرير userId
      });

      const affiliationsData: Affiliation[] = res.data ?? [];

      // جمع جميع الـ colleges / universities
      const collegeIds = affiliationsData
        .map((aff) => aff.college?.cid ?? aff.university.uid)
        .filter(Boolean);

      set({
        affiliations: affiliationsData,
        collegeIds,
        loading: false,
      });

      console.log('Affiliations fetched:', affiliationsData);
      console.log('College IDs for Dean:', collegeIds);

    } catch (err: any) {
      console.error('Error fetching affiliations:', err);
      set({ error: err.message || 'حدث خطأ أثناء جلب البيانات', loading: false });
    }
  },
}));
