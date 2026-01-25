import { useEffect } from 'react';
import { useNotificationsStore } from '../store/useStore';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const store = useNotificationsStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifications = await notificationService.getNotifications();
      store.setNotifications(notifications);
    };
    fetchNotifications();

    const stopPolling = notificationService.startPolling(5000);
    return () => stopPolling();
  }, []);

  return store;
};
