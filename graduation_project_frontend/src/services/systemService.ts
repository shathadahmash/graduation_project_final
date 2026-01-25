// src/services/systemService.ts
import api from './api';

export interface SystemSetting {
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_at: string;
}

export interface ApprovalSequence {
  sequence_id: number;
  sequence_type: string;
  approval_levels: any[]; // JSON array of levels
  description?: string;
}

export const systemService = {
  // ======================
  // System Settings
  // ======================
  async getAllSettings(): Promise<SystemSetting[]> {
    const res = await api.get('/system-settings/');
    return res.data;
  },

  async getSetting(key: string): Promise<SystemSetting> {
    const res = await api.get(`/system-settings/${key}/`);
    return res.data;
  },

  async createSetting(data: Partial<SystemSetting>): Promise<SystemSetting> {
    const res = await api.post('/system-settings/', data);
    return res.data;
  },

  async updateSetting(key: string, data: Partial<SystemSetting>): Promise<SystemSetting> {
    const res = await api.put(`/system-settings/${key}/`, data);
    return res.data;
  },

  async deleteSetting(key: string): Promise<void> {
    await api.delete(`/system-settings/${key}/`);
  },

  // ======================
  // Approval Sequences
  // ======================
  async getAllSequences(): Promise<ApprovalSequence[]> {
    const res = await api.get('/approval-sequences/');
    return res.data;
  },

  async getSequenceById(sequenceId: number): Promise<ApprovalSequence> {
    const res = await api.get(`/approval-sequences/${sequenceId}/`);
    return res.data;
  },

  async createSequence(data: Partial<ApprovalSequence>): Promise<ApprovalSequence> {
    const res = await api.post('/approval-sequences/', data);
    return res.data;
  },

  async updateSequence(sequenceId: number, data: Partial<ApprovalSequence>): Promise<ApprovalSequence> {
    const res = await api.put(`/approval-sequences/${sequenceId}/`, data);
    return res.data;
  },

  async deleteSequence(sequenceId: number): Promise<void> {
    await api.delete(`/approval-sequences/${sequenceId}/`);
  },
};
