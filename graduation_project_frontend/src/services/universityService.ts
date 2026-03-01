import axios from 'axios';

export interface University {
  id: number;
  university_name: string;
  uid?: number; // original backend primary key
  uname_ar?: string;
  uname_en?: string | null;
  type?: string | null;
  colleges?: any[];
}

function normalizeItem(item: any): University {
  if (!item || typeof item !== 'object') return item;
  const uid = item.uid ?? item.id ?? item.pk ?? null;
  const uname_ar = item.uname_ar ?? item.university_name ?? item.name ?? item.uname ?? null;
  const uname_en = item.uname_en ?? item.university_name_en ?? null;
  return {
    id: uid ?? (item.id ?? null),
    uid: uid ?? undefined,
    university_name: uname_ar || uname_en || (item.university_name ?? '') as string,
    uname_ar: uname_ar ?? undefined,
    uname_en: uname_en ?? undefined,
    type: item.type ?? undefined,
    colleges: item.colleges ?? item.college_list ?? undefined,
  } as University;
}

function normalizeResponse(data: any): University[] {
  if (!data) return [];
  let arr: any[] = [];
  if (Array.isArray(data)) arr = data;
  else if (data.results && Array.isArray(data.results)) arr = data.results;
  else if (data.universities && Array.isArray(data.universities)) arr = data.universities;
  else if (typeof data === 'object') {
    // object-of-records -> values
    const vals = Object.values(data).filter(v => Array.isArray(v) || (v && typeof v === 'object'));
    if (vals.length === 1 && Array.isArray(vals[0])) arr = vals[0];
    else if (vals.length > 0 && Array.isArray(vals[0])) arr = vals[0];
    else arr = Object.values(data);
  }
  return arr.map(normalizeItem).filter(Boolean) as University[];
}

export const universityService = {
  async getUniversities(params?: any) {
    try {
      const resp = await axios.get('/universities/', { params });
      // diagnostic logging to help with inconsistent backend shapes
      try { console.debug('[universityService] raw response:', resp.status, resp.data); } catch (e) {}
      const normalized = normalizeResponse(resp.data);
      try { console.debug('[universityService] normalized count:', normalized.length, 'sample:', normalized.slice(0,3)); } catch (e) {}
      return normalized;
    } catch (error) {
      console.error('[universityService] getUniversities error', error?.response?.status, error?.response?.data ?? error?.message ?? error);
      return [];
    }
  },
  async getUniversityById(id: number) {
    try {
      const resp = await axios.get(`/universities/${id}/`);
      return normalizeItem(resp.data);
    } catch (error) {
      console.error('[universityService] getUniversityById error', error);
      throw error;
    }
  },
  async addUniversity(data: Omit<University, 'id'>) {
    try {
      const resp = await axios.post('/universities/', data);
      return normalizeItem(resp.data);
    } catch (error) {
      console.error('[universityService] addUniversity error', error);
      throw error;
    }
  },
  async updateUniversity(id: number, data: Partial<Omit<University, 'id'>>) {
    try {
      const resp = await axios.put(`/universities/${id}/`, data);
      return normalizeItem(resp.data);
    } catch (error) {
      console.error('[universityService] updateUniversity error', error);
      throw error;
    }
  },
  async deleteUniversity(id: number) {
    try {
      await axios.delete(`/universities/${id}/`);
      return true;
    } catch (error) {
      console.error('[universityService] deleteUniversity error', error);
      throw error;
    }
  }
};
