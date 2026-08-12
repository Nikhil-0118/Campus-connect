import api from './api';
import type { Notification, PaginatedResponse } from '../types';

export const notificationsService = {
  async listNotifications(params?: Record<string, string | number>): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications/', { params });
    return response.data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.post(`/notifications/${id}/read/`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all/');
  },
};
