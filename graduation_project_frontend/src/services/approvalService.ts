import api from './api';

export const approvalService = {
  async getApprovals(status?: string) {
    const response = await api.get('/approvals/', { params: status ? { status } : {} });
    return response.data;
  },

  async getApprovalDetail(approvalId: number) {
    const response = await api.get(`/approvals/${approvalId}/`);
    return response.data;
  },

  async approveRequest(approvalId: number, data?: any) {
    const response = await api.post(`/approvals/${approvalId}/approve/`, data);
    return response.data;
  },

  async rejectRequest(approvalId: number, reason?: string) {
    const response = await api.post(`/approvals/${approvalId}/reject/`, { reason });
    return response.data;
  },

  async requestModifications(approvalId: number, modifications: string) {
    const response = await api.post(`/approvals/${approvalId}/request-modifications/`, { modifications });
    return response.data;
  }
};
