import api from './api';
import { useNotificationsStore } from '../store/useStore';

export const notificationService = {
  async getNotifications(limit: number = 50) {
    const response = await api.get('/notifications/', { params: { limit } });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count/');
    return response.data.count || 0;
  },

  async markAsRead(notificationId: number) {
    await api.post(`/notifications/${notificationId}/mark-read/`);
  },

  async markAllAsRead() {
    await api.post('/notifications/mark-all-read/');
  },

  async deleteNotification(notificationId: number) {
    await api.delete(`/notifications/${notificationId}/`);
  },

  startPolling(interval: number = 5000) {
    const poll = async () => {
      const data = await this.getNotifications();
      if (data.length > 0) {
        useNotificationsStore.getState().setNotifications(data);
      }
    };
    poll();
    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }
};
