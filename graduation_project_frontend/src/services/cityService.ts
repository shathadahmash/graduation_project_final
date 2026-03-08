// cityService.ts
import api from './api';

export interface City {
  bid: number;
  bname_ar: string;
  bname_en: string;
}

export const cityService = {
  async getCities(params?: any): Promise<City[]> {
    try {
      const resp = await api.get('/cities/', { params });
      return resp.data;
    } catch (error) {
      console.error('[cityService] getCities error', error);
      return [];
    }
  }
};